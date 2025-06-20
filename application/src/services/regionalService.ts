
import { pb } from '@/lib/pocketbase';
import { RegionalService, CreateRegionalServiceParams, InstallCommand } from '@/types/regional.types';

// Generate a random token
const generateToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Generate a random agent ID
const generateAgentId = (): string => {
  return 'agent_' + Math.random().toString(36).substring(2, 10);
};

export const regionalService = {
  async getRegionalServices(): Promise<RegionalService[]> {
    try {
      const response = await pb.collection('regional_service').getFullList({
        sort: '-created',
      });
      
      return response.map(record => ({
        id: record.id,
        region_name: record.region_name,
        status: record.status,
        agent_id: record.agent_id,
        agent_ip_address: record.agent_ip_address,
        token: record.token,
        connection: record.connection,
        created: record.created,
        updated: record.updated,
      }));
    } catch (error) {
      console.error('Error fetching regional services:', error);
      throw new Error('Failed to fetch regional services');
    }
  },

  async createRegionalService(params: CreateRegionalServiceParams): Promise<{ service: RegionalService; installCommand: InstallCommand }> {
    try {
      const token = generateToken();
      const agentId = generateAgentId();
      
      const data = {
        region_name: params.region_name,
        status: 'pending',
        agent_id: agentId,
        agent_ip_address: params.agent_ip_address,
        token: token,
        connection: 'offline',
      };

      const record = await pb.collection('regional_service').create(data);
      
      const service: RegionalService = {
        id: record.id,
        region_name: record.region_name,
        status: record.status,
        agent_id: record.agent_id,
        agent_ip_address: record.agent_ip_address,
        token: record.token,
        connection: record.connection,
        created: record.created,
        updated: record.updated,
      };

      const installCommand: InstallCommand = {
        token: token,
        agent_id: agentId,
        api_endpoint: pb.baseUrl,
        bash_script: this.generateBashScript(token, agentId, pb.baseUrl, params.agent_ip_address)
      };

      return { service, installCommand };
    } catch (error) {
      console.error('Error creating regional service:', error);
      throw new Error('Failed to create regional service');
    }
  },

  async deleteRegionalService(id: string): Promise<void> {
    try {
      await pb.collection('regional_service').delete(id);
    } catch (error) {
      console.error('Error deleting regional service:', error);
      throw new Error('Failed to delete regional service');
    }
  },

  generateBashScript(token: string, agentId: string, apiEndpoint: string, agentIp: string): string {
    return `#!/bin/bash

# CheckCle - Regional Monitoring Agent Installation Script
# Generated on: $(date)

echo "🚀 Installing CheckCle Regional Monitoring Agent..."
echo "======================================================"

# Configuration
AGENT_ID="${agentId}"
TOKEN="${token}"
API_ENDPOINT="${apiEndpoint}"
AGENT_IP="${agentIp}"
INSTALL_DIR="/opt/checkcle-regional-agent"
SERVICE_NAME="checkcle-regional-agent"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)" 
   exit 1
fi

# Create installation directory
echo "📁 Creating installation directory..."
mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

# Download the agent binary
echo "📥 Downloading Regional Monitoring Agent..."
wget -O regional-check-agent https://github.com/operacle/distributed-regional-monitoring/releases/latest/download/distributed-regional-check-agent-linux-amd64

# Make it executable
chmod +x regional-check-agent

# Create configuration file
echo "⚙️ Creating configuration file..."
cat > config.yaml << EOF
# CheckCle Regional Monitoring Agent Configuration
agent:
  id: "$AGENT_ID"
  region: "$(curl -s ipinfo.io/region 2>/dev/null || echo 'Unknown')"
  ip_address: "$AGENT_IP"

api:
  endpoint: "$API_ENDPOINT"
  token: "$TOKEN"
  collection: "regional_service"

monitoring:
  interval: 30s
  timeout: 10s
  max_retries: 3

logging:
  level: "info"
  file: "/var/log/checkcle-regional-agent.log"
EOF

# Create systemd service
echo "🔧 Creating systemd service..."
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=CheckCle Regional Monitoring Agent
After=network.target
Wants=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/regional-check-agent --config=$INSTALL_DIR/config.yaml
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
echo "🎯 Enabling and starting the service..."
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

# Check status
echo "✅ Installation completed!"
echo ""
echo "📊 Service Status:"
systemctl status $SERVICE_NAME --no-pager -l

echo ""
echo "🔍 Quick Status Check:"
echo "   Agent ID: $AGENT_ID"
echo "   API Endpoint: $API_ENDPOINT"
echo "   Log file: /var/log/checkcle-regional-agent.log"
echo ""
echo "📝 Useful commands:"
echo "   - Check status: systemctl status $SERVICE_NAME"
echo "   - View logs: journalctl -u $SERVICE_NAME -f"
echo "   - Restart: systemctl restart $SERVICE_NAME"
echo "   - Stop: systemctl stop $SERVICE_NAME"
echo ""
echo "🎉 Regional Monitoring Agent is now running!"
`;
  }
};