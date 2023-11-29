const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');


import { getFirestore, collection, doc, setDoc, updateDoc, getDoc} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import {firebaseConfig } from "../constant/index.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getAuth} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";

import { consoleLog, getSheetData, createFileInFolder} from "./index.js";

import { getAuthClient2,getAuthClient3, getAuthClient4, getAuthClient5} from "./getAuthClient.js";



const App = initializeApp(firebaseConfig);
const db = getFirestore(App);
const auth = getAuth(App);


let subscriptionPurchased = false;

let consecutiveFailures = 0;
const maxConsecutiveFailures = 10;

const folderName = "Allotrix"
const documentsPath = path.join(process.env.HOME || process.env.USERPROFILE, 'Documents');
const targetFolderPath = path.join(documentsPath, folderName);


//check for subscription

export async function checkSubscription(){
  const USER = auth.currentUser;
  if (USER) {
      const UID = USER.uid;
      const userDocRef = doc(db, "users", UID);
      const userDoc =  await getDoc(userDocRef);
      const userData = userDoc.data();

      if (userData && userData.subscriptionPurchased === true) {
          console.log("subscription pruchased")
          let label = document.getElementById("subscription-status");
          label.textContent = "Subscription: Active";
          label.style.border = "2px solid green";
          subscriptionPurchased =  true;
        } else {
          console.log("subscription NOT pruchased")
          let label = document.getElementById("subscription-status");
          label.textContent = "Subscription: Inactive";
          label.style.border = "2px solid #EF4036;"
          subscriptionPurchased =  false;
        }


     }
  }




//getting OG Sheet Values
export async function getAllValuesFromOGSheet() {
    const auth = await getAuthClient4();
    const sheets = google.sheets({ version: 'v4', auth });
  
    const filePath = path.join(targetFolderPath, "sheet.json");
    const jsonContents = fs.readFileSync(filePath, 'utf8');
    
    const sheetData = JSON.parse(jsonContents);
    const sheetId = sheetData.sheetid;   
  
    const namesAndIDs = await getSheetData(sheets, sheetId);
    const sheetName = 'OG';
  
    let spreadsheetId;
  
    // Iterate through the sheet names (namesAndIDs[1] has the sheet Names)
    let ArrayLength = 0;
    for (const i in namesAndIDs[1]) {
      ArrayLength += 1;
    }
  
    for (let i = 0; i < ArrayLength; i++) {
  
      if (namesAndIDs[1][i] === sheetName) {
        spreadsheetId = namesAndIDs[0][i];
  
        break;
      }
    }
  
  
  
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:Z`, 
      });
    
  
    // Extract the values from the response
    const values = response.data.values;
  
    const valuesWithoutHeader = values.slice(1);
  
    //find length of data
    let valuesLength = 0;
    for (const i in valuesWithoutHeader) {
      valuesLength += 1;
    } 
  
    return values;
  
  }


//FOR NOTIFS
  export async function getAllValuesLengthFromOGSheet() {
    const auth = await getAuthClient5();
    const sheets = google.sheets({ version: 'v4', auth });

    const filePath = path.join(targetFolderPath, "sheet.json");
const jsonContents = fs.readFileSync(filePath, 'utf8');

const sheetData = JSON.parse(jsonContents);
const sheetId = sheetData.sheetid;



    const namesAndIDs = await getSheetData(sheets, sheetId);
    const sheetName = 'OG';

    
  
    let spreadsheetId;
  
    // Iterate through the sheet names (namesAndIDs[1] has the sheet Names)
    let ArrayLength = 0;
    for (const i in namesAndIDs[1]) {
      ArrayLength += 1;
    }
  
    for (let i = 0; i < ArrayLength; i++) {
  
      if (namesAndIDs[1][i] === sheetName) {
        spreadsheetId = namesAndIDs[0][i];
  
        break;
      }
    }
  
  
  
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:Z`, 
      });
    
  
    // Extract the values from the response
    const values = response.data.values;
  
    const valuesWithoutHeader = values.slice(1);
  
    //find length of data
    let valuesLength = 0;
    for (const i in valuesWithoutHeader) {
      valuesLength += 1;
    } 
  
    return valuesLength;
  
  }

