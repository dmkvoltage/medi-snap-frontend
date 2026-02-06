'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  Upload,
  Camera,
  FileText,
  AlertCircle,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { validateFile } from '@/lib/api-client';

interface DocumentUploadProps {
  onFileSelected: (file: File, preview?: string) => void;
  isLoading?: boolean;
  showCompact?: boolean;
}

export function DocumentUpload({
  onFileSelected,
  isLoading = false,
  showCompact = false,
}: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── File handling ──────────────────────────────────────
  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      setFileName(file.name);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewUrl = e.target?.result as string;
          setPreview(previewUrl);
          onFileSelected(file, previewUrl);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  // ── Drag & drop ────────────────────────────────────────
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // ── Camera ─────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access is not available in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playError) {
          setCameraError('Unable to start the camera preview. Please allow camera permissions.');
        }
      }
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : 'Failed to access camera');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraError(null);
  }, []);

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {
        setCameraError('Unable to start the camera preview. Please allow camera permissions.');
      });
    }
  }, [cameraActive]);

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `medical-document-${Date.now()}.jpg`, { type: 'image/jpeg' });
            handleFile(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  }, [handleFile, stopCamera]);

  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);


  // ══════════════════════════════════════════════════════
  // COMPACT MODE — "Upload another" strip
  // ══════════════════════════════════════════════════════
  if (showCompact) {
    return (
      <Card
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl
          transition-all duration-300 cursor-pointer
          ${dragActive
            ? 'border-primary bg-primary/10 scale-[1.02]'
            : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/30 hover:shadow-lg'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".jpg,.jpeg,.png,.pdf"
          disabled={isLoading}
          className="hidden"
          aria-label="Upload document"
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-4 flex-1 justify-center sm:justify-start">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex-shrink-0">
              <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Upload another document</p>
              <p className="text-sm text-muted-foreground">Drag and drop or use the buttons</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center sm:justify-end flex-shrink-0">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="rounded-full h-11 px-6 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button
              onClick={startCamera}
              disabled={isLoading}
              variant="outline"
              className="rounded-full h-11 px-6 border-2"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
          </div>
        </div>
      </Card>
    );
  }


  // ══════════════════════════════════════════════════════
  // DOCUMENT READY — preview state
  // ══════════════════════════════════════════════════════
  if (preview && fileName) {
    return (
      <Card className={`
        border-0 rounded-3xl bg-gradient-to-br from-card to-muted/30
        shadow-xl overflow-hidden
        animate-fade-in-up
      `}>
        {/* Top bar with gradient */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/20 to-green-500/20 flex-shrink-0">
              <CheckCircle2 className="h-6 w-6 text-secondary" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-foreground truncate">{fileName}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                Ready to analyze
              </p>
            </div>
          </div>

          <button
            onClick={() => { setPreview(null); setFileName(null); }}
            className="
              flex h-10 w-10 items-center justify-center rounded-full
              text-muted-foreground
              hover:bg-muted/50 hover:text-foreground
              transition-all duration-200
              hover:scale-110
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2
            "
            aria-label="Remove document"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-2xl bg-gradient-to-br from-muted/50 to-muted overflow-hidden aspect-[4/3] flex items-center justify-center border border-border/50 shadow-inner">
            <img
              src={preview}
              alt="Document preview"
              className="max-w-full max-h-full object-contain shadow-lg rounded-xl"
            />
          </div>
        </div>
      </Card>
    );
  }


  // ══════════════════════════════════════════════════════
  // CAMERA VIEW
  // ══════════════════════════════════════════════════════
  if (cameraActive) {
    return (
      <Card className={`
        border-0 rounded-3xl bg-gradient-to-br from-card to-muted/30
        shadow-xl overflow-hidden
        animate-fade-in-up
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xl font-bold text-foreground flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Camera
            </p>
            <button
              onClick={stopCamera}
              className="
                flex h-10 w-10 items-center justify-center rounded-full
                text-muted-foreground
                hover:bg-muted/50 hover:text-foreground
                transition-all duration-200
                hover:scale-110
              "
              aria-label="Close camera"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {cameraError && (
            <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10 mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive text-sm">{cameraError}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-2xl bg-gradient-to-br from-black to-gray-900 overflow-hidden aspect-video mb-6 shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              aria-label="Camera preview"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={stopCamera}
              variant="outline"
              className="flex-1 rounded-full h-12 text-base font-semibold border-2"
            >
              Cancel
            </Button>
            <Button
              onClick={takePhoto}
              className="flex-1 rounded-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
            >
              <Camera className="h-5 w-5 mr-2" />
              Capture
            </Button>
          </div>
        </div>
      </Card>
    );
  }


  // ══════════════════════════════════════════════════════
  // DEFAULT — main upload zone
  // ══════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <Card
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-3xl
          transition-all duration-300 cursor-pointer
          overflow-hidden
          ${dragActive
            ? 'border-primary bg-primary/10 scale-[1.02] shadow-2xl shadow-primary/20'
            : 'border-border/60 bg-gradient-to-br from-card to-muted/30 hover:border-primary/40 hover:shadow-xl'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".jpg,.jpeg,.png,.pdf"
          disabled={isLoading}
          className="hidden"
          aria-label="Upload document"
        />

        <div className="text-center py-16 sm:py-20 px-6 relative">
          {/* Animated background blobs */}
          {dragActive && (
            <>
              <div className="absolute top-10 left-1/4 w-32 h-32 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <div className="absolute bottom-10 right-1/4 w-40 h-40 bg-secondary/20 blur-3xl rounded-full animate-pulse" />
            </>
          )}

          <div className="relative z-10">
            {/* Animated icon circle */}
            <div className={`
              flex justify-center mb-8
              transition-all duration-300
              ${dragActive ? 'scale-125' : 'scale-100 hover:scale-110'}
            `}>
              <div className={`
                flex h-20 w-20 items-center justify-center rounded-3xl
                bg-gradient-to-br from-primary/20 to-blue-500/20
                shadow-lg shadow-primary/20
                transition-all duration-300
                ${dragActive ? 'bg-primary/30 shadow-primary/40' : ''}
              `}>
                {isLoading ? (
                  <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <Upload className="h-10 w-10 text-primary" aria-hidden="true" />
                )}
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight">
              Upload your medical document
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
              Drag and drop here, or{' '}
              <span className="text-primary font-semibold">browse files</span>
            </p>
            <p className="text-base text-muted-foreground/70 mt-3 flex items-center justify-center gap-2">
              <span className="px-3 py-1 bg-muted rounded-full text-sm">JPG</span>
              <span className="text-muted-foreground">•</span>
              <span className="px-3 py-1 bg-muted rounded-full text-sm">PNG</span>
              <span className="text-muted-foreground">•</span>
              <span className="px-3 py-1 bg-muted rounded-full text-sm">PDF</span>
              <span className="text-muted-foreground ml-2">•</span>
              <span className="text-sm">Up to 10 MB</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="
                  inline-flex items-center justify-center gap-2
                  h-14 px-10 rounded-full
                  bg-gradient-to-r from-primary to-blue-600
                  text-white text-base font-semibold
                  shadow-xl shadow-primary/25
                  hover:shadow-2xl hover:shadow-primary/30
                  hover:scale-105
                  active:scale-[0.98]
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    Browse files
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>

              <Button
                onClick={startCamera}
                disabled={isLoading}
                variant="outline"
                className="
                  inline-flex items-center justify-center gap-2
                  h-14 px-10 rounded-full
                  border-2 border-border/60
                  text-base font-semibold
                  hover:bg-muted/50
                  hover:scale-105
                  active:scale-[0.98]
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <Camera className="h-5 w-5" />
                Open camera
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
