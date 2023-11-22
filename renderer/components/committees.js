import {workingContainer, createNewCommittee, getSheetIdFromJSONFile, getAuthClient} from "./index.js";
const { google } = require('googleapis');
const { ipcRenderer } = require("electron");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getAuth} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  child,
  update,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-database.js";
import{hideLoadingScreen, showLoadingScreen} from "./index.js"

import {firebaseConfig } from "../constant/index.js";
const App = initializeApp(firebaseConfig);

const auth = getAuth(App);

//const workingContainer = document.getElementById('working-container');

const committeeDict = {};



//committee tiles
function createTile(committeeName) {
  const tile = document.createElement('div');
  tile.classList.add('com-element');

  tile.classList.add('com-tile');
  tile.textContent = committeeName;

  workingContainer.appendChild(tile);
    
}

export async function loadCommittees(){

  const pageName = document.getElementById("page-name");
  pageName.textContent = "Edit Committees";

  

  const user = auth.currentUser;
  if (!user) {
  console.error("User not authenticated.");
  return;
  }
                  
  const userId = user.uid;
  const realDb = getDatabase(App);
  const matrixRef = ref(realDb, `${userId}/matrix`);
  const snapshot = await get(matrixRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    showLoadingScreen();

    try{

    
    const committeeNames = Object.keys(data);
    console.log(committeeNames)

    for (const committeeName of committeeNames) {
        createTile(committeeName);
        
    }
    if (workingContainer.childElementCount <= committeeNames.length){
      addNewComTile();
      console.log("add new tile added")
    }
    }catch(error){
      console.error('Error loading data:', error)
    }finally{
      hideLoadingScreen();
    }

  };


    function addNewComTile(){
      const addNewCommittee = document.createElement('div');
      addNewCommittee.classList.add('com-tile');
      addNewCommittee.id = 'com-add-tile';

      addNewCommittee.textContent = "+";
      addNewCommittee.style.fontSize = "3em";
      addNewCommittee.style.fontWeight = "200";
      addNewCommittee.style.background = "#414141";

      addNewCommittee.style.color = "#EF4036";

      workingContainer.appendChild(addNewCommittee);
    }

    workingContainer.addEventListener('click', function(event) {
      const clickedElement = event.target;
      
      if (clickedElement.classList.contains('com-tile')) {
        handleTileClick(clickedElement);
      }
     
    });

    function handleTileClick(tile) {
    
      if (tile.classList.contains('com-tile') && tile.id.includes("com-add-tile")) {
        console.log("Tile with an image is clicked");
        createNewCommittee(); // Add new com tile
      } else {
        const tileName = tile.textContent;
        workingContainer.innerHTML = "";
        workingContainer.style.display = "flex";
        workingContainer.style.flexDirection = "column";
    
        committeeEdit(tileName);
        console.log(`${tileName} tile is clicked`);
      }
    }
}









