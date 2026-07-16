import { cn } from "@/lib/utils/cn";

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse rounded-lg bg-muted",
            className || "h-48 w-full"
          )}
        />
      ))}
    </div>
  );
}
