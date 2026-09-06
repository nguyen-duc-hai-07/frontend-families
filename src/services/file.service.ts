import { apiClient } from './apiClient'
import type { FileUploadResponse, ResponseGeneral } from '@/types'

const MAX_SINGLE_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_MULTIPLE_FILES_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_MULTIPLE_FILES_COUNT = 10

export const fileService = {
  /**
   * Tải lên 1 file đơn lẻ (Avatar, ảnh gia phả, tư liệu...)
   * @param file File cần upload (tối đa 10MB)
   */
  async uploadFile(file: File): Promise<FileUploadResponse> {
    if (file.size > MAX_SINGLE_FILE_SIZE) {
      throw new Error(`Dung lượng file vượt quá giới hạn 10MB (${(file.size / (1024 * 1024)).toFixed(2)}MB)`)
    }

    const formData = new FormData()
    formData.append('file', file)

    const res = await apiClient.post<ResponseGeneral<FileUploadResponse>>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data.data
  },

  /**
   * Tải lên danh sách nhiều file cùng lúc (tối đa 10 file, tổng dung lượng <= 100MB)
   * @param files Danh sách các file
   */
  async uploadMultipleFiles(files: File[]): Promise<FileUploadResponse[]> {
    if (files.length === 0) return []
    if (files.length > MAX_MULTIPLE_FILES_COUNT) {
      throw new Error(`Số lượng file vượt quá giới hạn cho phép (tối đa ${MAX_MULTIPLE_FILES_COUNT} file)`)
    }

    const totalSize = files.reduce((acc, f) => acc + f.size, 0)
    if (totalSize > MAX_MULTIPLE_FILES_SIZE) {
      throw new Error(
        `Tổng dung lượng các file vượt quá giới hạn 100MB (${(totalSize / (1024 * 1024)).toFixed(2)}MB)`
      )
    }

    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    const res = await apiClient.post<ResponseGeneral<FileUploadResponse[]>>('/files/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data.data
  },

  /**
   * Xóa file khỏi hệ thống theo file_name
   * @param fileName Tên file cần xóa (vd: abc-xyz.jpg)
   */
  async deleteFile(fileName: string): Promise<void> {
    if (!fileName) return
    await apiClient.delete<ResponseGeneral<void>>('/files', {
      params: {
        file_name: fileName,
      },
    })
  },
}

export default fileService
