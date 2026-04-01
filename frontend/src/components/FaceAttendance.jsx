import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';
import { FiCamera, FiCheckCircle, FiAlertCircle, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { faceAttendanceAPI } from '../services/api';

const MODEL_URL = '/models';

const STATUS = {
  IDLE: 'idle',
  LOADING_MODELS: 'loading_models',
  READY: 'ready',
  DETECTING: 'detecting',
  SUCCESS: 'success',
  ERROR: 'error',
};

const FaceAttendance = ({ type = 'clock-in', onSuccess }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [statusMsg, setStatusMsg] = useState('');
  const [hasRegistered, setHasRegistered] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  // Start camera AFTER modal is rendered in DOM
  useEffect(() => {
    if (isOpen) {
      initCamera();
    }
    return () => {
      if (!isOpen) stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const initCamera = async () => {
    setStatus(STATUS.LOADING_MODELS);
    setStatusMsg('Loading face recognition models...');
    setLocation(null);
    setLocationError('');
    try {
      // Check face registered
      const { data } = await faceAttendanceAPI.getMyFace();
      setHasRegistered(data.hasface);

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      // Get location (non-blocking)
      navigator.geolocation?.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => setLocationError(err.message),
        { enableHighAccuracy: true, timeout: 10000 }
      );

      setStatusMsg('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setStatus(STATUS.READY);
          setStatusMsg('Position your face in the camera');
        };
      }
    } catch (err) {
      setStatus(STATUS.ERROR);
      setStatusMsg(
        err.name === 'NotAllowedError' ? 'Camera permission denied. Please allow camera access.' :
        err.name === 'NotFoundError'   ? 'No camera found on this device.' :
        'Failed to initialize: ' + err.message
      );
    }
  };

  const close = () => {
    stopCamera();
    setIsOpen(false);
    setStatus(STATUS.IDLE);
    setStatusMsg('');
  };

  const handleClock = async () => {
    if (!location) {
      toast.error('Location access required. Please allow location and try again.');
      return;
    }
    setStatus(STATUS.DETECTING);
    setStatusMsg('Verifying your face...');
    try {
      let det = null;
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 300));
        det = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks(true)
          .withFaceDescriptor();
        if (det) break;
      }
      if (!det) {
        setStatus(STATUS.ERROR);
        setStatusMsg('No face detected. Ensure good lighting and face the camera.');
        return;
      }

      // Draw detection
      const dims = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
      faceapi.matchDimensions(canvasRef.current, dims);
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, dims.width, dims.height);
      faceapi.draw.drawDetections(canvasRef.current, faceapi.resizeResults(det, dims));

      setStatusMsg('Face detected! Verifying identity...');
      const { data } = await faceAttendanceAPI.clockIn({
        descriptor: Array.from(det.descriptor),
        latitude: location.latitude,
        longitude: location.longitude,
        type,
      });

      setStatus(STATUS.SUCCESS);
      setStatusMsg(data.message);
      toast.success(data.message);
      if (onSuccess) onSuccess(data.data);
      setTimeout(close, 2000);
    } catch (err) {
      setStatus(STATUS.ERROR);
      setStatusMsg(err.response?.data?.message || 'Verification failed. Try again.');
    }
  };

  const statusColor = {
    [STATUS.IDLE]: 'text-gray-500',
    [STATUS.LOADING_MODELS]: 'text-blue-500',
    [STATUS.READY]: 'text-green-500',
    [STATUS.DETECTING]: 'text-yellow-500',
    [STATUS.SUCCESS]: 'text-green-600',
    [STATUS.ERROR]: 'text-red-500',
  };

  const isClockOut = type === 'clock-out';
  const btnLabel = isClockOut ? 'Face Clock-Out' : 'Face Clock-In';
  const btnColor = isClockOut ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm ${btnColor}`}
      >
        <FiCamera size={16} /> {btnLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">📸 {btnLabel}</h2>
              <button onClick={close} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>

            {/* Camera feed */}
            <div className="relative bg-black" style={{ height: 300 }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
                autoPlay
              />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

              {status === STATUS.LOADING_MODELS && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                  <div className="text-white text-center">
                    <FiRefreshCw className="animate-spin mx-auto mb-2" size={36} />
                    <p className="text-sm font-medium">{statusMsg}</p>
                  </div>
                </div>
              )}
              {status === STATUS.SUCCESS && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-80">
                  <div className="text-white text-center">
                    <FiCheckCircle size={72} className="mx-auto mb-2" />
                    <p className="font-semibold">Done!</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 space-y-3">
              <div className={`flex items-center gap-2 text-sm font-medium ${statusColor[status]}`}>
                {status === STATUS.ERROR ? <FiAlertCircle size={16} /> : <FiCheckCircle size={16} />}
                {statusMsg || 'Initializing...'}
              </div>

              <div className={`flex items-center gap-2 text-xs ${location ? 'text-green-600' : 'text-orange-500'}`}>
                <FiMapPin size={14} />
                {location
                  ? `Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                  : locationError || 'Getting location...'}
              </div>

              {!hasRegistered && (
                <div className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2">
                  ⚠️ Face not registered. Contact your admin to register your face.
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {status === STATUS.ERROR && (
                  <button
                    onClick={initCamera}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                  >
                    Retry Camera
                  </button>
                )}
                {status === STATUS.READY && (
                  <button
                    onClick={handleClock}
                    disabled={!hasRegistered}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${btnColor}`}
                  >
                    {btnLabel}
                  </button>
                )}
                {status === STATUS.DETECTING && (
                  <div className="flex-1 py-2.5 rounded-xl text-sm font-medium text-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700">
                    Processing...
                  </div>
                )}
                {status === STATUS.LOADING_MODELS && (
                  <div className="flex-1 py-2.5 rounded-xl text-sm font-medium text-center bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                    Please wait...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FaceAttendance;
