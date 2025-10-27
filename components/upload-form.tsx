"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Image as ImageIcon, CheckCircle2, XCircle, X } from "lucide-react";
import { compressImages } from "@/lib/image-compression";
import { uploadDirectlyToDrive } from "@/lib/direct-drive-upload";

export function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const MAX_VIDEO_SIZE = 250 * 1024 * 1024; // 250MB

    const validFiles = selectedFiles.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      // Check if video is too large
      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        alert(`Video "${file.name}" is too large. Maximum size is 250MB.`);
        return false;
      }

      return isImage || isVideo;
    });

    setFiles(validFiles);
    setUploadStatus("idle");
  };

  const handleDeleteFile = (indexToDelete: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToDelete));
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
      // Step 1: Compress images (10% of progress)
      setCompressing(true);
      setStatusMessage("Optimizing images...");

      const compressedFiles = await compressImages(files, (current, total) => {
        const compressProgress = Math.floor((current / total) * 10);
        setUploadProgress(compressProgress);
      });

      setCompressing(false);

      // Step 2: Upload files directly to Google Drive (90% of progress)
      let uploadedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < compressedFiles.length; i++) {
        const file = compressedFiles[i];
        const filesCompleted = i;
        const totalFiles = compressedFiles.length;

        const result = await uploadDirectlyToDrive(file, (progress) => {
          // Calculate overall progress
          const filesProgress = (filesCompleted / totalFiles) * 90;
          const currentFileProgress = (progress.progress / 100) * (90 / totalFiles);
          const overallProgress = 10 + filesProgress + currentFileProgress;

          setUploadProgress(Math.floor(overallProgress));
          setStatusMessage(
            `Uploading ${i + 1}/${totalFiles}: ${file.name} (${progress.progress}%)`
          );
        });

        if (result.success) {
          uploadedCount++;
        } else {
          failedCount++;
          console.error(`Failed to upload ${file.name}:`, result.error);
        }
      }

      setUploadProgress(100);

      if (uploadedCount > 0) {
        setUploadStatus("success");

        let message = '';
        if (uploadedCount > 0 && failedCount > 0) {
          message = `Successfully uploaded ${uploadedCount} file${uploadedCount > 1 ? 's' : ''}. ${failedCount} failed.`;
        } else {
          message = `Successfully uploaded ${uploadedCount} file${uploadedCount > 1 ? 's' : ''}!`;
        }

        setStatusMessage(message);
        setTimeout(() => {
          router.push("/gallery");
        }, 1500);
      } else {
        setUploadStatus("error");
        setStatusMessage('All uploads failed. Please try again.');
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setStatusMessage(error.message || "Failed to upload. Please try again.");
    } finally {
      setUploading(false);
      setCompressing(false);
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
            accept="image/*,video/*"
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
                Photos and videos (max 250MB for videos)
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
                  className="aspect-square rounded-lg border-2 border-primary/20 relative"
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(index);
                    }}
                    className="absolute -top-1 -right-1 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg transition-all hover:scale-110"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>

                  {isVideo ? (
                    <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg overflow-hidden">
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
                        className="w-full h-full object-cover rounded-lg overflow-hidden"
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
              {statusMessage || (compressing ? "Optimizing images..." : `Uploading... ${uploadProgress}%`)}
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
