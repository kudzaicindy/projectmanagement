const API_BASE = import.meta.env.VITE_API_URL ?? '';

function getToken() {
  return localStorage.getItem('estatepm_token');
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ accessToken: string; user: import('./types').User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => api<import('./types').User>('/api/auth/me'),
};

export const usersApi = {
  list: () => api<import('./types').User[]>('/api/users'),
};

export const projectsApi = {
  list: (params?: { type?: string; status?: string; mine?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.status) q.set('status', params.status);
    if (params?.mine) q.set('mine', 'true');
    const qs = q.toString();
    return api<import('./types').Project[]>(`/api/projects${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => api<import('./types').Project>(`/api/projects/${id}`),
  create: (data: Record<string, unknown>) =>
    api<import('./types').Project>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  stats: (mine?: boolean) => {
    const qs = mine ? '?mine=true' : '';
    return api<Array<{ type: string; status: string; _count: { _all: number } }>>(
      `/api/projects/stats/summary${qs}`,
    );
  },
};

export const propertiesApi = {
  list: () => api<import('./types').Property[]>('/api/properties'),
  get: (id: string) =>
    api<import('./types').Property & { projects: import('./types').Project[] }>(`/api/properties/${id}`),
  create: (data: Record<string, unknown>) =>
    api<import('./types').Property>('/api/properties', { method: 'POST', body: JSON.stringify(data) }),
};

export const documentsApi = {
  listByProject: (projectId: string) =>
    api<import('./types').Document[]>(`/api/documents/project/${projectId}`),
  upload: (projectId: string, file: File, name: string, category: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('name', name);
    form.append('category', category);
    return api<import('./types').Document>(`/api/documents/project/${projectId}`, {
      method: 'POST',
      body: form,
      headers: {},
    });
  },
  downloadUrl: (id: string) => `${API_BASE}/api/documents/${id}/download`,
};

export const auditApi = {
  list: () => api<import('./types').AuditLog[]>('/api/audit'),
};

export const portfolioApi = {
  health: () =>
    api<{
      projects: import('./portfolioHealth').PortfolioProjectHealth[];
      totals: import('./portfolioHealth').PortfolioOverviewTotals | null;
    }>('/api/portfolio/health'),
};

export const tasksApi = {
  list: (projectId: string) => api<import('./types').Task[]>(`/api/tasks/project/${projectId}`),
  generate: (projectId: string) =>
    api<{ generated: boolean; tasks: import('./types').Task[] }>(
      `/api/tasks/project/${projectId}/generate`,
      { method: 'POST' },
    ),
  create: (projectId: string, data: Record<string, unknown>) =>
    api<import('./types').Task>(`/api/tasks/project/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Record<string, unknown>) =>
    api<import('./types').Task>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => api<{ ok: boolean }>(`/api/tasks/${id}`, { method: 'DELETE' }),
};
