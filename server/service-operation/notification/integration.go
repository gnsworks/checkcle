
package notification

import (
	"log"
	"time"

	"service-operation/pocketbase"
	"service-operation/types"
)

// ServiceNotifier provides an easy interface to send notifications for service events
type ServiceNotifier struct {
	manager *NotificationManager
}

// NewServiceNotifier creates a new service notifier
func NewServiceNotifier(pbClient *pocketbase.PocketBaseClient) *ServiceNotifier {
	return &ServiceNotifier{
		manager: NewNotificationManager(pbClient),
	}
}

// NotifyServiceStatus sends a notification for service status change
func (sn *ServiceNotifier) NotifyServiceStatus(service pocketbase.Service, result *types.OperationResult) {
	// Check if service has notification configured
	if service.NotificationID == "" {
		return
	}

	// Create notification payload
	payload := &NotificationPayload{
		ServiceName:  service.Name,
		Status:       service.Status,
		Host:         service.Host,
		Port:         service.Port,
		ServiceType:  service.ServiceType,
		ResponseTime: result.ResponseTime.Milliseconds(),
		Timestamp:    time.Now(),
		ErrorMessage: result.Error,
	}

	// Send notification
	if err := sn.manager.SendServiceNotification(payload, service.NotificationID, service.TemplateID); err != nil {
		log.Printf("Failed to send notification for service %s: %v", service.Name, err)
	} else {
		log.Printf("Notification sent successfully for service %s", service.Name)
	}
}

// NotifyCustom sends a custom notification
func (sn *ServiceNotifier) NotifyCustom(notificationID, templateID, serviceName, status, message string) error {
	payload := &NotificationPayload{
		ServiceName: serviceName,
		Status:      status,
		Message:     message,
		Timestamp:   time.Now(),
	}

	return sn.manager.SendServiceNotification(payload, notificationID, templateID)
}