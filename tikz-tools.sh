#!/bin/bash

# TikZ Advanced Plugin Tools
# A consolidated script for various operations

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
  echo -e "${BLUE}┌───────────────────────────────────────┐${NC}"
  echo -e "${BLUE}│       TikZ Advanced Plugin Tools      │${NC}"
  echo -e "${BLUE}└───────────────────────────────────────┘${NC}"
  echo ""
  echo -e "Usage: ${YELLOW}./tikz-tools.sh [command]${NC}"
  echo ""
  echo -e "${GREEN}Commands:${NC}"
  echo -e "  ${CYAN}build${NC}       - Build the plugin"
  echo -e "  ${CYAN}start${NC}       - Start the TikZ server"
  echo -e "  ${CYAN}debug${NC}       - Start the TikZ server in debug mode"
  echo -e "  ${CYAN}test-api${NC}    - Test the TikZ server API"
  echo -e "  ${CYAN}setup${NC}       - Set up the server and install dependencies"
  echo -e "  ${CYAN}clean${NC}       - Clean build artifacts"
  echo -e "  ${CYAN}help${NC}        - Show this help message"
  echo ""
}

# Function to build the plugin
build_plugin() {
  echo -e "${BLUE}Building TikZ Advanced plugin...${NC}"

  # Run the build script
  if command -v npm &> /dev/null; then
    echo -e "${YELLOW}Running npm build...${NC}"
    npm run build

    if [ $? -ne 0 ]; then
      echo -e "${RED}Build failed! See error messages above.${NC}"
      exit 1
    fi
  else
    echo -e "${RED}Error: npm command not found. Please install Node.js and npm.${NC}"
    exit 1
  fi

  echo -e "${GREEN}Build completed successfully!${NC}"
  echo -e "${BLUE}Files are available in the dist directory:${NC}"
  echo -e "  - ${CYAN}dist/main.js${NC}"
  echo -e "  - ${CYAN}dist/manifest.json${NC}"
  echo -e "  - ${CYAN}dist/styles.css${NC}"
  echo ""
  echo -e "${YELLOW}Copy these files to your Obsidian vault's plugins directory:${NC}"
  echo -e "  ${CYAN}<vault>/.obsidian/plugins/obsidian-tikz-advanced/${NC}"
}

# Function to start the server
start_server() {
  echo -e "${BLUE}Starting TikZ server...${NC}"
  cd src/server
  if command -v npm &> /dev/null; then
    echo -e "${YELLOW}Server will be available at ${CYAN}http://localhost:3000${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    npm start
  else
    echo -e "${RED}Error: npm command not found. Please install Node.js and npm.${NC}"
    exit 1
  fi
}

# Function to start the server in debug mode
debug_server() {
  echo -e "${BLUE}Starting TikZ server in debug mode...${NC}"
  cd src/server
  if command -v npm &> /dev/null; then
    echo -e "${YELLOW}Server will be available at ${CYAN}http://localhost:3000${NC}"
    echo -e "${YELLOW}Debug logs will be displayed${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    LOG_LEVEL=debug npm start
  else
    echo -e "${RED}Error: npm command not found. Please install Node.js and npm.${NC}"
    exit 1
  fi
}

# Function to test the API
test_api() {
  echo -e "${BLUE}Testing TikZ server API...${NC}"

  # Check if curl is available
  if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl command not found. Please install curl.${NC}"
    exit 1
  fi

  # Check if server is running
  echo -e "${YELLOW}Checking if server is running...${NC}"
  if ! curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${RED}Error: Server is not running. Start the server first with:${NC}"
    echo -e "  ${CYAN}./tikz-tools.sh start${NC}"
    exit 1
  fi

  echo -e "${YELLOW}Sending test request to server...${NC}"
  curl -X POST -H "Content-Type: application/json" -d '{"tikzCode":"\\begin{tikzpicture}\\draw (0,0) circle (1cm);\\end{tikzpicture}","format":"svg","engine":"pdflatex","preamble":"\\usepackage{tikz}"}' http://localhost:3000/render
  echo -e "\n\n${GREEN}Test completed!${NC}"
}

# Function to set up the server
setup_server() {
  echo -e "${BLUE}Setting up TikZ Advanced plugin...${NC}"

  # Check if npm is available
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm command not found. Please install Node.js and npm.${NC}"
    exit 1
  fi

  # Install server dependencies
  echo -e "${YELLOW}Installing server dependencies...${NC}"
  cd src/server
  npm install

  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies! See error messages above.${NC}"
    exit 1
  fi

  # Create public directory if it doesn't exist
  echo -e "${YELLOW}Creating public directory...${NC}"
  mkdir -p public

  # Start the server
  echo -e "${GREEN}Setup completed successfully!${NC}"
  echo -e "${YELLOW}Starting the server...${NC}"
  echo -e "${YELLOW}Server will be available at ${CYAN}http://localhost:3000${NC}"
  echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
  npm start
}

# Function to clean build artifacts
clean_artifacts() {
  echo -e "${BLUE}Cleaning build artifacts...${NC}"

  # Remove build artifacts
  echo -e "${YELLOW}Removing dist directory...${NC}"
  rm -rf dist

  # Remove server build artifacts
  echo -e "${YELLOW}Removing server build artifacts...${NC}"
  rm -rf src/server/dist

  # Remove temporary files
  echo -e "${YELLOW}Removing temporary files...${NC}"
  rm -f *.js.map *.js.css *.js.manifest

  echo -e "${GREEN}Clean completed successfully!${NC}"
}

# Main script logic
case "$1" in
  build)
    build_plugin
    ;;
  start)
    start_server
    ;;
  debug)
    debug_server
    ;;
  test-api)
    test_api
    ;;
  setup)
    setup_server
    ;;
  clean)
    clean_artifacts
    ;;
  help|*)
    show_help
    ;;
esac
