
package pocketbase

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

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