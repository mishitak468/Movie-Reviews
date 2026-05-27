import { Card } from "@/components/ui/card";

export default function MovieCardSkeleton() {
  return (
    <Card className="aspect-[2/3] gap-0 overflow-hidden border-white/5 py-0">
      <div className="cine-shimmer h-full w-full" />
    </Card>
  );
}
