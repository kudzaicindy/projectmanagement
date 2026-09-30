export type UserRole = 'PM' | 'QA' | 'FINANCE' | 'CEO' | 'ADMIN';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type ProjectType = 'MANAGED' | 'RENOVATION' | 'DEVELOPMENT';
export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type DocumentCategory = 'PLAN' | 'PERMIT' | 'CONTRACT' | 'REPORT' | 'OTHER';
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export type Task = {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: TaskStatus;
  isMilestone: boolean;
  predecessorId?: string | null;
  sortOrder: number;
  predecessor?: { id: string; name: string } | null;
};

export type Property = {
  id: string;
  name: string;
  address: string;
  city?: string | null;
  country?: string | null;
  description?: string | null;
  _count?: { projects: number };
};

export type Project = {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description?: string | null;
  budgetUsd?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  propertyId: string;
  property?: { id: string; name: string; address: string; city?: string | null };
  manager?: { id: string; name: string; email?: string; role?: UserRole } | null;
  createdBy?: { id: string; name: string; email?: string; role?: UserRole };
  documents?: Document[];
  tasks?: Task[];
  _count?: { documents: number; tasks?: number };
};

export type Document = {
  id: string;
  name: string;
  category: DocumentCategory;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  uploadedBy?: { id: string; name: string };
};

export type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  createdAt: string;
  user?: { name: string; role: UserRole } | null;
};
