import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.tasksService.findByProject(projectId);
  }

  @Post('project/:projectId')
  @Roles('QA', 'PM', 'ADMIN', 'CEO')
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.tasksService.create(projectId, dto, req.user.id);
  }

  /** Build a Gantt schedule from portfolio phases or a default timeline. Idempotent if tasks already exist. */
  @Post('project/:projectId/generate')
  @Roles('QA', 'PM', 'ADMIN', 'CEO')
  generate(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.tasksService.generateSchedule(projectId, req.user.id);
  }

  @Patch(':id')
  @Roles('QA', 'PM', 'ADMIN', 'CEO')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.tasksService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('QA', 'PM', 'ADMIN', 'CEO')
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.tasksService.remove(id, req.user.id);
  }
}
