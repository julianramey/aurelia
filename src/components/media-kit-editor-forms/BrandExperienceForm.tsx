import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { EditorFormProps } from '@/lib/sections';

// BrandExperienceForm might need specific props from EditorFormProps
interface BrandExperienceFormProps extends Pick<EditorFormProps, 'formData' | 'handleBrandCollaborations' | 'profile' | 'updateCollaborations'> {}

const BrandExperienceForm: React.FC<BrandExperienceFormProps> = ({ 
  formData, 
  handleBrandCollaborations, 
  profile, 
  updateCollaborations 
}) => {
  return (
    <div className="space-y-1">
      <Label htmlFor="brand_collaborations_text">Past Collaborations</Label>
      <Textarea
        id="brand_collaborations_text"
        name="brand_collaborations_text"
        value={formData.brand_collaborations_text || ''}
        onChange={handleBrandCollaborations}
        onBlur={() => {
          if (profile?.id && formData.brand_collaborations_text && updateCollaborations) {
            const collabsArray = formData.brand_collaborations_text
              .split(',')
              .map(item => item.trim())
              .filter(Boolean);
            
            updateCollaborations(collabsArray.map(brand => ({ profile_id: profile.id, brand_name: brand })));
          }
        }}
        placeholder="Enter brand names separated by commas"
        className="h-24"
      />
      <p className="text-sm text-taupe mt-2">
        Example: Nike, Adidas, Puma
      </p>
    </div>
  );
};

export default BrandExperienceForm; 