//getting DUP_CHK Sheet Values
export async function getAllValuesFromDUP_CHKSheet_2() {
  const auth = await getAuthClient4();
  const sheets = google.sheets({ version: 'v4', auth });

  const filePath = path.join(targetFolderPath, "sheet.json");
    const jsonContents = fs.readFileSync(filePath, 'utf8');

    const sheetData = JSON.parse(jsonContents);
    const sheetId = sheetData.sheetid;


  const namesAndIDs = await getSheetData(sheets, sheetId);
  const sheetName = 'DUP_CHK';

  let spreadsheetId;

  // Iterate through the sheet names (namesAndIDs[1] has the sheet Names)
  let ArrayLength = 0;
  for (const i in namesAndIDs[1]) {
    ArrayLength += 1;
  }

  for (let i = 0; i < ArrayLength; i++) {

    if (namesAndIDs[1][i] === sheetName) {
      spreadsheetId = namesAndIDs[0][i];

      break;
    }
  }



    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:Z`, 
    });
  

  // Extract the values from the response
  const values = response.data.values;

  const valuesWithoutHeader = values.slice(1);

  return values;
}

//FOR NOTIFS
export async function getAllValuesFromDUP_CHKSheet() {
    const auth = await getAuthClient5();
    const sheets = google.sheets({ version: 'v4', auth });

    const filePath = path.join(targetFolderPath, "sheet.json");
const jsonContents = fs.readFileSync(filePath, 'utf8');

const sheetData = JSON.parse(jsonContents);
const sheetId = sheetData.sheetid;



    const namesAndIDs = await getSheetData(sheets, sheetId);
    const sheetName = 'DUP_CHK';
  
    let spreadsheetId;
  
    // Iterate through the sheet names (namesAndIDs[1] has the sheet Names)
    let ArrayLength = 0;
    for (const i in namesAndIDs[1]) {
      ArrayLength += 1;
    }
  
    for (let i = 0; i < ArrayLength; i++) {
  
      if (namesAndIDs[1][i] === sheetName) {
        spreadsheetId = namesAndIDs[0][i];
  
        break;
      }
    }
  
  
  
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:Z`, 
      });
    
  
    // Extract the values from the response
    const values = response.data.values;
  
    const valuesWithoutHeader = values.slice(1);
  
    let valuesLength = 0;
    for (const i in valuesWithoutHeader) {
      valuesLength += 1;
    } 
  
    return valuesLength;
}

  export async function getAllValuesFromDUPSheet() {
    
    const auth = await getAuthClient4();
    const sheets = google.sheets({ version: 'v4', auth });

    const sheetName = "DUP"

    const filePath = path.join(targetFolderPath, "sheet.json");
const jsonContents = fs.readFileSync(filePath, 'utf8');

const sheetData = JSON.parse(jsonContents);
const sheetId = sheetData.sheetid;



      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:Z`, 
      });
    
  
    // Extract the values from the response
    const values = response.data.values;
  
    const valuesWithoutHeader = values.slice(1);
  
   
    //find length
    let valuesLength = 0;
    for (const i in valuesWithoutHeader) {
      valuesLength += 1;
    } 
  
    return values;
  }
  
  export async function getAllValuesFromWaitlistSheet() {
    const auth = await getAuthClient2();
    const sheets = google.sheets({ version: 'v4', auth });

    const filePath = path.join(targetFolderPath, "sheet.json");
    const jsonContents = fs.readFileSync(filePath, 'utf8');
    
    const sheetData = JSON.parse(jsonContents);
    const sheetId = sheetData.sheetid;
    

  
    const namesAndIDs = await getSheetData(sheets, sheetId);
    const sheetName = 'Waitlist';
  
    let spreadsheetId;
  
    // Iterate through the sheet names (namesAndIDs[1] has the sheet Names)
    let ArrayLength = 0;
    for (const i in namesAndIDs[1]) {
      ArrayLength += 1;
    }
  
    for (let i = 0; i < ArrayLength; i++) {
  
      if (namesAndIDs[1][i] === sheetName) {
        spreadsheetId = namesAndIDs[0][i];
  
        break;
      }
    }
  
  
  
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:Z`, 
      });
    
  
    // Extract the values from the response
    const values = response.data.values;
  
    const valuesWithoutHeader = values.slice(1);
  
    //find length of data
    let valuesLength = 0;
    for (const i in valuesWithoutHeader) {
      valuesLength += 1;
    } 
  
    return valuesLength;
  
  }

