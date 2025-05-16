import React, { Suspense, lazy, useMemo, useState, useEffect } from 'react';
import DashboardNav from '@/components/DashboardNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import PreviewLoadingFallback from '@/components/PreviewLoadingFallback';
import {
  IdentificationIcon,
  CalculatorIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  TableCellsIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import type { ProfileData } from '@/pages/MediaKit';
import { defaultColorScheme } from '@/pages/MediaKit';
import type { MediaKitStats, Service, BrandCollaboration } from '@/lib/types';

const LazyMediaKit = lazy(() => import('@/pages/MediaKit'));
const LazyRateCalculator = lazy(() => import('@/pages/RateCalculator'));
const LazyAnalyticsDashboard = lazy(() => import('@/pages/Analytics'));
const LazyBrandDiscoveryPage = lazy(() => import('@/pages/BrandDirectory'));
const LazyAIAgentPage = lazy(() => import('@/pages/Agent'));
const LazyOutreachTrackerPage = lazy(() => import('@/pages/OutreachTracker'));

interface DashboardModule {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  href: string;
  cta: string;
  proFeature?: boolean;
}

const modules: DashboardModule[] = [
  {
    id: 'media-kit',
    name: 'Media Kit',
    description: 'Your professional, shareable online resume. Attract brands & showcase your talent.',
    icon: IdentificationIcon,
    href: '/media-kit',
    cta: 'View My Kit',
  },
  {
    id: 'rate-calculator',
    name: 'Rate Calculator',
    description: 'Estimate your content value. Set competitive rates for brand collaborations.',
    icon: CalculatorIcon,
    href: '/rate-calculator',
    cta: 'Calculate Rates',
  },
  {
    id: 'analytics',
    name: 'Analytics Overview',
    description: 'Track your growth. Understand your audience & performance across platforms.',
    icon: ChartBarIcon,
    href: '/analytics',
    cta: 'View Analytics',
  },
  {
    id: 'brand-discovery',
    name: 'Brand Discovery',
    description: 'Find brands to collaborate with. Search our database of influencer-friendly companies.',
    icon: MagnifyingGlassIcon,
    href: '/brand-directory',
    cta: 'Discover Brands',
    proFeature: true,
  },
  {
    id: 'ai-agent',
    name: 'Aurelia AI Agent',
    description: 'Your personal AI assistant. Brainstorm ideas, draft emails, get advice.',
    icon: SparklesIcon,
    href: '/agent',
    cta: 'Chat with AI',
  },
  {
    id: 'outreach-tracker',
    name: 'Outreach Tracker',
    description: 'Manage your brand communications. Keep track of pitches & follow-ups.',
    icon: TableCellsIcon,
    href: '/outreach-tracker',
    cta: 'Track Outreach',
    proFeature: true,
  },
];

// Define a more specific type for the raw profile data from Supabase
interface RawProfileFromDB extends Partial<Omit<ProfileData, 'media_kit_data' | 'videos' | 'services' | 'brand_collaborations' | 'media_kit_stats' | 'section_visibility'>> {
  id: string; 
  user_id: string; 
  media_kit_data?: string | Record<string, any>; 
  media_kit_videos?: { url: string, thumbnail_url: string }[];
  services?: Service[]; 
  brand_collaborations?: BrandCollaboration[]; 
  media_kit_stats?: MediaKitStats[];
  section_visibility?: Record<string, boolean>;
  username?: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  contact_email?: string;
  brand_name?: string;
  tagline?: string;
  personal_intro?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  skills?: string[];
  portfolio_images?: string[];
  selected_template_id?: string;
  media_kit_url?: string;
  niche?: string;
  created_at?: string;
  updated_at?: string;
  follower_count?: number | string;
  engagement_rate?: number | string;
  avg_likes?: number | string;
  reach?: number | string;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const me = user?.user_metadata?.username || user?.id;

  const [mediaKitPreviewData, setMediaKitPreviewData] = useState<ProfileData | null>(null);
  const [isMediaKitPreviewLoading, setIsMediaKitPreviewLoading] = useState<boolean>(true);
  const [mediaKitPreviewError, setMediaKitPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (me) {
      const fetchMediaKitPreviewData = async () => {
        setIsMediaKitPreviewLoading(true);
        setMediaKitPreviewError(null);
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select(`
              *,\
              media_kit_stats(*),\
              brand_collaborations(*),\
              services(*),\
              media_kit_videos(url, thumbnail_url)\
            `)
            .eq(user?.user_metadata?.username ? 'username' : 'id', me)
            .single();

          if (error) throw error;

          if (profile) {
            const dbProfileData = profile as RawProfileFromDB; 

            let mediaKitDataObj: Record<string, any> = {};
            if (typeof dbProfileData.media_kit_data === 'string') {
              try { mediaKitDataObj = JSON.parse(dbProfileData.media_kit_data); } catch { /*ignore*/ }
            } else if (typeof dbProfileData.media_kit_data === 'object' && dbProfileData.media_kit_data !== null) {
              mediaKitDataObj = dbProfileData.media_kit_data;
            }

            const typedMediaKitStats = (dbProfileData.media_kit_stats || []) as MediaKitStats[];
            const joinedVideos = (dbProfileData.media_kit_videos || []) as {url: string, thumbnail_url: string}[];
            const joinedServices = (dbProfileData.services || []) as Service[]; 
            const joinedCollabs = (dbProfileData.brand_collaborations || []) as BrandCollaboration[]; 

            const fullPreviewData: ProfileData = {
              id: dbProfileData.id || '',
              user_id: dbProfileData.user_id || '',
              username: dbProfileData.username || '',
              full_name: dbProfileData.full_name || mediaKitDataObj?.brand_name || 'Your Name',
              email: dbProfileData.email || '',
              avatar_url: dbProfileData.avatar_url,
              contact_email: mediaKitDataObj?.contact_email || dbProfileData.contact_email || dbProfileData.email || '',
              
              brand_name: dbProfileData.brand_name || mediaKitDataObj?.brand_name,
              tagline: dbProfileData.tagline || mediaKitDataObj?.tagline || '',
              personal_intro: dbProfileData.personal_intro || mediaKitDataObj?.personal_intro,
              instagram_handle: dbProfileData.instagram_handle || mediaKitDataObj?.instagram_handle,
              tiktok_handle: dbProfileData.tiktok_handle || mediaKitDataObj?.tiktok_handle,
              skills: dbProfileData.skills || mediaKitDataObj?.skills || [],
              portfolio_images: dbProfileData.portfolio_images || mediaKitDataObj?.portfolio_images || [],
              selected_template_id: dbProfileData.selected_template_id || mediaKitDataObj?.selected_template_id || 'default',
              media_kit_url: dbProfileData.media_kit_url,
              niche: dbProfileData.niche,
              created_at: dbProfileData.created_at,
              updated_at: dbProfileData.updated_at,

              media_kit_data: { // This must be the object form
                type: "media_kit_data",
                brand_name: mediaKitDataObj?.brand_name || dbProfileData.brand_name || '',
                tagline: mediaKitDataObj?.tagline || dbProfileData.tagline || '',
                colors: mediaKitDataObj?.colors || defaultColorScheme,
                font: mediaKitDataObj?.font || 'Inter',
                selected_template_id: mediaKitDataObj?.selected_template_id || dbProfileData.selected_template_id || 'default',
                skills: mediaKitDataObj?.skills || dbProfileData.skills || [],
                contact_email: mediaKitDataObj?.contact_email || dbProfileData.contact_email || dbProfileData.email || '',
                videos: joinedVideos, 
                portfolio_images: mediaKitDataObj?.portfolio_images || dbProfileData.portfolio_images || [],
                personal_intro: mediaKitDataObj?.personal_intro || dbProfileData.personal_intro || '',
                instagram_handle: mediaKitDataObj?.instagram_handle || dbProfileData.instagram_handle || '',
                tiktok_handle: mediaKitDataObj?.tiktok_handle || dbProfileData.tiktok_handle || '',
              },
              
              videos: joinedVideos, 
              services: joinedServices,
              brand_collaborations: joinedCollabs,
              
              follower_count: typedMediaKitStats.find(s => s.platform === 'instagram')?.follower_count || dbProfileData.follower_count || 0,
              engagement_rate: typedMediaKitStats.find(s => s.platform === 'instagram')?.engagement_rate || dbProfileData.engagement_rate || 0,
              avg_likes: typedMediaKitStats.find(s => s.platform === 'instagram')?.avg_likes || dbProfileData.avg_likes || 0,
              reach: typedMediaKitStats.find(s => s.platform === 'instagram')?.weekly_reach || dbProfileData.reach || 0,
              media_kit_stats: typedMediaKitStats,
              
              section_visibility: dbProfileData.section_visibility ?? {
                profileDetails: true, profilePicture: true, socialMedia: true,
                audienceStats: true, performance: true, tiktokVideos: true,
                brandExperience: true, servicesSkills: true, contactDetails: true,
              },
            };
            setMediaKitPreviewData(fullPreviewData);
          } else {
            setMediaKitPreviewError('Profile not found for media kit preview.');
          }
        } catch (err) {
          console.error("Error fetching media kit preview data:", err);
          setMediaKitPreviewError(err instanceof Error ? err.message : 'Failed to load media kit preview');
        } finally {
          setIsMediaKitPreviewLoading(false);
        }
      };
      fetchMediaKitPreviewData();
    } else if (!authLoading) {
      setIsMediaKitPreviewLoading(false);
      setMediaKitPreviewError('User not available for media kit preview.');
    }
  }, [me, authLoading, user]);

  const PREVIEWS = useMemo(() => ({
    'media-kit': isMediaKitPreviewLoading ? (
      <PreviewLoadingFallback />
    ) : mediaKitPreviewError ? (
      <div className="text-red-500 p-4">Error: {mediaKitPreviewError}</div>
    ) : mediaKitPreviewData ? (
      <div 
        className="w-[250%] h-[250%] origin-top-left bg-white"
        style={{ transform: 'scale(0.4)', transformOrigin: 'top left' }}
      >
        <Suspense fallback={<PreviewLoadingFallback />}>
          <LazyMediaKit isPreview previewUsername={me} previewData={mediaKitPreviewData} />
        </Suspense>
      </div>
    ) : (
      <div className="text-gray-500 p-4">No media kit data available for preview.</div>
    ),
    'rate-calculator': (
        <div 
            className="w-[250%] h-[250%] origin-top-left bg-white"
            style={{ transform: 'scale(0.4)', transformOrigin: 'top left' }}
        >
            <Suspense fallback={<PreviewLoadingFallback />}>
                <LazyRateCalculator isPreview={true} />
            </Suspense>
        </div>
    ),
    'analytics': (
        <div 
            className="w-[250%] h-[250%] origin-top-left bg-white"
            style={{ transform: 'scale(0.4)', transformOrigin: 'top left' }}
        >
            <Suspense fallback={<PreviewLoadingFallback />}>
                <LazyAnalyticsDashboard isPreview={true} />
            </Suspense>
        </div>
    ),
    'brand-discovery': (
        <div 
            className="w-[250%] h-[250%] origin-top-left bg-white"
            style={{ transform: 'scale(0.4)', transformOrigin: 'top left' }}
        >
            <Suspense fallback={<PreviewLoadingFallback />}>
                <LazyBrandDiscoveryPage isPreview={true} />
            </Suspense>
        </div>
    ),
    'ai-agent': (
        <div 
            className="w-[250%] h-[250%] origin-top-left bg-white"
            style={{ 
                transform: 'scale(0.4)', 
                transformOrigin: 'top left' 
            }}
        >
            <Suspense fallback={<PreviewLoadingFallback />}>
                <LazyAIAgentPage isPreview={true} />
            </Suspense>
        </div>
    ),
    'outreach-tracker': (
        <div 
            className="w-[250%] h-[250%] origin-top-left bg-white"
            style={{ transform: 'scale(0.4)', transformOrigin: 'top left' }}
        >
            <Suspense fallback={<PreviewLoadingFallback />}>
                <LazyOutreachTrackerPage isPreview={true} />
            </Suspense>
        </div>
    ),
  }), [isMediaKitPreviewLoading, mediaKitPreviewError, mediaKitPreviewData, me]);

  const AbstractPreview = React.memo(({ id }: { id: string }) => (
    <div className="w-full h-full bg-slate-50 overflow-hidden">
      <ErrorBoundary fallbackMessage={`Cannot load preview for ${id}`}>
        {PREVIEWS[id as keyof typeof PREVIEWS]} 
      </ErrorBoundary>
    </div>
  ));
  AbstractPreview.displayName = 'AbstractPreview';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      <DashboardNav />
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-display font-medium tracking-tight text-slate-900">
            Welcome back, <span className="text-rose-600">{user?.user_metadata?.full_name || user?.email || 'Creator'}</span>!
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Here's your central hub for managing your influencer career.
          </p>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-800 mb-1">Quick Access</h2>
            <p className="text-slate-600">Jump right back into your most used tools.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {modules.map((module) => (
              <Link 
                to={module.href} 
                key={module.id}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col border border-slate-200/75 hover:border-rose/75"
              >
                <div className="w-full h-48 bg-slate-50 group-hover:bg-rose/10 transition-colors duration-300 flex items-center justify-center p-1 border-b border-slate-200/75 group-hover:border-rose/20 overflow-hidden">
                  <AbstractPreview id={module.id} />
                </div> 
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center mb-2">
                    <div className="p-2.5 bg-rose/10 rounded-lg mr-3 flex-shrink-0 group-hover:bg-rose/20 transition-colors duration-300">
                        <module.icon className="h-5 w-5 text-rose group-hover:text-rose/90 transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h2 className="text-base font-semibold text-slate-700 group-hover:text-rose transition-colors duration-300 truncate" title={module.name}>{module.name}</h2>
                          {module.proFeature && (
                            <span className="ml-2 flex-shrink-0 px-2 py-0.5 text-xs font-semibold text-rose bg-rose/10 rounded-full">
                              PRO
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors duration-300 line-clamp-2">{module.description}</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-4">
                    <span className="inline-flex items-center text-sm font-medium text-rose group-hover:text-rose/90 group-hover:underline">
                        {module.cta}
                        <ArrowRightIcon className="ml-1.5 h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 pt-10 border-t border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">What's New</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 shadow-lg rounded-xl border border-transparent">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Feature Update: Enhanced AI Agent</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Aurelia AI can now help you draft responses to brand emails and analyze campaign proposals. Try it out!
                </p>
                <Link to="/agent" className="text-sm font-medium text-rose-600 hover:text-rose-500">
                  Chat with AI &rarr;
                </Link>
              </div>
              <div className="bg-white p-6 shadow-lg rounded-xl border border-transparent">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">New Blog Post: Mastering TikTok Trends</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Learn how to identify and leverage trending audio and challenges to boost your TikTok presence.
                </p>
                <a href="#" className="text-sm font-medium text-rose-600 hover:text-rose-500">
                  Read more &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 