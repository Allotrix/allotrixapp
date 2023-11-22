const { google } = require('googleapis');

import { committeeCheck, workingContainer, setUpContainer, constraints} from "./index.js";
import {columnNames} from "../constant/index.js";
import{hideLoadingScreen, showLoadingScreen} from "./index.js"
import { getAuthClient1} from "./getAuthClient.js";


export let spreadsheetMessageAdded = false;
export let spreadSheetLink = {}

export async function spreadsheetDone() {
  showLoadingScreen();
  try {
    const messageContainer = document.querySelector(".message-container");

    if (messageContainer) {
      messageContainer.remove();
      spreadsheetMessageAdded = false;

    }

    let makeSpreadsheetSuccess =  await makeSpreadsheet();

    if (makeSpreadsheetSuccess === true) {
      
      if (!spreadsheetMessageAdded) {
        const spreadsheetContainer = document.createElement("div");
        spreadsheetContainer.classList.add("message-container");
        spreadsheetContainer.style.gridColumn = "span 3";

        const tickImg = document.createElement("img");
        tickImg.setAttribute("id", "tick-img");
        tickImg.setAttribute("src", "assets/tick.png");
        spreadsheetContainer.appendChild(tickImg);

        const msg = document.createElement("h3");
        msg.classList.add("updates-msg");
        msg.textContent = "Spreadsheet was successfully made";
        spreadsheetContainer.appendChild(msg);

        const updatesBtn = document.createElement("button");
        updatesBtn.textContent = "View Sheets";
        updatesBtn.classList.add("updates-btn");
        updatesBtn.setAttribute("id", "updateBtn");
        spreadsheetContainer.appendChild(updatesBtn);

        workingContainer.appendChild(spreadsheetContainer);
        console.log("added spreadsheet container");

        updatesBtn.addEventListener("click", () => {
          const spreadSheetId = document.getElementById('spreadsheet-field');

          const websiteUrl = spreadSheetId.value;
          window.open(websiteUrl);
        });

        spreadsheetMessageAdded = true;
      }

      //scrolling and disabling blockOne sections;
      // Scroll to the target section
      const targetSection2 = document.querySelector(".message-container");
      targetSection2.scrollIntoView({ behavior: 'smooth' });

      // Disable the form field
      const cont = document.querySelector(".setUpContainer");
      cont.disabled = true;
      cont.classList.add('disabled');
      cont.style.pointerEvents = 'none';
      cont.style.opacity = '0.5';
      
      constraints();
      spreadsheetMessageAdded = false;
      const targetSection = document.querySelector("#constraints-container");
      targetSection.scrollIntoView({ behavior: "smooth" });


      

    } else {
      if (!spreadsheetMessageAdded) {
        
        const spreadsheetContainer = document.createElement("div");
        spreadsheetContainer.classList.add("message-container");

        const crossImg = document.createElement("img");
        crossImg.setAttribute("id", "tick-img");
        crossImg.setAttribute("src", "assets/cross.png");
        spreadsheetContainer.appendChild(crossImg);

        const msg = document.createElement("h3");
        msg.classList.add("updates-msg");
        msg.textContent = "Need editor permissions";
        spreadsheetContainer.appendChild(msg);

        const msg2 = document.createElement("h6");
        msg2.classList.add("updates-msg");
        msg2.textContent =
          "Please paste sheet link with editor access. If the issues persist, please contact allotrixapp@gmail.com";
        msg2.style.fontSize = "1.2em";
        spreadsheetContainer.appendChild(msg2);

        const updatesBtn = document.createElement("button");
        updatesBtn.textContent = "View Sheets";
        updatesBtn.classList.add("updates-btn");
        updatesBtn.setAttribute("id", "updateBtn");
        spreadsheetContainer.appendChild(updatesBtn);

        workingContainer.appendChild(spreadsheetContainer);

        updatesBtn.addEventListener("click", () => {
          const spreadSheetId = document.getElementById('spreadsheet-field');

          const websiteUrl = spreadSheetId.value;
          window.open(websiteUrl);
        });

        spreadsheetMessageAdded = true;
      }
   
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }finally{
    hideLoadingScreen()
  }

}


//Function to Get Authentication Credentials
getAuthClient1()
// Function to retrieve the list of sheet names
export async function getSheetData(sheets, spreadsheetId) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId,
    ranges: [],
  });

  const sheetsData = response.data.sheets;
  const sheetIds = sheetsData.map(sheet => sheet.properties.sheetId);
  const sheetNames = sheetsData.map(sheet => sheet.properties.title);
  const allSheetsData = [sheetIds, sheetNames];
  return allSheetsData;
}

//funstion to retrieve the first row values from the first sheet

async function getFirstSheetRowData(sheets, spreadsheetId) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: 'OG!A1:Z1',
  });

  const firstRowValues = response.data.values;  
  return firstRowValues;
}



