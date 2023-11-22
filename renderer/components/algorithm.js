const {writeFile, existsSync, readFileSync, writeFileSync} = require('fs');

const { google } = require('googleapis');
const { serviceAccountCred } = require('../constant/index.js');


async function getFields() {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const sheetjsonFileName = 'sheet.json';
    const sheetjsonFilePath = path.join(__dirname, '..', sheetjsonFileName);
    const sheetContent = readFileSync(sheetjsonFilePath, 'utf-8');
    const spreadsheetId = sheetContent[sheetid];

    console.log(spreadsheetId)
    

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'OG!A1:Z1',
    });

    console.log(response)
}  

async function getAuthClient() {
  
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  
    const auth = await google.auth.getClient({
      credentials: serviceAccountCred,
      scopes: SCOPES,
    });
  
    return auth;
  }

  getFields()