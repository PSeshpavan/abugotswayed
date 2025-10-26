import { UploadForm } from "@/components/upload-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <UploadForm />
    </main>
  );
}
