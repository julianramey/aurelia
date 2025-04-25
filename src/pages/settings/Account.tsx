import React from 'react';
import DashboardNav from '../../components/DashboardNav';
import { useAuth } from '../../lib/AuthContext';
import { 
  CreditCardIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function Account() {
  const { user } = useAuth();
  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav />
      <main className="p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-medium text-charcoal">Account Settings</h1>
            <p className="mt-2 text-taupe">Manage your account preferences and subscription</p>
          </div>

          <div className="space-y-6">
            {/* Subscription Info */}
            <div className="bg-white rounded-lg shadow-sm border border-blush/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-charcoal">Pro Plan</h2>
                  <p className="text-sm text-taupe">Your subscription renews on August 1, 2024</p>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose/10 text-rose">
                    Active
                  </span>
                </div>
              </div>
              <div className="mt-6 border-t border-blush/20 pt-6">
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 text-taupe" />
                  <span className="ml-2 text-sm text-taupe">Billing details</span>
                </div>
                <div className="mt-2 text-sm">
                  <p className="text-charcoal">•••• •••• •••• 4242</p>
                  <p className="text-taupe">Next billing date: August 1, 2024</p>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-blush/20 p-6">
              <h2 className="text-lg font-medium text-charcoal mb-6">Security</h2>
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-taupe">Current Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full rounded-md border border-blush/20 px-3 py-2 text-charcoal focus:border-rose focus:ring-rose"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-taupe">New Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full rounded-md border border-blush/20 px-3 py-2 text-charcoal focus:border-rose focus:ring-rose"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-taupe">Confirm New Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full rounded-md border border-blush/20 px-3 py-2 text-charcoal focus:border-rose focus:ring-rose"
                  />
                </div>
                <div className="flex justify-end">
                  {saved && (
                    <div className="flex items-center text-green-600 mr-4">
                      <CheckCircleIcon className="h-5 w-5 mr-1" />
                      <span className="text-sm">Password updated!</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="bg-rose text-white px-4 py-2 rounded-lg hover:bg-rose/90 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-lg shadow-sm border border-blush/20 p-6">
              <h2 className="text-lg font-medium text-charcoal mb-6">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BellIcon className="h-5 w-5 text-taupe" />
                    <span className="ml-2 text-sm text-charcoal">Email Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-taupe/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-taupe" />
                    <span className="ml-2 text-sm text-charcoal">Two-Factor Authentication</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-taupe/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 