// this will filter new data by checking DUP_CHK and paste new data in DUP and then update DUP_CHK
export async function processOGData() {

  // Get values from the OG sheet
  const ogSheetValues = await getAllValuesFromOGSheet();

  // Get values from the DUP_CHK sheet
  const dupChkSheetValues = await getAllValuesFromDUP_CHKSheet_2();

  // ===== Comparing the data and exclude duplicates =======

  const headerRow = ogSheetValues[0];

  // Find the index of the "email" column
  let emailIndex = -1; // Initialize to -1, indicating not found
  for (let i = 0; i < headerRow.length; i++) {
    if (headerRow[i].trim().toLowerCase().includes('email')) {
      emailIndex = i;
      break; 
    }
  }


  if (ogSheetValues.length === dupChkSheetValues.length){


    consecutiveFailures++;
    consoleLog(`No new registrations found, checking again (${consecutiveFailures})`);

    if (consecutiveFailures >= maxConsecutiveFailures) {
      // If consecutive failures threshold is reached, set algo_running to false
      console.log(`Max consecutive failures (${maxConsecutiveFailures}) reached. Setting algo_running to false.`);
      try {
        const text6 = document.getElementById("automator-card-text");
        const automateButton6 = document.getElementById("automator-card-button")
        const card6 = document.getElementById("automator-card");

        text6.textContent = "Automator";
        card6.style.backgroundImage = "linear-gradient(to top, rgba(255, 0, 0, 0.5) 50%, rgba(204, 0, 0, 0.5) 50%), url('assets/red-gears.jpg')";
        card6.style.backgroundSize = "cover";
        automateButton6.style.background = "linear-gradient(to bottom, #00FF00, #00CC00)";
        card6.style.boxShadow = "0 0 20px red";
        automateButton6.textContent = "Start";
        card6.classList.remove("glow");
        consoleLog("No participants, Algorithm Stopped.")
        consecutiveFailures = 0;
      } catch (error) {
        console.error("Error updating algorithmRunning:", error);
      }
    }
    
  }
  else{

  
  // Using the email index and comparing email values
  const filteredValues = ogSheetValues.slice(1).filter((ogData) => {
    // Check if the email is not in DUP_CHK values
    if (emailIndex !== -1 && ogData[emailIndex]) {
      const ogEmail = ogData[emailIndex];
      consoleLog(`Processing email: ${ogEmail}`);

      // Log each DUP_CHK data entry to help identify the issue
      dupChkSheetValues.forEach((dupChkData, index) => {
        //console.log(`Comparing with DUP_CHK entry ${index}:`, dupChkData);
      });

      return !dupChkSheetValues.some((dupChkData) => dupChkData.includes(ogEmail));
    }
  });
  console.log("Filtered Values (excluding existing DUP_CHK entries): ", filteredValues);
  setInterval(await pasteToDUP_CHKAndDUP(filteredValues), 500);

}
}



export async function pasteToDUP_CHKAndDUP(pasteData) {
  try {
    // Authenticate and set up Google Sheets API client
    const auth = await getAuthClient3();
    const sheets = google.sheets({ version: 'v4', auth });

    const filePath = path.join(targetFolderPath, "sheet.json");
const jsonContents = fs.readFileSync(filePath, 'utf8');

const sheetData = JSON.parse(jsonContents);
const sheetId = sheetData.sheetid;


    // Determine the last row with content in the "DUP" sheet
    const dupSheetValues = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'DUP', // Replace with the specific range you need
    });

    // Determine the last row with content in the "DUP_CHK" sheet
    const dupChkSheetValues = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'DUP_CHK', // Replace with the specific range you need
    });

    // Update the range with the calculated last row
    const dupLastRow = (dupSheetValues.data.values.length || 0) + 1;
    const dupChkLastRow = (dupChkSheetValues.data.values.length || 0) + 1;

    // Create the value range object with the data
    const valueRange = {
      values: pasteData,
    };

    // Use spreadsheets.values.update method to post the data into "DUP" sheet
     sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `DUP!A${dupLastRow}:Z`, // Replace with the specific range you need
      valueInputOption: 'RAW',
      resource: valueRange,
    });

    // Similarly, post the data into "DUP_CHK" sheet (use the same range)
     sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `DUP_CHK!A${dupChkLastRow}:Z`, // Replace with the specific range you need
      valueInputOption: 'RAW',
      resource: valueRange,
    });

    consoleLog('SUCCESS! Data retrieved');
  } catch (error) {
    console.error('Error while pasting data:', error);
  }
}


  
export async function deleteRowFromDUP(email) {

  const auth = await getAuthClient3();
  const sheets = google.sheets({ version: 'v4', auth });

  const filePath = path.join(targetFolderPath, "sheet.json");
  const jsonContents = fs.readFileSync(filePath, 'utf8');

  const sheetData = JSON.parse(jsonContents);
  const sheetId = sheetData.sheetid;

  // Use the spreadsheets.values.get method to retrieve the existing data
  const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "DUP",
  });

  const values = response.data.values;

  if (!values) {
      consoleLog('No new participant to process');
      return;
  }

  // Find the index of the row to delete based on the email
  const targetHeader = 'Email ID';
  const columnIndex = values[0].findIndex(header => header.toLowerCase() === targetHeader.toLowerCase());

  if (columnIndex === -1) {
      consoleLog('Email column not found in the "DUP" sheet.');
      return;
  }

  let rowToDelete = -1;
  for (let i = 0; i < values.length; i++) {
      if (values[i][columnIndex] === email) {
          rowToDelete = i + 1; // Adding 1 to account for header row
          break;
      }
  }

  if (rowToDelete === -1) {
      consoleLog(`No row found with email: ${email}`);
      return;
  }

  // Define the range to clear, including the entire row to be deleted
  const deleteRange = `DUP!A${rowToDelete}:Z${rowToDelete}`;

  const dataToBeDeleted = values[rowToDelete - 1]; // Subtract 1 to remove header row

  // Use the spreadsheets.values.clear method to clear the specified range
  await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: deleteRange,
  });

 
  consoleLog(`${email} is allotted`);
}


