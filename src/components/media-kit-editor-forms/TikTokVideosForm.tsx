import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrashIcon } from '@heroicons/react/24/solid';
import type { EditorFormProps } from '@/lib/sections';
import type { VideoItem } from '@/lib/types'; // Assuming VideoItem is in types

interface TikTokVideosFormProps extends Pick<EditorFormProps, 
  'videoLinks' | 
  'setVideoLinks' | 
  'toast' | 
  'handleAddVideo' | 
  'handleRemoveVideo' | 
  'handleVideoUrlChange' | 
  'formData' // For formData.colors.accent
> {}

const TikTokVideosForm: React.FC<TikTokVideosFormProps> = ({ 
  videoLinks, 
  // setVideoLinks, // setVideoLinks is part of EditorFormProps but not directly used if handlers are passed
  toast, 
  handleAddVideo, 
  handleRemoveVideo, 
  handleVideoUrlChange, 
  formData 
}) => {

  // Ensure videoLinks is always an array
  const currentVideoLinks = Array.isArray(videoLinks) ? videoLinks : [];

  if (!handleAddVideo || !handleRemoveVideo || !handleVideoUrlChange || !toast) {
     return <div>Error: Missing essential props for TikTokVideosForm.</div>;
  }

  return (
    <div className="space-y-4">
      {currentVideoLinks.map((video: VideoItem, idx: number) => (
        <div
          key={idx}
          className="relative border-2 rounded-lg overflow-hidden"
          style={{ borderColor: formData?.colors?.accent || '#7E69AB' }} // Fallback accent
        >
          <div className="flex items-center p-2">
            <Input
              placeholder="https://www.tiktok.com/…"
              value={video.url}
              onChange={e => handleVideoUrlChange(idx, e.target.value)}
            />
            <button
              onClick={() => handleRemoveVideo(idx)}
              className="ml-2 p-1 text-gray-500 hover:text-red-500"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
          {/* Optionally display thumbnail if available */}
          {/* {video.thumbnail_url && <img src={video.thumbnail_url} alt="Video thumbnail" className="w-full h-auto" />} */}
        </div>
      ))}

      {currentVideoLinks.length < 5 && (
        <>
          <Button variant="outline" onClick={handleAddVideo} className="w-full">
            + Add another TikTok
          </Button>
          <p className="mt-1 text-sm text-gray-500">3+ videos recommended</p>
        </>
      )}
      {currentVideoLinks.length >= 5 && (
         <p className="mt-1 text-sm text-center text-gray-500">Maximum of 5 videos reached.</p>
      )}
    </div>
  );
};

export default TikTokVideosForm; 