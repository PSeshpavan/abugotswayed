"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
  videoUrl: string;
  videoName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ videoUrl, videoName, isOpen, onClose }: VideoModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
          aria-label="Close video"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Video player */}
        <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
          <video
            key={videoUrl}
            controls
            autoPlay
            className="w-full max-h-[80vh] object-contain"
            preload="metadata"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video name */}
        <p className="text-white text-center mt-3 text-sm truncate">
          {videoName}
        </p>
      </div>
    </div>
  );
}
