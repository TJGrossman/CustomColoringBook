
'use client';

import { Logo } from "@/components/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Home() {
  const heroPhoto = PlaceHolderImages.find(img => img.id === 'hero-photo');
  const heroColoring = PlaceHolderImages.find(img => img.id === 'hero-coloring');
  const [isAtBottom, setIsAtBottom] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const isBottom = scrollTop + windowHeight >= documentHeight - 50; // 50px threshold
      setIsAtBottom(isBottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#2d1b4e]">
       <header className="px-4 lg:px-6 h-16 flex items-center bg-[#2d1b4e]/80 backdrop-blur-sm sticky top-0 z-50 border-b border-purple-800">
        <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
          <Logo className="h-6 w-6 text-purple-300" />
          <span className="text-xl font-semibold font-headline text-white">ColoringPics</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full pt-4 pb-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-6 md:space-y-4">
                <div className="space-y-6 md:space-y-4">
                  <h1 className="text-2xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-white">
                    Create custom coloring books from your photos – fast!
                  </h1>
                  <p className="max-w-[600px] text-purple-100 md:text-xl">
                    Upload your favorite photos, and let AI convert them into beautiful, printable coloring books.
                  </p>
                  <blockquote className="text-lg md:text-xl font-medium text-purple-50 italic border-l-4 border-purple-300 pl-4">
                    Capture the moments that matter.<br />
                    Let your child color their story.
                  </blockquote>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                   <Button asChild size="lg">
                      <Link href="/create">
                        Create Your Coloring Book
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                </div>
                <p className="text-sm text-purple-200 mt-4 max-w-[600px]">
                  <strong>*Pro Tip:</strong> If your little one's imagination is running wild, you can tell our AI how you want to update the images to add a little extra magic to the memories.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="relative aspect-[8.5/11] w-full max-w-md bg-gray-100 rounded-lg overflow-hidden shadow-md">
                  {/* Simple coloring book image - full size background */}
                  <div className="absolute inset-0">
                    <Image
                      src="/examples/easy.png"
                      alt="Coloring book example"
                      width={432}
                      height={560}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* Original image - left half overlay with higher z-index */}
                  <div className="absolute inset-0 overflow-hidden z-10" style={{clipPath: 'inset(0 50% 0 0)'}}>
                    <Image
                      src="/examples/originalFull.png"
                      alt="Original photo"
                      width={432}
                      height={560}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-purple-800">
        <p className="text-xs text-purple-300">&copy; 2025 ColoringPics. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs text-purple-300 hover:text-purple-200 hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs text-purple-300 hover:text-purple-200 hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
      
      {/* Mobile-only fixed button at bottom when scrolled */}
      {isMobile && isAtBottom && (
        <div className="fixed bottom-0 left-0 right-0 z-50 pt-4 pb-9 bg-[#2d1b4e]/95 backdrop-blur-sm border-t border-purple-800 sm:hidden">
          <Button asChild size="lg" className="w-full rounded-none">
            <Link href="/create">
              Create Your Coloring Book
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
