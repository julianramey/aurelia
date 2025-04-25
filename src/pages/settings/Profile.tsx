import React from 'react';
import DashboardNav from '../../components/DashboardNav';
import { useProfile } from '../../lib/hooks/useProfile';
import { 
  CameraIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function Profile() {
  const { profile, updateProfile } = useProfile();
  const [saved, setSaved] = React.useState(false);
  const [formData, setFormData] = React.useState({
    username: '',
    full_name: '',
    instagram_handle: '',
    tiktok_handle: '',
    personal_intro: '',
    media_kit_url: ''
  });

  // Initialize form data when profile is loaded
  React.useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        instagram_handle: profile.instagram_handle || '',
        tiktok_handle: profile.tiktok_handle || '',
        personal_intro: profile.personal_intro || '',
        media_kit_url: profile.media_kit_url || ''
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special validation for media_kit_url - only allow alphanumeric and hyphens
    if (name === 'media_kit_url') {
      const sanitizedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await updateProfile(formData);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav />
      <main className="p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-medium text-charcoal">Profile Settings</h1>
            <p className="mt-2 text-taupe">Manage your public profile information</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-blush/20 overflow-hidden">
            {/* Profile Header */}
            <div className="p-6 border-b border-blush/20">
              <div className="flex items-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-rose/10 flex items-center justify-center">
                    <CameraIcon className="h-8 w-8 text-rose" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm border border-blush/20">
                    <CameraIcon className="h-4 w-4 text-taupe" />
                  </button>
                </div>
                <div className="ml-6">
                  <h2 className="text-lg font-medium text-charcoal">Profile Photo</h2>
                  <p className="text-sm text-taupe">Upload a photo to personalize your profile</p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-taupe">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-blush/20 px-3 py-2 text-charcoal focus:border-rose focus:ring-rose"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-taupe">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-blush/20 px-3 py-2 text-charcoal focus:border-rose focus:ring-rose"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-taupe">Media Kit URL</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-blush/20 bg-cream px-3 text-taupe sm:text-sm">
                      glowfolio.com/
                    </span>
                    <input
                      type="text"
                      name="media_kit_url"
                      value={formData.media_kit_url}
                      onChange={handleChange}
                      placeholder="your-custom-url"
                      className="block w-full rounded-none rounded-r-md border border-blush/20 px-3 py-2 text-charcoal focus:border-rose focus:ring-rose"
                    />
                  </div>
                  <p className="mt-1 text-sm text-taupe">This will be the public URL for your media kit. Only lowercase letters, numbers, and hyphens allowed.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-taupe">Instagram Handle</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-blush/20 bg-cream px-3 text-taupe sm:text-sm">
                      @
                    </span>
                    <input
                      type="text"
                      name="instagram_handle"
                      value={formData.instagram_handle}
                      onChange={handleChange}
                      className="block w-full rounded-none rounded-r-md border border-blush/20 px-3 py-2 text-charcoal focus:border-rose focus:ring-rose"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-taupe">TikTok Handle</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-blush/20 bg-cream px-3 text-taupe sm:text-sm">
                      @
                    </span>
                    <input
                      type="text"
                      name="tiktok_handle"
                      value={formData.tiktok_handle}
                      onChange={handleChange}
                      className="block w-full rounded-none rounded-r-md border border-blush/20 px-3 py-2 text-charcoal focus:border-rose focus:ring-rose"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-taupe">Bio</label>
                <textarea
                  rows={4}
                  name="personal_intro"
                  value={formData.personal_intro}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-blush/20 px-3 py-2 text-charcoal focus:border-rose focus:ring-rose"
                />
              </div>

              <div className="flex justify-end">
                {saved && (
                  <div className="flex items-center text-green-600 mr-4">
                    <CheckCircleIcon className="h-5 w-5 mr-1" />
                    <span className="text-sm">Saved!</span>
                  </div>
                )}
                <button
                  type="submit"
                  className="bg-rose text-white px-4 py-2 rounded-lg hover:bg-rose/90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 