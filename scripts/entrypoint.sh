#!/bin/sh

echo "Running on architecture: $(uname -m)"

# Copy PocketBase data if empty
if [ ! -f /mnt/pb_data/data.db ] && [ -d /app/pb_data ] && [ "$(ls -A /app/pb_data)" ]; then
  cp -a /app/pb_data/. /mnt/pb_data/
fi

# Start PocketBase in the background
echo "Starting PocketBase..."
/app/pocketbase serve --http=0.0.0.0:8090 --dir /mnt/pb_data 2>&1 | grep -vE 'REST API|Dashboard' &

# Wait for PocketBase to become available
echo "Waiting for PocketBase to become available..."
until curl -s http://localhost:8090/api/health >/dev/null; do
  echo "Waiting on http://localhost:8090..."
  sleep 1
done

echo "PocketBase is up!"

# Start Go service
echo "Starting Go service..."
/app/service-operation &

# Keep container alive
wait
