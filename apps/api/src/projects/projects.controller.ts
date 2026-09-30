import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('mine') mine?: string,
    @Req() req?: { user: { id: string } },
  ) {
    return this.projectsService.findAll({
      type,
      status,
      userId: mine === 'true' && req?.user ? req.user.id : undefined,
    });
  }

  @Get('stats/summary')
  stats(@Query('mine') mine?: string, @Req() req?: { user: { id: string } }) {
    return this.projectsService.stats(
      mine === 'true' && req?.user ? req.user.id : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  /** Any authenticated Alamait user can create a project — it is tracked to them. */
  @Post()
  create(@Body() dto: CreateProjectDto, @Req() req: { user: { id: string } }) {
    return this.projectsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles('PM', 'QA', 'ADMIN', 'CEO', 'FINANCE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.projectsService.update(id, dto, req.user.id);
  }
}
