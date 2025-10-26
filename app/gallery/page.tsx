import { ImageGallery } from "@/components/image-gallery";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload } from "lucide-react";

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Wedding Memories
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Celebrating love, one photo at a time
            </p>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              className="border-2 border-primary/30 hover:bg-primary/10"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </Link>
        </div>
      </div>
      <ImageGallery />
    </main>
  );
}