export async function makeSpreadsheet() {
  //showLoadingScreen()

  try{
    //                  //
    //Declaring Constants:
    //                  //

    //initializing
    const auth = await getAuthClient1();
    const sheets = google.sheets({ version: 'v4', auth });

    //Add DUP_CHK, DUP in the CommitteeCheck List
    /* const committeeList = ["DUP_CHK", "DUP", ...committeeCheck.map(arr => arr[0])];
    const lengthComList = committeeList.length;*/

    const committeeListSet = new Set(["DUP_CHK", "DUP", "Waitlist", "Blacklist", ...committeeCheck.map(arr => arr[0])]);
    const committeeList = Array.from(committeeListSet);
    const lengthComList = committeeList.length;
    console.log(committeeList)
 
    //Declaring the scope
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
    
    //Start - SPREADSHEET ID CHECK
    const sheetLinkElement = document.getElementById('spreadsheet-field');
    const sheetLink = sheetLinkElement.value;

    const regex = /\/spreadsheets\/d\/([^/]+)/; // Replace with your actual regular expression pattern.

    const match = sheetLink.match(regex);
    //const spreadsheetIdMain = match[1];
    const spreadsheetIdMain = match && match[1] ? match[1] : "error";
    
    //Write to json sheet link
    let temp_remember = {
      "sheetid": spreadsheetIdMain
  }

  spreadSheetLink = Object.assign({}, temp_remember);

    

    const spreadsheetIdMainLen = spreadsheetIdMain.length;
    console.log(spreadsheetIdMain);
    console.log(spreadsheetIdMainLen);
    //End
    
    const sheetValues = columnNames.map(column => ({ userEnteredValue: { stringValue: column } }));

    //Getting inital list of sheet names
    //Getting intial list of sheed ids
    const [sheetIds, sheetNames] = await getSheetData(sheets, spreadsheetIdMain);


    //             //
    //Main Function//
    //             // 

    //Deleting the existing sheets except index [0]
    console.log(sheetIds);
    for (let i = 1; i < sheetIds.length; i++) {
      const sheetId = sheetIds[i];
      const deleteRequest = {
        spreadsheetId: spreadsheetIdMain,
        resource: {
          requests: [
            {
              deleteSheet: {
                sheetId: sheetId,
              },
            },
          ],
        },
      };
      await sheets.spreadsheets.batchUpdate(deleteRequest);
      console.log(`Sheet "${sheetNames[i]}" deleted.`);
    }

    //Renaming the first sheet to OG
    const renameRequest = {
      spreadsheetId: spreadsheetIdMain,
      resource:{
        requests:[
          {
            updateSheetProperties:{
              properties:{
                sheetId: sheetIds[0],
                title: 'OG',
              },
              fields: 'title',
            },
          },
        ],
      },
    };

    await sheets.spreadsheets.batchUpdate(renameRequest);
    console.log(`Sheet '${sheetNames[0]}' renamed to 'OG'.`);

    //Create new sheets
    for (let i = 0; i < lengthComList; i++) {
      const sheetTitle = committeeList[i];
      const request = {
        spreadsheetId: spreadsheetIdMain,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetTitle,
                },
              },
            },
          ],
        },
      };
      await sheets.spreadsheets.batchUpdate(request);
      console.log(`Sheet '${sheetTitle}' created.`);
    }
    console.log(sheetIds.length);
    
    //add new header to newly created sheets
    const [newSheetIds, newSheetNames] = await getSheetData(sheets, spreadsheetIdMain);
    console.log(sheetValues);
    for (let i = 3; i < newSheetIds.length; i++){
      const currSheet = newSheetIds[i];
      const headerRequest = {
        spreadsheetId: spreadsheetIdMain,
        resource:{
          requests: [
            {
              updateCells: {
                range: {
                  sheetId: currSheet,
                  startRowIndex: 0,
                  startColumnIndex: 0,
                },
                rows: [
                  {
                    values: sheetValues,
                  },
                ],
                fields: 'userEnteredValue',
              },
            }
          ]
        }
      }
      await sheets.spreadsheets.batchUpdate(headerRequest);
      console.log(`Sheet values for '${newSheetNames[i]}' is updated.`);
    }

    //Rename the frist row of DUP and DUP_CHK from OG
    const firstRowData = await getFirstSheetRowData(sheets, spreadsheetIdMain);
    const rowDataList = firstRowData[0];
    const modRowDataList = rowDataList.map(column => ({ userEnteredValue: { stringValue: column } }));
    console.log(firstRowData);
    console.log(rowDataList);
    console.log(modRowDataList);
    for (let i = 1; i < 3; i++){
      const currSheet = newSheetIds[i];
      const headerRequest = {
        spreadsheetId: spreadsheetIdMain,
        resource:{
          requests: [
            {
              updateCells: {
                range: {
                  sheetId: currSheet,
                  startRowIndex: 0,
                  startColumnIndex: 0,
                },
                rows: [
                  {
                    values: modRowDataList,
                  },
                ],
                fields: 'userEnteredValue',
              },
            }
          ]
        }
      }
      await sheets.spreadsheets.batchUpdate(headerRequest);
      console.log(`Sheet values for '${newSheetNames[i]}' is updated.`);
    }

    console.log("makeSpreadsheetSuccess is true")
    return true;
  } catch (error) {
    console.error("An error occurred in makeSpreadsheet:", error);
    return false;
  }

}



