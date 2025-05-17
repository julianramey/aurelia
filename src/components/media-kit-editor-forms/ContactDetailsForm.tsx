import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EditorFormProps } from '@/lib/sections';

interface ContactDetailsFormProps extends Pick<EditorFormProps, 'formData' | 'handleInputChange'> {}

const ContactDetailsForm: React.FC<ContactDetailsFormProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="text" // Was 'email', but handleInputChange is generic. Kept as 'text'.
          value={formData.email}
          onChange={handleInputChange}
          placeholder="you@example.com"
        />
      </div>
    </div>
  );
};

export default ContactDetailsForm; 