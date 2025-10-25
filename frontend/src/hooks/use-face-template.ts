import { useState, useEffect } from 'react'
import { faceTemplateService } from '@/lib/api/face-templates'

export function useFaceTemplate(employeeId: number) {
  const [faceTemplate, setFaceTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFaceTemplate = async () => {
    try {
      setLoading(true)
      const data = await faceTemplateService.getByEmployee(employeeId)
      setFaceTemplate(data)
    } catch (err: any) {
      setError(err)
      setFaceTemplate(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (employeeId) {
      fetchFaceTemplate()
    }
  }, [employeeId])

  return {
    faceTemplate,
    loading,
    error,
    refetch: fetchFaceTemplate,
  }
}