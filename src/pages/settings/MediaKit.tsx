import React from 'react';
import DashboardNav from '../../components/DashboardNav';
import { useAuth } from '../../lib/AuthContext';
import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  PhotoIcon,
  SwatchIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function MediaKit() {
  const { user } = useAuth();

  const mockAnalytics = {
    followers: '125K',
    engagement: '4.8%',
    reachPerPost: '45K',
    avgLikes: '8.2K'
  };

  const brandColors = [
    { name: 'Primary', hex: '#FF4785', className: 'bg-rose' },
    { name: 'Secondary', hex: '#F8F7F4', className: 'bg-cream' },
    { name: 'Accent', hex: '#2A2118', className: 'bg-charcoal' }
  ];

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav />
      <main className="p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-medium text-charcoal">Media Kit</h1>
            <p className="mt-2 text-taupe">Share your brand assets and analytics with potential partners</p>
          </div>

          {/* Analytics Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-blush/20 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-charcoal">Analytics Overview</h2>
              <button className="flex items-center text-sm text-rose hover:text-rose/80">
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Export PDF
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-cream rounded-lg">
                <p className="text-sm text-taupe mb-1">Followers</p>
                <p className="text-2xl font-medium text-charcoal">{mockAnalytics.followers}</p>
              </div>
              <div className="p-4 bg-cream rounded-lg">
                <p className="text-sm text-taupe mb-1">Engagement</p>
                <p className="text-2xl font-medium text-charcoal">{mockAnalytics.engagement}</p>
              </div>
              <div className="p-4 bg-cream rounded-lg">
                <p className="text-sm text-taupe mb-1">Reach/Post</p>
                <p className="text-2xl font-medium text-charcoal">{mockAnalytics.reachPerPost}</p>
              </div>
              <div className="p-4 bg-cream rounded-lg">
                <p className="text-sm text-taupe mb-1">Avg. Likes</p>
                <p className="text-2xl font-medium text-charcoal">{mockAnalytics.avgLikes}</p>
              </div>
            </div>
          </div>

          {/* Brand Assets */}
          <div className="bg-white rounded-lg shadow-sm border border-blush/20 p-6 mb-6">
            <h2 className="text-lg font-medium text-charcoal mb-6">Brand Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-blush/20 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <PhotoIcon className="h-5 w-5 text-taupe" />
                  <span className="ml-2 text-charcoal">Logo Package</span>
                </div>
                <button className="w-full bg-cream text-charcoal px-4 py-2 rounded-lg hover:bg-cream/80 transition-colors flex items-center justify-center">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download (.zip)
                </button>
              </div>
              <div className="border border-blush/20 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <DocumentTextIcon className="h-5 w-5 text-taupe" />
                  <span className="ml-2 text-charcoal">Press Kit</span>
                </div>
                <button className="w-full bg-cream text-charcoal px-4 py-2 rounded-lg hover:bg-cream/80 transition-colors flex items-center justify-center">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download (.pdf)
                </button>
              </div>
            </div>
          </div>

          {/* Brand Guidelines */}
          <div className="bg-white rounded-lg shadow-sm border border-blush/20 p-6">
            <h2 className="text-lg font-medium text-charcoal mb-6">Brand Guidelines</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-charcoal mb-3">Color Palette</h3>
                <div className="grid grid-cols-3 gap-4">
                  {brandColors.map((color) => (
                    <div key={color.name} className="space-y-2">
                      <div className={`h-12 rounded-lg ${color.className}`}></div>
                      <div>
                        <p className="text-sm font-medium text-charcoal">{color.name}</p>
                        <p className="text-sm text-taupe">{color.hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-charcoal mb-3">Typography</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-display text-2xl text-charcoal">Display Font</p>
                    <p className="text-sm text-taupe">Playfair Display</p>
                  </div>
                  <div>
                    <p className="font-sans text-2xl text-charcoal">Body Font</p>
                    <p className="text-sm text-taupe">Inter</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 