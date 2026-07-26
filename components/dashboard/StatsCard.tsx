import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  Icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  cardBgColor?: string;
}

export default function StatsCard({
  title,
  value,
  trend,
  isPositive,
  Icon,
  iconBgColor = "bg-muted",
  iconColor = "text-muted-foreground",
  cardBgColor = "bg-card",
}: StatsCardProps) {
  return (
    <Card className={`${cardBgColor} p-4 sm:p-6 border-border shadow-sm flex flex-col justify-between min-h-[120px] sm:min-h-[140px]`}>
      <div className="flex justify-between items-start gap-2">
        <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgColor}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
      <div>
        <div className="text-xl sm:text-3xl font-bold text-foreground mt-2 break-all">{value}</div>
        {trend && (
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className={isPositive ? "text-primary font-medium" : "text-muted-foreground"}>
              {isPositive ? "↗" : "↘"} {trend}
            </span>
            <span className="text-muted-foreground">dari bulan lalu</span>
          </div>
        )}
      </div>
    </Card>
  );
}

