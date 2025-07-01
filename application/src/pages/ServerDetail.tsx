
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { serverService } from "@/services/serverService";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Server, Database } from "lucide-react";
import { ServerMetricsCharts } from "@/components/servers/ServerMetricsCharts";
import { ServerMetricsOverview } from "@/components/servers/ServerMetricsOverview";
import { ServerHistoryCharts } from "@/components/servers/ServerHistoryCharts";

const ServerDetail = () => {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { sidebarCollapsed, toggleSidebar } = useSidebar();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  console.log('ServerDetail component loaded with serverId:', serverId);

  const {
    data: server,
    isLoading: serverLoading,
    error: serverError
  } = useQuery({
    queryKey: ['server', serverId],
    queryFn: () => serverService.getServer(serverId!),
    enabled: !!serverId
  });

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleBackToServers = () => {
    navigate('/instance-monitoring');
  };

  if (serverError) {
    console.error('Server detail error:', serverError);
    return (
      <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            sidebarCollapsed={sidebarCollapsed} 
            toggleSidebar={toggleSidebar} 
          />
          <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="text-center max-w-md w-full">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Error loading server</h2>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Unable to fetch server data. Please check your connection and try again.
              </p>
              <div className="text-xs text-muted-foreground mb-4 font-mono">
                Error: {serverError?.message || 'Unknown error'}
              </div>
              <Button onClick={handleBackToServers} variant="outline" className="text-sm sm:text-base">
                Back to Servers
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (serverLoading) {
    return (
      <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            sidebarCollapsed={sidebarCollapsed} 
            toggleSidebar={toggleSidebar} 
          />
          <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading server details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          sidebarCollapsed={sidebarCollapsed} 
          toggleSidebar={toggleSidebar} 
        />
        <main className="flex-1 overflow-auto">
          <div className="mx-[20px] my-[20px]">
            {/* Header Section */}
            <div className="mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Button
                      onClick={handleBackToServers}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Servers
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                      <Database className="h-4 w-4 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {server?.name || 'Server Detail'}
                    </h1>
                  </div>
                  <p className={`text-muted-foreground mt-1 sm:mt-2 transition-all duration-300 ${sidebarCollapsed ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
                    Monitor server performance metrics and system health
                    {server && (
                      <span className="block text-xs text-foreground/80 mt-1">
                        {server.hostname} • {server.ip_address} • {server.os_type} • {server.system_info} 
                      </span>
                      
                    )}
                  </p>
                  
                  
                </div>
              </div>
            </div>

            {/* Server Overview Cards */}
            {server && (
              <div className="mb-6 lg:mb-8">
                <ServerMetricsOverview server={server} />
              </div>
            )}

            {/* Historical Charts Section */}
            {server && (
              <div className="mb-6 lg:mb-8">
                <ServerHistoryCharts serverId={server.id} />
              </div>
            )}
            
            {/* Metrics Charts Section */}
            {server && (
              <div className="min-w-0">
                <ServerMetricsCharts serverId={server.id} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ServerDetail;