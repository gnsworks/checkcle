
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Activity, AlertTriangle, Power } from "lucide-react";
import { ServerStats } from "@/types/server.types";
import { useTheme } from "@/contexts/ThemeContext";

interface ServerStatsCardsProps {
  stats: ServerStats;
}

export const ServerStatsCards = ({ stats }: ServerStatsCardsProps) => {
  const { theme } = useTheme();

  const cards = [
    {
      title: "TOTAL SERVERS",
      value: stats.total,
      icon: Server,
      gradient: theme === 'dark' 
        ? "linear-gradient(135deg, rgba(139, 69, 19, 0.8) 0%, rgba(160, 82, 45, 0.6) 100%)" 
        : "linear-gradient(135deg, #8b4513 0%, #a0522d 100%)"
    },
    {
      title: "ONLINE SERVERS",
      value: stats.online,
      icon: Activity,
      gradient: theme === 'dark' 
        ? "linear-gradient(135deg, rgba(67, 160, 71, 0.8) 0%, rgba(102, 187, 106, 0.6) 100%)" 
        : "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)"
    },
    {
      title: "OFFLINE SERVERS",
      value: stats.offline,
      icon: Power,
      gradient: theme === 'dark'
        ? "linear-gradient(135deg, rgba(229, 57, 53, 0.8) 0%, rgba(239, 83, 80, 0.6) 100%)"
        : "linear-gradient(135deg, #e53935 0%, #ef5350 100%)"
    },
    {
      title: "WARNING SERVERS",
      value: stats.warning,
      icon: AlertTriangle,
      gradient: theme === 'dark'
        ? "linear-gradient(135deg, rgba(255, 152, 0, 0.8) 0%, rgba(255, 183, 77, 0.6) 100%)"
        : "linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
      {cards.map((card, index) => (
        <Card 
          key={index}
          className={`border-none rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
            theme === 'dark' ? 'dark-card' : ''
          } relative z-10`}
          style={{
            background: card.gradient
          }}
        >
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="w-full h-full" 
              style={{ 
                backgroundImage: `linear-gradient(#fff 1px, transparent 1px), 
                                  linear-gradient(90deg, #fff 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}
            ></div>
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-white">{card.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between relative z-10">
            <span className="text-5xl font-bold text-white">{card.value}</span>
            <div className="rounded-full p-3 bg-white/25 backdrop-blur-sm">
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};