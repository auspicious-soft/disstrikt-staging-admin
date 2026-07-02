import { BASE_IMG_URL } from "@/constants/apiUrls";
import React, { useState } from "react";

interface Video {
  title: string;
  url: string;
  thumbnail: string;
  _id: string;
}

interface VideosTabProps {
  videos: Video[];
}

const VideosTab: React.FC<VideosTabProps> = ({ videos }) => {
  const [playingVideos, setPlayingVideos] = useState<{
    [key: string]: boolean;
  }>({});

  const handlePlay = (videoId: string) => {
    setPlayingVideos((prev) => ({ ...prev, [videoId]: true }));
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-10">
        <p className="text-stone-400 text-sm ">No Videos Available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 w-full">
      {videos.map((video) => (
        <div key={video._id} className="w-full flex flex-col items-start gap-2">
          {playingVideos[video._id] ? (
            <video
              src={`${BASE_IMG_URL}${video.url}`}
              className="w-full aspect-[1/1] rounded-[10px] object-cover"
              controls
              autoPlay
              muted
            />
          ) : (
            <div className="relative w-full aspect-[1/1] rounded-[10px] overflow-hidden">
              <img
                src={`${BASE_IMG_URL}${video.thumbnail}`}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/fallback-thumbnail.jpg";
                }}
              />
              <button
                onClick={() => handlePlay(video._id)}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-70 transition-opacity"
                aria-label="Play video"
              >
                <svg
                  className="w-8 h-8 sm:w-12 sm:h-12 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          )}
          <div className="text-stone-200 text-xs sm:text-xs font-normal  truncate w-full">
            {video.title}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideosTab;
