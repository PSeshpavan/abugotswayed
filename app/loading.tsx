import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mx-auto text-primary" />
        <p className="text-sm sm:text-base text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
