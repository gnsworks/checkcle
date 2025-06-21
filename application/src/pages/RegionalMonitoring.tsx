
import React, { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "@/contexts/SidebarContext";
import { RegionalMonitoringContent } from "@/components/regional-monitoring/RegionalMonitoringContent";

const RegionalMonitoring = () => {
  const { sidebarCollapsed, toggleSidebar } = useSidebar();
  const currentUser = authService.getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          sidebarCollapsed={sidebarCollapsed} 
          toggleSidebar={toggleSidebar} 
        />
        <div className="flex-1 overflow-auto">
          <RegionalMonitoringContent />
        </div>
      </div>
    </div>
  );
};

export default RegionalMonitoring;