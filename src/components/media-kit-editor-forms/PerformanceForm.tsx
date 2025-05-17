import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EditorFormProps } from '@/lib/sections';

interface PerformanceFormProps extends Pick<EditorFormProps, 'formData' | 'handleMetricsChange'> {}

const PerformanceForm: React.FC<PerformanceFormProps> = ({ formData, handleMetricsChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="avg_likes">Average Likes</Label>
        <Input
          id="avg_likes"
          name="avg_likes"
          type="text" // Kept as text
          value={formData.avg_likes}
          onChange={handleMetricsChange}
          placeholder="0"
        />
      </div>
      <div>
        <Label htmlFor="reach">Average Reach</Label>
        <Input
          id="reach"
          name="reach"
          type="text" // Kept as text
          value={formData.reach}
          onChange={handleMetricsChange}
          placeholder="0"
        />
      </div>
    </div>
  );
};

export default PerformanceForm; 