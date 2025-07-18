
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy } from "lucide-react";
import { copyToClipboard } from "@/utils/copyUtils";
import { OSSelector } from "./OSSelector";

interface ServerAgentConfigFormProps {
  formData: {
    serverName: string;
    description: string;
    osType: string;
    checkInterval: string;
    retryAttempt: string;
    dockerEnabled: boolean;
    notificationEnabled: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    serverName: string;
    description: string;
    osType: string;
    checkInterval: string;
    retryAttempt: string;
    dockerEnabled: boolean;
    notificationEnabled: boolean;
  }>>;
  serverId: string;
  serverToken: string;
  currentPocketBaseUrl: string;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const ServerAgentConfigForm: React.FC<ServerAgentConfigFormProps> = ({
  formData,
  setFormData,
  serverId,
  serverToken,
  currentPocketBaseUrl,
  isSubmitting,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="serverName">Server Name *</Label>
          <Input
            id="serverName"
            placeholder="e.g., web-server-01"
            value={formData.serverName}
            onChange={(e) => setFormData(prev => ({ ...prev, serverName: e.target.value }))}
            required
          />
          <p className="text-xs text-muted-foreground">What is the name or label used as the identifier</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="serverId">Server Agent ID</Label>
          <div className="flex gap-2">
            <Input
              id="serverId"
              value={serverId}
              readOnly
              className="font-mono text-sm bg-muted"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(serverId)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Auto-generated unique identifier</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Operating System *</Label>
          <OSSelector
            value={formData.osType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, osType: value }))}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkInterval">Check Interval</Label>
            <Select
              value={formData.checkInterval}
              onValueChange={(value) => setFormData(prev => ({ ...prev, checkInterval: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="120">2 minutes</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">How often to check the server and metric status</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retryAttempt">Retry Attempts</Label>
            <Select
              value={formData.retryAttempt}
              onValueChange={(value) => setFormData(prev => ({ ...prev, retryAttempt: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select retry attempts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 attempt</SelectItem>
                <SelectItem value="2">2 attempts</SelectItem>
                <SelectItem value="3">3 attempts</SelectItem>
                <SelectItem value="5">5 attempts</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Number of retry attempts before marking as down</p>
          </div>

          <div className="space-y-2">
            <Label>Server Token</Label>
            <div className="flex gap-2">
              <Input value={serverToken} readOnly className="font-mono text-sm bg-muted" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(serverToken)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Auto-generated authentication token</p>
          </div>

          <div className="space-y-2">
            <Label>System URL</Label>
            <div className="flex gap-2">
              <Input value={currentPocketBaseUrl} readOnly className="font-mono text-sm bg-muted" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(currentPocketBaseUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Current system API URL</p>
          </div>
        </div>
      </div>
     
      <div className="pt-4">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating Agent..." : "Create Server Agent"}
        </Button>
      </div>
    </form>
  );
};