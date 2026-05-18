import Image from "next/image";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {/* Logo dengan animasi pulse */}
      <div className="relative w-20 h-20 animate-pulse drop-shadow-md">
        <Image
          src="/images/logo.png"
          alt="Memuat..."
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Loading text dan bar */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Memuat data...
        </p>
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary/60 rounded-full animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}
