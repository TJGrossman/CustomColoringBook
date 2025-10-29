
'use client';

import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-auto flex-col gap-4 border-b bg-background/80 px-4 pt-2 backdrop-blur-sm sm:px-6">
      <div className="flex h-14 items-center gap-4">
        <div className="flex items-center gap-2 md:hidden">
          <SidebarTrigger />
          <Link href="/dashboard">
            <Logo className="h-6 w-6" />
            <span className="sr-only">ColoringPics</span>
          </Link>
        </div>

        <div className="flex w-full items-center justify-end gap-4">
            {/* User-related UI removed */}
        </div>
      </div>
    </header>
  );
}
