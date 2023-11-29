import { workingContainer } from "./global.js";
const path =  require("path")
const fs =  require("fs");
const { google } = require('googleapis');
const { ipcRenderer } = require("electron");

const nodemailer = require('nodemailer');

import {firebaseConfig } from "../constant/index.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getAuth} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { getFirestore,  doc, getDoc} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

import { getAuthClient1} from "./getAuthClient.js";
import {getSheetData, showLoadingScreen, hideLoadingScreen, consoleLog} from "./index.js";
import {  pastetoblacklist  } from "./index.js";



const folderName = "Allotrix"
const documentsPath = path.join(process.env.HOME || process.env.USERPROFILE, 'Documents');
const targetFolderPath = path.join(documentsPath, folderName);

let subscriptionPurchased = false;
const App = initializeApp(firebaseConfig);
const db = getFirestore(App);

const auth = getAuth(App);




export async function manualEmail(){
    const jsonemailprefFilePath = path.join(targetFolderPath, 'email_pref.json');
    let existingJsonData = JSON.parse(fs.readFileSync(jsonemailprefFilePath, 'utf8'));
  
    if (existingJsonData["automate_email"] == true){
        const popupContainer = document.createElement('div');
        popupContainer.id = 'blacklist-popup-container';
        popupContainer.classList.add('hidden');


        const popup = document.createElement('div');
        popup.classList.add('blacklist-popup');
        popup.style.width = "40%";
        popup.style.height = "35%";



        const popupHeader = document.createElement('div');
        popupHeader.classList.add('blacklist-popup-header');

        const heading = document.createElement('h2');
        heading.textContent = 'Oops!';

        const closeButton = document.createElement('button');
        closeButton.id = 'blacklist-close-popup';
        closeButton.classList.add('blacklist-close-button');
        closeButton.textContent = 'X';

        closeButton.addEventListener('click', () => {
            popupContainer.classList.add('hidden');
        });

        const popupContent = document.createElement('div');
        popupContent.classList.add('blacklistpopup-content');

        const msgDiv = document.createElement("div");
        msgDiv.style.display = "flex";
        msgDiv.style.flexDirection = "column";
        msgDiv.style.alignItems = "center";
        msgDiv.style.gap = "10px";
        msgDiv.style.color = "white";
        msgDiv.style.padding = "20px";
        msgDiv.style.fontSize = "14px";




        const msgDivTag = document.createElement("div");
        msgDivTag.innerHTML = ` <label class="toggle-container">
        <span class="toggle-label">Automate Emails:</span>
        <div style="position: relative;">
        <input type="checkbox" class="toggle-checkbox" id="emailToggle"> 
        </div>
    </label>`

        const msgDivText = document.createElement("h2");
        msgDivText.textContent = "Turn off Email-automation to access.";

        msgDiv.appendChild(msgDivTag);
        msgDiv.appendChild(msgDivText);




        // Append the elements to build the structure
        popupHeader.appendChild(heading);
        popupHeader.appendChild(closeButton);
        popup.appendChild(popupHeader);
        popup.appendChild(popupContent);
        popupContent.appendChild(msgDiv);
        popupContainer.appendChild(popup)

     
        document.body.appendChild(popupContainer);

        if (popupContainer.classList.contains('hidden')) {
            popupContainer.classList.remove('hidden');
        }

}
else{
    // Check if workingContainer has elements with the class name "com-element"
  if (workingContainer.getElementsByClassName("email-element").length === 0) {
    workingContainer.innerHTML = "";
    workingContainer.style.display = "grid"
    workingContainer.style.gridColumn = "span 3";
    workingContainer.style.height = "auto";

    showLoadingScreen()
    try{
      await loadEmailCommittees();
    }
    finally{
      hideLoadingScreen()
    }
    }
}

} 

