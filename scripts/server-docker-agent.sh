
#!/bin/bash

# CheckCle Server Monitoring Agent - Docker One-Click Installation Script
# This script provides fully automated Docker installation using environment variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is not installed"
        log_info "Please install Docker first:"
        log_info "  Ubuntu/Debian: sudo apt-get update && sudo apt-get install docker.io"
        log_info "  CentOS/RHEL: sudo yum install docker"
        log_info "  Or visit: https://docs.docker.com/engine/install/"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker daemon is not running"
        log_info "Start Docker with: sudo systemctl start docker"
        exit 1
    fi
    
    log_success "Docker is installed and running"
}

# Validate required environment variables
validate_environment() {
    local missing_vars=()
    
    # Check required variables
    [[ -z "$SERVER_TOKEN" ]] && missing_vars+=("SERVER_TOKEN")
    [[ -z "$POCKETBASE_URL" ]] && missing_vars+=("POCKETBASE_URL")
    [[ -z "$SERVER_NAME" ]] && missing_vars+=("SERVER_NAME")
    [[ -z "$AGENT_ID" ]] && missing_vars+=("AGENT_ID")
    
    if [[ ${#missing_vars[@]} -ne 0 ]]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        log_info ""
        log_info "Usage examples:"
        log_info "  SERVER_TOKEN=your-token POCKETBASE_URL=http://host:8090 SERVER_NAME=server AGENT_ID=agent sudo -E bash $0"
        log_info "  sudo SERVER_TOKEN=your-token POCKETBASE_URL=http://host:8090 SERVER_NAME=server AGENT_ID=agent bash $0"
        log_info ""
        log_info "Required variables:"
        log_info "  SERVER_TOKEN          Server authentication token"
        log_info "  POCKETBASE_URL        PocketBase URL (e.g., http://194.233.80.126:8090)"
        log_info "  SERVER_NAME           Server name (e.g., DB-Server01)"
        log_info "  AGENT_ID              Agent identifier (e.g., agent_hogr3np88u7dq5xf9balzl)"
        log_info ""
        log_info "Optional variables:"
        log_info "  HEALTH_CHECK_PORT     Health check port (default: 8081)"
        log_info "  CONTAINER_NAME        Container name (default: monitoring-agent)"
        log_info "  DOCKER_IMAGE          Docker image (default: operacle/checkcle-server-agent:latest)"
        exit 1
    fi
    
    log_success "Environment validation passed"
    log_info "SERVER_TOKEN: ${SERVER_TOKEN:0:8}..."
    log_info "POCKETBASE_URL: $POCKETBASE_URL"
    log_info "SERVER_NAME: $SERVER_NAME"
    log_info "AGENT_ID: $AGENT_ID"
}

# Set default values for optional variables
set_defaults() {
    HEALTH_CHECK_PORT="${HEALTH_CHECK_PORT:-8081}"
    CONTAINER_NAME="${CONTAINER_NAME:-monitoring-agent}"
    DOCKER_IMAGE="${DOCKER_IMAGE:-operacle/checkcle-server-agent:latest}"
    POCKETBASE_ENABLED="${POCKETBASE_ENABLED:-true}"
    
    log_info "Configuration:"
    log_info "  Container name: $CONTAINER_NAME"
    log_info "  Docker image: $DOCKER_IMAGE"
    log_info "  Health check port: $HEALTH_CHECK_PORT"
    log_info "  PocketBase enabled: $POCKETBASE_ENABLED"
}

# Stop and remove existing container if it exists
cleanup_existing_container() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Stopping and removing existing container: $CONTAINER_NAME"
        docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
        docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
        log_success "Existing container removed"
    fi
}

# Create Docker volumes
create_volumes() {
    log_info "Creating Docker volumes..."
    
    # Create volumes if they don't exist
    if ! docker volume ls --format '{{.Name}}' | grep -q "^monitoring_data$"; then
        docker volume create monitoring_data
        log_success "Created monitoring_data volume"
    else
        log_info "monitoring_data volume already exists"
    fi
    
    if ! docker volume ls --format '{{.Name}}' | grep -q "^monitoring_logs$"; then
        docker volume create monitoring_logs
        log_success "Created monitoring_logs volume"
    else
        log_info "monitoring_logs volume already exists"
    fi
}

# Get Docker group ID
get_docker_group_id() {
    local docker_gid
    docker_gid=$(getent group docker | cut -d: -f3)
    if [[ -z "$docker_gid" ]]; then
        log_warning "Docker group not found, using default GID 999"
        docker_gid=999
    fi
    echo "$docker_gid"
}

# Run the Docker container
run_docker_container() {
    log_info "Starting monitoring agent Docker container..."
    
    local docker_gid
    docker_gid=$(get_docker_group_id)
    
    log_info "Docker group ID: $docker_gid"
    
    # Run the Docker container with all the required parameters
    docker run -d \
        --name "$CONTAINER_NAME" \
        --restart unless-stopped \
        -p "$HEALTH_CHECK_PORT:8081" \
        --group-add "$docker_gid" \
        -e AGENT_ID="$AGENT_ID" \
        -e SERVER_NAME="$SERVER_NAME" \
        -e SERVER_TOKEN="$SERVER_TOKEN" \
        -e POCKETBASE_URL="$POCKETBASE_URL" \
        -e POCKETBASE_ENABLED="$POCKETBASE_ENABLED" \
        -v /proc:/host/proc:ro \
        -v /etc:/host/etc:ro \
        -v /sys:/host/sys:ro \
        -v /:/host/root:ro \
        -v /var/run:/host/var/run:ro \
        -v /dev:/host/dev:ro \
        -v /var/run/docker.sock:/var/run/docker.sock:ro \
        -v monitoring_data:/var/lib/monitoring-agent \
        -v monitoring_logs:/var/log/monitoring-agent \
        "$DOCKER_IMAGE"
    
    log_success "Docker container started successfully"
}

# Wait for container to be ready
wait_for_container() {
    log_info "Waiting for container to be ready..."
    
    local max_attempts=30
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            log_success "Container is running"
            return 0
        fi
        
        sleep 1
        ((attempt++))
    done
    
    log_error "Container failed to start within expected time"
    return 1
}

# Test the installation
test_installation() {
    log_info "Testing installation..."
    
    # Check container status
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_error "Container is not running"
        log_info "Check container logs: docker logs $CONTAINER_NAME"
        return 1
    fi
    
    # Wait a moment for the service to start
    sleep 3
    
    # Test health endpoint
    log_info "Testing health endpoint at http://localhost:$HEALTH_CHECK_PORT/health"
    
    if curl -s -f "http://localhost:$HEALTH_CHECK_PORT/health" >/dev/null 2>&1; then
        log_success "Health endpoint is responding"
    else
        log_warning "Health endpoint not responding yet (service may still be starting)"
    fi
    
    # Show recent container logs
    log_info "Recent container logs:"
    docker logs --tail 10 "$CONTAINER_NAME"
}

# Show post-installation information
show_post_install_info() {
    echo
    echo "============================================="
    echo "  Docker Installation Complete!"
    echo "============================================="
    echo
    log_success "CheckCle Monitoring Agent Docker container installed and running successfully"
    echo
    echo "Container Information:"
    echo "  Container name: $CONTAINER_NAME"
    echo "  Docker image: $DOCKER_IMAGE"
    echo "  Health check port: $HEALTH_CHECK_PORT"
    echo "  Agent ID: $AGENT_ID"
    echo "  Server name: $SERVER_NAME"
    echo
    echo "Useful commands:"
    echo "  Container status: docker ps -f name=$CONTAINER_NAME"
    echo "  Container logs: docker logs -f $CONTAINER_NAME"
    echo "  Stop container: docker stop $CONTAINER_NAME"
    echo "  Start container: docker start $CONTAINER_NAME"
    echo "  Remove container: docker rm -f $CONTAINER_NAME"
    echo "  Health check: curl http://localhost:$HEALTH_CHECK_PORT/health"
    echo
    echo "The monitoring agent is now running in a Docker container and will appear in your dashboard."
    echo
}

# Main installation function
main() {
    echo "============================================="
    echo "  CheckCle Server Monitoring Agent"
    echo "  Docker One-Click Installation"
    echo "============================================="
    echo
    
    check_root
    check_docker
    validate_environment
    set_defaults
    
    log_info "Starting Docker container installation..."
    
    # Setup and run container
    cleanup_existing_container
    create_volumes
    run_docker_container
    
    if wait_for_container; then
        test_installation
        show_post_install_info
    else
        log_error "Container installation failed"
        log_info "Check container logs: docker logs $CONTAINER_NAME"
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "CheckCle Server Monitoring Agent - Docker One-Click Installer"
        echo
        echo "Usage: SERVER_TOKEN=token POCKETBASE_URL=url SERVER_NAME=name AGENT_ID=id sudo bash $0"
        echo
        echo "System Requirements:"
        echo "  - Docker installed and running"
        echo "  - Root privileges (sudo)"
        echo "  - Internet access to pull Docker image"
        echo
        echo "Required Environment Variables:"
        echo "  SERVER_TOKEN          Server authentication token"
        echo "  POCKETBASE_URL        PocketBase URL (e.g., http://194.233.80.126:8090)"
        echo "  SERVER_NAME           Server name (e.g., DB-Server01)"
        echo "  AGENT_ID              Agent identifier"
        echo
        echo "Optional Environment Variables:"
        echo "  HEALTH_CHECK_PORT     Health check port (default: 8081)"
        echo "  CONTAINER_NAME        Container name (default: monitoring-agent)"
        echo "  DOCKER_IMAGE          Docker image (default: operacle/checkcle-server-agent:latest)"
        echo "  POCKETBASE_ENABLED    Enable PocketBase (default: true)"
        echo
        echo "Examples:"
        echo "  SERVER_TOKEN=abc123 POCKETBASE_URL=http://host:8090 SERVER_NAME=server AGENT_ID=agent sudo -E bash $0"
        echo "  sudo SERVER_TOKEN=abc123 POCKETBASE_URL=http://host:8090 SERVER_NAME=server AGENT_ID=agent bash $0"
        echo
        echo "Options:"
        echo "  --help, -h            Show this help message"
        echo "  --uninstall           Remove the monitoring agent container"
        echo
        exit 0
        ;;
    --uninstall)
        check_root
        check_docker
        set_defaults
        
        log_info "Uninstalling monitoring agent Docker container..."
        
        # Stop and remove container
        if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
            docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
            log_success "Container removed"
        else
            log_info "Container not found"
        fi
        
        # Optionally remove volumes (ask user)
        echo -n "Remove data volumes? (y/N): "
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            docker volume rm monitoring_data monitoring_logs >/dev/null 2>&1 || true
            log_success "Data volumes removed"
        else
            log_info "Data volumes preserved"
        fi
        
        log_success "Monitoring agent Docker container uninstalled"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac