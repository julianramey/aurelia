import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/hooks/useProfile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCircleIcon, Cog6ToothIcon, DocumentIcon, HomeIcon, RectangleGroupIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [showUsername, setShowUsername] = useState(false);

  // Only show username when profile is fully loaded
  useEffect(() => {
    if (profile?.username) {
      setShowUsername(true);
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <nav className="w-full py-6 px-4 md:px-6 lg:px-8 border-b border-blush/20 bg-cream sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-display font-medium text-charcoal">
              Glowfolio
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <Link to="#features" className="text-sm font-medium text-taupe hover:text-rose transition-colors">
            Features
          </Link>
          <Link to="#howitworks" className="text-sm font-medium text-taupe hover:text-rose transition-colors">
            How It Works
          </Link>
          <Link to="#pricing" className="text-sm font-medium text-taupe hover:text-rose transition-colors">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative h-14 pl-4 pr-8 rounded-full hover:bg-white hover:shadow-sm transition-all duration-200 flex items-center cursor-pointer">
                  <div className="flex items-center gap-1">
                    <div className="transform scale-75">
                      <UserCircleIcon className="w-8 h-8 text-rose" />
                    </div>
                    <span className="font-medium text-charcoal text-base min-w-[100px]">
                      {showUsername ? profile?.username : <span className="invisible">placeholder</span>}
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-charcoal">
                      {profile?.full_name || 'Your Account'}
                    </p>
                    <p className="text-xs text-taupe">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="py-2">
                  <Link to="/dashboard" className="flex items-center w-full">
                    <HomeIcon className="h-4 w-4 mr-2 text-rose" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-2">
                  <Link to="/media-kit" className="flex items-center w-full">
                    <RectangleGroupIcon className="h-4 w-4 mr-2 text-rose" />
                    <span>Media Kit</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-2">
                  <Link to="/settings/profile" className="flex items-center w-full">
                    <Cog6ToothIcon className="h-4 w-4 mr-2 text-rose" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="py-2 text-rose"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button 
                  variant="ghost" 
                  className="hidden sm:inline-flex text-charcoal hover:bg-white/90"
                >
                  Login
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="rose" 
                  className="rounded-full px-6"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
