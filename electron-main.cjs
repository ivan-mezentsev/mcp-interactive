const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Flag to track if the dialog is open
let dialogWindow = null;
let responseSent = false; // Flag to prevent duplicate responses

// Function to create and show the dialog window
function createDialog(dialogData = null) {
  // Reset response flag for new dialog
  responseSent = false;
  const title = dialogData?.projectName || 'MCP Interactive Dialog';
  
  try {
    dialogWindow = new BrowserWindow({
    width: 600,
    height: 600,
    resizable: true,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: title,
    alwaysOnTop: true,
    skipTaskbar: true
  });

  // Load the HTML content for the dialog
  dialogWindow.loadFile('dialog.html');
  
  // Send initial data when the page is ready
  if (dialogData) {
    dialogWindow.webContents.once('did-finish-load', () => {
      dialogWindow.webContents.send('update-dialog', dialogData);
    });
  }

  // Handle window closed event
  dialogWindow.on('closed', () => {
    if (!responseSent) {
      console.log('TEXT_FROM_RENDERER: ');
      responseSent = true;
    }
    dialogWindow = null;
    console.log('DIALOG_CLOSED');
    app.quit();
  });
  
  // Handle window close event (before closing) to send empty response
  dialogWindow.on('close', (event) => {
    // console.error(`[DEBUG] Window close event, responseSent: ${responseSent}`);
    // Send empty response only if no response was sent yet
    if (!responseSent) {
      // console.error(`[DEBUG] Sending fallback empty response to stdout`);
      process.stdout.write(`TEXT_FROM_RENDERER: ${JSON.stringify('')}\n`);
      responseSent = true;
      // console.error(`[DEBUG] Fallback response sent, responseSent now: ${responseSent}`);
    // } else {
      // console.error(`[DEBUG] Response already sent, not sending fallback`);
    }
  });

  } catch (error) {
    console.error(`[DEBUG] Error in createDialog: ${error.message}`);
    console.error(`[DEBUG] Error stack: ${error.stack}`);
  }

  // Note: Dialog data is now passed via environment variables at startup
  // No need to listen for stdin messages for dialog content
}

// Handle submit button click
ipcMain.on('submit-clicked', (event, text) => {
  if (!responseSent) {
    console.log(`TEXT_FROM_RENDERER: ${JSON.stringify(text)}`);
    responseSent = true;
    if (dialogWindow) {
      dialogWindow.close();
    }
  }
});

// Handle the Cancel button click from renderer process
ipcMain.on('cancel-clicked', (event) => {
  if (!responseSent) {
    console.log(`TEXT_FROM_RENDERER: ${JSON.stringify('')}`);
    responseSent = true;
  }
  if (dialogWindow) {
    dialogWindow.close();
  }
});

// Handle timeout event
ipcMain.on('dialog-timeout', (event) => {
  if (!responseSent) {
    console.log('DIALOG_TIMEOUT');
    responseSent = true;
    if (dialogWindow) {
      dialogWindow.close();
    }
  }
});

// Handle window close event
ipcMain.on('window-close', (event) => {
  if (!responseSent) {
    console.log(`TEXT_FROM_RENDERER: ${JSON.stringify('')}`);
    responseSent = true;
  }
});

// App ready event
app.whenReady().then(() => {
  // Read dialog data from environment variables
  const dialogData = {
    projectName: process.env.DIALOG_PROJECT_NAME || 'MCP Interactive Dialog',
    message: process.env.DIALOG_MESSAGE || 'Please provide your input:',
    predefinedOptions: JSON.parse(process.env.DIALOG_PREDEFINED_OPTIONS || '[]'),
    timeout: parseInt(process.env.DIALOG_TIMEOUT || '60', 10)
  };
  
  // Create and show the dialog
  createDialog(dialogData);
});

// Handle all windows closed
app.on('window-all-closed', () => {
  // Quit the Electron app when all windows are closed
  app.quit();
});

// Handle app activation (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    // Read dialog data from environment variables
    const dialogData = {
      projectName: process.env.DIALOG_PROJECT_NAME || 'MCP Interactive Dialog',
      message: process.env.DIALOG_MESSAGE || 'Please enter text here...',
      predefinedOptions: process.env.DIALOG_PREDEFINED_OPTIONS ? 
        JSON.parse(process.env.DIALOG_PREDEFINED_OPTIONS) : [],
      timeout: parseInt(process.env.DIALOG_TIMEOUT || '60', 10)
    };
    createDialog(dialogData);
  }
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  app.quit();
});

process.on('SIGTERM', () => {
  app.quit();
});