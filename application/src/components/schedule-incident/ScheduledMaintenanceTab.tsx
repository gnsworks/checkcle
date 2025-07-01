import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MaintenanceTable, MaintenanceStatusChecker } from './maintenance';
import { LoadingState } from '@/components/services/LoadingState';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { useMaintenanceData } from './hooks/useMaintenanceData';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

interface ScheduledMaintenanceTabProps {
  refreshTrigger?: number;
}

export const ScheduledMaintenanceTab = ({ refreshTrigger = 0 }: ScheduledMaintenanceTabProps) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [manualRefresh, setManualRefresh] = React.useState(0);

  const combinedRefreshTrigger = refreshTrigger + manualRefresh;

  const {
    loading,
    filter,
    setFilter,
    maintenanceData,
    overviewStats,
    fetchMaintenanceData,
    isEmpty,
    error,
    initialized,
  } = useMaintenanceData({ refreshTrigger: combinedRefreshTrigger });

  useEffect(() => {
    if (error) {
      toast({
        title: t('error'),
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast, t]);

  useEffect(() => {
    fetchMaintenanceData(true);
  }, [fetchMaintenanceData]);

  const handleMaintenanceUpdated = () => {
    setManualRefresh((prev) => prev + 1);
  };

  const handleTabChange = (value: string) => {
    setFilter(value);
  };

  if (loading && !initialized) {
    return <LoadingState />;
  }

  const gradientCard = (
    title: string,
    value: string | number,
    icon: JSX.Element,
    gradient: string
  ) => (
    <Card
      className="border-none rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 relative z-10"
      style={{
        background: theme === 'dark'
          ? `linear-gradient(135deg, rgba(65,59,55,0.8) 0%, ${gradient})`
          : `linear-gradient(135deg, rgba(65,59,55,0.8) 0%, ${gradient})`,
      }}
    >
      <div className="absolute inset-0 z-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px),
                              linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
      </div>
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between relative z-10">
        <span className="text-4xl font-bold text-white">{value}</span>
        <div className="rounded-full p-3 bg-white/25 backdrop-blur-sm">
          {icon}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <MaintenanceStatusChecker
        maintenanceData={maintenanceData}
        onStatusUpdated={handleMaintenanceUpdated}
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
        {gradientCard(
          t('upcomingMaintenance'),
          loading ? '...' : overviewStats.upcoming,
          <Calendar className="h-6 w-6 text-white" />,
          'rgba(59,130,246,0.6)'
        )}
        {gradientCard(
          t('ongoingMaintenance'),
          loading ? '...' : overviewStats.ongoing,
          <Clock className="h-6 w-6 text-white" />,
          'rgba(251,191,36,0.6)'
        )}
        {gradientCard(
          t('completedMaintenance'),
          loading ? '...' : overviewStats.completed,
          <CheckCircle className="h-6 w-6 text-white" />,
          'rgba(34,197,94,0.6)'
        )}
        {gradientCard(
          t('totalScheduledHours'),
          loading ? '...' : `${overviewStats.totalDuration}h`,
          <Clock className="h-6 w-6 text-white" />,
          'rgba(139,92,246,0.6)'
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('scheduledMaintenance')}</CardTitle>
          <CardDescription>
            {t('scheduledMaintenanceDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="upcoming"
            value={filter}
            className="w-full"
            onValueChange={handleTabChange}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">{t('upcomingMaintenance')}</TabsTrigger>
              <TabsTrigger value="ongoing">{t('ongoingMaintenance')}</TabsTrigger>
              <TabsTrigger value="completed">{t('completedMaintenance')}</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <MaintenanceTable
                data={maintenanceData}
                isLoading={loading && initialized}
                onMaintenanceUpdated={handleMaintenanceUpdated}
              />
            </TabsContent>

            <TabsContent value="ongoing">
              <MaintenanceTable
                data={maintenanceData}
                isLoading={loading && initialized}
                onMaintenanceUpdated={handleMaintenanceUpdated}
              />
            </TabsContent>

            <TabsContent value="completed">
              <MaintenanceTable
                data={maintenanceData}
                isLoading={loading && initialized}
                onMaintenanceUpdated={handleMaintenanceUpdated}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};
