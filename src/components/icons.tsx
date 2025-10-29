import type { SVGProps } from 'react';
import Image from 'next/image';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <Image
      src="/logo.png"
      alt="ColoringPics Logo"
      width={24}
      height={24}
      className="rounded"
      {...props}
    />
  );
}
