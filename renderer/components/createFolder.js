const fs = require("fs");
const path = require("path");



export function createFileInFolder(folderName, fileName, fileContent) {
    const documentsPath = path.join(process.env.HOME || process.env.USERPROFILE, 'Documents');
    const targetFolderPath = path.join(documentsPath, folderName);
  
    // Create the specified folder if it doesn't exist
    if (!fs.existsSync(targetFolderPath)) {
      fs.mkdirSync(targetFolderPath);
      console.log(`Folder "${folderName}" created in Documents.`);
    } else {
      console.log(`Folder "${folderName}" already exists in Documents.`);
    }
  
    // Create and save the file
    const filePath = path.join(targetFolderPath, fileName);
    fs.writeFileSync(filePath, fileContent);
    console.log(`File "${fileName}" created in "${folderName}" folder.`);
  }