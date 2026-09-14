import { SkeletonList } from "@/components/ui/skeleton-list";

export default function Loading() {
  return <div className="p-6"><SkeletonList rows={8} /></div>;
}
