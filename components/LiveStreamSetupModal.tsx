import React, { useState, useRef, useEffect } from 'react';
import { LoadingIcon } from './Icons';

interface LiveStreamSetupModalProps {
  onConfirm: (description: string) => void;
  onCancel: () => void;
}

const LiveStreamSetupModal: React.FC<LiveStreamSetupModalProps> = ({ onConfirm, onCancel }) => {
  const [description, setDescription] = useState('');
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(null);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Camera access denied. Please check your browser permissions.");
      } finally {
        setIsCameraLoading(false);
      }
    };
    
    enableCamera();

    return () => {
      // Cleanup: stop all tracks on the stream when the component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleConfirm = () => {
    onConfirm(description);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg m-4">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">Setup Your Live Stream</h2>
        </div>
        <div className="p-4">
          <div className="aspect-video bg-black rounded-md mb-4 flex items-center justify-center">
            {isCameraLoading && <LoadingIcon />}
            {cameraError && <p className="text-red-500 text-sm p-4 text-center">{cameraError}</p>}
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover rounded-md ${isCameraLoading || cameraError ? 'hidden' : ''}`} />
          </div>
          <textarea
            className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="What's your stream about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="p-4 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
          <button onClick={onCancel} className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={isCameraLoading || !!cameraError} className="px-6 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Go Live
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamSetupModal;
