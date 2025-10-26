"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { MediaData } from "@/types";
import { Loader2, Play } from "lucide-react";
import { VideoModal } from "./video-modal";

export function ImageGallery() {
  const [media, setMedia] = useState<MediaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<MediaData | null>(null);
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
        // Append to existing media
        setMedia((prev) => [...prev, ...(data.media || data.images || [])]);
      } else {
        // Replace with new media
        setMedia(data.media || data.images || []);
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

      // Check if there are new media items
      const newMedia = data.media || data.images || [];
      if (newMedia.length > 0) {
        const latestId = newMedia[0].id;
        const currentLatestId = media[0]?.id;

        if (latestId !== currentLatestId) {
          // New media available, prepend them
          const newItems = newMedia.filter(
            (item: MediaData) => !media.some((existing) => existing.id === item.id)
          );
          if (newItems.length > 0) {
            setMedia((prev) => [...newItems, ...prev]);
          }
        }
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [media]);

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

  // Get optimized media URL
  const getMediaUrl = (item: MediaData) => {
    if (item.isVideo) {
      return `https://drive.google.com/uc?export=download&id=${item.id}`;
    }
    return `https://drive.google.com/thumbnail?id=${item.id}&sz=w800`;
  };

  const getThumbnailUrl = (item: MediaData) => {
    return `https://drive.google.com/thumbnail?id=${item.id}&sz=w800`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mx-auto text-primary" />
          <p className="text-sm sm:text-base text-muted-foreground">Loading memories...</p>
        </div>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-5xl sm:text-6xl md:text-7xl">📸</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">No Photos Yet</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Be the first to share a memory! Upload your photos to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {media.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className={`aspect-square relative group overflow-hidden rounded-md sm:rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-muted animate-in fade-in ${
                item.isVideo ? "cursor-pointer" : ""
              }`}
              style={{
                animationDelay: `${(index % 15) * 50}ms`,
              }}
              onClick={() => item.isVideo && setSelectedVideo(item)}
            >
              <Image
                src={getThumbnailUrl(item)}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.66vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Play button overlay for videos */}
              {item.isVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 rounded-full p-3 sm:p-4 group-hover:bg-black/80 group-hover:scale-110 transition-all duration-300">
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      {/* Load more trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-6 sm:py-8 mt-2 sm:mt-4"
        >
          {loadingMore && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              <span className="text-sm sm:text-base">Loading more...</span>
            </div>
          )}
        </div>
      )}

        {!hasMore && media.length > 0 && (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <p className="text-sm sm:text-base">You&apos;ve seen all the memories!</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      <VideoModal
        videoUrl={selectedVideo ? getMediaUrl(selectedVideo) : ""}
        videoName={selectedVideo?.name || ""}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </>
  );
}
