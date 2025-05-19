import React from 'react';
import type { SectionVisibilityState } from '@/lib/types'; 

// The VideoItem type from props matches the one in lib/types essentially
interface VideoItemProp {
  url: string;
  thumbnail_url: string;
}

interface VideoShowcaseProps {
  videos: Array<VideoItemProp>; 
  sectionVisibility: SectionVisibilityState; 
}

const VideoShowcaseBlock: React.FC<VideoShowcaseProps> = ({
  videos,
  // sectionVisibility, // Not directly used for styling items here
}) => {
  if (!videos || videos.length === 0) {
    return null; 
  }

  // Determine dynamic styles based on video count from original template logic
  const containerStyle: React.CSSProperties = {
    gap: videos.length >= 3 && videos.length <= 4 ? '1.5rem' : '1rem',
  };

  const getAnchorStyle = (videoCount: number): React.CSSProperties => ({
    maxWidth: videoCount <= 3 ? '26%' : '19.8%',
  });

  const playIconSizeClass = videos.length >= 4 ? 'w-9 h-9' : 'w-10 h-10';

  return (
    <div className="flex justify-center px-1" style={containerStyle}>
      {videos.map((video, index) => (
        <a
          key={index}
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="video-thumbnail-link block rounded-lg overflow-hidden flex-1" // Class from themedCssRules
          style={getAnchorStyle(videos.length)}
        >
          <div className="relative">
            <img
              src={video.thumbnail_url}
              alt={`Video ${index + 1}`}
              className="w-full object-cover aspect-[3/4]"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 transition-opacity hover:opacity-75">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 24 24"
                className={playIconSizeClass}
              >
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default VideoShowcaseBlock; 