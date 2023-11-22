const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
import {workingContainer, showMatrix, committeeCheck, nextBtnContainer, fieldIndex, displayError, addNextButton, constraints} from "./index.js";
import {columnNames} from "../constant/index.js";
import { getAuthClient1} from "./getAuthClient.js";

import{hideLoadingScreen, showLoadingScreen} from "./index.js"
const { ipcRenderer } = require("electron");

const folderName = "Allotrix"
const documentsPath = path.join(process.env.HOME || process.env.USERPROFILE, 'Documents');
const targetFolderPath = path.join(documentsPath, folderName);



export function createNewCommittee(){


    workingContainer.innerHTML="";
    workingContainer.style.display = "flex";
    workingContainer.style.flexDirection = "column"


    const setUpContainer = document.createElement("div");
    setUpContainer.className = 'form-field';

    //=======style

    setUpContainer.style.display = "flex";
    setUpContainer.style.flexDirection = "column";
    setUpContainer.style.maxHeight = "80vh";
    setUpContainer.style.position = "top";
    setUpContainer.style.padding = "10px";


    setUpContainer.style.scrollBar = "hidden";
    setUpContainer.style.display = "flex";
    setUpContainer.style.flexDirection = "column"
    //=======\style

    const addText = document.createElement('h1');
    addText.textContent = "Add New Committee"
    setUpContainer.appendChild(addText);
  
  
    const newFieldContainer = document.createElement('div');
    newFieldContainer.className = 'form-field';
  
      
  
      const committeeLabel = document.createElement('label');
      committeeLabel.setAttribute('for', `committee${fieldIndex}`);
      committeeLabel.textContent = 'Committee:';
      newFieldContainer.appendChild(committeeLabel);
    
      const committeeSelect = document.createElement('input');
      committeeSelect.setAttribute('type', 'text');
      committeeSelect.classList.add("com-input")
      committeeSelect.setAttribute('id', `committee${fieldIndex}`);
      committeeSelect.setAttribute("placeholder", `Committee Name`); 
  
      committeeSelect.setAttribute('name', 'committee[]');
      committeeSelect.required = true;
      newFieldContainer.appendChild(committeeSelect);
    
      const sizeLabel = document.createElement('label');
      sizeLabel.setAttribute('for', `size${fieldIndex}`);
      sizeLabel.textContent = 'Size:';
      newFieldContainer.appendChild(sizeLabel);
    
      const sizeInput = document.createElement('input');
      sizeInput.setAttribute('type', 'number');
      sizeInput.setAttribute('id', `size${fieldIndex}`);
      sizeInput.setAttribute("placeholder", `0`); 
  
      sizeInput.setAttribute('name', 'size[]');
      sizeInput.required = true;
      newFieldContainer.appendChild(sizeInput);


      addNextButton();

      nextBtnContainer.addEventListener('click', nextBtnHandler);
  
  
  
      setUpContainer.appendChild(newFieldContainer);
      setUpContainer.appendChild(nextBtnContainer);

      workingContainer.appendChild(setUpContainer);
  
  
     
  
  }
  
  function nextBtnHandler(){

    const committeeFields = document.querySelectorAll('input[name="committee[]"]');
  
  
    // Remove previous error messages
    const previousErrorMessages = document.querySelectorAll('.error-msg-container');
    previousErrorMessages.forEach((errorMsg) => {
      errorMsg.remove();
    });

    let isValid = true;
    


  
    
    committeeFields.forEach((field) => {
      const committeeValue = field.value;
      const sizeField = field.nextElementSibling.nextElementSibling;
      const sizeValue = sizeField.value;
  
      if (committeeValue === "" || sizeValue === "") {
        displayError("Fields cannot be empty");
        isValid = false;

      } else {
        console.log("committeeCheck list: ", committeeCheck)

        committeeCheck.push([committeeValue, sizeValue])
        console.log(`Committee: ${committeeValue}`);
        console.log(`Size: ${sizeValue}`);
        console.log("committeeCheck list: ", committeeCheck)
      }
    });
   
    if (isValid) {
      spreadsheetDone();
      
    }
  }



let spreadsheetMessageAdded = false;


  async function spreadsheetDone() {
    showLoadingScreen()
    try {
      const messageContainer = document.querySelector(".message-container");
  
      if (messageContainer) {
        messageContainer.remove();
        spreadsheetMessageAdded = false;
  
      }
  
      const makeSpreadsheetSuccess =  await makeSpreadsheet();
  
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
          msg.textContent = "Committee was successfully added to Spreadsheets";
          spreadsheetContainer.appendChild(msg);
  
          
  
          workingContainer.appendChild(spreadsheetContainer);
          console.log("added spreadsheet container");
  
          spreadsheetMessageAdded = true;
        }
  
        //scrolling and disabling blockOne sections;
        // Scroll to the target section
        const targetSection2 = document.querySelector(".message-container");
        targetSection2.scrollIntoView({ behavior: 'smooth' });
  
        // Disable the form field
        const cont = document.querySelector(".form-field");
        if(cont){
            cont.disabled = true;
            cont.classList.add('disabled');
            cont.style.pointerEvents = 'none';
            cont.style.opacity = '0.5';
        }
       
        
        showMatrix();
        spreadsheetMessageAdded = false;
        const targetSection = document.querySelector("#matrix-container");
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
            "Please head to the sheets and add 'cpsprimemun@gmail.com' as an editor";
          msg2.style.fontSize = "1.2em";
          spreadsheetContainer.appendChild(msg2);
  
  
          workingContainer.appendChild(spreadsheetContainer);
  
          
  
          spreadsheetMessageAdded = true;
        }
     
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }finally{
      hideLoadingScreen();
    }
  }




//Function to Get Authentication Credentials
export async function getAuthClient() {
  
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

  const auth = await google.auth.getClient({
    credentials: serviceAccountCred,
    scopes: SCOPES,
  });

  return auth;
}

async function getSheetData(sheets, spreadsheetId) {
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


export function getSheetIdFromJSONFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    if (jsonData.hasOwnProperty('sheetid')) {
      return jsonData.sheetid;
    } else {
      return; // or throw an error if you prefer
    }
  } catch (error) {
    console.error('Error reading or parsing JSON file:', error);
    return null;
  }
}

export async function makeSpreadsheet(){
  try{
   
    const filePath =  path.join(targetFolderPath, 'sheet.json');
    const spreadsheetIdMain = getSheetIdFromJSONFile(filePath);
    console.log('Extracted sheetId:', spreadsheetIdMain);
    const auth = await getAuthClient1();
    const sheets = google.sheets({ version: 'v4', auth });

    const sheetValues = columnNames.map(column => ({ userEnteredValue: { stringValue: column } }));
    const sheetTitle = document.getElementsByClassName("com-input")[0].value
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
    


    const [newSheetIds, newSheetNames] = await getSheetData(sheets, spreadsheetIdMain);

    const lengthSheets = newSheetIds.length - 1;
    console.log(lengthSheets)
    const currSheet = newSheetIds[lengthSheets];
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
      console.log(`Sheet values for '${newSheetNames[lengthSheets]}' is updated.`);

    return true;

  } catch (error){
    console.error("An error occurred in makeSpreadsheet:", error);
    const comAlert = window.confirm("Committee already exists. Please create a new committee.");
          if (comAlert) {
            ipcRenderer.send("reload-window");

              console.log("refreshed");
          }

    return false;
  }
};


