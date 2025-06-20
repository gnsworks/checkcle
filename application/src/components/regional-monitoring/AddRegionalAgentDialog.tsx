
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Terminal, CheckCircle } from "lucide-react";
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Installation command copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Add Regional Monitoring Agent</DialogTitle>
          <DialogDescription>
            Configure a new regional monitoring agent to extend your monitoring coverage.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <form onSubmit={handleCreateAgent} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="regionName">Region Name</Label>
                <Input
                  id="regionName"
                  placeholder="e.g., US East, Europe West, Asia Pacific"
                  value={regionName}
                  onChange={(e) => setRegionName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="agentIp">Agent Server IP Address</Label>
                <Input
                  id="agentIp"
                  placeholder="e.g., 192.168.1.100 or your-server.com"
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
                {isSubmitting ? "Creating..." : "Generate Installation"}
              </Button>
            </div>
          </form>
        )}

        {step === 2 && installCommand && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <h3 className="text-lg font-semibold">Agent Configuration Created!</h3>
              <p className="text-muted-foreground">
                Use the installation script below to set up your regional monitoring agent.
              </p>
            </div>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Agent Details</TabsTrigger>
                <TabsTrigger value="install">Installation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Information</CardTitle>
                    <CardDescription>
                      Configuration details for your regional monitoring agent
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
                            onClick={() => copyToClipboard(installCommand.agent_id)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Region</Label>
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
                          onClick={() => copyToClipboard(installCommand.token)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="install" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="h-5 w-5" />
                      One-Click Installation
                    </CardTitle>
                    <CardDescription>
                      Run this command on your target server to automatically install and configure the agent
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Installation Command</Label>
                      <div className="relative">
                        <Textarea
                          readOnly
                          value={`curl -fsSL | sudo bash -s -- <<'EOF'\n${installCommand.bash_script}\nEOF`}
                          className="font-mono text-sm min-h-[100px]"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(`curl -fsSL | sudo bash -s -- <<'EOF'\n${installCommand.bash_script}\nEOF`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={downloadScript} variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download Script
                      </Button>
                      <Button 
                        onClick={() => copyToClipboard(installCommand.bash_script)} 
                        variant="outline" 
                        className="flex-1"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Script
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p className="font-medium">Installation Steps:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Copy the installation command above</li>
                        <li>SSH into your target server</li>
                        <li>Run the command as root (with sudo)</li>
                        <li>The agent will be automatically installed and started</li>
                        <li>Check the agent status in the Regional Monitoring dashboard</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetDialog}>
                Add Another
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