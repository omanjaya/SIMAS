'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { SelectWithError } from '@/components/profile/select-with-error';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { profileService } from '@/lib/api/profile';

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export default function CompleteProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    phone: '',
    date_of_birth: '',
    gender: '',
    position: '',
    address: '',
    department: '',
    emergency_contact: {
      name: '',
      phone: '',
      relationship: '',
    } as EmergencyContact,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfileStatus();
  }, []);

  const loadProfileStatus = async () => {
    try {
      setLoading(true);
      const response = await profileService.getStatus();
      if (!response.profile_completed) {
        // Load existing data if available
        setProfileData({
          phone: response.required_fields.phone || profileData.phone,
          date_of_birth: response.required_fields.date_of_birth || profileData.date_of_birth,
          gender: response.required_fields.gender || profileData.gender,
          position: response.required_fields.position || profileData.position,
          address: response.required_fields.address || profileData.address || '',
          department: response.required_fields.department || profileData.department || '',
          emergency_contact: response.required_fields.emergency_contact || profileData.emergency_contact,
        });
      } else {
        // If profile is already completed, redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error loading profile status:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('emergency_contact.')) {
      const field = name.split('.')[1] as keyof EmergencyContact;
      setProfileData(prev => ({
        ...prev,
        emergency_contact: {
          ...prev.emergency_contact,
          [field]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when selection is made
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!profileData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    if (!profileData.date_of_birth.trim()) {
      newErrors.date_of_birth = 'Date of birth is required';
    }
    
    if (!profileData.gender.trim()) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!profileData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    
    if (!profileData.emergency_contact.name.trim()) {
      newErrors['emergency_contact.name'] = 'Emergency contact name is required';
    }
    
    if (!profileData.emergency_contact.phone.trim()) {
      newErrors['emergency_contact.phone'] = 'Emergency contact phone is required';
    }
    
    if (!profileData.emergency_contact.relationship.trim()) {
      newErrors['emergency_contact.relationship'] = 'Emergency contact relationship is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await profileService.completeProfile(profileData);
      
      if (response.success) {
        toast.success(response.message || 'Profile completed successfully!');
        router.push('/dashboard');
      } else {
        toast.error(response.message || 'Failed to complete profile');
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('An error occurred while completing your profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Please fill in your personal information to complete your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                placeholder="e.g., +6281234567890"
                error={errors.phone}
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={profileData.date_of_birth}
                onChange={handleChange}
                error={errors.date_of_birth}
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <SelectWithError 
                value={profileData.gender} 
                onValueChange={(value) => handleSelectChange('gender', value)}
                placeholder="Select gender"
                error={errors.gender}
              >
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectWithError>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                name="position"
                value={profileData.position}
                onChange={handleChange}
                placeholder="e.g., Teacher, Staff, Administrator"
                error={errors.position}
              />
            </div>

            {/* Department (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={profileData.department}
                onChange={handleChange}
                placeholder="e.g., Science, Administration"
              />
            </div>

            {/* Address (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={profileData.address}
                onChange={handleChange}
                placeholder="Your address"
              />
            </div>

            {/* Emergency Contact Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Emergency Contact *</h3>
              
              <div className="space-y-4">
                {/* Emergency Contact Name */}
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact.name">Contact Name *</Label>
                  <Input
                    id="emergency_contact.name"
                    name="emergency_contact.name"
                    value={profileData.emergency_contact.name}
                    onChange={handleChange}
                    placeholder="Full name of emergency contact"
                    error={errors['emergency_contact.name']}
                  />
                </div>

                {/* Emergency Contact Phone */}
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact.phone">Contact Phone *</Label>
                  <Input
                    id="emergency_contact.phone"
                    name="emergency_contact.phone"
                    value={profileData.emergency_contact.phone}
                    onChange={handleChange}
                    placeholder="e.g., +6281234567890"
                    error={errors['emergency_contact.phone']}
                  />
                </div>

                {/* Emergency Contact Relationship */}
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact.relationship">Relationship *</Label>
                  <Input
                    id="emergency_contact.relationship"
                    name="emergency_contact.relationship"
                    value={profileData.emergency_contact.relationship}
                    onChange={handleChange}
                    placeholder="e.g., Spouse, Parent, Sibling"
                    error={errors['emergency_contact.relationship']}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Completing Profile...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}