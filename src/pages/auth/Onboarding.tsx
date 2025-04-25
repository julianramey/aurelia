import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

const NICHE_OPTIONS = [
  'Beauty',
  'Fashion',
  'Lifestyle',
  'Fitness',
  'Travel',
  'Food',
  'Tech',
  'Other'
];

const PITCH_STYLES = [
  'Professional',
  'Friendly',
  'Creative',
  'Direct',
  'Storytelling'
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    instagram_handle: '',
    tiktok_handle: '',
    follower_count: '',
    location: '',
    niche: NICHE_OPTIONS[0],
    personal_intro: '',
    preferred_pitch_style: PITCH_STYLES[0]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('No user found. Please try logging in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, let's check if the username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', formData.username)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error checking username:', checkError);
        throw new Error('Error checking username availability');
      }

      if (existingUser) {
        setError('Username is already taken. Please choose another.');
        return;
      }

      // Clean up the data before sending
      const profileData = {
        id: user.id,
        username: formData.username,
        full_name: formData.full_name,
        instagram_handle: formData.instagram_handle.replace('@', ''),
        tiktok_handle: formData.tiktok_handle.replace('@', ''),
        follower_count: parseInt(formData.follower_count) || 0,
        location: formData.location || null,
        niche: formData.niche,
        personal_intro: formData.personal_intro,
        preferred_pitch_style: formData.preferred_pitch_style,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Attempting to save profile with data:', profileData);

      const { data, error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select('*');

      if (upsertError) {
        console.error('Detailed Supabase error:', upsertError);
        throw new Error(upsertError.message);
      }

      console.log('Profile saved successfully:', data);
      navigate('/generate-media-kit');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Complete Your Profile</h2>
          <p className="mt-2 text-gray-600">Let's get your Glowfolio set up!</p>
        </div>

        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              required
              className="mt-1 px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="full_name"
              required
              className="mt-1 px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Instagram Handle</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
                @
              </span>
              <input
                type="text"
                name="instagram_handle"
                required
                className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-pink-500 focus:ring-pink-500 px-2"
                value={formData.instagram_handle}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">TikTok Handle</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
                @
              </span>
              <input
                type="text"
                name="tiktok_handle"
                required
                className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-pink-500 focus:ring-pink-500 px-2"
                value={formData.tiktok_handle}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Follower Count</label>
            <input
              type="number"
              name="follower_count"
              required
              className="mt-1 px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              value={formData.follower_count}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location (Optional)</label>
            <input
              type="text"
              name="location"
              className="mt-1 px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Niche</label>
            <select
              name="niche"
              required
              className="mt-1 px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              value={formData.niche}
              onChange={handleChange}
            >
              {NICHE_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Personal Intro</label>
            <textarea
              name="personal_intro"
              required
              rows={3}
              className="mt-1 px-2 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              value={formData.personal_intro}
              onChange={handleChange}
              placeholder="Tell brands a bit about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Pitch Style</label>
            <select
              name="preferred_pitch_style"
              required
              className="mt-1 px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              value={formData.preferred_pitch_style}
              onChange={handleChange}
            >
              {PITCH_STYLES.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 