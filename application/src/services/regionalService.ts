
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
        bash_script: this.generateAutomaticInstallScript(token, agentId, pb.baseUrl, params.agent_ip_address, params.region_name)
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

  generateAutomaticInstallScript(token: string, agentId: string, apiEndpoint: string, agentIp: string, regionName: string): string {
    return `#!/bin/bash

# CheckCle Regional Monitoring Agent - Automatic Installation Script
# Generated on: $(date)
# This script will automatically download, install, configure and start the regional monitoring agent

echo "🚀 CheckCle Regional Monitoring Agent - Automatic Installation"
echo "=============================================================="
echo ""

# Configuration variables
REGION_NAME="${regionName}"
AGENT_ID="${agentId}"
AGENT_IP_ADDRESS="${agentIp}"
AGENT_TOKEN="${token}"
POCKETBASE_URL="${apiEndpoint}"

# Package information
PACKAGE_URL="https://github.com/operacle/distributed-regional-monitoring/releases/latest/download/distributed-regional-check-agent_1.0.0_amd64.deb"
PACKAGE_NAME="distributed-regional-check-agent_1.0.0_amd64.deb"
SERVICE_NAME="regional-check-agent"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)" 
   echo "   Usage: sudo bash install-regional-agent.sh"
   exit 1
fi

echo "📋 Installation Configuration:"
echo "   Region Name: $REGION_NAME"
echo "   Agent ID: $AGENT_ID"
echo "   Agent IP: $AGENT_IP_ADDRESS"
echo "   PocketBase URL: $POCKETBASE_URL"
echo ""

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Created temporary directory: $TEMP_DIR"

# Download the .deb package
echo "📥 Downloading Regional Monitoring Agent package..."
cd "$TEMP_DIR"
if wget -q --show-progress "$PACKAGE_URL" -O "$PACKAGE_NAME"; then
    echo "✅ Package downloaded successfully"
else
    echo "❌ Failed to download package from $PACKAGE_URL"
    echo "   Please check your internet connection and try again"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Install the package
echo ""
echo "📦 Installing Regional Monitoring Agent package..."
if dpkg -i "$PACKAGE_NAME"; then
    echo "✅ Package installed successfully"
else
    echo "⚠️  Package installation had issues, attempting to fix dependencies..."
    if apt-get install -f -y; then
        echo "✅ Dependencies fixed and package installed successfully"
    else
        echo "❌ Failed to install package and fix dependencies"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
fi

# Configure the agent
echo ""
echo "⚙️  Configuring Regional Monitoring Agent..."

# Create the environment configuration file
cat > /etc/regional-check-agent/regional-check-agent.env << EOF
# Distributed Regional Check Agent Configuration
# Auto-generated on $(date)

# Server Configuration
PORT=8091

# Operation defaults
DEFAULT_COUNT=4
DEFAULT_TIMEOUT=3s
MAX_COUNT=20
MAX_TIMEOUT=30s

# Logging
ENABLE_LOGGING=true

# PocketBase integration
POCKETBASE_ENABLED=true
POCKETBASE_URL=$POCKETBASE_URL

# Regional Agent Configuration - Auto-configured
REGION_NAME=$REGION_NAME
AGENT_ID=$AGENT_ID
AGENT_IP_ADDRESS=$AGENT_IP_ADDRESS
AGENT_TOKEN=$AGENT_TOKEN

# Monitoring configuration
CHECK_INTERVAL=30s
MAX_RETRIES=3
REQUEST_TIMEOUT=10s
EOF

echo "✅ Configuration file created at /etc/regional-check-agent/regional-check-agent.env"

# Set proper permissions
chown root:regional-check-agent /etc/regional-check-agent/regional-check-agent.env
chmod 640 /etc/regional-check-agent/regional-check-agent.env

# Enable and start the service
echo ""
echo "🔧 Starting Regional Monitoring Agent service..."

# Reload systemd daemon
systemctl daemon-reload

# Enable the service for auto-start
if systemctl enable $SERVICE_NAME; then
    echo "✅ Service enabled for auto-start"
else
    echo "❌ Failed to enable service"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Start the service
if systemctl start $SERVICE_NAME; then
    echo "✅ Service started successfully"
else
    echo "❌ Failed to start service"
    echo "   Check the configuration and try: sudo systemctl start $SERVICE_NAME"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Wait a moment for service to initialize
sleep 3

# Check service status
echo ""
echo "📊 Service Status:"
systemctl status $SERVICE_NAME --no-pager -l

# Test health endpoint
echo ""
echo "🩺 Testing agent health endpoint..."
if curl -s -f http://localhost:8091/health > /dev/null; then
    echo "✅ Agent health endpoint is responding"
else
    echo "⚠️  Agent health endpoint not responding yet (this is normal, may take a few moments)"
fi

# Cleanup
rm -rf "$TEMP_DIR"
echo ""
echo "🎉 Regional Monitoring Agent Installation Complete!"
echo ""
echo "📋 Installation Summary:"
echo "   Agent ID: $AGENT_ID"
echo "   Region: $REGION_NAME"
echo "   Status: $(systemctl is-active $SERVICE_NAME)"
echo "   Health URL: http://localhost:8091/health"
echo "   Service endpoint: http://localhost:8091/operation"
echo ""
echo "📝 Useful commands:"
echo "   Check status: sudo systemctl status $SERVICE_NAME"
echo "   View logs: sudo journalctl -u $SERVICE_NAME -f"
echo "   Restart: sudo systemctl restart $SERVICE_NAME"
echo "   Stop: sudo systemctl stop $SERVICE_NAME"
echo ""
echo "✨ The agent is now monitoring and reporting to your CheckCle dashboard!"
`;
  }
};