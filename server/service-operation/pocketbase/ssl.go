
package pocketbase

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"service-operation/types"
)

type SSLCertificatesResponse struct {
	Page       int                     `json:"page"`
	PerPage    int                     `json:"perPage"`
	TotalItems int                     `json:"totalItems"`
	TotalPages int                     `json:"totalPages"`
	Items      []types.SSLCertificate `json:"items"`
}

func (c *PocketBaseClient) GetSSLCertificates() ([]types.SSLCertificate, error) {
	url := fmt.Sprintf("%s/api/collections/ssl_certificates/records", c.baseURL)
	
	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch SSL certificates: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("PocketBase returned status %d", resp.StatusCode)
	}

	var response SSLCertificatesResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode SSL certificates response: %v", err)
	}

	return response.Items, nil
}

func (c *PocketBaseClient) UpdateSSLCertificate(id string, data map[string]interface{}) error {
	url := fmt.Sprintf("%s/api/collections/ssl_certificates/records/%s", c.baseURL, id)
	
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal SSL certificate data: %v", err)
	}

	req, err := http.NewRequest(http.MethodPatch, url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create SSL certificate update request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to update SSL certificate: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to update SSL certificate, status: %d", resp.StatusCode)
	}

	return nil
}

func (c *PocketBaseClient) GetSSLCertificateByID(id string) (*types.SSLCertificate, error) {
	url := fmt.Sprintf("%s/api/collections/ssl_certificates/records/%s", c.baseURL, id)
	
	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch SSL certificate: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("PocketBase returned status %d", resp.StatusCode)
	}

	var cert types.SSLCertificate
	if err := json.NewDecoder(resp.Body).Decode(&cert); err != nil {
		return nil, fmt.Errorf("failed to decode SSL certificate response: %v", err)
	}

	return &cert, nil
}