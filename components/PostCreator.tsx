import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, VideoIcon, LiveStreamIcon, CameraIcon, LiveCameraIcon } from './Icons';
import { PostType, Media, User } from '../src/types';
import { useTranslation } from '../hooks/useTranslation';

interface PostCreatorProps {
  onStartLiveStream: () => void;
  onAddPost: (postData: { content: string; type: PostType; media?: Media[] }) => void;
  currentUser: User;
}

const PostCreator: React.FC<PostCreatorProps> = ({ onStartLiveStream, onAddPost, currentUser }) => {
  const { t } = useTranslation();
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
    console.log('Files selected:', files);
    if (!files) return;
    
    resetVideoState(); // Clear any video upload in progress

    const newImagePreviews = Array.from(files).map(file => {
      const url = URL.createObjectURL(file);
      console.log('Created preview URL:', url);
      return url;
    });
    console.log('Setting image previews:', newImagePreviews);
    setImagePreviews(prev => {
      const updated = [...prev, ...newImagePreviews];
      console.log('Updated image previews:', updated);
      return updated;
    });

    event.target.value = '';
  };

  const handleMediaFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log('Media files selected:', files);
    if (!files) return;
    
    resetVideoState(); // Clear any video upload in progress
    resetImageState(); // Clear any image previews

    const imageFiles: File[] = [];
    const videoFiles: File[] = [];

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        imageFiles.push(file);
      } else if (file.type.startsWith('video/')) {
        videoFiles.push(file);
      }
    });

    // Handle images
    if (imageFiles.length > 0) {
      const newImagePreviews = imageFiles.map(file => {
        const url = URL.createObjectURL(file);
        console.log('Created image preview URL:', url);
        return url;
      });
      console.log('Setting image previews:', newImagePreviews);
      setImagePreviews(newImagePreviews);
    }

    // Handle videos (only first video)
    if (videoFiles.length > 0) {
      const videoFile = videoFiles[0];
      console.log('Processing video file:', videoFile.name);
      
      if (!videoFile.type.startsWith('video/')) {
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
          simulateUpload(videoFile);
        }
      };
      videoElement.onerror = () => {
        setUploadError('Could not read video metadata. The file may be corrupt.');
      }
      videoElement.src = URL.createObjectURL(videoFile);
    }

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

  const handleMediaClick = () => {
    if (isUploading) return;
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
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg">
      <div className="flex items-start space-x-4">
        <img src={currentUser.avatar} alt="My Avatar" className="w-12 h-12 rounded-full ring-2 ring-gray-100 dark:ring-gray-700" />
        <div className="flex-1">
          <textarea
            className="w-full p-3 text-lg bg-transparent border-0 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-all duration-200"
            rows={6}
            placeholder={t('shareYourThoughts')}
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input type="file" ref={videoInputRef} onChange={handleVideoFileChange} accept="video/*" className="hidden" />
      <input type="file" ref={imageInputRef} onChange={handleMediaFileChange} accept="image/*,video/*" multiple className="hidden" />

      {/* Image Preview Grid */}
      {imagePreviews.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Images selected: {imagePreviews.length}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {imagePreviews.map((preview, index) => {
              console.log('Rendering image preview:', preview, 'at index:', index);
              return (
                <div key={index} className="relative aspect-square">
                  <img 
                    src={preview} 
                    alt={`preview ${index}`} 
                    className="w-full h-full object-cover rounded-lg shadow-md" 
                    onLoad={() => console.log('Image loaded:', preview)}
                    onError={(e) => console.error('Image load error:', e, preview)}
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold hover:bg-opacity-80 transition-opacity"
                    aria-label="Remove image"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Video Preview */}
      {uploadedVideo && (
        <div className="mt-4">
          <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img 
              src={uploadedVideo.url} 
              alt="Video thumbnail" 
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-[20px] border-l-gray-800 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
              </div>
            </div>
            <button
              onClick={() => {
                setUploadedVideo(null);
                setUploadSuccess(false);
              }}
              className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-opacity-80 transition-opacity"
              aria-label="Remove video"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Upload Status Section */}
      <div className="mt-2 min-h-[0px] flex items-center">
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

      <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex space-x-3">
          <button 
            onClick={handleMediaClick}
            disabled={isUploading}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md">
            <ImageIcon />
            <span className="text-sm font-medium hidden sm:inline">{t('photo')}</span>
          </button>
          <button 
              onClick={handleGoLiveClick}
              disabled={isUploading || imagePreviews.length > 0 || uploadSuccess}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-orange-600 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md">
              <LiveCameraIcon />
              <span className="text-sm font-medium hidden sm:inline">{t('live')}</span>
             </button>
        </div>
        <button 
            onClick={handlePost}
            disabled={isPostButtonDisabled}
            className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105">
          {t('post')}
        </button>
      </div>
    </div>
  );
};

export default PostCreator;
