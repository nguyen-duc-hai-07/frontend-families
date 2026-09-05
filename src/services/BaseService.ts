import { apiClient } from './apiClient'
import type { PageResponse, ResponseGeneral } from '@/types'

export interface BaseQueryParams {
  page?: number
  size?: number
  keyword?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  isAll?: boolean
  [key: string]: any
}

/**
 * Generic BaseService providing standard CRUD operations.
 * Extend this class for any entity to get getAll, getById, create, update, patch, and delete immediately.
 *
 * Example:
 * ```ts
 * export class ProductService extends BaseService<Product, CreateProductDTO, UpdateProductDTO> {
 *   constructor() {
 *     super('/products')
 *   }
 * }
 * export const productService = new ProductService()
 * ```
 */
export class BaseService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  protected endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  /**
   * Fetch paginated list of entities
   */
  async getAll(params?: BaseQueryParams): Promise<PageResponse<T>> {
    const res = await apiClient.get<ResponseGeneral<PageResponse<T>> | PageResponse<T>>(this.endpoint, { params })
    const data = (res.data as any)?.data ?? res.data

    if (Array.isArray(data)) {
      return {
        content: data,
        amount: data.length,
        totalElements: data.length,
        totalPages: 1,
        page: 0,
        size: data.length,
      }
    }

    const content = data?.content || []
    const amount = typeof data?.amount === 'number' ? data.amount : (data?.totalElements ?? content.length)

    return {
      content,
      amount,
      totalElements: data?.totalElements ?? amount,
      totalPages: data?.totalPages ?? Math.ceil(amount / (params?.size || 10)),
      page: data?.page ?? params?.page ?? 0,
      size: data?.size ?? params?.size ?? 10,
    }
  }

  /**
   * Fetch a single entity by ID
   */
  async getById(id: number | string): Promise<T> {
    const res = await apiClient.get<ResponseGeneral<T> | T>(`${this.endpoint}/${id}`)
    return (res.data as any)?.data ?? res.data
  }

  /**
   * Create a new entity
   */
  async create(payload: CreateDTO): Promise<T> {
    const res = await apiClient.post<ResponseGeneral<T> | T>(this.endpoint, payload)
    return (res.data as any)?.data ?? res.data
  }

  /**
   * Update an existing entity by ID (PUT)
   */
  async update(id: number | string, payload: UpdateDTO): Promise<T> {
    const res = await apiClient.put<ResponseGeneral<T> | T>(`${this.endpoint}/${id}`, payload)
    return (res.data as any)?.data ?? res.data
  }

  /**
   * Partially update an existing entity by ID (PATCH)
   */
  async patch(id: number | string, payload: Partial<UpdateDTO>): Promise<T> {
    const res = await apiClient.patch<ResponseGeneral<T> | T>(`${this.endpoint}/${id}`, payload)
    return (res.data as any)?.data ?? res.data
  }

  /**
   * Delete an entity by ID
   */
  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`)
  }
}
