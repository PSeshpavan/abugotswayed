"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";

interface ImageModalProps {
  thumbnailUrl: string;
  fullSizeUrl: string;
  imageName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ thumbnailUrl, fullSizeUrl, imageName, isOpen, onClose }: ImageModalProps) {
  const [isHighResLoaded, setIsHighResLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset loading state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsHighResLoaded(false);
      setIsLoading(true);
    }
  }, [isOpen, fullSizeUrl]);

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
        className="relative w-full max-w-6xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
          aria-label="Close image"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Image container */}
        <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
          <div className="relative w-full" style={{ maxHeight: '90vh' }}>
            {/* Show thumbnail immediately for instant feedback */}
            <Image
              src={thumbnailUrl}
              alt={imageName}
              width={1920}
              height={1080}
              className={`w-full h-full object-contain max-h-[90vh] transition-opacity duration-300 ${
                isHighResLoaded ? 'opacity-0 absolute inset-0' : 'opacity-100'
              }`}
              unoptimized
              priority
              onLoad={() => setIsLoading(false)}
            />

            {/* Load high-res version in background */}
            <Image
              src={fullSizeUrl}
              alt={imageName}
              width={1920}
              height={1080}
              className={`w-full h-full object-contain max-h-[90vh] transition-opacity duration-300 ${
                isHighResLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
              unoptimized
              priority
              onLoad={() => {
                setIsHighResLoaded(true);
                setIsLoading(false);
              }}
            />

            {/* Loading spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Image name */}
        <p className="text-white text-center mt-3 text-sm truncate">
          {imageName}
        </p>
      </div>
    </div>
  );
}
