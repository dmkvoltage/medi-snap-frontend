'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  Upload,
  Camera,
  FileText,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
          relative border-[1.5px] border-dashed rounded-2xl
          transition-all duration-200 cursor-pointer
          ${dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
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

        {/* Desktop: horizontal row | Mobile: stacked center */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">

          {/* Icon + text */}
          <div className="flex items-center gap-3 flex-1 justify-center sm:justify-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
              <Upload className="h-4.5 w-4.5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Upload another document</p>
              <p className="text-xs text-muted-foreground">Drag and drop or use the buttons</p>
            </div>
          </div>

          {/* Action buttons — Google style: text-only primary, icon+text secondary */}
          <div className="flex gap-2 justify-center sm:justify-end flex-shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="
                inline-flex items-center justify-center
                h-9 px-5 rounded-full
                bg-primary text-white text-sm font-medium
                transition-all duration-200 ease-out
                hover:bg-primary/85 hover:shadow-md hover:shadow-primary/20
                active:scale-[0.97]
                disabled:opacity-50 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              "
            >
              Upload
            </button>
            <button
              onClick={startCamera}
              disabled={isLoading}
              className="
                inline-flex items-center justify-center gap-1.5
                h-9 px-5 rounded-full
                border border-border bg-transparent text-foreground text-sm font-medium
                transition-all duration-200 ease-out
                hover:bg-muted/40
                active:scale-[0.97]
                disabled:opacity-50 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2
              "
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
              Camera
            </button>
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
      <Card className="
        border-0 rounded-2xl bg-card
        shadow-[0_1px_3px_rgba(0,0,0,0.07)]
        overflow-hidden
      ">
        {/* Top bar: green check + filename + dismiss */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Green tonal circle — secondary = Google Green = success */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-secondary" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">Ready to analyze</p>
            </div>
          </div>

          {/* Dismiss — ghost X */}
          <button
            onClick={() => { setPreview(null); setFileName(null); }}
            className="
              flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0
              text-muted-foreground
              hover:bg-muted/50 hover:text-foreground
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2
            "
            aria-label="Remove document"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Preview image */}
        <div className="px-5 pb-5">
          <div className="rounded-xl bg-muted border border-border overflow-hidden aspect-[4/3] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Document preview"
              className="max-w-full max-h-full object-contain"
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
      <Card className="
        border-0 rounded-2xl bg-card
        shadow-[0_1px_3px_rgba(0,0,0,0.07)]
        overflow-hidden
      ">
        <div className="p-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-medium text-foreground">Camera</p>
            <button
              onClick={stopCamera}
              className="
                flex h-8 w-8 items-center justify-center rounded-full
                text-muted-foreground
                hover:bg-muted/50 hover:text-foreground
                transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2
              "
              aria-label="Close camera"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Camera error */}
          {cameraError && (
            <Alert variant="destructive" className="rounded-xl border-destructive/30 bg-destructive/5 mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive text-sm">{cameraError}</AlertDescription>
            </Alert>
          )}

          {/* Video feed */}
          <div className="rounded-xl bg-black overflow-hidden aspect-video mb-5">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              aria-label="Camera preview"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Action buttons — Google style */}
          <div className="flex gap-3">
            <button
              onClick={stopCamera}
              className="
                flex-1 inline-flex items-center justify-center
                h-11 rounded-full
                border border-border bg-transparent text-foreground text-sm font-medium
                transition-all duration-200 ease-out
                hover:bg-muted/40
                active:scale-[0.97]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2
              "
            >
              Cancel
            </button>
            <button
              onClick={takePhoto}
              className="
                flex-1 inline-flex items-center justify-center gap-2
                h-11 rounded-full
                bg-primary text-white text-sm font-medium
                transition-all duration-200 ease-out
                hover:bg-primary/85 hover:shadow-lg hover:shadow-primary/25
                active:scale-[0.97]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              "
            >
              <Camera className="h-4.5 w-4.5" aria-hidden="true" />
              Capture
            </button>
          </div>
        </div>
      </Card>
    );
  }


  // ══════════════════════════════════════════════════════
  // DEFAULT — main upload zone
  // ══════════════════════════════════════════════════════
  return (
    <div className="space-y-4">
      {/* Error */}
      {error && (
        <Alert variant="destructive" className="rounded-xl border-destructive/30 bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Drop zone */}
      <Card
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-[1.5px] border-dashed rounded-2xl
          transition-all duration-200 cursor-pointer
          ${dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card hover:border-primary/40'
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

        <div className="text-center py-12 sm:py-16 px-6">

          {/* Tonal icon circle — matches Google's pattern */}
          <div className="flex justify-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
          </div>

          {/* Text — Google uses light font-weight (400) for large headings */}
          <h3 className="text-xl sm:text-2xl font-normal text-foreground mb-2 tracking-tight">
            Upload your medical document
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Drag and drop here, or use the buttons below
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Supports JPG, PNG, or PDF · Up to 10 MB
          </p>

          {/* Buttons — Google style: primary filled, secondary outlined */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            {/* Primary button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="
                inline-flex items-center justify-center gap-2
                h-12 px-7 rounded-full
                bg-primary text-white text-sm font-medium
                transition-all duration-200 ease-out
                hover:bg-primary/85 hover:shadow-lg hover:shadow-primary/25
                active:scale-[0.97]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  Processing…
                </>
              ) : (
                <>
                  <FileText className="h-4.5 w-4.5" aria-hidden="true" />
                  Browse files
                </>
              )}
            </button>

            {/* Secondary button */}
            <button
              onClick={startCamera}
              disabled={isLoading}
              className="
                inline-flex items-center justify-center gap-2
                h-12 px-7 rounded-full
                border border-border bg-transparent text-foreground text-sm font-medium
                transition-all duration-200 ease-out
                hover:bg-muted/40
                active:scale-[0.97]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <Camera className="h-4.5 w-4.5" aria-hidden="true" />
              Open camera
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
