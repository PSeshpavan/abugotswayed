"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from "next/link";

export default function QRPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="text-center space-y-6 sm:space-y-8 max-w-2xl w-full">
        <div className="px-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3 sm:mb-4">
            Wedding Photo QR Code
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Print this QR code and display it at your wedding venue for guests to scan and share photos
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-2xl inline-block w-full max-w-md mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/qr-code.png"
            alt="QR Code for Wedding Photos"
            className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 mx-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden text-center p-6 sm:p-8">
            <p className="text-red-600 font-medium text-sm sm:text-base">QR Code not generated yet</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Run: npm run generate-qr YOUR_URL
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
          <Link href="/qr-code.png" download="wedding-qr-code.png" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-gradient-to-r from-primary to-secondary">
              <Download className="w-4 h-4 mr-2" />
              <span className="text-sm sm:text-base">Download QR Code</span>
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full border-2">
              <span className="text-sm sm:text-base">Back to App</span>
            </Button>
          </Link>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 sm:p-6 text-left space-y-2 text-xs sm:text-sm mx-2">
          <h3 className="font-semibold text-sm sm:text-base">Printing Tips:</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
            <li className="leading-relaxed">Print on high-quality paper for best scanning results</li>
            <li className="leading-relaxed">Recommended size: 8x10 inches or larger</li>
            <li className="leading-relaxed">Place QR codes at guest tables, photo booth, and entrance</li>
            <li className="leading-relaxed">Test scanning before the event to ensure it works</li>
            <li className="leading-relaxed">Add text like &quot;Scan to share your photos!&quot; above the QR code</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
