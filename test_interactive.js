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
  message: "# The MIT License (MIT)\n---\n\nCopyright © `<year>` `<copyright holders>`\n\nPermission is hereby granted, free of charge, to any person\nobtaining a copy of this software and associated documentation\nfiles (the “Software”), to deal in the Software without\nrestriction, including without limitation the rights to use,\ncopy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the\nSoftware is furnished to do so, subject to the following\nconditions:\n\nThe above copyright notice and this permission notice shall be\nincluded in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,\nEXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES\nOF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND\nNONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT\nHOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,\nWHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING\nFROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR\nOTHER DEALINGS IN THE SOFTWARE.\n```\n#!/usr/bin/env bash\nwhile :\ndo\n\techo \"Press [CTRL + C] to stop..\"\n\tsleep 1\ndone\n```\nPlease select one of the test options. Also check this link: [Open example.com](https://example.com)",
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
