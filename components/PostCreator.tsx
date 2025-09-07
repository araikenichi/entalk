import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, VideoIcon, LiveStreamIcon } from './Icons';
import { PostType, Media, User } from '../types';

interface PostCreatorProps {
  onStartLiveStream: () => void;
  onAddPost: (postData: { content: string; type: PostType; media?: Media[] }) => void;
  currentUser: User;
}

const PostCreator: React.FC<PostCreatorProps> = ({ onStartLiveStream, onAddPost, currentUser }) => {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<{ url: string } | null>(null);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const resetVideoState = () => {
    setIsUploading(false);
    setUploadProgress(null);
    setUploadingFileName(null);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadedVideo(null);
  };

  const resetImageState = () => {
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
  };

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadingFileName(file.name);
    setUploadProgress(0);
    setUploadError(null); // Clear previous errors
    setUploadedVideo(null);
    setUploadSuccess(false);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) {
            clearInterval(interval);
            return null;
        }

        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setUploadSuccess(true);
          setUploadingFileName(null);
          setUploadedVideo({ url: `https://picsum.photos/seed/vid${Date.now()}/800/450` }); // Placeholder thumbnail
          
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(null);
          }, 2000); // Keep progress bar at 100% for a moment
          return 100;
        }
        return newProgress;
      });
    }, 250);
  };

  const handleVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    resetVideoState();

    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file.');
      return;
    }

    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    videoElement.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoElement.src);
      const duration = videoElement.duration;
      if (duration > 300) { // 5 minutes = 300 seconds
        setUploadError('Video is too long. Please select a video under 5 minutes.');
      } else {
        simulateUpload(file);
      }
    };
    videoElement.onerror = () => {
        setUploadError('Could not read video metadata. The file may be corrupt.');
    }
    videoElement.src = URL.createObjectURL(file);
    
    event.target.value = '';
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    resetVideoState(); // Clear any video upload in progress

    const newImagePreviews = Array.from(files).map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newImagePreviews]);

    event.target.value = '';
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
    const urlToRemove = imagePreviews[indexToRemove];
    URL.revokeObjectURL(urlToRemove);
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleVideoClick = () => {
    if (isUploading) return;
    resetImageState();
    videoInputRef.current?.click();
  };
  
  const handleImageClick = () => {
    if (isUploading) return;
    resetVideoState();
    imageInputRef.current?.click();
  };

  const handleGoLiveClick = () => {
    if (isUploading || imagePreviews.length > 0) return;
    onStartLiveStream();
  };
  
  const handlePost = () => {
    if (!text.trim() && imagePreviews.length === 0 && !uploadedVideo) return;

    let type = PostType.Text;
    let media: Media[] | undefined = undefined;

    if (imagePreviews.length > 0) {
      type = PostType.Image;
      media = imagePreviews.map(url => ({ type: 'image', url }));
    } else if (uploadedVideo) {
      type = PostType.Video;
      media = [{ type: 'video', url: uploadedVideo.url }];
    }
    
    onAddPost({ content: text.trim(), type, media });

    // Reset state after posting
    setText('');
    resetImageState();
    resetVideoState();
  };

  const isPostButtonDisabled = isUploading || (!text.trim() && imagePreviews.length === 0 && !uploadSuccess);

  return (
    <div className="p-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-start space-x-4">
        <img src={currentUser.avatar} alt="My Avatar" className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <textarea
            className="w-full p-2 text-lg bg-transparent focus:outline-none placeholder-gray-500"
            rows={2}
            placeholder="Share your thoughts..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input type="file" ref={videoInputRef} onChange={handleVideoFileChange} accept="video/*" className="hidden" />
      <input type="file" ref={imageInputRef} onChange={handleImageFileChange} accept="image/*" multiple className="hidden" />

      {/* Image Preview Grid */}
      {imagePreviews.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square">
                <img src={preview} alt={`preview ${index}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold hover:bg-opacity-80 transition-opacity"
                  aria-label="Remove image"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Status Section */}
      <div className="mt-4 min-h-[60px] flex items-center">
        {(isUploading || uploadError || uploadSuccess) && !uploadError && (
          <div className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {isUploading && uploadProgress !== null && !uploadSuccess && (
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 truncate">Uploading: {uploadingFileName}</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-linear" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}
            {uploadSuccess && (
              <p className="text-sm text-green-500 font-semibold">Video uploaded successfully!</p>
            )}
          </div>
        )}
         {uploadError && (
              <div className="w-full p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <p className="text-sm text-red-500">{uploadError}</p>
              </div>
         )}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2 sm:space-x-4">
          <button 
            onClick={handleImageClick}
            disabled={isUploading}
            className="flex items-center space-x-2 px-3 py-2 rounded-full text-blue-500 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <ImageIcon />
            <span className="text-sm font-semibold hidden sm:inline">Image</span>
          </button>
          <button 
            onClick={handleVideoClick}
            disabled={isUploading || imagePreviews.length > 0}
            className="flex items-center space-x-2 px-3 py-2 rounded-full text-green-500 bg-green-50 dark:bg-green-900/50 hover:bg-green-100 dark:hover:bg-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <VideoIcon />
            <span className="text-sm font-semibold hidden sm:inline">Video</span>
          </button>
          <button 
            onClick={handleGoLiveClick}
            disabled={isUploading || imagePreviews.length > 0 || uploadSuccess}
            className="flex items-center space-x-2 px-3 py-2 rounded-full text-red-500 bg-red-50 dark:bg-red-900/50 hover:bg-red-100 dark:hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <LiveStreamIcon />
            <span className="text-sm font-semibold hidden sm:inline">Go Live</span>
          </button>
        </div>
        <button 
            onClick={handlePost}
            disabled={isPostButtonDisabled}
            className="px-6 py-2 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Post
        </button>
      </div>
    </div>
  );
};

export default PostCreator;
