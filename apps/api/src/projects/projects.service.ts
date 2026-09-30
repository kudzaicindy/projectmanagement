import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const projectInclude = {
  property: { select: { id: true, name: true, address: true, city: true } },
  manager: { select: { id: true, name: true, email: true, role: true } },
  createdBy: { select: { id: true, name: true, email: true, role: true } },
  _count: { select: { documents: true, tasks: true } },
  tasks: { select: { progress: true, status: true } },
} satisfies Prisma.ProjectInclude;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(filters?: { type?: string; status?: string; userId?: string }) {
    return this.prisma.project.findMany({
      where: {
        ...(filters?.type ? { type: filters.type as never } : {}),
        ...(filters?.status ? { status: filters.status as never } : {}),
        ...(filters?.userId
          ? {
              OR: [
                { createdById: filters.userId },
                { managerId: filters.userId },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: projectInclude,
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        ...projectInclude,
        documents: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploadedBy: { select: { id: true, name: true } },
          },
        },
        tasks: {
          orderBy: [{ sortOrder: 'asc' }, { startDate: 'asc' }],
          take: 5,
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async create(dto: CreateProjectDto, userId: string) {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        type: dto.type,
        status: dto.status ?? 'ACTIVE',
        description: dto.description,
        budgetUsd: dto.budgetUsd,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        propertyId: dto.propertyId,
        managerId: dto.managerId ?? userId,
        createdById: userId,
      },
      include: projectInclude,
    });

    await this.audit.log({
      userId,
      action: 'CREATE',
      entityType: 'Project',
      entityId: project.id,
      details: { name: project.name, type: project.type, createdBy: userId },
    });

    return project;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    await this.findOne(id);

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        budgetUsd: dto.budgetUsd,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: projectInclude,
    });

    await this.audit.log({
      userId,
      action: 'UPDATE',
      entityType: 'Project',
      entityId: id,
      details: dto as Prisma.InputJsonValue,
    });

    return project;
  }

  stats(userId?: string) {
    return this.prisma.project.groupBy({
      by: ['type', 'status'],
      where: userId
        ? { OR: [{ createdById: userId }, { managerId: userId }] }
        : undefined,
      _count: { _all: true },
    });
  }
}
