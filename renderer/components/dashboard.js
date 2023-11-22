//node imports
const fs = require('fs');
const path = require("path");
const { ipcRenderer } = require("electron");

//firebase imports

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, updateDoc, getDoc} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import { getDatabase, ref, get} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-database.js";
import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL, } from 'https://www.gstatic.com/firebasejs/10.2.0/firebase-storage.js';

import {firebaseConfig } from "../constant/index.js";


//other imports
import { matrixButton, loadMatrix, spreadsheetMessageAdded, settings,account, workingContainer, createFieldContainer, setUpContainer, nextBtnContainer, extraFieldContainer, loadCommittees, fieldIndex, showLoadingScreen, hideLoadingScreen,} from "./index.js";
import {Alotter, getAllValuesFromDUPSheet, getAllValuesFromDUP_CHKSheet, 
  getAllValuesFromWaitlistSheet, createFileInFolder, processOGData, manualEmail,
  versionChecker, defaultnotificationChecker, adminNotificationChecker, newRegistrationNotificationChecker, 
  getAllValuesFromBlacklistSheet, disablePremiumCards} from "./index.js"


//firebase init
const App = initializeApp(firebaseConfig);
const auth = getAuth(App);
const db = getFirestore(App);
const storage = getStorage(App);
const usersCollection = collection(db, "users");


let intervalId = null;

//DOM Elements
export let dashb = document.getElementById("dashboard");
export let addCommittees = document.getElementById("add-committees");
export let settingsBtn = document.getElementById("settings");
export const consoleOutput = document.getElementById("console-output");
export const setUpBtn = document.getElementById("set-up");

const profileEditButton = document.getElementById("edit");
const profileLogoutButton = document.getElementById("profile-logout");

const orgName = document.getElementById("org-name");
const pfp = document.getElementById("pfp");
const pageName = document.getElementById("page-name");
const setUp = document.getElementById("set-up")
const addComBtn = document.getElementById("add-committees")
const matrixBtn = document.getElementById("matrix")
const dash = document.getElementById("dashboard");
const automationButton = document.getElementById("automator-card")


const folderName = "Allotrix"
const documentsPath = path.join(process.env.HOME || process.env.USERPROFILE, 'Documents');
const targetFolderPath = path.join(documentsPath, folderName);


//event listeners

profileEditButton.addEventListener("click", ()=>{
  workingContainer.innerHTML = "";
  workingContainer.style.display="flex";
  settings();
  account();
})

document.addEventListener("DOMContentLoaded", async function() {
  if (workingContainer.innerHTML === "") {

    
    showLoadingScreen()
    try{
       dashboard();
  
    }
    finally{
      hideLoadingScreen()
    }
  }
});

dashb.addEventListener("click", async function () {

  // Check if workingContainer has elements with the class name "dashboard-element"
  if (workingContainer.getElementsByClassName("dashboard-element").length === 0) {
    workingContainer.innerHTML = "";
    workingContainer.style.height = "100%";

    await dashboard();

  }
});

setUpBtn.addEventListener("click", function() {
  workingContainer.innerHTML="";
  workingContainer.style.display = "flex";
  workingContainer.style.flexDirection = "column";

  setupData();
  
});

addCommittees.addEventListener("click", async function() {
  
  // Check if workingContainer has elements with the class name "com-element"
  if (workingContainer.getElementsByClassName("com-element").length === 0) {
    workingContainer.innerHTML = "";
    workingContainer.style.display = "grid"
    workingContainer.style.gridColumn = "span 3";
    workingContainer.style.height = "auto";

    showLoadingScreen()
    try{
      await loadCommittees();

    }finally{
      hideLoadingScreen
    }
  }
});

matrixButton.addEventListener("click", async function() {
  // Check if workingContainer has elements with the class name "com-element"
  if (workingContainer.getElementsByClassName("matrix-element").length === 0) {
    workingContainer.innerHTML = "";
    workingContainer.style.display = "grid"
    workingContainer.style.gridColumn = "span 3";
    workingContainer.style.height = "auto";

    showLoadingScreen()
    try{
      await loadMatrix();
    }
    finally{
      hideLoadingScreen()
    }
    }

  

})

