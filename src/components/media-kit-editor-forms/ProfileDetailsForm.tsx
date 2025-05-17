import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { EditorFormProps } from '@/lib/sections'; // Import the shared props type

// Use EditorFormProps directly as ProfileDetailsFormProps
const ProfileDetailsForm: React.FC<EditorFormProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="brand_name">Name</Label>
        <Input
          id="brand_name"
          name="brand_name"
          value={formData.brand_name}
          onChange={handleInputChange}
          placeholder="Your name"
        />
      </div>
      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          name="tagline"
          value={formData.tagline}
          onChange={handleInputChange}
          placeholder="Your brand tagline"
        />
      </div>
      <div>
        <Label htmlFor="personal_intro">About You</Label>
        <Textarea
          id="personal_intro"
          name="personal_intro"
          value={formData.personal_intro}
          onChange={handleInputChange}
          placeholder="Tell your story"
          className="h-24"
        />
      </div>
    </div>
  );
};

export default ProfileDetailsForm; 