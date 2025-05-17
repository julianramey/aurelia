import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EditorFormProps } from '@/lib/sections';

interface SocialMediaFormProps extends Pick<EditorFormProps, 'formData' | 'handleSocialChange'> {}

const SocialMediaForm: React.FC<SocialMediaFormProps> = ({ formData, handleSocialChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="instagram_handle">Instagram</Label>
        <Input
          id="instagram_handle"
          name="instagram_handle"
          value={formData.instagram_handle}
          onChange={handleSocialChange} // Uses specific social change handler
          placeholder="@yourusername"
        />
      </div>
      <div>
        <Label htmlFor="tiktok_handle">TikTok</Label>
        <Input
          id="tiktok_handle"
          name="tiktok_handle"
          value={formData.tiktok_handle}
          onChange={handleSocialChange} // Uses specific social change handler
          placeholder="@yourusername"
        />
      </div>
    </div>
  );
};

export default SocialMediaForm; 