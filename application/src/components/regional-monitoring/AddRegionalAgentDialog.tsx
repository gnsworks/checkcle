import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Terminal, CheckCircle, Zap, Play } from "lucide-react";
import { regionalService } from "@/services/regionalService";
import { InstallCommand } from "@/types/regional.types";
import { useToast } from "@/hooks/use-toast";

interface AddRegionalAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentAdded: () => void;
}

export const AddRegionalAgentDialog: React.FC<AddRegionalAgentDialogProps> = ({
  open,
  onOpenChange,
  onAgentAdded
}) => {
  const [step, setStep] = useState(1);
  const [regionName, setRegionName] = useState("");
  const [agentIp, setAgentIp] = useState("");
  const [installCommand, setInstallCommand] = useState<InstallCommand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionName.trim() || !agentIp.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await regionalService.createRegionalService({
        region_name: regionName,
        agent_ip_address: agentIp,
      });
      
      setInstallCommand(result.installCommand);
      setStep(2);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create regional agent configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, description: string = "Content") => {
    try {
      // Try the modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Copied!",
          description: `${description} copied to clipboard.`,
        });
        return;
      }
      
      // Fallback for older browsers or non-secure contexts (like localhost)
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        toast({
          title: "Copied!",
          description: `${description} copied to clipboard.`,
        });
      } else {
        throw new Error('execCommand failed');
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      
      // Show the text in a modal or alert as final fallback
      const userAgent = navigator.userAgent.toLowerCase();
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      let errorMessage = "Failed to copy to clipboard.";
      if (isLocalhost) {
        errorMessage += " This is common in local development. Please manually copy the text.";
      } else if (userAgent.includes('chrome')) {
        errorMessage += " Try using HTTPS or enable clipboard permissions.";
      }
      
      toast({
        title: "Copy failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // As a last resort, select the text for manual copying
      try {
        const textarea = document.querySelector('textarea[readonly]') as HTMLTextAreaElement;
        if (textarea) {
          textarea.select();
          textarea.setSelectionRange(0, 99999); // For mobile devices
        }
      } catch (selectError) {
        console.error('Failed to select text:', selectError);
      }
    }
  };

  const downloadScript = () => {
    if (!installCommand) return;
    
    const blob = new Blob([installCommand.bash_script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `install-regional-agent-${installCommand.agent_id}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Installation script downloaded successfully.",
    });
  };

  const handleComplete = () => {
    onAgentAdded();
    setStep(1);
    setRegionName("");
    setAgentIp("");
    setInstallCommand(null);
    onOpenChange(false);
  };

  const resetDialog = () => {
    setStep(1);
    setRegionName("");
    setAgentIp("");
    setInstallCommand(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Add Regional Monitoring Agent</DialogTitle>
          <DialogDescription>
            Deploy a regional monitoring agent with automatic one-click installation.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <form onSubmit={handleCreateAgent} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="regionName">Region Name</Label>
                <Input
                  id="regionName"
                  placeholder="e.g., us-east-1, europe-west-1, asia-pacific-1"
                  value={regionName}
                  onChange={(e) => setRegionName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="agentIp">Agent Server IP Address</Label>
                <Input
                  id="agentIp"
                  placeholder="e.g., 192.168.1.100 or your-server.example.com"
                  value={agentIp}
                  onChange={(e) => setAgentIp(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Generating..." : "Generate Installation"}
              </Button>
            </div>
          </form>
        )}

        {step === 2 && installCommand && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold">Agent Configuration Ready!</h3>
              <p className="text-muted-foreground">
                One-click installation script generated with automatic configuration.
              </p>
            </div>

            <Tabs defaultValue="oneclicK" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="oneclicK">One-Click Install</TabsTrigger>
                <TabsTrigger value="details">Agent Details</TabsTrigger>
                <TabsTrigger value="manual">Manual Install</TabsTrigger>
              </TabsList>
              
              <TabsContent value="oneclicK" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      One-Click Automatic Installation
                    </CardTitle>
                    <CardDescription>
                      Complete installation, configuration, and service startup in one command
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                        <Play className="h-4 w-4" />
                        What this script does automatically:
                      </div>
                      <ul className="text-sm text-green-700 space-y-1 ml-6">
                        <li>• Downloads the latest .deb package</li>
                        <li>• Installs the regional monitoring agent</li>
                        <li>• Creates configuration file with your settings</li>
                        <li>• Starts and enables the service</li>
                        <li>• Runs health checks</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <Label>Run this command on your target server:</Label>
                      <div className="relative">
                        <Textarea
                          readOnly
                          value={`# One-click installation command:
curl -fsSL https://raw.githubusercontent.com/operacle/checkcle/refs/heads/main/scripts/install-regional-agent.sh | sudo bash -s -- \\
  --region-name="${regionName}" \\
  --agent-id="${installCommand.agent_id}" \\
  --agent-ip="${agentIp}" \\
  --token="${installCommand.token}" \\
  --pocketbase-url="${installCommand.api_endpoint}"`}
                          className="font-mono text-sm min-h-[120px] pr-12"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(`curl -fsSL https://raw.githubusercontent.com/operacle/checkcle/refs/heads/main/scripts/install-regional-agent.sh | sudo bash -s -- --region-name="${regionName}" --agent-id="${installCommand.agent_id}" --agent-ip="${agentIp}" --token="${installCommand.token}" --pocketbase-url="${installCommand.api_endpoint}"`, "Installation command")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={downloadScript} variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download Complete Script
                      </Button>
                      <Button 
                        onClick={() => copyToClipboard(installCommand.bash_script, "Installation script")} 
                        variant="outline" 
                        className="flex-1"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Full Script
                      </Button>
                    </div>

                    {/* Local development notice */}
                    {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Local Development Notice:</strong> If clipboard copying fails, this is normal in local development. 
                          You can use the "Download Complete Script" button instead or manually copy the text.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Agent Configuration</CardTitle>
                    <CardDescription>
                      These values will be automatically configured during installation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-foreground">Agent ID</Label>
                        <div className="relative">
                          <Input
                            value={installCommand.agent_id}
                            readOnly
                            className="font-mono text-sm bg-muted/50 border-muted-foreground/20 text-foreground pr-10"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                            onClick={() => copyToClipboard(installCommand.agent_id, "Agent ID")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Region Name</Label>
                        <Input
                          value={regionName}
                          readOnly
                          className="font-mono text-sm bg-muted/50 border-muted-foreground/20 text-foreground"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Server IP</Label>
                        <Input
                          value={agentIp}
                          readOnly
                          className="font-mono text-sm bg-muted/50 border-muted-foreground/20 text-foreground"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">API Endpoint</Label>
                        <Input
                          value={installCommand.api_endpoint}
                          readOnly
                          className="font-mono text-sm bg-muted/50 border-muted-foreground/20 text-foreground"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-foreground">Authentication Token</Label>
                      <div className="relative">
                        <Input
                          value={installCommand.token}
                          readOnly
                          className="font-mono text-sm bg-muted/50 border-muted-foreground/20 text-foreground pr-10"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                          onClick={() => copyToClipboard(installCommand.token, "Authentication token")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Configuration file location:</strong> /etc/regional-check-agent/regional-check-agent.env
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="h-5 w-5" />
                      Manual Installation Steps
                    </CardTitle>
                    <CardDescription>
                      Step-by-step manual installation process
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <p className="font-medium">Step 1: Download Package</p>
                        <code className="text-xs bg-muted p-2 rounded block mt-1">
                          wget https://github.com/operacle/Distributed-Regional-Monitoring/releases/download/V1.0.0/distributed-regional-check-agent_1.0.0_amd64.deb
                        </code>
                      </div>
                      
                      <div className="border-l-4 border-blue-500 pl-4">
                        <p className="font-medium">Step 2: Install Package</p>
                        <code className="text-xs bg-muted p-2 rounded block mt-1">
                          sudo dpkg -i distributed-regional-check-agent_1.0.0_amd64.deb<br/>
                          sudo apt-get install -f
                        </code>
                      </div>
                      
                      <div className="border-l-4 border-blue-500 pl-4">
                        <p className="font-medium">Step 3: Configure Agent</p>
                        <code className="text-xs bg-muted p-2 rounded block mt-1">
                          sudo nano /etc/regional-check-agent/regional-check-agent.env
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">Add the configuration values shown in the Agent Details tab</p>
                      </div>
                      
                      <div className="border-l-4 border-blue-500 pl-4">
                        <p className="font-medium">Step 4: Start Service</p>
                        <code className="text-xs bg-muted p-2 rounded block mt-1">
                          sudo systemctl enable regional-check-agent<br/>
                          sudo systemctl start regional-check-agent
                        </code>
                      </div>
                      
                      <div className="border-l-4 border-green-500 pl-4">
                        <p className="font-medium">Step 5: Verify Installation</p>
                        <code className="text-xs bg-muted p-2 rounded block mt-1">
                          sudo systemctl status regional-check-agent<br/>
                          curl http://localhost:8091/health
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetDialog}>
                Add Another Agent
              </Button>
              <Button onClick={handleComplete}>
                Complete Setup
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};