function createEmailTile(committeeName) {
    const tile = document.createElement('div');
    tile.classList.add('email-element');
    tile.classList.add('email-tile');
    tile.textContent = committeeName;
  
    workingContainer.appendChild(tile);
      
  }

  export async function loadEmailCommittees() {
    try {

      const auth = await getAuthClient1();
      const sheets = google.sheets({ version: 'v4', auth });

      const filePath = path.join(targetFolderPath, "sheet.json");
      const jsonContents = fs.readFileSync(filePath, 'utf8');
      
      const sheetData = JSON.parse(jsonContents);
      const sheetId = sheetData.sheetid;

      const sheetNames = await getSheetData(sheets, sheetId);

      console.log('Sheet Names:', sheetNames);
  
      // Continue with your logic using sheet names...
  
      const pageName = document.getElementById("page-name");
      pageName.textContent = "Verify Data";
 //===----===
    try {
        for (const committeeName of sheetNames[1]) {
            const notCommitte = ["OG", "DUP_CHK", "DUP", "Blacklist", "Waitlist"];

            if (!notCommitte.includes(committeeName)) {
                createEmailTile(committeeName);
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        hideLoadingScreen();
    }

    workingContainer.addEventListener('click', function(event) {
        const clickedElement = event.target;

        if (clickedElement.classList.contains('email-tile')) {
            handleEmailTileClick(clickedElement, sheetId);
        }
    });

    async function handleEmailTileClick(tile, sheetId) {
        const tileName = tile.textContent;
        workingContainer.innerHTML = "";
        workingContainer.style.display = "flex";
        workingContainer.style.flexDirection = "column";
    
        try {
            await createEmailTable(tileName, sheetId);
            console.log(`${tileName} tile is clicked`);
        } catch (error) {
            console.error('Error creating email table:', error.message);
        }
    }

    } catch (error) {
      console.error('Error loading matrix:', error.message);
    }
  }

  //table
  async function createEmailTable(committeeName, sheetId) {
    showLoadingScreen();
    workingContainer.innerHTML = "";

    try {
        const auth = await getAuthClient1();
        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `${committeeName}!A1:Z`,
        });

        const values = response.data.values;
        const valuesWithoutHeader = values.slice(1);
        console.log(values);
        console.log(valuesWithoutHeader);

        
        if (workingContainer.childElementCount == 0) {


        // Search bar
        const searchBar = document.createElement("input");
        searchBar.type = "text";
        searchBar.placeholder = "Search...";
        searchBar.classList.add("search-email-bar");

        const clearButton = document.createElement("button");
        clearButton.textContent = "Back";
        clearButton.classList.add("add-button");

        const sendEmailButton = document.createElement("button");
        sendEmailButton.textContent = "Send Emails";
        sendEmailButton.classList.add("normal-button");

        const searchContainer = document.createElement("div");
        searchContainer.classList.add("search-email-container");

        const searchIcon = document.createElement("i");
        searchIcon.className = "fas fa-search";
        searchIcon.style.color = "white";

        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchBar);
        searchContainer.appendChild(clearButton);
        searchContainer.appendChild(sendEmailButton);

        const tableContainer = document.createElement("div");
        tableContainer.id = 'table-email-container';

        const table = document.createElement("table");
        table.classList.add("custom-email-table");

        const thead = document.createElement("thead");

        const committeeNameRow = document.createElement("tr");
        const committeeNameCell = document.createElement("th");
        committeeNameCell.textContent = committeeName;
        committeeNameCell.setAttribute("colspan", "8");
        committeeNameRow.appendChild(committeeNameCell);
        thead.appendChild(committeeNameRow);

        const subHeadings = ['FIRST NAME', 'LAST NAME', 'EMAIL', 'MUN RANK', 'COMMITTEE', 'COUNTRY', 'CATEGORY'];

        const subHeadingRow = document.createElement("tr");
        subHeadings.forEach(subHeading => { 
            const subHeadingCell = document.createElement("th");
            subHeadingCell.textContent = subHeading;
            subHeadingRow.appendChild(subHeadingCell);
        });
        thead.appendChild(subHeadingRow);

        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        const totalRows = Math.max(...valuesWithoutHeader.map(row => row.length));
        for (let i = totalRows - 1; i >= 0; i--) {
            const emailStatusIndex = 8;
        
            if (
                valuesWithoutHeader[i] &&
                valuesWithoutHeader[i].some(cell => cell.trim() !== '') &&
                valuesWithoutHeader[i][emailStatusIndex]?.trim() !== 'email sent'
            ) {
        
                if (valuesWithoutHeader[i].includes('email sent')) {
                    valuesWithoutHeader.splice(i, 1);
                }
        
                const row = document.createElement('tr');
        
                // Specify the indices you want to include in the new row
                const includedIndices = [0, 1, 2, 4, 5, 6, 7];
        
                includedIndices.forEach(index => {
                    const dataCell = document.createElement('td');
                    dataCell.textContent = valuesWithoutHeader[i]?.[index] || '';
                    row.appendChild(dataCell);
                });
        
                // Alternating row colors
                if (i % 2 === 0) {
                    row.classList.add('even-row');
                } else {
                    row.classList.add('odd-row');
                }
        
                tbody.appendChild(row);
            }
        }
        
        
        
        

        table.appendChild(tbody);

        // The table style
        tableContainer.style.height = "90vh";
        tableContainer.style.width = "100%";
        tableContainer.style.overflowY = "auto";

        tableContainer.appendChild(table);
        workingContainer.appendChild(searchContainer);
        workingContainer.appendChild(tableContainer);

        function filterTable(searchText) {
            const rows = tableContainer.querySelectorAll("tbody tr");
            rows.forEach(row => {
                const columns = row.querySelectorAll("td");
                let shouldDisplay = false;

                columns.forEach(column => {
                    const columnText = column.textContent.toLowerCase();
                    if (columnText.includes(searchText.toLowerCase())) {
                        shouldDisplay = true;
                    }
                });

                if (shouldDisplay) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        }

        // Event listener for the search bar
        searchBar.addEventListener("input", function () {
            const searchText = searchBar.value.trim();
            filterTable(searchText);
        });

        // Event listener for the clear button
        clearButton.addEventListener("click", async function () {
            workingContainer.innerHTML = "";
            workingContainer.style.display = "grid";
            workingContainer.style.gridColumn = "span 3";
            workingContainer.style.height = "auto";

            showLoadingScreen();
            try {
                await loadEmailCommittees();
            } finally {
                hideLoadingScreen();
            }
        });
        sendEmailButton.addEventListener("click", async () => {
            const confirmed = window.confirm("Are you sure you want to send emails?");
        
            if (confirmed) {
                const rows = tbody.querySelectorAll("tr");

                showLoadingScreen()
                try{
                for (const row of rows) {
                    const cells = row.querySelectorAll("td");
        
                    const firstName = cells[0].textContent;
                    const lastName = cells[1].textContent;
                    const emailId = cells[2].textContent;
                    const committee = cells[4].textContent;
                    const country = cells[5].textContent;
                    const pertinency = cells[6].textContent;
        
                    // Call the function to send the verified email
                    await sendVerifiedEmail(firstName, lastName, emailId, committee, country, pertinency);
        
                    // Add a class to dim the processed row
                    row.classList.add("processed-row");
                }
              }
              finally{
                hideLoadingScreen();
                ipcRenderer.send("reload-window");

              }
            }
        });
        
    }
    } finally {
        hideLoadingScreen();
    }

}
  
async function checkSubscription(){
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
  
async function sendVerifiedEmail(firstName, lastName, emailId, committee, country, pertinency){

await checkSubscription();
  
if (subscriptionPurchased === false){
     console.log("Buy Premium version to send automatic emails", "red")
  return;
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
      console.log("No Email template found in database.");
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
       console.log("No authenticated user found.");
  }
  let UpdatedEmailBody = emailBody
  .replace("$(first_name)", firstName) 
  .replace("$(last_name)", lastName)

  UpdatedEmailBody = UpdatedEmailBody
  .replace(/\$\(committee\)/gi, committee)
  .replace(/\$\(country\)/gi, country);




  // Email data
  const mailOptions = {
    from: 'allotments.allotrix@gmail.com',
    to: emailId, 
    subject: 'Committee and country allotment |  Allotrix',
    html: UpdatedEmailBody,
  };
  console.log("email:",emailId);

  if (isValidEmail(emailId.trim()) == true  ) {
    console.log('Valid email address');
  } else {
    console.log('Invalid email address');
    pastetoblacklist([firstName, lastName, emailId, "", "", country, committee, pertinency]);
    console.log('Invalid email address, allocation pasted to blacklist');

  }
  


  // Sending the email
  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
         console.log("Something went wrong, email not sent.");
      console.error('Error: ' + error);
      pastetoblacklist([firstName, lastName, emailId, "-", "-", country, committee, pertinency]);
      console.log('Invalid email address, allocation pasted to blacklist');


    } else {
      console.log('Email sent: ' + info.response);
      await updateSheetByEmail(firstName, lastName, emailId, committee, country,)

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



async function updateSheetByEmail(firstName, lastName, emailId, committee, country) {
    console.log("update sheet", emailId);
    console.log("update sheet", committee);
    console.log("update sheet", firstName);
    console.log("update sheet", lastName);

    try {
        const auth = await getAuthClient1();
        const sheets = google.sheets({ version: 'v4', auth });

        const filePath = path.join(targetFolderPath, "sheet.json");
        const jsonContents = fs.readFileSync(filePath, 'utf8');

        const sheetData = JSON.parse(jsonContents);
        const sheetId = sheetData.sheetid;

        const range = `${committee}!A:Z`;  // Assuming your sheet has columns up to 'Z'

        const valuesResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: range,
        });

        const values = valuesResponse.data.values;

        for (let i = 0; i < values.length; i++) {  
            const currentEmailId = values[i][2];  
            if (currentEmailId === emailId) {
                values[i][8] = 'email sent';
            }
        }

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: range,
            valueInputOption: 'RAW',
            resource: { values: values },
        });

        console.log(`Updated rows for ${firstName} ${lastName} in committee ${committee} with email sent status.`);
    } catch (error) {
        console.error('Error updating sheet:', error);
    }
}
