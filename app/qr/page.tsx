"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from "next/link";

export default function QRPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Wedding Photo QR Code
          </h1>
          <p className="text-muted-foreground">
            Print this QR code and display it at your wedding venue for guests to scan and share photos
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-2xl inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/qr-code.png"
            alt="QR Code for Wedding Photos"
            className="w-64 h-64 md:w-80 md:h-80"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden text-center p-8">
            <p className="text-red-600 font-medium">QR Code not generated yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Run: npm run generate-qr YOUR_URL
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/qr-code.png" download="wedding-qr-code.png">
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="border-2">
              Back to App
            </Button>
          </Link>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 text-left space-y-2 text-sm">
          <h3 className="font-semibold text-base">Printing Tips:</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Print on high-quality paper for best scanning results</li>
            <li>Recommended size: 8x10 inches or larger</li>
            <li>Place QR codes at guest tables, photo booth, and entrance</li>
            <li>Test scanning before the event to ensure it works</li>
            <li>Add text like &quot;Scan to share your photos!&quot; above the QR code</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
