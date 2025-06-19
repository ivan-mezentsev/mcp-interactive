import { spawn } from 'child_process';

const server = spawn('node', ['index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

server.stdout.on('data', (data) => {
  console.log('Server response:', data.toString());
  server.kill();
  process.exit(0);
});

server.stderr.on('data', (data) => {
  console.log('Server stderr:', data.toString());
});

// Send ask_user request
const request = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "ask_user",
    arguments: {
      projectName: "Test Project",
      message: "```\n#!/usr/bin/env bash\nwhile :\ndo\n\techo \"Press [CTRL + C] to stop..\"\n\tsleep 1\ndone\n```\nPlease select one of the test options:",
      predefinedOptions: ["Option 1", "Option 2", "Option 3"]
    }
  }
};

setTimeout(() => {
  console.log('Sending request:', JSON.stringify(request));
  server.stdin.write(JSON.stringify(request) + '\n');
}, 1000);

// Keep process alive
setTimeout(() => {
  console.log('Test completed');
  server.kill();
  process.exit(0);
}, 90000);
