import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  mapPhaseToTaskStatus,
  portfolioSiteIdFromProjectId,
  resolveProjectWindow,
  seedsForProject,
  splitTimeline,
  type PhaseSeed,
} from './gantt-generate';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findByProject(projectId: string) {
    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'asc' }],
      include: { predecessor: { select: { id: true, name: true } } },
    });
  }

  async create(projectId: string, dto: CreateTaskDto, userId: string) {
    await this.ensureProject(projectId);
    this.validateDates(dto.startDate, dto.endDate);

    if (dto.predecessorId) {
      await this.ensureTaskInProject(dto.predecessorId, projectId);
    }

    const task = await this.prisma.task.create({
      data: {
        projectId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        progress: dto.progress ?? 0,
        status: dto.status,
        isMilestone: dto.isMilestone ?? false,
        predecessorId: dto.predecessorId,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: { predecessor: { select: { id: true, name: true } } },
    });

    await this.audit.log({
      userId,
      action: 'CREATE',
      entityType: 'Task',
      entityId: task.id,
      details: { projectId, name: task.name },
    });

    return task;
  }

  async update(taskId: string, dto: UpdateTaskDto, userId: string) {
    const existing = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) throw new NotFoundException('Task not found');

    if (dto.startDate && dto.endDate) {
      this.validateDates(dto.startDate, dto.endDate);
    }

    if (dto.predecessorId) {
      await this.ensureTaskInProject(dto.predecessorId, existing.projectId);
      if (dto.predecessorId === taskId) {
        throw new BadRequestException('Task cannot depend on itself');
      }
    }

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: { predecessor: { select: { id: true, name: true } } },
    });

    await this.audit.log({
      userId,
      action: 'UPDATE',
      entityType: 'Task',
      entityId: taskId,
      details: dto as Prisma.InputJsonValue,
    });

    return task;
  }

  async generateSchedule(projectId: string, userId: string) {
    const project = await this.ensureProject(projectId);
    const existing = await this.prisma.task.findMany({
      where: { projectId },
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'asc' }],
      include: { predecessor: { select: { id: true, name: true } } },
    });
    if (existing.length > 0) {
      return { generated: false, tasks: existing };
    }

    const phaseSeeds = await this.loadPhaseSeeds(project.id, project.name);
    const seeds = seedsForProject(phaseSeeds);
    const window = resolveProjectWindow(project.startDate, project.endDate, seeds.length);
    const ranges = splitTimeline(window.start, window.end, seeds.length);

    let predecessorId: string | undefined;
    const createdIds: string[] = [];

    for (let i = 0; i < seeds.length; i++) {
      const seed = seeds[i];
      const range = ranges[i];
      const { status, progress } = mapPhaseToTaskStatus(seed.status, seed.percentComplete);

      const task = await this.prisma.task.create({
        data: {
          projectId,
          name: seed.name,
          startDate: range.start,
          endDate: range.end,
          progress,
          status,
          isMilestone: i === seeds.length - 1,
          predecessorId,
          sortOrder: seed.sortOrder,
        },
      });
      createdIds.push(task.id);
      predecessorId = task.id;
    }

    await this.audit.log({
      userId,
      action: 'CREATE',
      entityType: 'Task',
      entityId: projectId,
      details: { generateSchedule: true, taskCount: createdIds.length },
    });

    const tasks = await this.findByProject(projectId);
    return { generated: true, tasks };
  }

  private async loadPhaseSeeds(projectId: string, projectName: string): Promise<PhaseSeed[]> {
    try {
      const siteId = portfolioSiteIdFromProjectId(projectId);
      let site = siteId
        ? await this.prisma.portfolioSite.findUnique({
            where: { id: siteId },
            include: { phases: { orderBy: { sortOrder: 'asc' } } },
          })
        : null;

      if (!site) {
        site = await this.prisma.portfolioSite.findFirst({
          where: { name: { equals: projectName, mode: 'insensitive' } },
          include: { phases: { orderBy: { sortOrder: 'asc' } } },
        });
      }

      if (!site?.phases.length) return [];

      return site.phases.map((ph) => ({
        name: ph.name,
        sortOrder: ph.sortOrder,
        percentComplete: ph.percentComplete,
        status: ph.status,
      }));
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        (err.code === 'P2021' || err.code === 'P2022')
      ) {
        return [];
      }
      throw err;
    }
  }

  async remove(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    await this.prisma.task.delete({ where: { id: taskId } });

    await this.audit.log({
      userId,
      action: 'DELETE',
      entityType: 'Task',
      entityId: taskId,
      details: { name: task.name },
    });

    return { ok: true };
  }

  private async ensureProject(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  private async ensureTaskInProject(taskId: string, projectId: string) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, projectId } });
    if (!task) throw new BadRequestException('Predecessor must belong to the same project');
  }

  private validateDates(start: string, end: string) {
    if (new Date(end) < new Date(start)) {
      throw new BadRequestException('End date must be on or after start date');
    }
  }
}
