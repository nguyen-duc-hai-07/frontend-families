import { apiClient } from './apiClient'
import type {
  FamilyInfo,
  FamilyRequest,
  PersonTreeNode,
  PersonDetail,
  PersonRequest,
  ParentRequest,
  ParentResponse,
  MarriageRequest,
  MarriageResponse,
  FamilyTreeQueryParams,
  PersonSearchQueryParams,
  ResponseGeneral,
  PageResponse,
} from '@/types'

export class FamilyService {
  // ==========================================
  // I. Quản lý Dòng họ (Families)
  // ==========================================

  /**
   * Lấy thông tin dòng họ theo familyId
   */
  async getFamilyInfo(familyId: number): Promise<FamilyInfo> {
    const res = await apiClient.get<ResponseGeneral<FamilyInfo>>(`/families/${familyId}`)
    return res.data.data
  }

  /**
   * Tạo mới dòng họ
   */
  async createFamily(request: FamilyRequest): Promise<FamilyInfo> {
    const res = await apiClient.post<ResponseGeneral<FamilyInfo>>('/families', request)
    return res.data.data
  }

  /**
   * Cập nhật thông tin dòng họ
   */
  async updateFamily(familyId: number, request: FamilyRequest): Promise<FamilyInfo> {
    const res = await apiClient.put<ResponseGeneral<FamilyInfo>>(`/families/${familyId}`, request)
    return res.data.data
  }

  /**
   * Xóa mềm dòng họ
   */
  async deleteFamily(familyId: number): Promise<void> {
    await apiClient.delete<ResponseGeneral<void>>(`/families/${familyId}`)
  }

  // ==========================================
  // II. Quản lý Thành viên & Phả hệ (Persons)
  // ==========================================

  /**
   * Lấy cấu trúc cây phả hệ theo familyId, có thể giới hạn số đời hiển thị
   */
  async getFamilyTree(params: FamilyTreeQueryParams): Promise<PersonTreeNode[]> {
    const { family_id, is_all = true, max_generation } = params
    const queryParams: Record<string, any> = {
      family_id,
      is_all,
    }
    if (!is_all && typeof max_generation === 'number') {
      queryParams.max_generation = max_generation
    }

    const res = await apiClient.get<ResponseGeneral<PersonTreeNode[] | PersonTreeNode>>('/persons/tree', {
      params: queryParams,
    })

    const data = res.data.data
    if (Array.isArray(data)) {
      return data
    }
    if (data) {
      return [data]
    }
    return []
  }

  /**
   * Lấy chi tiết thông tin thành viên (kèm danh sách vợ/chồng)
   */
  async getPersonDetail(personId: number): Promise<PersonDetail> {
    const res = await apiClient.get<ResponseGeneral<PersonDetail>>(`/persons/${personId}`)
    return res.data.data
  }

  /**
   * Tìm kiếm thành viên trong dòng họ có phân trang
   */
  async searchPersons(params: PersonSearchQueryParams): Promise<PageResponse<PersonDetail>> {
    const { family_id, keyword = '', gender, is_alive, is_bloodline, page = 0, size = 15 } = params
    const queryParams: Record<string, any> = {
      family_id,
      page,
      size,
    }
    if (keyword && keyword.trim()) {
      queryParams.keyword = keyword.trim()
    }
    if (gender) {
      queryParams.gender = gender.toLowerCase()
    }
    if (typeof is_alive === 'boolean') {
      queryParams.is_alive = is_alive
    }
    if (typeof is_bloodline === 'boolean') {
      queryParams.is_bloodline = is_bloodline
    }

    const res = await apiClient.get<ResponseGeneral<PageResponse<PersonDetail>>>('/persons/search', {
      params: queryParams,
    })
    return res.data.data
  }

  /**
   * Tạo mới thành viên
   */
  async createPerson(request: PersonRequest): Promise<PersonDetail> {
    const payload = {
      ...request,
      gender: request.gender ? (request.gender.toLowerCase() as any) : undefined,
    }
    const res = await apiClient.post<ResponseGeneral<PersonDetail>>('/persons', payload)
    return res.data.data
  }

  /**
   * Cập nhật thông tin thành viên
   */
  async updatePerson(personId: number, request: PersonRequest): Promise<PersonDetail> {
    const payload = {
      ...request,
      gender: request.gender ? (request.gender.toLowerCase() as any) : undefined,
    }
    const res = await apiClient.put<ResponseGeneral<PersonDetail>>(`/persons/${personId}`, payload)
    return res.data.data
  }

  /**
   * Xóa mềm thành viên
   */
  async deletePerson(personId: number): Promise<void> {
    await apiClient.delete<ResponseGeneral<void>>(`/persons/${personId}`)
  }

  // ==========================================
  // III. Quan hệ Cha - Con (Parents)
  // ==========================================

  /**
   * Gán quan hệ cha/mẹ - con
   */
  async createParentRelation(request: ParentRequest): Promise<ParentResponse> {
    const res = await apiClient.post<ResponseGeneral<ParentResponse>>('/parents', request)
    return res.data.data
  }

  /**
   * Cập nhật quan hệ cha/mẹ - con
   */
  async updateParentRelation(relationId: number, request: ParentRequest): Promise<ParentResponse> {
    const res = await apiClient.put<ResponseGeneral<ParentResponse>>(`/parents/${relationId}`, request)
    return res.data.data
  }

  /**
   * Chi tiết quan hệ cha/mẹ - con
   */
  async getParentRelationDetail(relationId: number): Promise<ParentResponse> {
    const res = await apiClient.get<ResponseGeneral<ParentResponse>>(`/parents/${relationId}`)
    return res.data.data
  }

  /**
   * Xóa quan hệ cha/mẹ - con
   */
  async deleteParentRelation(relationId: number): Promise<void> {
    await apiClient.delete<ResponseGeneral<void>>(`/parents/${relationId}`)
  }

  // ==========================================
  // IV. Quan hệ Hôn nhân (Marriages)
  // ==========================================

  /**
   * Tạo liên kết kết hôn giữa 2 người
   */
  async createMarriage(request: MarriageRequest): Promise<MarriageResponse> {
    const res = await apiClient.post<ResponseGeneral<MarriageResponse>>('/marriages', request)
    return res.data.data
  }

  /**
   * Cập nhật quan hệ hôn nhân
   */
  async updateMarriage(marriageId: number, request: MarriageRequest): Promise<MarriageResponse> {
    const res = await apiClient.put<ResponseGeneral<MarriageResponse>>(`/marriages/${marriageId}`, request)
    return res.data.data
  }

  /**
   * Chi tiết quan hệ hôn nhân
   */
  async getMarriageDetail(marriageId: number): Promise<MarriageResponse> {
    const res = await apiClient.get<ResponseGeneral<MarriageResponse>>(`/marriages/${marriageId}`)
    return res.data.data
  }

  /**
   * Xóa quan hệ hôn nhân
   */
  async deleteMarriage(marriageId: number): Promise<void> {
    await apiClient.delete<ResponseGeneral<void>>(`/marriages/${marriageId}`)
  }

  // ==========================================
  // V. Phả đồ Cội Nguồn & Dòng Dõi Tổ Tiên (Ancestry)
  // ==========================================

  /**
   * Lấy danh sách dòng dõi phả hệ tổ tiên trực hệ từ Cụ Khởi Tổ đến thành viên này
   */
  async getAncestry(personId: number): Promise<PersonDetail[]> {
    const res = await apiClient.get<ResponseGeneral<PersonDetail[]>>(`/persons/${personId}/ancestry`)
    return res.data.data || []
  }
}

export const familyService = new FamilyService()
export default familyService
