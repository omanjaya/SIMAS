// src/lib/api/base-service.ts
import apiClient from './client';

export class BaseService<T, TFormData> {
  protected basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async getAll(params?: Record<string, any>): Promise<T[]> {
    const response = await apiClient.get<T[]>(this.basePath, { params });
    return response.data;
  }

  async getById(id: number): Promise<T> {
    const response = await apiClient.get<T>(`${this.basePath}/${id}`);
    return response.data;
  }

  async create(data: TFormData): Promise<T> {
    const response = await apiClient.post<T>(this.basePath, data);
    return response.data;
  }

  async update(id: number, data: Partial<TFormData>): Promise<T> {
    const response = await apiClient.put<T>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}