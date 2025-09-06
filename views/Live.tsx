import React, { useState } from 'react';
import { Post, PostType } from '../types';
import LiveStreamModal from '../components/LiveStreamModal';

interface LiveProps {
  posts: Post[];
}

const Live: React.FC<LiveProps> = ({ posts }) => {
  const livePosts = posts.filter(p => p.type === PostType.Live);
  const [selectedStream, setSelectedStream] = useState<Post | null>(null);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Live Plaza</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {livePosts.map(post => (
          <div key={post.id} className="cursor-pointer group" onClick={() => setSelectedStream(post)}>
            <div className="relative rounded-lg overflow-hidden">
              <img src={post.media?.[0].url} alt="live stream" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute top-2 left-2 flex items-center bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                LIVE
              </div>
              <div className="absolute bottom-2 left-2 text-white">
                <p className="font-bold">{post.user.name}</p>
                <p className="text-sm truncate">{post.content}</p>
                <p className="text-xs">{post.viewers?.toLocaleString()} watching</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedStream && (
        <LiveStreamModal post={selectedStream} onClose={() => setSelectedStream(null)} />
      )}
    </div>
  );
};

export default Live;