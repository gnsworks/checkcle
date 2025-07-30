
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Download, Container } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { copyToClipboard } from "@/utils/copyUtils";

interface DockerOneClickTabProps {
  serverToken: string;
  currentPocketBaseUrl: string;
  formData: {
    serverName: string;
    osType: string;
    checkInterval: string;
    retryAttempt: string;
  };
  serverId: string;
  onDialogClose: () => void;
}

export const DockerOneClickTab: React.FC<DockerOneClickTabProps> = ({
  serverToken,
  currentPocketBaseUrl,
  formData,
  serverId,
  onDialogClose,
}) => {
  const getDockerOneClickCommand = () => {
    const scriptUrl = "https://cdn.checkcle.io/scripts/server-docker-agent.sh";

    return `curl -L -o server-docker-agent.sh "${scriptUrl}"
chmod +x server-docker-agent.sh
SERVER_TOKEN="${serverToken}" \\
POCKETBASE_URL="${currentPocketBaseUrl}" \\
SERVER_NAME="${formData.serverName}" \\
AGENT_ID="${serverId}" \\
sudo -E bash ./server-docker-agent.sh`;
  };

  const getDirectDockerCommand = () => {
    return `docker run -d \\
  --name monitoring-agent \\
  --restart unless-stopped \\
  -p 8081:8081 \\
  --group-add 999 \\
  -e AGENT_ID="${serverId}" \\
  -e SERVER_NAME="${formData.serverName}" \\
  -e SERVER_TOKEN="${serverToken}" \\
  -e POCKETBASE_URL="${currentPocketBaseUrl}" \\
  -e POCKETBASE_ENABLED=true \\
  -v /proc:/host/proc:ro \\
  -v /etc:/host/etc:ro \\
  -v /sys:/host/sys:ro \\
  -v /:/host/root:ro \\
  -v /var/run:/host/var/run:ro \\
  -v /dev:/host/dev:ro \\
  -v /var/run/docker.sock:/var/run/docker.sock:ro \\
  -v monitoring_data:/var/lib/monitoring-agent \\
  -v monitoring_logs:/var/log/monitoring-agent \\
  operacle/checkcle-server-agent:latest`;
  };

  const handleCopyOneClickCommand = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Copy one-click command button clicked');
    const command = getDockerOneClickCommand();
    console.log('Copying one-click command:', command);
    await copyToClipboard(command);
  };

  const handleCopyDockerCommand = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Copy docker command button clicked');
    const command = getDirectDockerCommand();
    console.log('Copying docker command:', command);
    await copyToClipboard(command);
  };

  return (
    <div className="space-y-6">
      {/* One-Click Docker Installation */}
      <Card className="border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Container className="h-5 w-5" />
            Docker One-Click Install (Recommended)
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-300">
            Automated Docker container installation with system monitoring capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-blue-700 dark:text-blue-400">Docker One-Click Command</Label>
            <div className="relative">
              <pre className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap break-all text-blue-800 dark:text-blue-200">
                <code>{getDockerOneClickCommand()}</code>
              </pre>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-400"
                onClick={handleCopyOneClickCommand}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 p-3 rounded-md">
            <p className="font-medium mb-1">This script will automatically:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Download and setup the Docker monitoring agent</li>
              <li>Configure all required environment variables</li>
              <li>Start the container with proper system access</li>
              <li>Setup monitoring data persistence</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Direct Docker Run Command */}
      <Card className="border-gray-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Container className="h-5 w-5" />
            Direct Docker Run Command
          </CardTitle>
          <CardDescription>
            If you prefer to run the Docker container directly without the script
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Docker Run Command</Label>
            <div className="relative">
              <pre className="bg-muted border p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap break-all">
                <code>{getDirectDockerCommand()}</code>
              </pre>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleCopyDockerCommand}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground bg-muted/50 border p-3 rounded-md">
            <p className="font-medium mb-1">Prerequisites for direct Docker run:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Docker must be installed and running</li>
              <li>The operacle/checkcle-server-agent image must be available</li>
              <li>Run as root or with sudo privileges</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={onDialogClose}>
          Done
        </Button>
      </div>
    </div>
  );
};