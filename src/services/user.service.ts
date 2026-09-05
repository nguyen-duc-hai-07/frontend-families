import { BaseService, type BaseQueryParams } from './BaseService'
import { apiClient } from './apiClient'
import { UserRole, type UserResponse, type PageResponse } from '@/types'

export interface CreateUserPayload {
  username: string
  email: string
  password?: string
  phoneNumber?: string
  role?: UserRole | string
}

export interface UpdateUserPayload {
  username?: string
  email?: string
  phoneNumber?: string
  role?: UserRole | string
  password?: string
}

export class UserService extends BaseService<UserResponse, CreateUserPayload, UpdateUserPayload> {
  constructor() {
    super('/users')
  }

  /**
   * Fetch users with keyword search and pagination
   */
  async getUsers(params?: BaseQueryParams): Promise<PageResponse<UserResponse>> {
    return this.getAll(params)
  }

  /**
   * Fetch single user by ID
   */
  async getUserById(id: number): Promise<UserResponse> {
    return this.getById(id)
  }

  /**
   * Create user with normalized phone field
   */
  override async create(data: CreateUserPayload): Promise<UserResponse> {
    const payload = {
      username: data.username,
      email: data.email,
      password: data.password,
      phone_number: data.phoneNumber ?? '',
      phoneNumber: data.phoneNumber ?? '',
      role: data.role ?? UserRole.USER,
    }
    const res = await apiClient.post<any>(this.endpoint, payload)
    return res.data?.data || res.data
  }

  async createUser(data: CreateUserPayload): Promise<UserResponse> {
    return this.create(data)
  }

  /**
   * Update user with normalized phone field
   */
  override async update(id: number | string, data: UpdateUserPayload): Promise<UserResponse> {
    const payload: any = { ...data }
    if (data.phoneNumber !== undefined) {
      payload.phone_number = data.phoneNumber
      payload.phoneNumber = data.phoneNumber
    }
    const res = await apiClient.put<any>(`${this.endpoint}/${id}`, payload)
    return res.data?.data || res.data
  }

  async updateUser(id: number, data: UpdateUserPayload): Promise<UserResponse> {
    return this.update(id, data)
  }

  async deleteUser(id: number): Promise<void> {
    return this.delete(id)
  }
}

export const userService = new UserService()
