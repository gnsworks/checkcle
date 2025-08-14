
package pocketbase

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func (c *PocketBaseClient) parseResponse(resp *http.Response, target interface{}) error {
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	return json.Unmarshal(body, target)
}

func (c *PocketBaseClient) createRecord(collection string, data interface{}) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", 
		fmt.Sprintf("%s/api/collections/%s/records", c.baseURL, collection),
		bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	// No authentication header needed
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		// Read response body for better error details
		bodyBytes, _ := io.ReadAll(resp.Body)
		bodyString := string(bodyBytes)
		
		fmt.Printf("Failed to create record in %s collection. Status: %d, Response: %s\n", 
			collection, resp.StatusCode, bodyString)
		
		return fmt.Errorf("failed to create record in %s, status: %d, response: %s", 
			collection, resp.StatusCode, bodyString)
	}

	return nil
}

func (c *PocketBaseClient) updateRecord(collection string, recordID string, data interface{}) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("PATCH", 
		fmt.Sprintf("%s/api/collections/%s/records/%s", c.baseURL, collection, recordID),
		bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		bodyString := string(bodyBytes)
		
		fmt.Printf("Failed to update record in %s collection. Status: %d, Response: %s\n", 
			collection, resp.StatusCode, bodyString)
		
		return fmt.Errorf("failed to update record in %s, status: %d, response: %s", 
			collection, resp.StatusCode, bodyString)
	}

	return nil
}

// UpdateRecord is the public method for server monitoring that preserves other fields
func (c *PocketBaseClient) UpdateRecord(collection string, id string, data map[string]interface{}) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("PATCH",
		fmt.Sprintf("%s/api/collections/%s/records/%s", c.baseURL, collection, id),
		bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to update record, status: %d", resp.StatusCode)
	}

	return nil
}

func (c *PocketBaseClient) GetHTTPClient() *http.Client {
	return c.httpClient
}