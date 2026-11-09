// Atomic North — Windows/desktop shell. Loads the same web app that runs on GitHub Pages.
const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 380, minHeight: 600,
    backgroundColor: "#F5F8FC", title: "Atomic North", autoHideMenuBar: true,
    icon: path.join(__dirname, "..", "build", "icon.png"),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadFile(path.join(__dirname, "..", "app", "index.html"));
  // open web links in the user's browser, never inside the app
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith("file://")) { e.preventDefault(); shell.openExternal(url); } });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
