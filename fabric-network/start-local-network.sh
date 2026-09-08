#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SAMPLES_DIR="$ROOT_DIR/fabric-samples"
NETWORK_DIR="$SAMPLES_DIR/test-network"
CHAINCODE_DIR="$ROOT_DIR/chaincode/report-proof"

if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
  echo "Docker Desktop is not running. Open Docker Desktop, wait until it is ready, then rerun this command."
  exit 1
fi

cd "$NETWORK_DIR"
if ! docker ps --format '{{.Names}}' | grep -qx 'peer0.org1.example.com'; then
  ./network.sh up createChannel -ca
fi
./network.sh deployCC -ccn reportproof -ccp "$CHAINCODE_DIR" -ccl javascript

echo "Fabric network is ready: channel=mychannel, chaincode=reportproof"
