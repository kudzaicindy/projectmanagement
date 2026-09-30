import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      where: { active: true },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
  }
}
