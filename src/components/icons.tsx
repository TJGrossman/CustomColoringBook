import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m18.37 3.63-1.42 1.42c-.54.54-.83 1.25-.83 1.99v4.92c0 .74-.29 1.45-.83 1.99l-1.42 1.42" />
      <path d="m16.95 5.05-1.41 1.41" />
      <path d="m14.12 7.88-1.42 1.42" />
      <path d="M3 21h18" />
      <path d="M5 21V5.59c0-.74.29-1.45.83-1.99l1.42-1.42c.54-.54 1.25-.83 1.99-.83h4.52c.74 0 1.45.29 1.99.83l1.42 1.42c.54.54.83 1.25.83 1.99V21" />
    </svg>
  );
}
