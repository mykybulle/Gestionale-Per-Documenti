import type { Folder, FileAttachment, Category } from '../types';

const API_BASE = 'api';
export const UPLOADS_BASE = 'uploads';

export const initDB = async () => {
  return Promise.resolve();
};

export const getFolders = async (search?: string): Promise<Folder[]> => {
  const url = search 
    ? `${API_BASE}/folders.php?search=${encodeURIComponent(search)}`
    : `${API_BASE}/folders.php`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch folders');
  return res.json();
};

export const getFolder = async (id: number): Promise<Folder | undefined> => {
  const res = await fetch(`${API_BASE}/folders.php?id=${id}`);
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error('Failed to fetch folder');
  return res.json();
};

export const createFolder = async (folder: Omit<Folder, 'id' | 'createdAt'>): Promise<number> => {
  const res = await fetch(`${API_BASE}/folders.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(folder),
  });
  if (!res.ok) throw new Error('Failed to create folder');
  const data = await res.json();
  return data.id;
};

export const updateFolder = async (folder: Folder): Promise<void> => {
  if (!folder.id) throw new Error('Folder ID required');
  const res = await fetch(`${API_BASE}/folders.php?id=${folder.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(folder),
  });
  if (!res.ok) throw new Error('Failed to update folder');
};

export const deleteFolder = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/folders.php?id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete folder');
};

export const getFilesByFolder = async (folderId: number): Promise<FileAttachment[]> => {
  const res = await fetch(`${API_BASE}/files.php?folderId=${folderId}`);
  if (!res.ok) throw new Error('Failed to fetch files');
  return res.json();
};

export const addFile = async (data: { 
  folderId: number; 
  content: File; 
  category: string;
}): Promise<number> => {
  const formData = new FormData();
  formData.append('folderId', data.folderId.toString());
  formData.append('file', data.content);
  formData.append('category', data.category);

  const res = await fetch(`${API_BASE}/files.php`, {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) throw new Error('Failed to upload file');
  const result = await res.json();
  return result.id;
};

export const deleteFile = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/files.php?id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete file');
};

// Categories API
export const getCategories = async (): Promise<Category[]> => {
  const res = await fetch(`${API_BASE}/categories.php`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
};

export const addCategory = async (name: string): Promise<Category> => {
  const res = await fetch(`${API_BASE}/categories.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to add category');
  return res.json();
};

export const deleteCategory = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/categories.php?id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete category');
};

export const updateCategory = async (id: number, name: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/categories.php?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to update category');
};

export const updateFile = async (id: number, updates: { category?: string, name?: string }): Promise<void> => {
  const res = await fetch(`${API_BASE}/files.php?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update file');
};

export const getStats = async (): Promise<{ total: number, daIniziare: number, inCorso: number, finita: number, sospese: number }> => {
  const res = await fetch(`${API_BASE}/stats.php`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
};
