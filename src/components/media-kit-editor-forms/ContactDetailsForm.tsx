import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EditorFormProps } from '@/lib/sections';

// interface ContactDetailsFormProps extends Pick<EditorFormProps, 'formData' | 'handleInputChange'> {}

const ContactDetailsForm: React.FC<EditorFormProps> = ({ formData, handleInputChange, sectionVisibility /* other props from EditorFormProps can be destructured if needed */ }) => {
  // The parent Card in MediaKitEditor already conditionally renders this form's content
  // based on sectionVisibility.contactDetails. So, no extra visibility check needed here for the whole form.
  // However, if sectionVisibility.contactDetails is false, this component's content area in MediaKitEditor is hidden.
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
      <div>
        <Label htmlFor="contact_phone">Phone</Label>
        <Input
          id="contact_phone"
          name="contact_phone"
          type="text"
          value={formData.contact_phone}
          onChange={handleInputChange}
          placeholder="+1 234 567 8900"
        />
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          type="text"
          value={formData.website}
          onChange={handleInputChange}
          placeholder="yourwebsite.com"
        />
      </div>
    </div>
  );
};

export default ContactDetailsForm; 