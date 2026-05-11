import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';
import { FiCamera, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { faceAttendanceAPI } from '../services/api';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const MODEL_URL = '/models';

const STATUS = {
  IDLE: 'idle',
  LOADING_MODELS: 'loading_models',
  READY: 'ready',
  CAPTURING: 'capturing',
  SUCCESS: 'success',
  ERROR: 'error',
};

const AdminFaceRegister = ({ employee, onSuccess }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [statusMsg, setStatusMsg] = useState('');
  const [sampleCount, setSampleCount] = useState(0);

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
    setSampleCount(0);
    setStatusMsg('Loading face recognition models...');
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      setStatusMsg('Starting camera...');

      if (Capacitor.isNativePlatform()) {
        // On Android APK: use Capacitor Camera plugin
        await startCapacitorCamera();
      } else {
        // On web browser: use getUserMedia
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setStatus(STATUS.READY);
            setStatusMsg(`Position ${employee.name}'s face in the camera`);
          };
        }
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

  const startCapacitorCamera = async () => {
    // Take photo using Capacitor Camera plugin
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      direction: 'front',
    });

    // Load the captured image into an <img> for face-api detection
    const img = new Image();
    img.src = photo.dataUrl;
    await new Promise((res) => (img.onload = res));

    setStatus(STATUS.CAPTURING);
    setStatusMsg('Analyzing face...');

    const descriptors = [];
    for (let i = 0; i < 5; i++) {
      const det = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();
      if (det) {
        descriptors.push(Array.from(det.descriptor));
        setSampleCount(i + 1);
      }
    }

    if (descriptors.length === 0) {
      setStatus(STATUS.ERROR);
      setStatusMsg('No face detected. Ensure good lighting and try again.');
      return;
    }

    const avg = descriptors[0].map((_, i) =>
      descriptors.reduce((s, d) => s + d[i], 0) / descriptors.length
    );

    await faceAttendanceAPI.registerFace(employee.id, avg);
    setStatus(STATUS.SUCCESS);
    setStatusMsg(`Face registered for ${employee.name}!`);
    toast.success(`Face registered for ${employee.name}`);
    if (onSuccess) onSuccess();
    setTimeout(close, 2000);
  };

  const close = () => {
    stopCamera();
    setIsOpen(false);
    setStatus(STATUS.IDLE);
    setStatusMsg('');
    setSampleCount(0);
  };

  const handleCapture = async () => {
    if (Capacitor.isNativePlatform()) return; // handled by startCapacitorCamera
    setStatus(STATUS.CAPTURING);
    setStatusMsg('Scanning face... hold still');
    try {
      const descriptors = [];
      let attempts = 0;
      while (descriptors.length < 5 && attempts < 30) {
        attempts++;
        await new Promise((r) => setTimeout(r, 400));
        const det = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks(true)
          .withFaceDescriptor();
        if (!det) continue;

        const dims = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
        faceapi.matchDimensions(canvasRef.current, dims);
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, dims.width, dims.height);
        faceapi.draw.drawDetections(canvasRef.current, faceapi.resizeResults(det, dims));

        descriptors.push(Array.from(det.descriptor));
        setSampleCount(descriptors.length);
        setStatusMsg(`Capturing sample ${descriptors.length}/5...`);
      }

      if (descriptors.length < 5) {
        setStatus(STATUS.ERROR);
        setStatusMsg('Could not capture enough samples. Ensure good lighting and face the camera.');
        return;
      }

      const avg = descriptors[0].map((_, i) =>
        descriptors.reduce((s, d) => s + d[i], 0) / descriptors.length
      );

      await faceAttendanceAPI.registerFace(employee.id, avg);
      setStatus(STATUS.SUCCESS);
      setStatusMsg(`Face registered for ${employee.name}!`);
      toast.success(`Face registered for ${employee.name}`);
      if (onSuccess) onSuccess();
      setTimeout(close, 2000);
    } catch (err) {
      setStatus(STATUS.ERROR);
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      const isMissingColumn = msg.toLowerCase().includes('face_descriptor') || msg.toLowerCase().includes('schema cache');
      setStatusMsg(
        isMissingColumn
          ? 'Database not set up: run face_migration.sql in Supabase SQL Editor first.'
          : msg
      );
    }
  };

  const statusColor = {
    [STATUS.IDLE]: 'text-gray-500',
    [STATUS.LOADING_MODELS]: 'text-blue-500',
    [STATUS.READY]: 'text-green-500',
    [STATUS.CAPTURING]: 'text-yellow-500',
    [STATUS.SUCCESS]: 'text-green-600',
    [STATUS.ERROR]: 'text-red-500',
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-medium text-xs bg-indigo-500 hover:bg-indigo-600 transition-colors"
      >
        <FiCamera size={13} /> Register Face
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">📸 Register Face</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Employee: <span className="font-semibold text-gray-700 dark:text-gray-300">{employee.name}</span>
                </p>
              </div>
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

              {status === STATUS.CAPTURING && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className={`w-4 h-4 rounded-full border-2 border-white transition-all duration-300 ${
                        n <= sampleCount ? 'bg-green-400 scale-125' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}

              {status === STATUS.SUCCESS && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-80">
                  <div className="text-white text-center">
                    <FiCheckCircle size={72} className="mx-auto mb-2" />
                    <p className="font-semibold">Registered!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Status & Actions */}
            <div className="px-6 py-4 space-y-3">
              <div className={`flex items-center gap-2 text-sm font-medium ${statusColor[status]}`}>
                {status === STATUS.ERROR ? <FiAlertCircle size={16} /> : <FiCheckCircle size={16} />}
                {statusMsg || 'Initializing...'}
              </div>

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
                    onClick={handleCapture}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
                  >
                    Capture & Register
                  </button>
                )}
                {status === STATUS.CAPTURING && (
                  <div className="flex-1 py-2.5 rounded-xl text-sm font-medium text-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                    Capturing {sampleCount}/5 samples...
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

export default AdminFaceRegister;
