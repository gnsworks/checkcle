
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container, Play, Square, AlertTriangle } from "lucide-react";
import { DockerStats } from "@/types/docker.types";

interface DockerStatsCardsProps {
  stats: DockerStats;
}

export const DockerStatsCards = ({ stats }: DockerStatsCardsProps) => {
  const cards = [
    {
      title: "Total Containers",
      value: stats.total,
      icon: Container,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Running",
      value: stats.running,
      icon: Play,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Stopped",
      value: stats.stopped,
      icon: Square,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
    {
      title: "Warning",
      value: stats.warning,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <Card key={card.title} className={`${card.borderColor} bg-card hover:shadow-md transition-shadow`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} ${card.color} p-2 rounded-md`}>
                <IconComponent className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-foreground">
                  {card.value}
                </div>
                <Badge 
                  variant="outline" 
                  className={`${card.color} ${card.borderColor} text-xs`}
                >
                  Containers
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};