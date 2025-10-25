import apiClient from './client';

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface ProfileData {
  phone: string;
  date_of_birth: string;
  gender: string;
  position: string;
  address?: string;
  department?: string;
  emergency_contact: EmergencyContact;
}

interface ProfileStatusResponse {
  success: boolean;
  data: {
    profile_completed: boolean;
    employee_code: string;
    email: string;
    required_fields: {
      phone: string | null;
      date_of_birth: string | null;
      gender: string | null;
      position: string | null;
      emergency_contact: EmergencyContact | null;
      [key: string]: any;
    };
  };
}

interface CompleteProfileResponse {
  success: boolean;
  message: string;
  data?: {
    profile_completed: boolean;
    employee_code: string;
    full_name: string;
    email: string;
  };
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile_completed: boolean;
    employee_code: string;
  };
}

// New interfaces for My Profile endpoint
export interface MyProfileResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
    employee: {
      id: number;
      employee_code: string;
      full_name: string;
      phone: string;
      address: string;
      address_ktp: string;
      address_domisili: string | null;
      position: string;
      secondary_position: string | null;
      department: string;
      rank: string;
      job_class: string;
      tpp_amount: number;
      employment_type: string;
      employment_status: string;
      join_date: string;
    };
    face_registered: boolean;
    face_template_updated_at: string | null;
  };
}

export interface UpdateMyProfileData {
  name?: string;
  phone?: string;
  address?: string;
  address_ktp?: string;
  address_domisili?: string;
}

export interface UpdateMyProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: any;
    employee: any;
  };
}

class ProfileService {
  async getStatus(): Promise<ProfileStatusResponse['data']> {
    const response = await apiClient.get<{ data: ProfileStatusResponse['data'] }>(
      '/profile-completion/status'
    );
    return response.data.data;
  }

  async completeProfile(profileData: ProfileData): Promise<CompleteProfileResponse> {
    const response = await apiClient.post<CompleteProfileResponse>(
      '/profile-completion/complete',
      profileData
    );
    return response.data;
  }

  async updateProfile(updateData: Partial<ProfileData>): Promise<UpdateProfileResponse> {
    const response = await apiClient.put<UpdateProfileResponse>(
      '/profile-completion/update',
      updateData
    );
    return response.data;
  }

  async getMyProfile(): Promise<MyProfileResponse['data']> {
    const response = await apiClient.get<MyProfileResponse>('/my/profile');
    return response.data.data;
  }

  async updateMyProfile(data: UpdateMyProfileData): Promise<UpdateMyProfileResponse> {
    const response = await apiClient.put<UpdateMyProfileResponse>('/my/profile', data);
    return response.data;
  }

  async updatePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put('/my/profile/password', data);
    return response.data;
  }
}

export const profileService = new ProfileService();