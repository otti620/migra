import React from 'react';

export const TimesSquareDavidoBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none bg-black">
      {/* Exact uploaded image of Aliko Dangote, Davido and team in Times Square New York */}
      <img
        src="/THE-NEW-YORK-PICTURE-WITH-DAVIDO.jpeg"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/images/THE-NEW-YORK-PICTURE-WITH-DAVIDO.jpeg';
        }}
        alt="Aliko Dangote, Davido and team in Times Square New York under Dangote Refinery billboard"
        className="w-full h-full object-cover object-center"
      />
      {/* Subtle tint to keep input text readable while keeping the background vivid */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/75 pointer-events-none" />
    </div>
  );
};

