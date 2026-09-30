import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll() {
    return this.prisma.property.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { projects: true } } },
    });
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { updatedAt: 'desc' },
          include: { manager: { select: { id: true, name: true } } },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async create(dto: CreatePropertyDto, userId: string) {
    const property = await this.prisma.property.create({ data: dto });

    await this.audit.log({
      userId,
      action: 'CREATE',
      entityType: 'Property',
      entityId: property.id,
      details: { name: property.name },
    });

    return property;
  }

  async update(id: string, dto: UpdatePropertyDto, userId: string) {
    await this.findOne(id);

    const property = await this.prisma.property.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      userId,
      action: 'UPDATE',
      entityType: 'Property',
      entityId: id,
      details: dto as Prisma.InputJsonValue,
    });

    return property;
  }
}
