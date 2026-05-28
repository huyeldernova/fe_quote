'use client'

import { useState } from 'react'
import { imageService } from '@/services/image.service'
import { getErrorMessage } from '@/lib/utils'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function useImageUpload() {
  const [uploading, setUploading] = useState(false)

  async function uploadFile(file: File): Promise<string | null> {
    if (file.size > MAX_SIZE) {
      alert('File exceeds 5MB limit')
      return null
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Only JPG, PNG, WebP and GIF allowed')
      return null
    }
    setUploading(true)
    try {
      return await imageService.upload(file)
    } catch (err) {
      alert(getErrorMessage(err))
      return null
    } finally {
      setUploading(false)
    }
  }

  return { uploadFile, uploading }
}
