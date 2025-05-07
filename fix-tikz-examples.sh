#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default server URL
SERVER_URL="http://localhost:3000"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --server-url=*)
      SERVER_URL="${1#*=}"
      shift
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --server-url=URL  Specify the TikZ server URL (default: http://localhost:3000)"
      echo "  --help            Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}TikZ Examples Fixer${NC}"
echo -e "${BLUE}=================${NC}"
echo ""
echo -e "Server URL: ${YELLOW}${SERVER_URL}${NC}"
echo ""

# Check if server is running
echo -e "Checking if server is running..."
if curl -s "${SERVER_URL}/health" > /dev/null; then
  echo -e "${GREEN}Server is running${NC}"
else
  echo -e "${RED}Server is not running at ${SERVER_URL}${NC}"
  echo -e "Please start the server and try again"
  exit 1
fi

# Check if TypeScript is installed
if ! command -v tsc &> /dev/null; then
  echo -e "${RED}TypeScript compiler (tsc) not found${NC}"
  echo -e "Installing TypeScript..."
  npm install -g typescript
fi

# Check if ts-node is installed
if ! command -v ts-node &> /dev/null; then
  echo -e "${RED}ts-node not found${NC}"
  echo -e "Installing ts-node..."
  npm install -g ts-node
fi

# Check if axios is installed
if ! npm list axios &> /dev/null; then
  echo -e "${RED}axios not found${NC}"
  echo -e "Installing axios..."
  npm install axios
fi

# Run the fixer
echo -e "\n${BLUE}Running TikZ example fixer...${NC}\n"
export SERVER_URL
ts-node src/test/tikz-example-fixer.ts

# Check the exit code
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}Examples fixed successfully!${NC}"
  echo -e "Check the fixed-examples directory for the fixed examples"
else
  echo -e "\n${RED}Error fixing examples${NC}"
fi

# Ask if user wants to run tests on the fixed examples
echo -e "\n${YELLOW}Do you want to run tests on the fixed examples? (y/n)${NC}"
read -r run_tests

if [[ $run_tests =~ ^[Yy]$ ]]; then
  echo -e "\n${BLUE}Running tests on fixed examples...${NC}\n"
  
  # Copy fixed examples to a temporary directory
  mkdir -p temp-examples
  cp fixed-examples/* temp-examples/
  
  # Run tests on the fixed examples
  EXAMPLES_DIR=temp-examples ts-node src/test/tikz-example-tester.ts
  
  # Clean up
  rm -rf temp-examples
fi