export async function pasteResultToCommitteeSheet(result){
  let rel = result;

  const auth = await getAuthClient3();
  const sheets = google.sheets({ version: 'v4', auth });

  const filePath = path.join(targetFolderPath, "sheet.json");
const jsonContents = fs.readFileSync(filePath, 'utf8');

const sheetData = JSON.parse(jsonContents);
const sheetId = sheetData.sheetid;



    let committeeSheetName = result[5];
    let userEmail = result[2];




     // Determine the last row with content in the "DUP_CHK" sheet
     const committeeSheetValues = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${committeeSheetName}`, 
    });

    // Update the range with the calculated last row
    const committeeSheetLastRow = (committeeSheetValues.data.values.length || 0) + 1;
    console.log(`${committeeSheetName}'s last row: `, committeeSheetLastRow)
  
    // Create the value range object with the data
    const valueRange = {
      values: [result], 
    };

     sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${committeeSheetName}!A${committeeSheetLastRow}`,
        valueInputOption: 'RAW',
        resource: valueRange,
      });
      await deleteRowFromDUP(userEmail);
      await sendEmail(rel)

}

export async function pasteResultToWaitlistSheet(result){
  const auth = await getAuthClient3();
  const sheets = google.sheets({ version: 'v4', auth });

  const filePath = path.join(targetFolderPath, "sheet.json");
  const jsonContents = fs.readFileSync(filePath, 'utf8');
  
  const sheetData = JSON.parse(jsonContents);
  const sheetId = sheetData.sheetid;
  


    let committeeSheetName = "Waitlist";
    let userEmail = result[2];




     // Determine the last row with 
     const committeeSheetValues = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${committeeSheetName}`, 
    });

    // Update the range with the calculated last row
    const committeeSheetLastRow = (committeeSheetValues.data.values.length || 0) + 1;
  
    // Create the value range object with the data
    const valueRange = {
      values: [result], 
    };

    sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${committeeSheetName}!A${committeeSheetLastRow}`,
        valueInputOption: 'RAW',
        resource: valueRange,
      });


      consoleLog("User put to Waitlist")
      await deleteRowFromDUP(userEmail);
}


export async function sendEmail(result) {

  console.log("sending email: ", result);

  await checkSubscription();
  const jsonemailprefFilePath = path.join(targetFolderPath, 'email_pref.json');
  let existingJsonData = JSON.parse(fs.readFileSync(jsonemailprefFilePath, 'utf8'));
  
if (subscriptionPurchased === false && existingJsonData["automate_email"] == false){
  consoleLog("Buy Premium version to send automatic emails", "red")
  return;
}else if (subscriptionPurchased === true && existingJsonData["automate_email"] == false){
  consoleLog("Email not sent. Verify allotment to email.", "yellow")

}else{

  let EMAIL = "allotments.allotrix@gmail.com"
  let PASSWORD = "vsfc fobl ygsg ylsq";
  
  


  // transporter object
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  const jsonEmailFileName = 'emailHTML.json';
  const jsonFilePath = path.join(targetFolderPath, jsonEmailFileName);


  let emailBody;

  // Write html data to the JSON file from Firebase if changes are made in Firebase.
  const auth = getAuth(App);
  const USER = auth.currentUser;
  if (USER) {
    const UID = USER.uid;
    const userDocRef = doc(db, "users", UID);

    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (!userData || !userData.html) {
      consoleLog("No Email template found in database.");
      return;
    }

    // Read the existing JSON data if it exists
    let readData = {};
    if (fs.existsSync(jsonFilePath)) {
      readData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    }

    // Compare the HTML content from Firebase with the existing data
    if (userData.html !== readData.html) {
      readData.html = userData.html;
      createFileInFolder(folderName, jsonEmailFileName,JSON.stringify(readData, null, 2) )

      emailBody = userData.html;
    } else {
      emailBody = readData.html || '';
    }
  } else {
    consoleLog("No authenticated user found.");
  }
  let UpdatedEmailBody = emailBody
  .replace("$(first_name)", result[0]) 
  .replace("$(last_name)", result[1])

  UpdatedEmailBody = UpdatedEmailBody
  .replace(/\$\(committee\)/gi, result[5])
  .replace(/\$\(country\)/gi, result[6]);

  console.log(result[5]);
  console.log(result[6]);





  // Email data
  const mailOptions = {
    from: 'allotments.allotrix@gmail.com',
    to: result[2], 
    subject: 'Committee and country allotment | Allotrix testing <> Allotrix',
    html: UpdatedEmailBody,
  };
  console.log("email:",result[2]); 

  if (isValidEmail(result[2].trim()) == true  ) {
    console.log('Valid email address');
  } else {
    console.log('Invalid email address');
    pastetoblacklist(result); //const combinedData = [firstName, lastName, email, phone, munExp, "None",  "None",  "None"];

    consoleLog('Invalid email address, allocation pasted to blacklist');

  }
  


  // Sending the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      consoleLog("Something went wrong, email not sent.");
      console.error('Error: ' + error);
      pastetoblacklist(result);
      consoleLog('Invalid email address, allocation pasted to blacklist');


    } else {
      consoleLog('Email sent with country and committee allotment', "#2CBE53");
      console.log('Email sent: ' + info.response);
    }
  });

  function isValidEmail(email) {
    if (!email) {
      return false; 
    }
  
    const validDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'zoho.com',
      'protonmail.com',
      'aol.com',
      'hotmail.com',
    ];
  
    const domain = email.split('@')[1]; 
    console.log(domain)
    console.log("validDomains.includes(domain): ",validDomains.includes(domain))
    if(validDomains.includes(domain)){
      return true
    }
    else{
      return false
    }
  }
}
}
 


export async function pastetoblacklist(result){

  console.log(result)
  const auth = await getAuthClient3();
  const sheets = google.sheets({ version: 'v4', auth });

  const filePath = path.join(targetFolderPath, "sheet.json");
    const jsonContents = fs.readFileSync(filePath, 'utf8');

    const sheetData = JSON.parse(jsonContents);
    const sheetId = sheetData.sheetid;

    let committeeSheetName = "Blacklist";



     // Determine the last row 
     const committeeSheetValues = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${committeeSheetName}`, 
    });

    // Update the range with the calculated last row
    const committeeSheetLastRow = (committeeSheetValues.data.values.length || 0) + 1;
  
    // Create the value range object with the data
    const valueRange = {
      values: [result], 
    };

    sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${committeeSheetName}!A${committeeSheetLastRow}`,
        valueInputOption: 'RAW',
        resource: valueRange,
      });


      consoleLog("User put to Blacklist")
}

export async function getAllValuesFromBlacklistSheet() {
  const auth = await getAuthClient2();
  const sheets = google.sheets({ version: 'v4', auth });

  const filePath = path.join(targetFolderPath, "sheet.json");
const jsonContents = fs.readFileSync(filePath, 'utf8');

const sheetData = JSON.parse(jsonContents);
const sheetId = sheetData.sheetid;


  const namesAndIDs = await getSheetData(sheets, sheetId);
  const sheetName = 'Blacklist';




    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:Z`, 
    });
  

  // Extract the values from the response
  const values = response.data.values;

  return values;

}