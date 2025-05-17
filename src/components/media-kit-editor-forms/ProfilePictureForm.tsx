import React from 'react';
import { Button } from '@/components/ui/button';
import type { EditorFormProps } from '@/lib/sections';
// Assuming makeSafeKey is moved to a utils file, e.g., @/lib/utils
// If not, it would need to be passed as a prop or defined here.
// For now, let's try to import if it exists, otherwise it's a known dependency to resolve.
// import { makeSafeKey } from '@/lib/utils'; // Or wherever it might be

// Placeholder for makeSafeKey if not importable yet. This should be replaced by a proper import.
const makeSafeKey = (userId: string, originalName: string) => {
  const parts = originalName.split('.');
  const ext   = parts.length > 1 ? parts.pop() : '';
  const name  = parts.join('.');
  const safeBase = name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '_');
  return `${userId}/${safeBase}_${Date.now()}${ext ? `.${ext}` : ''}`;
};


interface ProfilePictureFormProps extends Pick<EditorFormProps, 'formData' | 'setFormData' | 'profile' | 'supabase' | 'toast'> {}

const ProfilePictureForm: React.FC<ProfilePictureFormProps> = ({ 
  formData, 
  setFormData, 
  profile, 
  supabase, 
  toast 
}) => {
  if (!setFormData || !profile || !supabase || !toast) {
    // Render nothing or an error if essential props are missing
    // This is a safeguard, expecting these to be passed from MediaKitEditor
    return <div>Error: Missing essential props for ProfilePictureForm.</div>;
  }

  return (
    <div className="flex items-center gap-4">
      {formData.profile_photo && (
        <img
          src={formData.profile_photo}
          alt="Profile preview"
          className="w-16 h-16 rounded-full object-cover border border-blush/20"
        />
      )}
      
      <div className="flex flex-col">
        <div className="relative">
          <Button 
            type="button" 
            variant="outline" 
            className="relative overflow-hidden"
            onClick={() => document.getElementById('avatar-upload')?.click()} // Changed ID to be more specific
          >
            {formData.profile_photo ? 'Change picture' : 'Upload picture'}
          </Button>
          <input
            id="avatar-upload" // Changed ID
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={async e => {
              const file = e.target.files?.[0];
              if (!file || !profile?.id) return;

              toast({ title: 'Uploading...', description: 'Please wait while we process your image.' });
              
              const key = makeSafeKey(profile.id, file.name);
              const { data, error } = await supabase
                .storage
                .from('avatars')
                .upload(key, file, { upsert: true });
              if (error) {
                return toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
              }

              const publicUrl = supabase
                .storage
                .from('avatars')
                .getPublicUrl(data.path)
                .data.publicUrl;

              setFormData(prev => ({ ...prev, profile_photo: publicUrl }));

              toast({ title: 'Uploaded!', description: 'Profile picture ready.' });
            }}
          />
        </div>
        <p className="text-xs text-taupe mt-2">
          Recommended: Square image, 500×500px or larger
        </p>
      </div>
    </div>
  );
};

export default ProfilePictureForm; 