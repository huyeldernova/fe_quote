import axiosInstance from '@/lib/axios'
import { ImageUploadResponse } from '@/types'

export const imageService = {
  upload: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await axiosInstance.post<ImageUploadResponse>(
      '/api/v1/images/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return res.data.imageUrl
  },

  delete: (imageUrl: string) =>
    axiosInstance.delete('/api/v1/images', { params: { url: imageUrl } }),
}
