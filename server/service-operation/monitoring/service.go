package monitoring

import (
	"log"
	"sync"
	"time"

	"service-operation/pocketbase"
)

type MonitoringService struct {
	pbClient        *pocketbase.PocketBaseClient
	activeServices  map[string]*ServiceMonitor
	regionalMonitor *RegionalMonitor
	mu              sync.RWMutex
	stopChan        chan bool
	isRunning       bool
}

func NewMonitoringService(pbClient *pocketbase.PocketBaseClient) *MonitoringService {
	return &MonitoringService{
		pbClient:        pbClient,
		activeServices:  make(map[string]*ServiceMonitor),
		regionalMonitor: NewRegionalMonitor(pbClient),
		stopChan:        make(chan bool),
		isRunning:       false,
	}
}

func (ms *MonitoringService) Start() {
	ms.mu.Lock()
	defer ms.mu.Unlock()

	if ms.isRunning {
		log.Println("Monitoring service is already running")
		return
	}

	ms.isRunning = true
	//log.Println("Starting monitoring service...")

	// Start regional monitoring
	ms.regionalMonitor.Start()

	// Start monitoring all services from PocketBase
	go ms.monitoringLoop()
}

func (ms *MonitoringService) Stop() {
	ms.mu.Lock()
	defer ms.mu.Unlock()

	if !ms.isRunning {
		return
	}

	log.Println("Stopping monitoring service...")
	ms.isRunning = false
	
	// Stop regional monitoring
	ms.regionalMonitor.Stop()
	
	// Stop all active monitors
	for serviceID, monitor := range ms.activeServices {
		ms.stopMonitor(serviceID, monitor)
	}

	ms.stopChan <- true
}

func (ms *MonitoringService) GetRegionalInfo() (string, string) {
	return ms.regionalMonitor.GetRegionalInfo()
}

func (ms *MonitoringService) monitoringLoop() {
	ticker := time.NewTicker(30 * time.Second) // Check for new services every 30 seconds
	defer ticker.Stop()

	// Initial load of services
	ms.loadAndStartServices()

	for {
		select {
		case <-ticker.C:
			ms.loadAndStartServices()
		case <-ms.stopChan:
			return
		}
	}
}

func (ms *MonitoringService) loadAndStartServices() {
	// Only get services that are NOT paused
	services, err := ms.pbClient.GetActiveServices()
	if err != nil {
		log.Printf("Failed to load services: %v", err)
		return
	}

	ms.mu.Lock()
	defer ms.mu.Unlock()

	// Filter out paused services and start monitoring for active ones
	activeServiceIDs := make(map[string]bool)
	for _, service := range services {
		if service.Status != "paused" {
			activeServiceIDs[service.ID] = true
			
			// Start monitoring if not already active
			if _, exists := ms.activeServices[service.ID]; !exists {
				ms.startMonitor(service)
			}
		}
	}

	// Stop monitoring for paused or removed services
	for serviceID, monitor := range ms.activeServices {
		if !activeServiceIDs[serviceID] {
			log.Printf("Stopping monitoring for service %s (paused or removed)", serviceID)
			ms.stopMonitor(serviceID, monitor)
		}
	}
}