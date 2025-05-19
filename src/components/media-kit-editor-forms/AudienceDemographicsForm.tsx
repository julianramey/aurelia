import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EditorFormProps } from '@/lib/sections';

const AudienceDemographicsForm: React.FC<EditorFormProps> = ({ formData, handleInputChange, initialDataLoaded }) => {
  if (!initialDataLoaded) return <p>Loading demographics data...</p>; // Or a skeleton loader

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="audience_age_range">Audience Age Range</Label>
        <Input
          id="audience_age_range"
          name="audience_age_range"
          value={formData.audience_age_range || ''}
          onChange={handleInputChange}
          placeholder="e.g., 25-34"
        />
      </div>
      <div>
        <Label htmlFor="audience_location_main">Primary Audience Location</Label>
        <Input
          id="audience_location_main"
          name="audience_location_main"
          value={formData.audience_location_main || ''}
          onChange={handleInputChange}
          placeholder="e.g., USA (California)"
        />
      </div>
      <div>
        <Label htmlFor="audience_gender_female">Female Audience Percentage</Label>
        <Input
          id="audience_gender_female"
          name="audience_gender_female"
          value={formData.audience_gender_female || ''}
          onChange={handleInputChange}
          placeholder="e.g., 65%"
        />
      </div>
    </div>
  );
};

export default AudienceDemographicsForm; 