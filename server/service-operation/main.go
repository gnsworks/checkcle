package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gorilla/mux"
	"service-operation/config"
	"service-operation/handlers"
	"service-operation/monitoring"
	"service-operation/pocketbase"
)

func main() {
	cfg := config.Load()
	
	// Initialize PocketBase client (no credentials required)
	var pbClient *pocketbase.PocketBaseClient
	var monitoringService *monitoring.MonitoringService
	var sslMonitoringService *monitoring.SSLMonitoringService
	
	if cfg.PocketBaseEnabled {
		var err error
		pbClient, err = pocketbase.NewPocketBaseClient(cfg.PocketBaseURL)
		if err != nil {
			log.Printf("Warning: Failed to initialize PocketBase client: %v", err)
		} else {
			if err := pbClient.TestConnection(); err != nil {
				log.Printf("Warning: PocketBase connection test failed: %v", err)
			} else {
				// Initialize and start monitoring service with regional support
				monitoringService = monitoring.NewMonitoringService(pbClient)
				go monitoringService.Start()
				log.Println("Monitoring service started with regional agent support")
				
				// Initialize and start SSL monitoring service (unchanged - no regional support)
				sslMonitoringService = monitoring.NewSSLMonitoringService(pbClient)
				go sslMonitoringService.Start()
				log.Println("SSL monitoring service started (independent of regional agents)")
			}
		}
	}
	
	handler := handlers.NewOperationHandler(cfg, pbClient)

	router := mux.NewRouter()

	// Main operation endpoint
	router.HandleFunc("/operation", handler.HandleOperation).Methods("POST")
	
	// Quick operation endpoint with query parameters
	router.HandleFunc("/operation/quick", handler.HandleQuickOperation).Methods("GET")
	
	// Legacy ping endpoint for backward compatibility
	router.HandleFunc("/ping", handler.HandleOperation).Methods("POST")
	router.HandleFunc("/ping/quick", handler.HandleQuickOperation).Methods("GET")
	
	// Health check
	router.HandleFunc("/health", handler.HandleHealth).Methods("GET")

	log.Printf("Service Operation starting on port %s", cfg.Port)
	if pbClient != nil {
		log.Printf("PocketBase integration enabled at %s (public access)", pbClient.GetBaseURL())
	}
	if monitoringService != nil {
		log.Printf("Automatic service monitoring enabled with regional agent support")
	}
	if sslMonitoringService != nil {
		log.Printf("SSL certificate monitoring enabled (independent)")
	}
	log.Printf("Endpoints:")
	log.Printf("  POST /operation - Full operation test (ping, dns, tcp, http, ssl)")
	log.Printf("  GET  /operation/quick?type=<type>&host=<host> - Quick operation test")
	log.Printf("  POST /ping - Legacy ping endpoint")
	log.Printf("  GET  /ping/quick?host=<host> - Legacy quick ping test")
	log.Printf("  GET  /health - Health check")
	log.Printf("Supported operations: ping, dns, tcp, http, ssl")
	log.Printf("Regional monitoring: Tracks 'Default' region connection status")

	// Setup graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	
	go func() {
		<-c
		log.Println("Shutting down monitoring services...")
		if monitoringService != nil {
			monitoringService.Stop()
		}
		if sslMonitoringService != nil {
			sslMonitoringService.Stop()
		}
		log.Println("Service stopped")
		os.Exit(0)
	}()

	if err := http.ListenAndServe(":"+cfg.Port, router); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}