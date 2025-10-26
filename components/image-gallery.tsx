"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { ImageData } from "@/types";
import { Loader2 } from "lucide-react";

export function ImageGallery() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch initial images
  const fetchImages = useCallback(async (pageToken?: string) => {
    try {
      const url = pageToken
        ? `/api/images?pageToken=${pageToken}`
        : "/api/images";

      const response = await fetch(url, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (pageToken) {
        // Append to existing images
        setImages((prev) => [...prev, ...data.images]);
      } else {
        // Replace with new images
        setImages(data.images);
      }

      setNextPageToken(data.nextPageToken);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadInitialImages = async () => {
      setLoading(true);
      await fetchImages();
      setLoading(false);
    };
    loadInitialImages();
  }, [fetchImages]);

  // Poll for new images every 10 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      // Only fetch first page to check for new images
      const response = await fetch("/api/images", {
        cache: 'no-store',
      });
      const data = await response.json();

      // Check if there are new images
      if (data.images.length > 0) {
        const latestImageId = data.images[0].id;
        const currentLatestId = images[0]?.id;

        if (latestImageId !== currentLatestId) {
          // New images available, prepend them
          const newImages = data.images.filter(
            (img: ImageData) => !images.some((existing) => existing.id === img.id)
          );
          if (newImages.length > 0) {
            setImages((prev) => [...newImages, ...prev]);
          }
        }
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [images]);

  // Load more images
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !nextPageToken) return;

    setLoadingMore(true);
    await fetchImages(nextPageToken);
    setLoadingMore(false);
  }, [hasMore, loadingMore, nextPageToken, fetchImages]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loadMore]);

  // Get optimized image URL
  const getImageUrl = (image: ImageData) => {
    return `https://drive.google.com/thumbnail?id=${image.id}&sz=w800`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading memories...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="text-6xl">📸</div>
          <h2 className="text-2xl font-bold">No Photos Yet</h2>
          <p className="text-muted-foreground">
            Be the first to share a memory! Upload your photos to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div
            key={`${image.id}-${index}`}
            className="aspect-square relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-muted animate-in fade-in"
            style={{
              animationDelay: `${(index % 15) * 50}ms`,
            }}
          >
            <Image
              src={getImageUrl(image)}
              alt={image.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      {/* Load more trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8 mt-4"
        >
          {loadingMore && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && images.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>You&apos;ve seen all the memories!</p>
        </div>
      )}
    </div>
  );
}
