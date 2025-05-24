import React, { useState } from 'react';
// createPortal is no longer needed
import type { SectionVisibilityState } from '@/lib/types';

interface VideoItemProp {
  url: string;
  thumbnail_url?: string;
  provider_name?: string;
  // embed_html?: string; // Kept for type consistency, but not used by current inline logic
}

interface VideoShowcaseProps {
  videos: VideoItemProp[];
  sectionVisibility: SectionVisibilityState;
  isPreview?: boolean;
}

export default function VideoShowcaseBlock({
  videos,
  isPreview = false,
}: VideoShowcaseProps) {
  const [showEmbed, setShowEmbed] = useState<Record<number, boolean>>({});
  const extractTikTokId = (url: string) => url.match(/video\/(\d+)/)?.[1] ?? null;

  if (!videos.length && !isPreview) return null;

  if (isPreview && !videos.length) {
    return (
      <div className="text-center py-10 text-gray-400 italic">
        Video showcase will appear here. Add video URLs in the editor.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      {videos.map((vid, i) => {
        const postId = vid.provider_name === 'tiktok' ? extractTikTokId(vid.url) : null;

        return (
          <div key={i} className="w-full sm:w-[48%] md:w-[31%] lg:w-[31%] xl:w-[31%] p-2">
            {showEmbed[i] && vid.provider_name === 'tiktok' && postId ? (
              // Inline TikTok Player using player/v1
              <div
                className="rounded-lg shadow-md overflow-visible relative"
              >
                <iframe
                  src={
                    `https://www.tiktok.com/player/v1/${postId}` +
                    `?autoplay=1` +
                    `&controls=1` +
                    `&description=0` +
                    `&music_info=0` +
                    `&closed_caption=0` +
                    `&loop=1`
                  }
                  className="w-full aspect-[9/16]"
                  style={{ border: 'none' }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={`TikTok video ${postId}`}
                />
              </div>
            ) : (
              // Thumbnail Button
              <button
                type="button"
                onClick={() => {
                  if (!isPreview) {
                    if (vid.provider_name === 'tiktok' && postId) {
                      setShowEmbed(prev => ({ ...prev, [i]: true }));
                    } else if (vid.url) {
                      // Fallback for non-TikTok videos or TikToks without a valid ID: open URL
                      window.open(vid.url, '_blank', 'noopener,noreferrer');
                    }
                  }
                }}
                className="aspect-[9/16] w-full rounded-lg overflow-hidden shadow-md relative cursor-pointer group bg-slate-200"
              >
                <img
                  src={vid.thumbnail_url || 'https://placehold.co/270x480/FFE4E8/000000?text=Video'}
                  alt={`Video ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/40 transition">
                  {isPreview ? (
                    <span className="text-white text-xs font-semibold p-1 bg-black/50 rounded-sm">
                      Preview
                    </span>
                  ) : (
                    <svg
                      className="w-10 h-10 md:w-12 md:h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7L8 5z" />
                    </svg>
                  )}
                </div>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
} 