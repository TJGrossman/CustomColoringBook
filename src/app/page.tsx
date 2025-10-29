
'use client';

import { Logo } from "@/components/icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const heroPhoto = PlaceHolderImages.find(img => img.id === 'hero-photo');
  const heroColoring = PlaceHolderImages.find(img => img.id === 'hero-coloring');

  return (
    <div className="flex flex-col min-h-screen">
       <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
          <Logo className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold font-headline">ColoringPics</span>
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
                  <h1 className="text-2xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Create custom coloring books from your photos – Fast
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Just upload your favorite photos, and our AI will magically convert them into beautiful, printable coloring book pages. It's fun, creative, and simple!
                  </p>
                  <p className="text-lg font-medium text-foreground">
                    Capture the moments that matter.<br />
                    Let your child color their story.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                   <Button asChild size="lg">
                      <Link href="/create">
                        Create Your Coloring Book
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {heroPhoto && (
                   <Image
                      src={heroPhoto.imageUrl}
                      alt={heroPhoto.description}
                      width={600}
                      height={800}
                      className="mx-auto aspect-[3/4] overflow-hidden rounded-xl object-cover"
                      data-ai-hint={heroPhoto.imageHint}
                   />
                )}
                 {heroColoring && (
                    <Image
                      src={heroColoring.imageUrl}
                      alt={heroColoring.description}
                      width={600}
                      height={800}
                      className="mx-auto aspect-[3/4] overflow-hidden rounded-xl object-cover"
                      data-ai-hint={heroColoring.imageHint}
                    />
                 )}
              </div>
            </div>
          </div>
        </section>
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