function committeeEdit(committeeTile){


  const heading = document.createElement("h1");
  heading.classList.add("h1-text");
  heading.textContent = committeeTile;
  heading.style.fontSize = "4em";

  workingContainer.appendChild(heading);

  const backBtnContainer = document.createElement('div')
  backBtnContainer.id = "back-button-container";

  const backBtn = document.createElement("button");
  backBtn.textContent = "Remove Committee";
  backBtn.className = "add-button";

  backBtnContainer.appendChild(backBtn);
  workingContainer.appendChild(backBtnContainer);

 
//remove committee button 
backBtn.addEventListener('click', async () => {
  const confirmDeletion = window.confirm(
    'Are you sure you want to delete the committee? You will lose all the data associated with it.'
  );

  if (confirmDeletion) {
    const user = auth.currentUser;
 
    if (!user) {
      console.error('User not authenticated.');
      return;
    }

    const userId = user.uid;
    const realDb = getDatabase(App);
    const matrixRef = ref(realDb, `${userId}/matrix`);
    const allotmentMatrixRef = ref(realDb, `${userId}/allotmentMatrix`);
    showLoadingScreen();
 
    try {
      // Check if data exists
      const snapshot = await get(matrixRef);
      const extractedData = snapshot.val();
      
      if (!extractedData) {
        console.error('Matrix data not found in Firebase.');
        return;
      }
      
      //delete the committee from data
      delete extractedData[committeeTile];
      console.log('After deletion:', extractedData);

      // Delete the committee from corresponding sheet
      const spreadsheetIdMain = getSheetIdFromJSONFile('sheet.json'); // Replace with your logic
      console.log('Extracted sheetId:', spreadsheetIdMain);

      // delete frm spreadsheet
      const auth = await getAuthClient();
      await deleteSheet(spreadsheetIdMain, committeeTile, auth);

      // Update matrix data in Firebase
      await set(matrixRef, extractedData);
      await set(allotmentMatrixRef, extractedData);

      console.log('Matrix data updated in Firebase.');
      ipcRenderer.send("reload-window");
    } 
    catch (error) {
      console.error('Error deleting committee data:', error);
    }
    finally{
      hideLoadingScreen();
    }
  }
});

// delete the sheet code

async function deleteSheet(spreadsheetId, committeeTile, auth) {
  try {
      const sheets = google.sheets({ version: 'v4', auth });

      // Get the sheetId by title
      const sheet = await sheets.spreadsheets.get({
          spreadsheetId: spreadsheetId,
      });

      const sheetsData = sheet.data.sheets;

      // Debug: Print available sheet titles
      const availableSheetTitles = sheetsData.map(sheet => sheet.properties.title);
      console.log('Available sheet titles:', availableSheetTitles);

      const sheetProperties = sheetsData.find(
          (sheet) => sheet.properties.title === committeeTile
      );
      console.log("Sheet properties:", sheetProperties);

      if (!sheetProperties) {
          console.error(`Sheet '${committeeTile}' not found.`);
      } else {
          const sheetId = sheetProperties.properties.sheetId;
          console.log('SheetId:', sheetId);

          // Delete the sheet
          const request = {
              spreadsheetId: spreadsheetId,
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

          await sheets.spreadsheets.batchUpdate(request);
          console.log(`Sheet with sheetId ${sheetId} deleted.`);

          auth.success = true;
      }
  } catch (error) {
      console.error('An error occurred in deleteSheet:', error);
      auth.success = false;
  }
}


//=======


  const editContainer = document.createElement("div");
  editContainer.id = "edit-container";

  

  const addCountry = document.createElement('div');
  addCountry.classList.add('edit-tile');
  addCountry.textContent = "Add New Country";

  const removeCountry = document.createElement('div');
  removeCountry.classList.add('edit-tile');
  removeCountry.textContent = "Remove Existing Country";

  editContainer.appendChild(addCountry);
  editContainer.appendChild(removeCountry);

  workingContainer.appendChild(editContainer)



  addCountry.addEventListener("click", () => {
    workingContainer.innerHTML = "";
specificComAddMatrix(committeeTile);
  });

  removeCountry.addEventListener("click", () => {
    workingContainer.innerHTML = "";
specificComRemoveMatrix(committeeTile);
  });



async function specificComAddMatrix(committeeTile){

    const backBtnContainer = document.createElement('div')
    backBtnContainer.id = "back-button-container";

    const backBtn = document.createElement("button");
    backBtn.textContent = "Back";
    backBtn.className = "add-button";

    backBtnContainer.appendChild(backBtn);
    workingContainer.appendChild(backBtnContainer);

    backBtn.addEventListener("click", () => {
      workingContainer.innerHTML ="";
      committeeEdit(committeeTile);
    })

    const matrixContainer = document.createElement('div')
    matrixContainer.id = "matrix-container";
    matrixContainer.innerHTML = '';
  
      const matrixHeading = document.createElement("h1");
      matrixHeading.textContent = `Add Countries to ${committeeTile}`;
      matrixContainer.appendChild(matrixHeading);
      

  //custom country entry row
  const customCountrySection = document.createElement('div');
  customCountrySection.className = 'custom-div';
  matrixContainer.appendChild(customCountrySection);

  const customCountryInput = document.createElement('div');
  customCountryInput.className = 'custom-input-div';
  customCountryInput.style.display = "flex";
  customCountrySection.appendChild(customCountryInput);

  const categoryInput = document.createElement('textarea');
    categoryInput.className = 'category-input';
    categoryInput.rows = 1;
    categoryInput.style.width = '100%'; 
    categoryInput.placeholder = "Paste countries separated with ','";

    customCountryInput.appendChild(categoryInput);



        
    


    function autoResizeTextArea(textarea) {
      textarea.style.height = '38px';
    
     
      textarea.style.height = textarea.scrollHeight + 'px';
    }

    categoryInput.addEventListener('input', () => {
      autoResizeTextArea(categoryInput);
    });
  

    


  const pertinencyContainer = document.createElement('div');
  pertinencyContainer.className = 'pertinency-buttons';
  customCountrySection.appendChild(pertinencyContainer);

  // pertinency dropdown
  const pertinencyDropdown = document.createElement('select');
  pertinencyDropdown.id = 'pertinency-dropdown';
  pertinencyDropdown.placeholder = "Pertinency"
  pertinencyDropdown.style.backgroundColor = 'transparent';
  pertinencyDropdown.style.border = 'none';
  pertinencyDropdown.style.fontFamily = 'Arial';
  pertinencyDropdown.style.fontSize = '16px';
  pertinencyDropdown.style.border = '.9px solid black';
  pertinencyDropdown.style.borderRadius = '9px';
  pertinencyDropdown.style.cursor = 'pointer';

  pertinencyContainer.appendChild(pertinencyDropdown);

  // pertinency options 
  const pertinencyButtonColors = ["Pertinency",'mostPertinent', 'moderatelyPertinent', 'leastPertinent'];
  pertinencyButtonColors.forEach((color) => {
  const pertinencyOption = document.createElement('option');
  pertinencyOption.id = "pertinency-option"
  pertinencyOption.value = color;
  pertinencyOption.textContent = color
  pertinencyDropdown.appendChild(pertinencyOption);
  });

  const enterButton = document.createElement('button');
  enterButton.classList.add("add-button")
  enterButton.textContent = 'Add to Matrix';
  customCountrySection.appendChild(enterButton);

  // Error Message displayer
  function displayError(txt) {   
    const msgContainer = document.createElement('div');
    msgContainer.className = 'error-msg-container';
    const errorMessage = document.createTextNode(txt);
    msgContainer.appendChild(errorMessage);
  
    customCountrySection.appendChild(msgContainer);
    console.log(txt)
  }


  workingContainer.appendChild(matrixContainer)



  function autosize() {
    var text = $('.autosize');
  
    text.each(function () {
      $(this).attr('rows', 1);
      resize($(this));
    });
  
    text.on('input', function () {
      resize($(this));
    });
  
    function resize($text) {
      $text.css('height', 'auto');
      $text.css('height', $text[0].scrollHeight + 'px');
    }
  }
  

  document.addEventListener('DOMContentLoaded', function () {
    autosize();
  });





  //"enterButton" event listener
  enterButton.addEventListener('click', async function  () {
    let valid = false;
    const pertinencyOption = document.getElementById("pertinency-dropdown").value;

    if (document.getElementsByClassName("category-input")[0].value === ""){
      displayError("Enter a country");
      valid = false;
    }
    else if(pertinencyOption === "Pertinency" ) {
      const msgCont = document.getElementsByClassName("error-msg-container")[0];
      if(msgCont){
      msgCont.remove()
    }      
      valid = false;
      displayError("choose a pertinency");
    } else {
      valid = true;
      const msgCont = document.getElementsByClassName("error-msg-container")[0];
      if(msgCont){
      msgCont.remove()
    }
    }

  if (valid) {
    if (!committeeDict[committeeTile]) {
      committeeDict[committeeTile] = {
        mostPertinent: [],
        moderatelyPertinent: [],
        leastPertinent: []
      };
    }
    const customCountry = document.getElementsByClassName("category-input")[0].value
    switch (pertinencyOption) {
      case 'mostPertinent':
        committeeDict[committeeTile].mostPertinent.push(customCountry);
        break;
      case 'moderatelyPertinent':
        committeeDict[committeeTile].moderatelyPertinent.push(customCountry);
        break;
      case 'leastPertinent':
        committeeDict[committeeTile].leastPertinent.push(customCountry);
        break;
    }

    // Reset 
    document.getElementsByClassName("category-input").value = '';

    console.log('Committee Dictionary:', committeeDict);

    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated.");
      return;
    }
  
    const userId = user.uid;
    const realDb = getDatabase(App);
    const matrixRef = ref(realDb, `${userId}/matrix`);
    const allotmentMatrixRef = ref(realDb, `${userId}/allotmentMatrix`);

    const constraintsRef = ref(realDb, `${userId}/constraints`);
    showLoadingScreen();
    try {
      // Check if data exists
      const snapshot = await get(matrixRef);
      if (snapshot.exists()) {
        // IF Data exists, retrieve it
        const data = snapshot.val();
        console.log('Existing data from Firebase:', data);

        if (data[committeeTile]) {
          const pertinency = document.getElementById("pertinency-dropdown").value;
          const inputText = document.getElementsByClassName("category-input")[0].value;
          const countries = inputText.split(',').map(country => country.trim());
    
          // Update the countries in the Firebase data
          if (!data[committeeTile][pertinency]) {
            data[committeeTile][pertinency] = [];
          }
    
          countries.forEach(newCountry => {
            const newCountryLower = newCountry.toLowerCase();
            if (!data[committeeTile][pertinency].map(item => item.toLowerCase()).includes(newCountryLower)) {
              data[committeeTile][pertinency].push(newCountry);
            }
          });
    
          // Update the data in Firebase Realtime Database
          await set(matrixRef, data);
    
          console.log("Data updated successfully in Firebase."); }

          //NOW DO IT FOR ALLOTMENT MATRIX======
          const allotmentSnapshot = await get(allotmentMatrixRef);
          if (allotmentSnapshot.exists()) {
            // IF Data exists, retrieve it
            const allotmentData = allotmentSnapshot.val();
            console.log('Existing data from Firebase:', allotmentData);

            if (allotmentData[committeeTile]) {
              const pertinency = document.getElementById("pertinency-dropdown").value;
              const inputText = document.getElementsByClassName("category-input")[0].value;
              const countries = inputText.split(',').map(country => country.trim());
        
              // Update the countries in the Firebase data
              if (!allotmentData[committeeTile][pertinency]) {
                allotmentData[committeeTile][pertinency] = [];
              }
        
              countries.forEach(newCountry => {
                const newCountryLower = newCountry.toLowerCase();
                if (!allotmentData[committeeTile][pertinency].map(item => item.toLowerCase()).includes(newCountryLower)) {
                  allotmentData[committeeTile][pertinency].push(newCountry);
                }
              });
        
              // Update the data in Firebase Realtime Database
              await set(allotmentMatrixRef, allotmentData);
        
              console.log("AllotmentData updated successfully in Firebase."); }
          
          
          
          }else {
            // IF Data does not exist, upload the countries directly to allotmentMatrixRef under the respective pertinency
            const pertinency = document.getElementById("pertinency-dropdown").value;
            const inputText = document.getElementsByClassName("category-input")[0].value;
            const countries = inputText.split(',').map(country => country.trim());
        
            // Create a new structure for the data
            const newData = {
                [committeeTile]: {
                    [pertinency]: countries
                }
            };
        
            // Upload the data to allotmentMatrixRef
            await set(allotmentMatrixRef, newData);
        
            console.log("AllotmentData created and uploaded successfully in Firebase.");
        }

          ipcRenderer.send("reload-window");

       
      }

  }catch(error){
    console.error(error)
  }finally{
    hideLoadingScreen()

  }}




});
}//specificComAddMatrix ends here

async function specificComRemoveMatrix(committeeTile){

  const backBtnContainer = document.createElement('div')
    backBtnContainer.id = "back-button-container";

    const backBtn = document.createElement("button");
    backBtn.textContent = "Back";
    backBtn.className = "add-button";

    backBtnContainer.appendChild(backBtn);
    workingContainer.appendChild(backBtnContainer);

    backBtn.addEventListener("click", () => {
      workingContainer.innerHTML ="";
      committeeEdit(committeeTile);
    })

    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated.");
      return;
    }
  
    const userId = user.uid;
    const realDb = getDatabase(App);
    const matrixRef = ref(realDb, `${userId}/matrix`);
    const allotmentMatrixRef = ref(realDb, `${userId}/allotmentMatrix`);

    const constraintsRef = ref(realDb, `${userId}/constraints`);
    
    showLoadingScreen()
    try {
      // Check if data exists
      const snapshot = await get(matrixRef);
      if (snapshot.exists()) {
        // IF Data exists, retrieve it
        const data  = snapshot.val();
        console.log('Existing data from Firebase:', data);

     

    const matrixContainer = document.createElement('div')
    matrixContainer.id = "matrix-container";
    matrixContainer.innerHTML = '';
  
    const matrixHeading = document.createElement("h1");
    matrixHeading.textContent = `Remove Countries from ${committeeTile}`;
    matrixContainer.appendChild(matrixHeading);

    workingContainer.appendChild(matrixContainer)

    const removeBtnWrap = document.createElement('div');
    removeBtnWrap.className = 'pertinency-buttons';
    removeBtnWrap.style.display = "flex";
    removeBtnWrap.style.flexDirection = "column";
    removeBtnWrap.style.gap = "20px";
  matrixContainer.appendChild(removeBtnWrap);

  const pertinencyContainer = document.createElement('div');
  pertinencyContainer.className = 'pertinency-buttons';
  removeBtnWrap.appendChild(pertinencyContainer);

  const pertinencyLabel = document.createElement("h3");
  pertinencyLabel.textContent = `Choose Pertinency in ${committeeTile} Matrix `;
  pertinencyContainer.appendChild(pertinencyLabel);

  // pertinency dropdown
  const pertinencyDropdown = document.createElement('select');
  pertinencyDropdown.id = 'pertinency-dropdown';
  pertinencyDropdown.placeholder = "Pertinency"
  pertinencyDropdown.style.backgroundColor = 'transparent';
  pertinencyDropdown.style.border = 'none';
  pertinencyDropdown.style.fontFamily = 'Arial';
  pertinencyDropdown.style.fontSize = '16px';
  pertinencyDropdown.style.border = '.9px solid black';
  pertinencyDropdown.style.borderRadius = '9px';
  pertinencyDropdown.style.cursor = 'pointer';

  pertinencyContainer.appendChild(pertinencyDropdown);

  // pertinency options 
  const pertinencyButtonColors = ["Pertinency", 'mostPertinent', 'moderatelyPertinent', 'leastPertinent'];
  pertinencyButtonColors.forEach((color) => {
    const pertinencyOption = document.createElement('option');
    pertinencyOption.id = "pertinency-option";
    pertinencyOption.value = color;
    pertinencyOption.textContent = color;
    pertinencyDropdown.appendChild(pertinencyOption);
  });

  pertinencyDropdown.addEventListener('change', () => {
    const selectedPertinency = pertinencyDropdown.value;
    
    // Clearing existing second dropdown if any
    const existingSecondDropdown = matrixContainer.querySelector('#second-dropdown-container');
    if (existingSecondDropdown) {
      existingSecondDropdown.remove();
    }

    // ------second dropdown
    const secondDropdownContainer = document.createElement('div');
    secondDropdownContainer.id = 'second-dropdown-container';
    secondDropdownContainer.style.width = "100%";
    secondDropdownContainer.style.display = "flex";
    secondDropdownContainer.style.flexDirection = "column";
    
    removeBtnWrap.appendChild(secondDropdownContainer);

    // Label
    const secondDropdownLabel = document.createElement('h3');
    secondDropdownLabel.textContent = `Choose a country to delete in ${committeeTile} Matrix `;
    
    secondDropdownContainer.appendChild(secondDropdownLabel);

    // Creting second dropdown
    const removeCountryDropdown = document.createElement('select');
    removeCountryDropdown.id = 'remove-country-dropdown';
    removeCountryDropdown.style.backgroundColor = 'transparent';
    removeCountryDropdown.style.border = 'none';
    removeCountryDropdown.style.fontFamily = 'Arial';
    removeCountryDropdown.style.fontSize = '16px';
    removeCountryDropdown.style.border = '.9px solid black';
    removeCountryDropdown.style.borderRadius = '9px';
    removeCountryDropdown.style.cursor = 'pointer';
    removeCountryDropdown.style.width = "100%"
    removeCountryDropdown.placeholder = 'Remove Country';

    // Add options based on selected pertinency
    if (data && data[committeeTile] && data[committeeTile][selectedPertinency]) {
    data[committeeTile][selectedPertinency].forEach((option) => {
      const removeCountryOption = document.createElement('option');
      removeCountryOption.value = option;
      removeCountryOption.textContent = option;
      removeCountryDropdown.appendChild(removeCountryOption);
    });

    secondDropdownContainer.appendChild(removeCountryDropdown); 
    }else{
      console.error("Data is undefined or not available.");

    }
        }) 
    

  const enterButton = document.createElement('button');
  enterButton.classList.add("add-button")
  enterButton.textContent = 'Remove';
  matrixContainer.appendChild(enterButton);

  //get allotment matrix as well
  try {
    // Check if data exists
    const snapshot = await get(allotmentMatrixRef);
    if (snapshot.exists()) {
      // IF Data exists, retrieve it
      const allotmentData  = snapshot.val();
      console.log('Existing data from Firebase:', data);
    }
  }catch (error){
        console.error(error)
      }



  enterButton.addEventListener("click", async () => {
    const selectedCountry = document.getElementById("remove-country-dropdown").value;
    const pertinency = document.getElementById("pertinency-dropdown").value;
    const countryIndex = data[committeeTile][pertinency].indexOf(selectedCountry);


      //get allotment matrix to remove the country if it exists
      const allotmentSnapshot = await get(allotmentMatrixRef);
      if (allotmentSnapshot.exists()) {
        // IF Data exists, retrieve it
        const allotmentData  = allotmentSnapshot.val();
        console.log('Existing data from Firebase:', allotmentData);

        if (allotmentData[committeeTile][pertinency]){
          if (countryIndex !== -1) {
          allotmentData[committeeTile][pertinency].splice(countryIndex, 1);
          await set(allotmentMatrixRef, allotmentData);
          console.log("allotment matrix updated")
          }
        }
      }

    if (countryIndex !== -1) {
      data[committeeTile][pertinency].splice(countryIndex, 1);
        await set(matrixRef, data);
        console.log("updated matrix")
        ipcRenderer.send("reload-window");

      }

     
      
  });
  

}
}catch (error){
  console.error(error)
}
finally{
  hideLoadingScreen();
}
}
}
