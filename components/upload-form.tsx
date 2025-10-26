"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react";

export function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

    const validFiles = selectedFiles.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type === "video/mp4";

      // Check if video is too large
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        alert(`Video "${file.name}" is too large. Maximum size is 100MB.`);
        return false;
      }

      return isImage || isVideo;
    });

    setFiles(validFiles);
    setUploadStatus("idle");
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus("error");
      setStatusMessage("Please select at least one file");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (data.success) {
        setUploadStatus("success");
        setStatusMessage(data.message);
        setTimeout(() => {
          router.push("/gallery");
        }, 1500);
      } else {
        setUploadStatus("error");
        setStatusMessage(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setStatusMessage("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    router.push("/gallery");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 border-primary/20">
      <CardHeader className="text-center space-y-2 px-4 sm:px-6">
        <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Share Your Memories
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Upload your favorite moments from the celebration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        <div
          className="border-2 border-dashed border-primary/30 rounded-lg p-6 sm:p-8 md:p-10 text-center hover:border-primary/50 transition-colors cursor-pointer bg-gradient-to-br from-primary/5 to-secondary/5"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="rounded-full bg-primary/10 p-3 sm:p-4">
              <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-medium">
                {files.length > 0
                  ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                  : "Click to select photos or videos"}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Photos and MP4 videos (max 100MB)
              </p>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {files.slice(0, 10).map((file, index) => {
              const isVideo = file.type.startsWith("video/");
              return (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden border-2 border-primary/20 relative"
                >
                  {isVideo ? (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <svg
                          className="w-12 h-12 mx-auto text-primary/70"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                        <p className="text-xs text-muted-foreground mt-1">Video</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </>
                  )}
                </div>
              );
            })}
            {files.length > 10 && (
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary/20 bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">+{files.length - 10}</span>
              </div>
            )}
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {uploadStatus !== "idle" && !uploading && (
          <div
            className={`flex items-center gap-2 p-4 rounded-lg ${
              uploadStatus === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {uploadStatus === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <p className="text-sm font-medium">{statusMessage}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="w-full sm:flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            size="lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">{uploading ? "Uploading..." : "Upload"}</span>
          </Button>
          <Button
            onClick={handleSkip}
            variant="outline"
            disabled={uploading}
            className="w-full sm:flex-1 border-2"
            size="lg"
          >
            <span className="text-sm sm:text-base">Skip & View Gallery</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
