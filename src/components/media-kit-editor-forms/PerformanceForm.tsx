import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EditorFormProps } from '@/lib/sections';

const PerformanceForm: React.FC<Pick<EditorFormProps, 'formData' | 'handleMetricsChange'>> = ({ formData, handleMetricsChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="avg_likes">Average Likes (General)</Label>
        <Input
          id="avg_likes"
          name="avg_likes"
          type="text" // Kept as text to allow for 'k', 'm' or fallback to string
          value={formData.avg_likes || ''} // Ensure value is not undefined/null
          onChange={handleMetricsChange}
          placeholder="e.g., 500"
          className="text-sm"
        />
      </div>
      <div>
        <Label htmlFor="reach">Average Reach (General)</Label>
        <Input
          id="reach"
          name="reach"
          type="text" // Kept as text
          value={formData.reach || ''} // Ensure value is not undefined/null
          onChange={handleMetricsChange}
          placeholder="e.g., 10000"
          className="text-sm"
        />
      </div>
      {/* Inputs for avg_video_views, avg_ig_reach, ig_engagement_rate removed as per user request */}
    </div>
  );
};

export default PerformanceForm; 