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
# This script will automatically detect architecture, download, install, configure and start the regional monitoring agent

echo "🚀 CheckCle Regional Monitoring Agent - Automatic Installation"
echo "=============================================================="
echo ""

# Configuration variables
REGION_NAME="${regionName}"
AGENT_ID="${agentId}"
AGENT_IP_ADDRESS="${agentIp}"
AGENT_TOKEN="${token}"
POCKETBASE_URL="${apiEndpoint}"

# Base package information
BASE_PACKAGE_URL="https://github.com/operacle/Distributed-Regional-Monitoring/releases/download/V1.0.0"
PACKAGE_VERSION="1.0.0"
SERVICE_NAME="regional-check-agent"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)" 
   echo "   Usage: sudo bash install-regional-agent.sh"
   exit 1
fi

# Detect operating system
echo "🔍 Detecting system information..."
OS_TYPE=$(uname -s | tr '[:upper:]' '[:lower:]')
echo "   Operating System: $OS_TYPE"

# Check if it's a supported OS
if [[ "$OS_TYPE" != "linux" ]]; then
    echo "❌ Unsupported operating system: $OS_TYPE"
    echo "   This installer only supports Linux systems"
    exit 1
fi

# Detect architecture
ARCH=$(uname -m)
echo "   Hardware Architecture: $ARCH"

# Map architecture to package architecture
case $ARCH in
    x86_64|amd64)
        PKG_ARCH="amd64"
        ;;
    aarch64|arm64)
        PKG_ARCH="arm64"
        ;;
    armv7l|armv6l)
        PKG_ARCH="arm64"
        echo "⚠️  ARM 32-bit detected, using ARM64 package (may require compatibility layer)"
        ;;
    *)
        echo "❌ Unsupported architecture: $ARCH"
        echo "   Supported architectures: x86_64 (amd64), aarch64 (arm64)"
        echo "   Please contact support for your architecture: $ARCH"
        exit 1
        ;;
esac

echo "   Package Architecture: $PKG_ARCH"

# Construct package URLs and names
PACKAGE_URL="$BASE_PACKAGE_URL/distributed-regional-check-agent_\${PACKAGE_VERSION}_\${PKG_ARCH}.deb"
PACKAGE_NAME="distributed-regional-check-agent_\${PACKAGE_VERSION}_\${PKG_ARCH}.deb"

echo ""
echo "📋 Installation Configuration:"
echo "   Region Name: $REGION_NAME"
echo "   Agent ID: $AGENT_ID"
echo "   Agent IP: $AGENT_IP_ADDRESS"
echo "   PocketBase URL: $POCKETBASE_URL"
echo "   Package URL: $PACKAGE_URL"
echo ""

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Created temporary directory: $TEMP_DIR"

# Download the .deb package
echo "📥 Downloading Regional Monitoring Agent package for $PKG_ARCH..."
cd "$TEMP_DIR"

# Test if package exists first
echo "🔍 Checking package availability..."
if command -v curl >/dev/null 2>&1; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -I "$PACKAGE_URL")
    if [ "$HTTP_STATUS" != "200" ]; then
        echo "❌ Package not found at $PACKAGE_URL (HTTP $HTTP_STATUS)"
        echo "   Available packages should be:"
        echo "   - distributed-regional-check-agent_\${PACKAGE_VERSION}_amd64.deb"
        echo "   - distributed-regional-check-agent_\${PACKAGE_VERSION}_arm64.deb"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    echo "✅ Package found, proceeding with download..."
fi

# Try wget first, then curl as fallback
DOWNLOAD_SUCCESS=false

if command -v wget >/dev/null 2>&1; then
    if wget -q --show-progress --timeout=30 --tries=3 "$PACKAGE_URL" -O "$PACKAGE_NAME"; then
        DOWNLOAD_SUCCESS=true
        echo "✅ Package downloaded successfully using wget"
    fi
elif command -v curl >/dev/null 2>&1; then
    if curl -L --connect-timeout 30 --max-time 300 --retry 3 --retry-delay 2 -o "$PACKAGE_NAME" "$PACKAGE_URL"; then
        DOWNLOAD_SUCCESS=true
        echo "✅ Package downloaded successfully using curl"
    fi
fi

if [ "$DOWNLOAD_SUCCESS" = false ]; then
    echo "❌ Failed to download package from $PACKAGE_URL"
    echo "   Please check:"
    echo "   - Internet connection"
    echo "   - Package availability for $PKG_ARCH architecture"
    echo "   - GitHub repository access: https://github.com/operacle/Distributed-Regional-Monitoring/releases"
    echo "   - Firewall/proxy settings"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Verify package integrity
echo ""
echo "🔍 Verifying package..."
if dpkg-deb --info "$PACKAGE_NAME" > /dev/null 2>&1; then
    echo "✅ Package verification successful"
else
    echo "❌ Package verification failed - corrupted download"
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
        echo "   This might be due to:"
        echo "   - Missing system dependencies"
        echo "   - Architecture compatibility issues"
        echo "   - Insufficient disk space"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
fi

# Configure the agent
echo ""
echo "⚙️  Configuring Regional Monitoring Agent..."

# Ensure configuration directory exists
mkdir -p /etc/regional-check-agent

# Create the environment configuration file
cat > /etc/regional-check-agent/regional-check-agent.env << EOF
# Distributed Regional Check Agent Configuration
# Auto-generated on $(date)

# Server Configuration
PORT=8091

# Operation defaults
DEFAULT_COUNT=4
DEFAULT_TIMEOUT=10s
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
if id "regional-check-agent" &>/dev/null; then
    chown root:regional-check-agent /etc/regional-check-agent/regional-check-agent.env
    chmod 640 /etc/regional-check-agent/regional-check-agent.env
else
    echo "⚠️  regional-check-agent user not found, using root permissions"
    chown root:root /etc/regional-check-agent/regional-check-agent.env
    chmod 600 /etc/regional-check-agent/regional-check-agent.env
fi

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
    echo "   View logs with: sudo journalctl -u $SERVICE_NAME -f"
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
echo "   Architecture: $PKG_ARCH"
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