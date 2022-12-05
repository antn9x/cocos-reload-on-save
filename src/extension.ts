// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const http = require("http");
const path = require("path");
const fs = require("fs");

function isCocosProject() {
  if (!vscode.workspace.workspaceFolders) {
    // vscode.window.showInformationMessage('No folder or workspace opened');
    return false;
  }
  const rootPath = vscode.workspace.workspaceFolders[0];
  if (!rootPath) { return false; }
  const projectJsonPath = path.join(rootPath.uri, "project.json");
  if (fs.existsSync(projectJsonPath)) { return true; }
  const packageJsonPath = path.join(rootPath.uri, "package.json");
  if (!fs.existsSync(packageJsonPath)) { return false; }
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
  return packageJson.creator;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  const host = vscode.workspace.getConfiguration().get("host.host");
  if (!isCocosProject()) { return; }
  let timeout: NodeJS.Timeout;
  vscode.workspace.onDidSaveTextDocument((e) => {
    if (timeout && timeout.hasRef()) { clearTimeout(timeout); }
    timeout = setTimeout(() => http.get(`${host}/update-db`).on("error", (err: Error) => console.log(err.message)), 200);
  });
}

// This method is called when your extension is deactivated
export function deactivate() { }
