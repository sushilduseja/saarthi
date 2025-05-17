
"use client";

import { cn } from '@/lib/utils';

interface DynamicCoverImageProps {
  width: number;
  height: number;
  className?: string;
}

export function DynamicCoverImage({
  width,
  height,
  className,
}: DynamicCoverImageProps) {
  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className={cn(
        "bg-muted", // Ensures a background color
        className // Allows parent to pass additional styles like w-full, h-48 etc.
      )}
      aria-hidden="true" // Since it's purely decorative now
    />
  );
}
