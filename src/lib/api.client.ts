const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  }

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Request failed');
    (error as any).code = data.error;
    throw error;
  }
  return data;
};

export const taskApi = {
  list: () => apiFetch('/tasks'),
  create: (data: any) => apiFetch('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/tasks/${id}`, { method: 'DELETE' }),
};

export const authApi = {
  register: (data: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
};
