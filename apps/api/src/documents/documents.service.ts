import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentCategory } from '@prisma/client';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  private uploadDir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {
    this.uploadDir = process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  findByProject(projectId: string) {
    return this.prisma.document.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });
  }

  async create(params: {
    projectId: string;
    name: string;
    category: DocumentCategory;
    file: Express.Multer.File;
    userId: string;
  }) {
    const storedName = `${Date.now()}-${params.file.originalname}`;
    const filePath = join(this.uploadDir, storedName);
    const { writeFileSync } = await import('fs');
    writeFileSync(filePath, params.file.buffer);

    const document = await this.prisma.document.create({
      data: {
        projectId: params.projectId,
        name: params.name,
        category: params.category,
        fileName: storedName,
        mimeType: params.file.mimetype,
        sizeBytes: params.file.size,
        uploadedById: params.userId,
      },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    await this.audit.log({
      userId: params.userId,
      action: 'UPLOAD',
      entityType: 'Document',
      entityId: document.id,
      details: { projectId: params.projectId, name: params.name },
    });

    return document;
  }

  async getFileStream(id: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const filePath = join(this.uploadDir, document.fileName);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    return { document, stream: createReadStream(filePath) };
  }
}
