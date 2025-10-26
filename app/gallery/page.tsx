import { ImageGallery } from "@/components/image-gallery";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload } from "lucide-react";

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
              Wedding Memories
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">
              Celebrating love, one photo at a time
            </p>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              className="border-2 border-primary/30 hover:bg-primary/10 shrink-0"
              size="sm"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
          </Link>
        </div>
      </div>
      <ImageGallery />
    </main>
  );
}