settingsBtn.addEventListener("click", function() {
  workingContainer.innerHTML = "";
  workingContainer.style.display = "flex"
  workingContainer.style.height = "auto";

  showLoadingScreen()
  try{
    settings()
    account()
  }finally{
    hideLoadingScreen()
  }

});

profileLogoutButton.addEventListener("click", async function(){

  const confirmLogout = window.confirm("Are you sure you want to log out?");
          if (confirmLogout) {
              Logout();
          }

          async function Logout() {
            // Set algo running to false
            const userId = auth.currentUser.uid;
            const userDocRef = doc(usersCollection, userId);
          
            await updateDoc(userDocRef, { algorithmRunning: false });
          
            signOut(auth)
              .then(async () => {
                // Remove CREDs
                const filePathCRED = path.join(targetFolderPath, "CRED.json");

                if (fs.existsSync(filePathCRED)) {
                  try {
                    fs.unlinkSync(filePathCRED);
                    console.log("CRED file deleted successfully");
                  } catch (err) {
                    console.error("Error deleting CRED file:", err);
                  }
                } else {
                  console.log("CRED file not found.");
                }
          
                // Remove sheet.json
                const filePathSheet = path.join(targetFolderPath, "sheet.json");
                if (fs.existsSync(filePathSheet)) {
                  try {
                    fs.unlinkSync(filePathSheet);
                    console.log("sheet.json file deleted successfully");
                  } catch (err) {
                    console.error("Error deleting sheet.json file:", err);
                  }
                } else {
                  console.log("sheet.json file not found.");
                }
          
                // Remove version.json
                const filePathVersion = path.join(targetFolderPath, "version.json");
                if (fs.existsSync(filePathVersion)) {
                  try {
                    fs.unlinkSync(filePathVersion);
                    console.log("version.json file deleted successfully");
                  } catch (err) {
                    console.error("Error deleting version.json file:", err);
                  }
                } else {
                  console.log("version.json file not found.");
                }
          
                ipcRenderer.send("reload-window");
                console.log("Sign-out successful");
              })
              .catch((error) => {
                console.log("logout error: ", error);
              });
          }
          
  
})

//====FUNCTIONS =======================

//global function variables
let algo_running = false;
var page_enter = false
let isExecuting = false;
let allotmentCount = 0;




