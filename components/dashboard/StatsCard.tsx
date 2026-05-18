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
    <Card className={`${cardBgColor} p-6 border-border shadow-sm flex flex-col justify-between min-h-[140px]`}>
      <div className="flex justify-between items-start">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-foreground mt-2">{value}</div>
        <div className="flex items-center gap-2 mt-2 text-xs">
          <span className={isPositive ? "text-primary" : "text-muted-foreground"}>
            {isPositive ? "↗" : "↘"} {trend}
          </span>
          <span className="text-muted-foreground">dari bulan lalu</span>
        </div>
      </div>
    </Card>
  );
}
