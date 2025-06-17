#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { initialTools } from './initial_tools.js';
import electronExecutablePath from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const { values } = parseArgs({
  options: {
    timeout: {
      type: 'string',
      short: 't',
      default: '60'
    }
  },
  allowPositionals: true
});

const dialogTimeout = parseInt(values.timeout, 10) || 60;

// Global variables
let electronProcess = null;
let pendingRequests = new Map(); // Store pending ask_user requests

// Function to start Electron GUI with initial data
function startElectronGUIWithData(projectName, message, predefinedOptions = []) {
  // Close existing process if any
  if (electronProcess) {
    electronProcess.kill();
    electronProcess = null;
  }
  
  const mainPath = path.join(__dirname, 'electron-main.cjs');
  
  // Prepare dialog data as environment variables
  const env = {
    ...process.env,
    DIALOG_PROJECT_NAME: projectName,
    DIALOG_MESSAGE: message,
    DIALOG_PREDEFINED_OPTIONS: JSON.stringify(predefinedOptions),
    DIALOG_TIMEOUT: dialogTimeout.toString(),
    // Remove IDE environment variables
    VSCODE_PID: undefined,
    VSCODE_CWD: undefined,
    CURSOR_PID: undefined,
    CURSOR_CWD: undefined,
    // Add variables for independent startup
    ELECTRON_IS_DEV: '0',
    NODE_ENV: 'production',
    ELECTRON_RUN_AS_NODE: ''
  };
  
  // Spawn Electron directly using the imported path
  electronProcess = spawn(electronExecutablePath, [mainPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: false,
    env: env
  });
  
  electronProcess.stdout.on('data', (data) => {
    const message = data.toString().trim();
    
    // Handle multi-line messages by splitting and processing each line
    const lines = message.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine === 'DIALOG_CLOSED') {
        // console.error('Dialog window closed');
      } else if (trimmedLine.startsWith('TEXT_FROM_RENDERER:')) {
        const userResponse = trimmedLine.substring('TEXT_FROM_RENDERER:'.length).trim();
        handleUserResponse(userResponse);
      } else if (trimmedLine === 'DIALOG_TIMEOUT') {
        handleUserResponse('TIMEOUT');
      }
      // Ignore debug messages and other non-essential output
    }
  });
  
  electronProcess.stderr.on('data', (data) => {
    const message = data.toString().trim();
    // console.error('Electron stderr:', message);
  });
  
  electronProcess.on('close', (code) => {
    // console.error('Electron process closed with code:', code);
    electronProcess = null;
  });

  electronProcess.on('error', (err) => {
    console.error('Failed to start Electron GUI:', err.message);
  });
}

// Handle user response from GUI
function handleUserResponse(userResponse) {
  // Find the most recent pending request (FIFO)
  const requestId = Array.from(pendingRequests.keys())[0];
  if (requestId) {
    const { resolve } = pendingRequests.get(requestId);
    pendingRequests.delete(requestId);
    
    // Check if response is timeout
    if (userResponse === 'TIMEOUT') {
      // Resolve with timeout message
      resolve({
        content: [{
          text: "User did not reply: Timeout occurred.",
          type: "text"
        }]
      });
    } else if (!userResponse || userResponse.trim() === '') {
      // Resolve with empty input message
      resolve({
        content: [{
          text: "User replied with empty input.",
          type: "text"
        }]
      });
    } else {
      // Resolve the promise with MCP response format
      resolve({
        content: [{
          text: `User replied: ${userResponse}`,
          type: "text"
        }]
      });
    }
  }
}

// Function to show dialog with parameters
function showDialog(projectName, message, predefinedOptions = []) {
  return new Promise((resolve, reject) => {
    const requestId = Date.now().toString();
    pendingRequests.set(requestId, { resolve, reject });
    
    // Always start new Electron process with data
    startElectronGUIWithData(projectName, message, predefinedOptions);
  });
}

// Note: Dialog data is now passed via environment variables at startup

// Create MCP Server
const server = new Server(
  {
    name: "mcp-interactive",
    version: "0.0.1"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: initialTools
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "ask_user") {
    const { projectName, message, predefinedOptions } = args;
    
    try {
      const result = await showDialog(projectName, message, predefinedOptions);
      return result;
    } catch (error) {
      throw new Error(`Failed to show dialog: ${error.message}`);
    }
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Interactive server started');
}

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...');
  if (electronProcess) {
    electronProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  if (electronProcess) {
    electronProcess.kill();
  }
  process.exit(0);
});

// Start the application
main().catch(console.error);