export async function dashboard() {
  showLoadingScreen();
  try{
  workingContainer.style.padding = '15px';
  workingContainer.style.display = 'grid';
  workingContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
  //workingContainer.style.gridTemplateRows = 'repeat(1, 1fr)';
  workingContainer.style.overflowY = 'scroll';
  workingContainer.style.justifyItems = 'center';
  workingContainer.style.alignItems = 'center';
  workingContainer.style.width = '100%';


  //set page name
  pageName.textContent = "Dashboard";

    //check if matrix exists, to disable buttons.
    async function checkMatrixNodeInFirebase() {


      const user = auth.currentUser;
      if (!user) {
        console.error("User not authenticated.");
        return;
      }
    
      const userId = user.uid;
      const realDb = getDatabase(App);
      const matrixRef = ref(realDb, `${userId}/matrix`);
    
      try {
        // Check if the "matrix" node exists
        const snapshot = await get(matrixRef);
        if (snapshot.exists()) {
          console.log('Matrix node exists in Firebase.');
    
          setUp.disabled = true;
          setUp.style.pointerEvents = 'none';
          setUp.style.opacity = '0.5';
       
        } else {

          const doSetup = window.confirm("Looks like you haven't setup your automation preferences. Please setup to proceed");
          if (doSetup) {
            workingContainer.innerHTML="";
            workingContainer.style.display = "flex";
            workingContainer.style.flexDirection = "column";

              setupData();
              console.log("setupData clicked");
          }else{
            doSetup()

          }
        
          console.log('Matrix node does not exist in Firebase.');
    
          
     
          addComBtn.disabled = true;
          addComBtn.style.pointerEvents = 'none';
          addComBtn.style.opacity = '0.5';
  
          dash.disabled = true;
          dash.style.pointerEvents = 'none';
          dash.style.opacity = '0.5';
  
          matrixBtn.disabled = true;
          matrixBtn.style.pointerEvents = 'none';
          matrixBtn.style.opacity = '0.5';

        }
      } catch (error) {
        console.error('Error checking matrix node in Firebase:', error);
      }
    }
    document.addEventListener('DOMContentLoaded', checkMatrixNodeInFirebase());


  //all variables init
  let totalSeats=0;
  let occupiedSeats = 0;
  let waitingList = 0;
  let waitingListSize = 0;
  let progress=0;

  
  //card1

  //<section1 >
  const sec1 = document.createElement("div");
  sec1.classList.add("secs")
  sec1.style.display = "grid"

  //<\section1 >

  //<section2>
  const sec2 = document.createElement("div");
  sec2.classList.add("secs")
  sec2.style.display = "grid"
  sec2.style.gridTemplateRows = 'repeat(1, 1fr) repeat(1, .5fr) repeat(1, 1fr) repeat(1, 1.5fr)';



  //<\section2 >

  //<section3 >
  const sec3 = document.createElement("div");
  sec3.classList.add("secs");
  sec3.style.display = "grid"
  sec3.style.gridTemplateRows = 'repeat(1, 2fr) repeat(1, 1fr) repeat(1, 1fr)';

  //<\section3 >

  const card = document.createElement("div");
  card.className = "card dashboard-element";


  const Occupancy = document.createElement("h1");
  Occupancy.textContent = `Occupancy`
  card.appendChild(Occupancy);
  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
    progressBar.style.background = "linear-gradient(to right, #d98208, #db0606)";

  

  const progressElement = document.createElement("div");
  progressElement.className = "progress";
  progressElement.textContent = `${progress.toFixed(2)}%`;
  

  const seatText = document.createElement("h2");
  seatText.textContent = `${occupiedSeats}/${totalSeats}`

  const seatText2 = document.createElement("h2");
  seatText2.textContent = `seats are occupied`

  progressBar.appendChild(progressElement);
  card.appendChild(progressBar);
  card.appendChild(seatText);
  card.appendChild(seatText2);

  sec1.appendChild(card);

  //card 2
  const card2 = document.createElement("div");
  card2.className = "card dashboard-element premium";

  card2.style.background = "#D9D9D9";
  card2.style.justifyContent = "end"
  card2.style.padding = "20px"

  const text2 = document.createElement("h1");
  text2.style.fontSize = "1.8em";
  text2.style.color = "black";

  const viewButton2 = document.createElement("button");
  viewButton2.className = "normal-button";
  viewButton2.textContent = "View Full Report";
  viewButton2.style.border = "1px solid white";

  viewButton2.style.fontSize = "1.5em";

  card2.appendChild(text2);
  card2.appendChild(viewButton2);
  sec2.appendChild(card2);

  //manual email card
  const manualEmailCard = document.createElement("div");
  manualEmailCard.className = "card dashboard-element premium";

  manualEmailCard.style.background = "#D9D9D9";
  manualEmailCard.style.justifyContent = "end"
  manualEmailCard.style.padding = "20px"

  const manualEmailCardtext = document.createElement("h1");
  manualEmailCardtext.style.fontSize = "1.8em";
  manualEmailCardtext.style.color = "black";

  const manualEmailCardviewButton= document.createElement("button");
  manualEmailCardviewButton.className = "normal-button";
  manualEmailCardviewButton.id = "manual-email-card-view-button"
  manualEmailCardviewButton.textContent = "Verify Allotments";
  manualEmailCardviewButton.style.border = "1px solid white";
  manualEmailCardviewButton.style.fontSize = "1.5em";

  manualEmailCard.appendChild(manualEmailCardtext);
  manualEmailCard.appendChild(manualEmailCardviewButton);
  sec2.appendChild(manualEmailCard);

  manualEmailCardviewButton.addEventListener("click", ()=>{
    manualEmail();
  })



  


  //card 3 Notification card
  const card3 = document.createElement("div");
  card3.className = "card dashboard-element";

  //card3.style.height = "30%";
  card3.style.background = "#313236";
  card3.style.paddingLeft = "20px";
  card3.style.paddingRight = "20px";
  card3.style.paddingTop = "10px";
  card3.style.overflowY = "auto";

  //card3.style.minHeight = "50%";




  const notifHeading = document.createElement("div");
  notifHeading.id = "notif-heading";


  const notifText = document.createElement("h1");
  notifText.id = "notif-heading-text";
  notifText.textContent = "Notifications";

  const notifAnchor = document.createElement("a");
  notifAnchor.id = "notif-heading-a";
  notifAnchor.textContent = "clear"

  


  notifHeading.appendChild(notifText);
  notifHeading.appendChild(notifAnchor);

  card3.appendChild(notifHeading);

  const notifOutput = document.createElement("div");
  notifOutput.id = "notif-output";
  notifOutput.style.borderRadius = "0 0 23px 23px";

  



  card3.appendChild(notifOutput);

  notifAnchor.addEventListener("click", ()=>{
    notifOutput.innerHTML = "";
  })

  sec3.appendChild(card3);

  

   // Card 7 email view card
  
   const card7 = document.createElement("div");
   card7.className = "card dashboard-element premium";

 
   //card7.style.height = "30%";
   card7.style.padding = "12px";
   card7.style.backgroundColor = "#D9D9D9";
 
   const card7Button = document.createElement("button");
   card7Button.classList.add("normal-button");
   card7Button.textContent = "Email Preview"

   card7Button.style.fontSize = "1.2em";
   card7Button.style.border = "1px solid white";

 
 
   
   card7.appendChild(card7Button);
 
 
 
   sec3.appendChild(card7);


  
   card7Button.addEventListener("click", async ()=>{
    const popupContainer = document.createElement('div');
    popupContainer.id = 'email-popup-container';
    popupContainer.classList.add('hidden');

    const popup = document.createElement('div');
    popup.classList.add('email-popup');

    const popupHeader = document.createElement('div');
    popupHeader.classList.add('email-popup-header');

    const heading = document.createElement('h2');
    heading.textContent = 'Email Template Preview';

    const emailCloseButton = document.createElement('button');
    emailCloseButton.id = 'email-close-popup';
    emailCloseButton.classList.add('email-close-button');
    emailCloseButton.textContent = 'X';

    const popupContent = document.createElement('div');
    popupContent.classList.add('emailpopup-content');

    // Append the elements to build the structure
    popupHeader.appendChild(heading);
    popupHeader.appendChild(emailCloseButton);
    popup.appendChild(popupHeader);
    popup.appendChild(popupContent);

   
    popupContainer.appendChild(popup);

    const jsonFileName = 'emailHTML.json';

const emailFilePath = path.join(targetFolderPath, jsonFileName);


const EmailPreview = document.createElement("iframe");
EmailPreview.classList.add("email-preview");


try {
  const readData = await JSON.parse(fs.readFileSync(emailFilePath, 'utf8'));
  const emailBody = readData.html;

  

  // Create a data URL with the HTML content
  const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(emailBody);
  EmailPreview.src = dataUrl;
  popupContent.appendChild(EmailPreview);
} catch (error) {
  console.error('Error reading and displaying email HTML:', error);
}




    popupContent.appendChild(EmailPreview)


    






    document.body.appendChild(popupContainer);




    


    if (popupContainer.classList.contains('hidden')) {
      popupContainer.classList.remove('hidden');
    }







    emailCloseButton.addEventListener('click', () => {
      popupContainer.classList.add('hidden');
    });


   });

 
 
 
    // Card 8 black list viewer card

    const card8 = document.createElement("div");
   card8.className = "card dashboard-element";
 
   card8.style.padding = "12px";
   card8.style.backgroundColor = "#D9D9D9";
 
   const card8Head = document.createElement("h1");
   card8Head.id = "card-7-head";
   card8Head.textContent = "Blacklist Data";
 
 
 
   const card8Button = document.createElement("button");
   card8Button.classList.add("normal-button");
   card8Button.textContent = "View"
 
 
   
   card8.appendChild(card8Head);
   card8.appendChild(card8Button);
 
 
 
   sec3.appendChild(card8);

   //black list event listener
   card8Button.addEventListener("click", async ()=>{
    const popupContainer = document.createElement('div');
    popupContainer.id = 'blacklist-popup-container';
    popupContainer.classList.add('hidden');

    const popup = document.createElement('div');
    popup.classList.add('blacklist-popup');


    const popupHeader = document.createElement('div');
    popupHeader.classList.add('blacklist-popup-header');

    const heading = document.createElement('h2');
    heading.textContent = 'Blacklisted Participants';

    const BlacklistCloseButton = document.createElement('button');
    BlacklistCloseButton.id = 'blacklist-close-popup';
    BlacklistCloseButton.classList.add('blacklist-close-button');
    BlacklistCloseButton.textContent = 'X';

    const popupContent = document.createElement('div');
    popupContent.classList.add('blacklistpopup-content');

    // Append the elements to build the structure
    popupHeader.appendChild(heading);
    popupHeader.appendChild(BlacklistCloseButton);
    popup.appendChild(popupHeader);
    popup.appendChild(popupContent);

   
 //start table
    const tableContainer = document.createElement("div");
    tableContainer.id = 'blacklist-table-container';

    const table = document.createElement("table");
    table.classList.add("blacklist-custom-table");

    const thead = document.createElement("thead");

    const headerRow = document.createElement("tr");

    // Define your custom column headers here
    const columnHeaders = ["FIRST NAME", "LAST NAME", "EMAIL", "PHONE", "MUN EXP", "COMMITTEE", "COUNTRY", "CATEGORY"];

    columnHeaders.forEach(headerText => {
      const headerCell = document.createElement("th");
      headerCell.textContent = headerText;
      headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);

    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    // Sample data for the table
    showLoadingScreen();
    try{
      let sampleData =  await getAllValuesFromBlacklistSheet();
      sampleData = sampleData.slice(1);
      sampleData.forEach(dataRow => {
        const row = document.createElement("tr");
  
        dataRow.forEach(data => {
          const dataCell = document.createElement("td");
          dataCell.textContent = data;
          row.appendChild(dataCell);
        });
  
        // Alternating row colors
        if (sampleData.indexOf(dataRow) % 2 === 0) {
          row.classList.add("even-row");
        } else {
          row.classList.add("odd-row");
        }
  
        tbody.appendChild(row);
      });
  
      table.appendChild(tbody);

      console.log(`sample data is: ${sampleData}`);

      
    }catch(error){
      console.error("error: ", error)
    }
    finally{
      hideLoadingScreen()
    }
   

    


    tableContainer.appendChild(table);

    popup.appendChild(tableContainer)


        popupContainer.appendChild(popup);


    // Add the popup container to the document
    document.body.appendChild(popupContainer);

    


    if (popupContainer.classList.contains('hidden')) {
      popupContainer.classList.remove('hidden');
    }







    BlacklistCloseButton.addEventListener('click', () => {
      popupContainer.classList.add('hidden');
    });


   });
   
   



 

 // Card 4
  const card4 = document.createElement("div");
  card4.className = "card dashboard-element";

  card4.style.height = "100%";
  card4.style.padding = "12px";
  card4.style.backgroundColor = "#D9D9D9";

  
  const waitingListBarContainer = document.createElement("div");
  waitingListBarContainer.className = "progress-bar-container";
  waitingListBarContainer.style.height = "25px";
  waitingListBarContainer.style.width = "100%";
  waitingListBarContainer.style.borderRadius = "23px";
  
  
  const waitingListBar = document.createElement("div");
  waitingListBar.className = "progress-bar2";
  waitingListBar.style.backgroundColor = "black";
  waitingListBar.style.height = "100%";
  waitingListBar.style.width = "100%";
  waitingListBar.style.borderRadius = "23px";
  
  const waitingListFill = document.createElement("div");
  waitingListFill.className = "progress-fill";
  waitingListFill.style.width = `${waitingList.toFixed(2)}%`; 
  waitingListFill.style.background = "linear-gradient(to right, #d98208, #db0606)";
  waitingListFill.style.borderRadius = "23px";

  waitingListFill.style.height = "100%"
  
  const textBelowWaitingListBar = document.createElement("h3");
  textBelowWaitingListBar.textContent = `People in Waiting List: ${waitingList}%`;
  
  waitingListBar.appendChild(waitingListFill);
  waitingListBarContainer.appendChild(waitingListBar);
  card4.appendChild(waitingListBarContainer);
  card4.appendChild(textBelowWaitingListBar);
  
  sec1.appendChild(card4);


  //card 6
  const card6 = document.createElement("div");
  card6.className = "card dashboard-element";

  card6.id = "automator-card";

  const text6 = document.createElement("h1");
  

  const automateButton6 = document.createElement("button");
  automateButton6.className = "normal-button";
  automateButton6.id = "automator-card-button";

  card6.style.backgroundImage = "linear-gradient(to top, rgba(255, 0, 0, 0.5) 50%, rgba(204, 0, 0, 0.5) 50%), url('assets/red-gears.jpg')";
  card6.style.backgroundSize = "cover";

  text6.textContent = "Automator";
  text6.id = "automator-card-text";
  text6.style.fontSize = "1.8em";
  text6.style.color = "white";

  automateButton6.textContent = "Checking...";
  automateButton6.style.backgroundImage = "linear-gradient(to bottom, grey, black)";
  automateButton6.style.fontSize = "1.5em";

  

  card6.appendChild(text6);
  card6.appendChild(automateButton6);
 
  sec2.appendChild(card6);

  //card 5
  const card5 = document.createElement("div");
  card5.className = "card dashboard-element";

  card5.style.height = "100%";
  card5.style.background = "black";
  card5.style.overflowY = "auto";


  const consoleHeading = document.createElement("div");
  consoleHeading.id = "console-heading";
  


  const headingText = document.createElement("h1");
  headingText.textContent = "</> Console";
  headingText.id = "console-heading-text";

  consoleHeading.appendChild(headingText);
  card5.appendChild(consoleHeading);

  const consoleOutput = document.createElement("div");
  consoleOutput.id = "console-output";


  consoleOutput.style.borderRadius = "0 0 23px 23px";

  consoleOutput.textContent = ">>> Algorithm turned off.."


  card5.appendChild(consoleOutput);

  sec2.appendChild(card5);

  

  workingContainer.appendChild(sec1);
  workingContainer.appendChild(sec2)
  workingContainer.appendChild(sec3)

  await updateCardValues();


  //added all cards=============================================

  //updating the card stats
  async function updateCardValues(){
    await disablePremiumCards();


   // Updating name and pfp
if (orgName.textContent === "Account Name") {
  const USER = auth.currentUser;
  if (USER) {
    const UID = USER.uid;
    const userDocRef = doc(db, "users", UID);

    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    orgName.textContent = userData.name;

    const storageRef = sRef(storage, `${UID}/pfp.png`);

    try {
       
      if(storageRef){
        let downloadURL = await getDownloadURL(storageRef);
      

      if (downloadURL) {
        pfp.src = "";
        pfp.style.backgroundImage = `url(${downloadURL})`;
        pfp.style.backgroundSize = "cover";
        pfp.style.backgroundRepeat = "no-repeat";
        pfp.style.backgroundClip = "content-box";
      }
    }
    } catch (error) {
      
      const defaultImageUrl = "./assets/default.jpeg";
      

      // Set the background image to the default image
      pfp.src = "";
      pfp.style.backgroundImage = `url(${defaultImageUrl})`;
      pfp.style.backgroundSize = "cover";
      pfp.style.backgroundRepeat = "no-repeat";
      pfp.style.backgroundClip = "content-box";
    }
  }
}

    //update card 1
    occupiedSeats = await getAllValuesFromDUP_CHKSheet();

    const user = auth.currentUser;
      if (!user) {
        console.error("User not authenticated.");
        return;
      }
    
      const userId = user.uid;
      const realDb = getDatabase(App);
      const matrixRef = ref(realDb, `${userId}/matrix`);

        const matrixSnapshot = await get(matrixRef);
    
        if (matrixSnapshot.exists()) {
          matrixSnapshot.forEach((childNodes) => {
            childNodes.forEach((children) => {
              children.forEach((contries) => {
                totalSeats++;
              });
            });
          });
    
          // Return the totalSeats count
          console.log("Total Seats: " + totalSeats);
        } else {
          console.error("No data found at matrix location.");
        }


    progress = (occupiedSeats / totalSeats) * 100;
    progressElement.textContent = `${progress.toFixed(2)}%`;
    seatText.textContent = `${occupiedSeats}/${totalSeats}`


    


    //update card 4
    waitingListSize = await getAllValuesFromWaitlistSheet();
    waitingList = (waitingListSize / totalSeats) * 100;

    waitingListFill.style.width = `${waitingList.toFixed(2)}%`; 
    textBelowWaitingListBar.textContent = `People in Waiting List: ${waitingList.toFixed(2)}%`;






    //update card 6
    try{
      if(algo_running === false){
      card6.style.backgroundImage = "linear-gradient(to top, rgba(255, 0, 0, 0.5) 50%, rgba(204, 0, 0, 0.5) 50%), url('assets/red-gears.jpg')";
      card6.style.backgroundSize = "cover";
    
      text6.textContent = "Automate";
      text6.style.fontSize = "1.8em";
      text6.style.color = "white";
    
      automateButton6.textContent = "Start";
      automateButton6.style.backgroundImage = "linear-gradient(to bottom, #00FF00, #00CC00)";
      automateButton6.style.fontSize = "1.5em";
    
    
      }else if (algo_running === true){
        card6.style.backgroundImage = "linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://cdn.pixabay.com/photo/2016/08/06/11/08/arrows-1574168_1280.jpg')";
        card6.style.backgroundSize = "cover";
        text6.textContent = "Automating...";
        text6.style.color = "white"
        card6.style.boxShadow = "0 0 20px green";
        automateButton6.style.background = "linear-gradient(to top, #FF0000, #CC0000)";
        automateButton6.textContent = "Stop";
        card6.classList.add("glow");
    
      }
    }catch (error) {
        console.error("Error getting user document:", error);
      }

  }


  if (page_enter === false) {
    clearInterval(intervalId); // Clear any existing interval

    let intervalSeconds = 7000;  // Default interval

    if (allotmentCount >= 75) {
      intervalSeconds = 14000; 
      allotmentCount = 0;

    }
    console.log("interval seconds: ", intervalSeconds)

    intervalId = setInterval(runAlgorithm, intervalSeconds);

    let notificationRunner = setInterval(notificationLoader, 60000);
  
    page_enter = true;
  }
  

    //automation event listener
    automateButton6.addEventListener("click", async function() {
      if (automateButton6.textContent === "Start") {
        
        try {
  
          algo_running = true;
    
          card6.style.backgroundImage = "linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://cdn.pixabay.com/photo/2016/08/06/11/08/arrows-1574168_1280.jpg')";
          card6.style.backgroundSize = "cover";
          text6.textContent = "Automating...";
          card6.style.boxShadow = "0 0 20px green";
          automateButton6.style.background = "linear-gradient(to top, #FF0000, #CC0000)";
          automateButton6.textContent = "Stop";
          card6.classList.add("glow");

          consoleLog("Algoirthm Running...")
        } catch (error) {
          console.error("Error updating algorithmRunning:", error);
        }
      } else {
        
        try {
          algo_running = false;
          isExecuting = false;
          allotmentCount = 0;



          text6.textContent = "Automator";
          card6.style.backgroundImage = "linear-gradient(to top, rgba(255, 0, 0, 0.5) 50%, rgba(204, 0, 0, 0.5) 50%), url('assets/red-gears.jpg')";
          card6.style.backgroundSize = "cover";
          automateButton6.style.background = "linear-gradient(to bottom, #00FF00, #00CC00)";
          card6.style.boxShadow = "0 0 20px red";
          automateButton6.textContent = "Start";
          card6.classList.remove("glow");
          consoleLog("Algorithm stopped.")
        } catch (error) {
          console.error("Error updating algorithmRunning:", error);
        }
      }
    });
    defaultnotificationChecker();

}
finally{
  hideLoadingScreen()
}
  }

export async function notificationLoader(){
  newRegistrationNotificationChecker();
versionChecker();
adminNotificationChecker()
.then(()=>{
  defaultnotificationChecker()

});
  
}

export function setupData() {

  pageName.textContent = "SetUP ";

  setUpContainer.innerHTML = "";
  if (workingContainer.innerHTML === "") {

    workingContainer.innerHTML = "";
    workingContainer.style.height = "95vh";
    workingContainer.appendChild(setUpContainer)

    setUpContainer.style.display = "flex";
    setUpContainer.style.flexDirection = "column";
    setUpContainer.style.maxHeight = "80vh";
    setUpContainer.style.position = "top";

    setUpContainer.style.scrollBar = "hidden";
    setUpContainer.style.display = "flex";
    setUpContainer.style.flexDirection = "column"




    const addcomsText = document.createElement('h1');
    addcomsText.textContent = "ADD COMMITTEES"
    setUpContainer.appendChild(addcomsText);

    const defaultFieldContainer = createFieldContainer();
    setUpContainer.appendChild(defaultFieldContainer);
    
    const removeBtn = document.getElementById("remove-button");

    removeBtn.remove();



    setUpContainer.appendChild(extraFieldContainer)

    
      setUpContainer.appendChild(nextBtnContainer);
    
  }
}



async function test_subject() {
  if (algo_running == true && isExecuting == false) {
    
    await processOGData(); 
    let data = await getAllValuesFromDUPSheet(); //returns values in DUP sheet

    //specific indexes
    let headerrow = data[0]
    const firstname = headerrow.findIndex((header) => header.toLowerCase() === 'first name');
    const lastname = headerrow.findIndex((header) => header.toLowerCase() === 'last name');
    const email = headerrow.findIndex((header) => header.toLowerCase() === 'email id');
    const phone = headerrow.findIndex((header) => header.toLowerCase() === 'phone');
    const pref1 = headerrow.findIndex((header) => header.toLowerCase() === 'committee preference 1');
    const pref2 = headerrow.findIndex((header) => header.toLowerCase() === 'committee preference 2');
    const mun_exp = headerrow.findIndex((header) => header.toLowerCase() === 'previous mun experience count');
    const bd = headerrow.findIndex((header) => header.toLowerCase() === 'best delegate');
    const hc = headerrow.findIndex((header) => header.toLowerCase() === 'high commendation');
    const spec = headerrow.findIndex((header) => header.toLowerCase() === 'special mention');

    const cont1 = headerrow.findIndex((header) => header.toLowerCase() === 'country preference 1');
    const cont2 = headerrow.findIndex((header) => header.toLowerCase() === 'country preference 2');
    const cont3 = headerrow.findIndex((header) => header.toLowerCase() === 'country preference 3');

    for(let i of data.slice(1)){

      let item = new Alotter()
      isExecuting = true;

      const MUN_EXP = parseInt(i[mun_exp])*1 + parseInt(i[bd])*4 + parseInt(i[hc])*3 +parseInt(i[spec])*2
      console.log(MUN_EXP);
      
      item.user_details = [[i[pref1],i[pref2],i[cont1],i[cont2],i[cont3]],MUN_EXP,i[firstname], i[lastname], i[email], i[phone]]
      await item.controller();
      consoleLog("Algorithm Working...");

    }

    
  }else{
    consoleLog("Already alloting someone...")

  }
}

// Function to call test_subject in a loop

async function runAlgorithm() {
  if (algo_running == true && isExecuting == true) {
    console.log("already executing, skipped ping");
    return;
  }

  if (algo_running == true && isExecuting == false) {
    const button = document.getElementById("automator-card-button");

    if (button.textContent == "Start") {
      algo_running = false;
      console.log("algo running: ", algo_running);
    }

    // Run your algorithm
    await test_subject()
      .then(() => {
        console.log("test sub was called");
        allotmentCount++;
        console.log(`allotment number ${allotmentCount}`);

        // After the current instance is executed, reset isExecuting and page_enter
        isExecuting = false;
        page_enter = false;
      })
      .catch((error) => {
        console.error("Error in test_subject:", error);

        isExecuting = false;
        page_enter = false;
      });
  } else if (algo_running == false && isExecuting == false) {
    consoleLog("Algorithm waiting for ping...");
  } else {
    consoleLog("Not Allotting anyone ATM");
  }
}




// console logging
export async function consoleLog(message, color = 'white') {
  const consoleOutput = document.getElementById("console-output");

  if (consoleOutput) {
    const messageNode = document.createElement("div");
    messageNode.textContent = `>>> ${message}`;
    messageNode.style.color = color; 
    consoleOutput.appendChild(messageNode);

    // Scroll to the bottom
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  } else {
    console.log("console not found ");
  }
}



