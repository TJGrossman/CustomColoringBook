
'use client';

import { ImageUploader } from "@/components/image-uploader";
import { Logo } from "@/components/icons";
import Link from "next/link";

export default function CreatePage() {
  return (
    <div className="flex flex-col min-h-screen">
       <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
          <Logo className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold font-headline">ColoringPics</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
            <p className="text-sm text-muted-foreground">Turn your photos into coloring pages.</p>
        </nav>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Create Your Coloring Book</h1>
                <p className="mt-2 text-muted-foreground">Upload your photos to get started. Our AI will convert them into line art, ready for you to color.</p>
            </div>
            <ImageUploader />
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 ColoringPics. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
