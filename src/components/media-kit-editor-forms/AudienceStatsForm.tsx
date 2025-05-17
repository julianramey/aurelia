import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EditorFormProps } from '@/lib/sections';

interface AudienceStatsFormProps extends Pick<EditorFormProps, 'formData' | 'handleMetricsChange'> {}

const AudienceStatsForm: React.FC<AudienceStatsFormProps> = ({ formData, handleMetricsChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="follower_count">Total Followers</Label>
        <Input
          id="follower_count"
          name="follower_count"
          type="text" // Kept as text to allow flexible input, parsing is done in handleMetricsChange
          value={formData.follower_count}
          onChange={handleMetricsChange}
          placeholder="0"
        />
      </div>
      <div>
        <Label htmlFor="engagement_rate">Engagement Rate</Label>
        <div className="flex items-center gap-2">
          <Input
            id="engagement_rate"
            name="engagement_rate"
            type="text" // Kept as text
            value={formData.engagement_rate}
            onChange={handleMetricsChange}
            placeholder="0.0"
          />
          <span className="text-sm text-taupe">%</span>
        </div>
      </div>
    </div>
  );
};

export default AudienceStatsForm; 