import apiClient from './client'

export const faceTemplateService = {
  async getByEmployee(employeeId: number) {
    const response = await apiClient.get(`/face-templates?employee_id=${employeeId}`)
    return response.data.data
  },

  async uploadTemplate(formData: FormData) {
    const response = await apiClient.post('/face-templates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteTemplate(id: number) {
    const response = await apiClient.delete(`/face-templates/${id}`)
    return response.data
  },
}