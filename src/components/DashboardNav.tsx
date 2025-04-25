import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useProfile } from '../lib/hooks/useProfile';
import { supabase } from '../lib/supabase';
import {
  UserCircleIcon,
  DocumentIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export default function DashboardNav() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const location = useLocation();

  // Only show username when profile is fully loaded
  useEffect(() => {
    // If we already have the profile username, show it
    if (profile?.username) {
      setShowUsername(true);
    }
  }, [profile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-white border-b border-blush/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-display font-medium text-charcoal">
                Glowfolio
              </span>
            </Link>
            
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  location.pathname === '/dashboard'
                    ? 'text-rose border-rose'
                    : 'text-taupe border-transparent hover:text-rose hover:border-rose/40'
                }`}
              >
                Analytics
              </Link>
              <Link
                to="/media-kit"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  location.pathname === '/media-kit'
                    ? 'text-rose border-rose'
                    : 'text-taupe border-transparent hover:text-rose hover:border-rose/40'
                }`}
              >
                Media Kit
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center text-taupe hover:text-rose p-2 rounded-lg"
              >
                <UserCircleIcon className="h-6 w-6" />
                <span className="ml-2 text-sm font-medium hidden sm:flex items-center min-w-[80px]">
                  {showUsername ? (
                    profile?.username
                  ) : (
                    <span className="invisible">placeholder</span>
                  )}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-blush/20 py-1 z-50">
                  <Link
                    to="/settings/profile"
                    className="flex items-center px-4 py-2 text-sm text-taupe hover:text-rose hover:bg-cream"
                  >
                    <UserCircleIcon className="h-5 w-5 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/settings/account"
                    className="flex items-center px-4 py-2 text-sm text-taupe hover:text-rose hover:bg-cream"
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-2" />
                    Account Settings
                  </Link>
                  <Link
                    to="/media-kit"
                    className="flex items-center px-4 py-2 text-sm text-taupe hover:text-rose hover:bg-cream"
                  >
                    <DocumentIcon className="h-5 w-5 mr-2" />
                    View Media Kit
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-taupe hover:text-rose hover:bg-cream"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 