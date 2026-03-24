import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import jsQR from 'jsqr';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { api } from '../lib/api';

interface PickupResult {
  studentName: string;
  totalPrice: number;
}

const ScannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastPickup, setLastPickup] = useState<PickupResult | null>(null);
  const [pickedUpOrder, setPickedUpOrder] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    const validateScanner = async () => {
      if (!token) {
        setError('Invalid scanner URL. Missing token.');
        setIsLoading(false);
        return;
      }
      try {
        await api.withToken('/scanners/validate', token);
        setIsValid(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid scanner token.');
      } finally {
        setIsLoading(false);
      }
    };
    validateScanner();
  }, [token]);

  useEffect(() => {
    if (!isValid || !videoRef.current) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        videoRef.current!.srcObject = stream;
      } catch (err) {
        setError('Camera access denied. Please enable camera permissions.');
      }
    };

    startCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isValid]);

  useEffect(() => {
    if (!isValid || !canvasRef.current || !videoRef.current) return;

    const scanFrame = () => {
      const canvas = canvasRef.current!;
      const video = videoRef.current!;

      if (video.readyState !== 2) {
        requestAnimationFrame(scanFrame);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qr = jsQR(imgData.data, imgData.width, imgData.height);

      if (qr && pickedUpOrder !== qr.data) {
        handleScan(qr.data);
      }

      requestAnimationFrame(scanFrame);
    };

    scanFrame();
  }, [isValid, pickedUpOrder]);

  const handleScan = async (orderId: string) => {
    if (!token) return;

    try {
      const result = await api.withToken<PickupResult>(
        `/scanners/scan`,
        token,
        { method: 'POST', body: JSON.stringify({ orderId }) }
      );
      setPickedUpOrder(orderId);
      setLastPickup(result);
      setTimeout(() => setPickedUpOrder(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed.');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400">Initializing scanner...</p>
      </div>
    );
  }

  if (!isValid || error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-center gap-4">
        <WifiOff className="w-12 h-12 text-red-400 opacity-50" />
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Scanner Not Valid</h1>
          <p className="text-slate-400">{error || 'Could not validate scanner token.'}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mt-4"
        >
          <ArrowLeft className="w-4 h-4" /> Go back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-xl">
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-xs font-semibold text-green-400">Scanner Active</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="glass-panel p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Camera */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-4 border-primary rounded-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
          </div>
        </div>

        {/* Pickup confirmation */}
        {pickedUpOrder && lastPickup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-block mb-4"
              >
                <div className="w-24 h-24 bg-green-400/20 rounded-full flex items-center justify-center border-4 border-green-400 text-5xl">
                  ✓
                </div>
              </motion.div>
              <p className="text-4xl font-black text-white mb-2">COLLECTED</p>
              <p className="text-xl text-slate-300 mb-1">{lastPickup.studentName}</p>
              <p className="text-2xl font-black text-green-400">₹{lastPickup.totalPrice}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom info */}
      <div className="p-6 bg-black/60 backdrop-blur-md border-t border-white/10">
        <p className="text-center text-slate-400 text-sm">
          Position QR code within the frame to scan
        </p>
      </div>
    </div>
  );
};

export default ScannerPage;
