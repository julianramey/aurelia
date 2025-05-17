import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { EditorFormProps } from '@/lib/sections';

interface ServicesSkillsFormProps extends Pick<EditorFormProps, 
  'formData' | 
  'handleServicesChange' | 
  'handleSkillsChange' | 
  'profile' | 
  'updateServices'
> {}

const ServicesSkillsForm: React.FC<ServicesSkillsFormProps> = ({ 
  formData, 
  handleServicesChange, 
  handleSkillsChange, 
  profile, 
  updateServices 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="services_text">Services Offered</Label>
        <Textarea
          id="services_text"
          name="services_text"
          value={formData.services_text || ''}
          onChange={handleServicesChange}
          onBlur={() => {
            if (profile?.id && formData.services_text && updateServices) {
              const servicesArray = formData.services_text
                .split(',')
                .map(item => item.trim())
                .filter(Boolean);
              
              updateServices(servicesArray.map(service => ({ profile_id: profile.id, service_name: service })));
            }
          }}
          placeholder="Enter services separated by commas"
          className="h-24"
        />
        <p className="text-sm text-taupe mt-2">
          Example: Content Creation, Brand Photography, Social Media Management
        </p>
      </div>
      <div>
        <Label htmlFor="skills_text">Key Skills</Label>
        <Textarea
          id="skills_text"
          name="skills_text"
          value={formData.skills_text || ''}
          onChange={handleSkillsChange}
          placeholder="Enter skills separated by commas"
          className="h-24"
          // Note: The original onBlur for skills to update profile.skills directly is not present here.
          // If skills need to be saved to a separate table like services/collaborations via a hook,
          // that logic would be added here, similar to services_text onBlur.
          // For now, it only updates formData, and skills are saved with the main save action.
        />
        <p className="text-sm text-taupe mt-2">
          Example: Adobe Photoshop, Video Editing, Copywriting
        </p>
      </div>
    </div>
  );
};

export default ServicesSkillsForm; 