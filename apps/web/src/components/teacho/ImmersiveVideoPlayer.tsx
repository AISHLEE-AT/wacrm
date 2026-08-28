import React from 'react';

export const ImmersiveVideoPlayer = ({ videoId, title }: { videoId: string, title?: string }) => (
  <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
    <iframe
      className="w-full h-full"
      src={https://www.youtube.com/embed/\}
      title={title || "Video Player"}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
);
