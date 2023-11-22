
const {writeFile, existsSync, readFileSync, writeFileSync} = require('fs');
const path = require('path');
const { ipcRenderer } = require("electron");

import { allCountries,committeeCheck, workingContainer, constraintsData, spreadSheetLink, isEmptyObject, createFileInFolder} from "./index.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  child,
  update,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-database.js";

import {firebaseConfig } from "../constant/index.js";
const App = initializeApp(firebaseConfig);

const auth = getAuth(App);
const db = getFirestore(App);
const usersCollection = collection(db, "users");

const folderName = "Allotrix";



//matrix section
export function showMatrix() {
  console.log("matrix container")


    const matrixContainer = document.createElement('div')
//  matrixContainer.style.gridColumn = "span 3";
    matrixContainer.id = "matrix-container";
   matrixContainer.innerHTML = '';

    const matrixHeading = document.createElement("h1");
    matrixHeading.textContent = "Add Country Matrix ";
    matrixContainer.appendChild(matrixHeading);
    
    

    const choiceContainer = document.createElement("div");
    choiceContainer.className = "committee-section";
    choiceContainer.style.display = "flex"
    
    const manualBtn = document.createElement("button");
    manualBtn.textContent = "Manual";
    manualBtn.className = "add-button";
    manualBtn.style.width = "100%";
    choiceContainer.appendChild(manualBtn);


    const bulkAddBtn = document.createElement("button");
    bulkAddBtn.textContent = "Add Custom"
    bulkAddBtn.className = "add-button";
    bulkAddBtn.style.width = "100%";

    choiceContainer.appendChild(bulkAddBtn);


    matrixContainer.appendChild(choiceContainer);
    workingContainer.appendChild(matrixContainer);

    manualBtn.addEventListener("click", ()=>{
      manual();
    })

    bulkAddBtn.addEventListener("click", ()=>{
      bulk();


      
      
    });

   





    function manual(){

      //clearing the container 
      const matrixContainer = document.getElementById('matrix-container');
      matrixContainer.innerHTML = '';

      

      const matrixHeading = document.createElement("h1");
      matrixHeading.textContent = "Manual Mode"
      matrixContainer.appendChild(matrixHeading)


      // dictionary object to store data for all committees
    const committeeDict = {};
  
    committeeCheck.forEach((committeeData) => {
      const committeeName = committeeData[0];
      const numberOfCountries = committeeData[1];


      
  
      // committee-specific object if it doesn't exist
      if (!committeeDict[committeeName]) {
        committeeDict[committeeName] = {
          mostPertinent: [],
          moderatelyPertinent: [],
          leastPertinent: []
        };
      }
  
      const committeeSection = document.createElement('div');
      committeeSection.className = 'committee-section';
  
      const committeeTitle = document.createElement('h1');
      committeeTitle.textContent = committeeName;
      committeeTitle.style.color = 'black';
      committeeSection.appendChild(committeeTitle);
  
      const searchDiv = document.createElement('div');
      searchDiv.className = 'search-section';
  
      const countrySearchInput = document.createElement('input');
      countrySearchInput.type = 'text';
      countrySearchInput.id = 'matrix-input';
      countrySearchInput.placeholder = 'Search country...';
      searchDiv.appendChild(countrySearchInput);
  
      const addButton = document.createElement('button');
      addButton.classList.add("add-button")
      addButton.id = 'add-button';

      addButton.textContent = 'Add';
      searchDiv.appendChild(addButton);
  
      const clearAllButton = document.createElement('button');
      clearAllButton.classList.add("normal-button")
      clearAllButton.id = 'clear-all-button';
      clearAllButton.textContent = 'Clear';
      searchDiv.appendChild(clearAllButton);

      const backBtn = document.createElement("button");
      backBtn.textContent = "back"
      backBtn.className = "add-button";
      searchDiv.appendChild(backBtn);

      backBtn.addEventListener("click", ()=>{
        matrixContainer.remove();
        showMatrix();
      })//here
  
      committeeSection.appendChild(searchDiv);
  
      const countriesList = document.createElement('div');
      countriesList.className = 'countries-list';
      committeeSection.appendChild(countriesList);

      //custom country entry row
        const customCountrySection = document.createElement('div');
        customCountrySection.className = 'custom-div';
        committeeSection.appendChild(customCountrySection);

        const customCountryButton = document.createElement('button');
        customCountryButton.textContent = 'Custom Country';
        customCountryButton.style.width = "90%";
        customCountryButton.style.gap = "3px";
        customCountryButton.className =  "add-button";
        customCountrySection.appendChild(customCountryButton);

        const customCountryInput = document.createElement('div');
        customCountryInput.className = 'custom-div';
        customCountryInput.style.display = "none";
        customCountrySection.appendChild(customCountryInput);

        

        const countryInput = document.createElement('input');
        countryInput.type = 'text';
        countryInput.id = 'custom-country-input';
        countryInput.placeholder = 'Country name...';
        customCountryInput.appendChild(countryInput);

        const pertinencyContainer = document.createElement('div');
        pertinencyContainer.className = 'pertinency-buttons';
        customCountryInput.appendChild(pertinencyContainer);

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
        const pertinencyButtonColors = ["Pertinency",'Most', 'Moderate', 'Least'];
        pertinencyButtonColors.forEach((color) => {
        const pertinencyOption = document.createElement('option');
        pertinencyOption.id = "pertinency-option"
        pertinencyOption.value = color;
        pertinencyOption.textContent = color
        pertinencyDropdown.appendChild(pertinencyOption);
        });

        const enterButton = document.createElement('button');
        enterButton.classList.add("add-button")
        enterButton.textContent = 'Enter';
        customCountryInput.appendChild(enterButton);

        const closeButton = document.createElement('button');
        closeButton.classList.add("add-button")
        closeButton.textContent = 'Close';
        closeButton.style.backgroundColor = 'red';
        closeButton.style.color = "white"
        customCountryInput.appendChild(closeButton);

        //error message div
        const errorMessageDiv = document.createElement('div');
        errorMessageDiv.className = 'error-msg-container';
        committeeSection.appendChild( errorMessageDiv);

        matrixContainer.appendChild(committeeSection);

      
  
      const clickCount = {};

      customCountryButton.addEventListener('click', function () {
        customCountryButton.style.display= "none";
        customCountryInput.style.display = 'flex';
        

      });
      
      closeButton.addEventListener('click', function () {
        customCountryButton.style.display= "flex";
        customCountryInput.style.display = 'none';
        customCountryInput.style.width = "100%";

      });

      //"enterButton" event listener
      enterButton.addEventListener('click', function () {
        let valid = false;
        const pertinencyOption = document.getElementById("pertinency-dropdown").value;
        let customCountry = document.getElementById("custom-country-input").value;
      
        if (pertinencyOption === "Pertinency" || customCountry === "") {
          valid = false;
        } else {
          valid = true;
        }
      
        if (valid) {
          let committeeName = committeeTitle.textContent;
      
          switch (pertinencyOption) {
            case 'Most':
              committeeDict[committeeName].mostPertinent.push(customCountry);
              break;
            case 'Moderate':
              committeeDict[committeeName].moderatelyPertinent.push(customCountry);
              break;
            case 'Least':
              committeeDict[committeeName].leastPertinent.push(customCountry);
              break;
          }
      
          // Reset 
          document.getElementById("custom-country-input").value = '';
      
          console.log('Committee Dictionary:', committeeDict);
        }
      });
  

      // list of countries
      const committeeArrays = {};
  
      if (!committeeData[committeeName]) {
        committeeData[committeeName] = {
          mostPertinent: [],
          moderatelyPertinent: [],
          leastPertinent: []
        };
      }
  
      function createCountriesList() {
        // Create the committee-specific array if it doesn't exist
        if (!committeeArrays[committeeName]) {
          committeeArrays[committeeName] = Object.assign([], allCountries);
        }
  
        const committeeArray = committeeArrays[committeeName];
  
        countriesList.innerHTML = ''; // Clear previous content
        
        const searchTerm = countrySearchInput.value.toLowerCase();
        const filteredCountries = committeeArray.filter((country) => country.toLowerCase().includes(searchTerm));
  
        // Limit the number of countries to the specified count for each committee
        const countriesToShow = filteredCountries.slice(0, numberOfCountries);
  
        countriesToShow.forEach((country) => {
          const countryDiv = document.createElement('div');
          countryDiv.className = 'country-item';
          countryDiv.textContent = country;
          countryDiv.style.backgroundColor = 'transparent';
  
          // Initialize click count to 0 if it doesn't exist
          if (!clickCount[country]) {
            clickCount[country] = 0;
          }
  
          //background color changes
          countryDiv.addEventListener('click', function () {
            clickCount[country] = clickCount[country] ? (clickCount[country] % 4) + 1 : 1;
  
            switch (clickCount[country]) {
              case 1:
                countryDiv.style.backgroundColor = 'red';
                break;
              case 2:
                countryDiv.style.backgroundColor = 'yellow';
                break;
              case 3:
                countryDiv.style.backgroundColor = 'green';
                break;
              default:
                countryDiv.style.backgroundColor = 'transparent';
                break;
            }
          });
  
          countriesList.appendChild(countryDiv);
        });
      }
  
      //  search input -> dynamically update the list
      countrySearchInput.addEventListener('input', createCountriesList);
  
      // "Add" button
      addButton.addEventListener('click', function () {
        const selectedCountries = Array.from(document.querySelectorAll('.country-item')).filter(
          (countryDiv) => countryDiv.style.backgroundColor !== 'transparent'
        );
  
        selectedCountries.forEach((countryDiv) => {
  
          const committeeName = committeeTitle.textContent; 
          const countryName = countryDiv.textContent;
          
          console.log("selected country: ", countryName)
  
          
          const countryIndex  =  committeeArrays[committeeName].indexOf(countryName)
          console.log("selected country index: ", countryIndex)
          
      
          countryDiv.remove();
          const x = committeeArrays[committeeName].splice(countryIndex, 1);
          console.log("removed country: ",x )
  
          // Push based on background color
          switch (countryDiv.style.backgroundColor) {
            case 'red':
              committeeDict[committeeName].mostPertinent.push(countryName);
              break;
            case 'yellow':
              committeeDict[committeeName].moderatelyPertinent.push(countryName);
              break;
            case 'green':
              committeeDict[committeeName].leastPertinent.push(countryName);
              break;
          }
  
          return countryName;
        });
  
        console.log('Committee Dictionary:', committeeDict);   
      });
  
      // "Clear All" button
      clearAllButton.addEventListener('click', function () {
        const countryDivs = document.querySelectorAll('.country-item');
        countryDivs.forEach((countryDiv) => {
          countryDiv.style.backgroundColor = 'transparent';
          clickCount[countryDiv.textContent] = 0;
        });
        committeeData[committeeName] = {
          mostPertinent: [],
          moderatelyPertinent: [],
          leastPertinent: []
        };
      });
  
  
      // Initial list of countries
      createCountriesList();
    });

    const nBtnConatiner = document.createElement("div");
  nBtnConatiner.className = "committee-section";
  nBtnConatiner.style.display = "flex";

  const nBtn = document.createElement("button");
  nBtn.className="normal-button";
  nBtn.textContent = "Next";
  nBtn.style.width = "100%"
  nBtnConatiner.appendChild(nBtn);


  matrixContainer.appendChild(nBtnConatiner);

  

  nBtn.addEventListener("click", function(){
    createPopup();
    openPopup();
  } );


  function createPopup() {
    // Create the popup container
    const popup = document.createElement('div');
    popup.id = 'popup';
    popup.classList.add('popup');
  
    // Create the popup content
    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');
  
    const heading = document.createElement('h1');
    heading.textContent = 'Write Matrix';
    popupContent.appendChild(heading);
  
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Please click confirm to update the matrix';
    popupContent.appendChild(paragraph);
  
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.setAttribute("class", "add-button");
    closeButton.addEventListener('click', closePopup);
    popupContent.appendChild(closeButton);

    const confirm = document.createElement('button');
    confirm.textContent = 'Confirm';
    confirm.setAttribute("class", "add-button");
    confirm.addEventListener('click', writeJson);
    popupContent.appendChild(confirm);
  
    // Append the popup content to the popup container
    popup.appendChild(popupContent);
  
    // Append the popup to the body
    document.body.appendChild(popup);
  }
  
  function openPopup() {
    const popup = document.getElementById('popup');
    if (!popup) {
      createPopup();
    }
    popup.style.display = 'block';
  }
  
  function closePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
      popup.style.display = 'none';
    }
  }

  //writing data to firebase realtimeDB
  async function writeMatrixToFirebase(matrixData) {
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
  
    try {
      // Check if data exists
      const snapshot = await get(matrixRef);
      if (snapshot.exists()) {
        // IF Data exists, retrieve it
        const existingData = snapshot.val();
        console.log('Existing data from Firebase:', existingData);


   
        // Merging existing data with new data
        const updatedData = { ...existingData, ...matrixData };
  
        // Update the data in Firebase
        await set(matrixRef, updatedData);
        await set(allotmentMatrixRef, updatedData);
        if (!isEmptyObject(constraintsData)){
          await set(constraintsRef, constraintsData);
        }  
        console.log('Matrix data updated in Firebase.');
      } else {
        // IF Data doesn't exist, create a new entry anyways:))
        const existingData = snapshot.val();
        const updatedData = { ...existingData, ...matrixData };

    
        await set(matrixRef, updatedData);
        await set(allotmentMatrixRef, updatedData);
        if (!isEmptyObject(constraintsData)){
          await set(constraintsRef, constraintsData);
        }  
      
        console.log('Matrix data created in Firebase.');
      }
    } catch (error) {
      console.error('Error writing/updating matrix data in Firebase:', error);
    }
  }
  async function updateConstraints(){
    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated.");
      return;
    }
      
    const userId = user.uid;
    const realDb = getDatabase(App);
    const constraintsRef = ref(realDb, `${userId}/constraints`);
    const snapshot = await get(constraintsRef)
    if (snapshot.exists()) {
      // IF Data exists, retrieve it
      const data = snapshot.val();
      console.log('Existing data from Firebase:', data);
      // Update the 'constraints.json' file
      const constraintsJsonFileName = 'constraints.json';
      const constraintsContent = data;
    
      // Write the updated content to 'sheet.json'
      createFileInFolder(folderName, constraintsJsonFileName,JSON.stringify(constraintsContent, null, 2) )
      console.log("contraints.json updated");
    
    }
    
  }
  async function writeJson(){
    

    //write sheet data
    const userId = auth.currentUser.uid; 
    const userDocRef = doc(usersCollection, userId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      // Gettin tthe "spreadSheetId" field from Firestore
      const userData = userDocSnapshot.data();
      const spreadsheetId = userData.spreadSheetId; 

      // Update the 'sheet.json' file
      const jsonSheetFileName = 'sheet.json';
      const jsonsheetContent = { sheetid: spreadsheetId };

      // Write the updated content to 'sheet.json'
      createFileInFolder(folderName, jsonSheetFileName, JSON.stringify(jsonsheetContent, null, 2));


      console.log("sheet.json' updated!");
  } else {
      console.error("User document not found.");
  }
    //End
    
    await writeMatrixToFirebase(committeeDict);
    await updateConstraints();
    ipcRenderer.send("reload-window");

/*
    const jsonFileName = 'matrix.json';
    const jsonFilePath = path.join(__dirname, '..', jsonFileName);

    let oldData = {};

    // Checking if the JSON file exists
    if (existsSync(jsonFilePath)) {
      try {
        const existingData = readFileSync(jsonFilePath, 'utf8');
        oldData = JSON.parse(existingData);
        console.log('Existing JSON data:', oldData);
      } catch (error) {
        console.error('Error reading existing JSON file:', error);
      }
    }


    Object.assign(oldData, committeeDict);

    const jsonData = JSON.stringify(oldData, null, 2);

   

    // Write the JSON data
    writeFile(jsonFilePath, jsonData, (err) => {
      if (err) {
        console.error('Error writing to JSON file:', err);
      } else {
        console.log('JSON file created and data written successfully.');

        const jsonFilePath_1 = path.join(__dirname, '../matrix_1.json');
        writeFile(jsonFilePath_1, jsonData, err => {
            if (err) {
              console.error('Error writing to matrix_1.json file:', err);
            } else {
              console.log('matrix_1.json updated successfully.');
            }
          });


      }
    }); */
    
  }

    };

  function bulk(){

  


      //clearig the container
      const matrixContainer = document.getElementById('matrix-container');
  matrixContainer.innerHTML = '';

  const matrixHeading = document.createElement("h1");
  matrixHeading.textContent = "Bulk Entry Mode";
  matrixContainer.appendChild(matrixHeading);

  // Dictionary object to store data for all committees
  const committeeDict = {};

  committeeCheck.forEach((committeeData) => {
    const committeeName = committeeData[0];
    const numberOfCountries = committeeData[1];

    // Committee-specific object if it doesn't exist
    if (!committeeDict[committeeName]) {
      committeeDict[committeeName] = {
        mostPertinent: [],
        moderatelyPertinent: [],
        leastPertinent: []
      };
    }

    const committeeSection = document.createElement('div');
    committeeSection.className = 'committee-section';

    const header = document.createElement('div');
    header.className = 'head-section';

    const committeeTitle = document.createElement('h1');
    committeeTitle.textContent = committeeName;
    committeeTitle.style.color = 'black';

    const countryCountDisplay = document.createElement('p');
    countryCountDisplay.textContent = 'Country count: 0';


    header.appendChild(committeeTitle);
    header.appendChild(countryCountDisplay);



   

    committeeSection.appendChild(header);
    const mostPertinentDiv = createCategoryDiv('Most Pertinent:');
    const moderatelyPertinentDiv = createCategoryDiv('Moderately Pertinent:');
    const leastPertinentDiv = createCategoryDiv('Least Pertinent:');

    committeeSection.appendChild(mostPertinentDiv);
    committeeSection.appendChild(moderatelyPertinentDiv);
    committeeSection.appendChild(leastPertinentDiv);

    //here
    const countriesData = {
      mostPertinent: [],
      moderatelyPertinent: [],
      leastPertinent: [],
    };

    function updateCountryCount() {
      const totalCount =
        countriesData.mostPertinent.length +
        countriesData.moderatelyPertinent.length +
        countriesData.leastPertinent.length;

      const totalCountDisplay = totalCount > numberOfCountries ? `<span style="color: red">${totalCount}</span>` : totalCount;
      countryCountDisplay.innerHTML = `Country count: ${totalCountDisplay}`;
    }

    matrixContainer.appendChild(committeeSection);

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

    function createCategoryDiv(title) {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'category';

      const categoryTitle = document.createElement('p');
      categoryTitle.textContent = title;

      categoryDiv.appendChild(categoryTitle);
      const categoryInput = document.createElement('textarea');
      categoryInput.className = 'category-input';
      categoryInput.rows = 1;
      categoryInput.style.width = '100%'; 
      categoryInput.placeholder = "Paste countries separated with ','";

      categoryDiv.appendChild(categoryInput);


      // Add event listener to update the country count when there's a change in the text input
      categoryInput.addEventListener('input', () => {
        const inputText = categoryInput.value.trim();
        const countries = inputText === '' ? [] : inputText.split(',').map((country) => country.trim());
        switch (title) {
          case 'Most Pertinent:':
             countriesData.mostPertinent = countries;
            break;
          case 'Moderately Pertinent:':
            countriesData.moderatelyPertinent = countries;
            break;
          case 'Least Pertinent:':
            countriesData.leastPertinent = countries;
            break;
        }
        switch (title) {
          case 'Most Pertinent:':
             committeeDict[committeeName].mostPertinent = countries;
            break;
          case 'Moderately Pertinent:':
            committeeDict[committeeName].moderatelyPertinent = countries;
            break;
          case 'Least Pertinent:':
            committeeDict[committeeName].leastPertinent = countries;
            break;
        }
        updateCountryCount();
      });

      function autoResizeTextArea(textarea) {
        textarea.style.height = '38px';
      
       
        textarea.style.height = textarea.scrollHeight + 'px';
      }

      categoryInput.addEventListener('input', () => {
        autoResizeTextArea(categoryInput);
      });
    

      

      return categoryDiv;
    }


    
    
    
      matrixContainer.appendChild(committeeSection);
  });

 

  const nBtnConatiner = document.createElement("div");
  nBtnConatiner.className = "committee-section";
  nBtnConatiner.style.display = "flex";

  const nBtn = document.createElement("button");
  nBtn.className="normal-button";
  nBtn.textContent = "Next";
  nBtn.style.width = "100%"

  nBtnConatiner.appendChild(nBtn);

  const backBtn = document.createElement("button");
    backBtn.textContent = "back"
    backBtn.className = "normal-button";
    backBtn.style.backgroundColor= "red"
    backBtn.style.width = "100%"

    
    nBtnConatiner.appendChild(backBtn);

    backBtn.addEventListener("click", ()=>{
      matrixContainer.remove();      
      showMatrix();
    })


    nBtn.addEventListener("click", function(){
      console.log(committeeDict)
      createPopup();
      openPopup();
    } );
  

  matrixContainer.appendChild(nBtnConatiner);

   function createPopup() {
    // Create the popup container
    const popup = document.createElement('div');
    popup.id = 'popup';
    popup.classList.add('popup');
  
    // Create the popup content
    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');
  
    const heading = document.createElement('h1');
    heading.textContent = 'Write Matrix';
    popupContent.appendChild(heading);
  
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Please click confirm to update the matrix';
    popupContent.appendChild(paragraph);
  
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.setAttribute("class", "add-button");
    closeButton.addEventListener('click', closePopup);
    popupContent.appendChild(closeButton);

    const confirm = document.createElement('button');
    confirm.textContent = 'Confirm';
    confirm.setAttribute("class", "add-button");
    confirm.addEventListener('click', writeJson);
    popupContent.appendChild(confirm);
  
    // Append the popup content to the popup container
    popup.appendChild(popupContent);
  
    // Append the popup to the body
    document.body.appendChild(popup);
  }
  
  function openPopup() {
    const popup = document.getElementById('popup');
    if (!popup) {
      createPopup();
    }
    popup.style.display = 'block';
  }
  
  function closePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
      popup.style.display = 'none';
    }
  }


  // Function to write the matrix data to Firebase Realtime Database
  async function writeMatrixToFirebase(matrixData) {
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
  
    try {
      // Check if data exists
      const snapshot = await get(matrixRef);
      if (snapshot.exists()) {
        // IF Data exists, retrieve it
        const existingData = snapshot.val();
        console.log('Existing data from Firebase:', existingData);


        // Merging existing data with new data
        const updatedData = { ...existingData, ...matrixData };
  
        // Update the data in Firebase
        await set(matrixRef, updatedData);
        await set(allotmentMatrixRef, updatedData);
        if (! isEmptyObject(constraintsData)){
          await set(constraintsRef, constraintsData);
        }     
        console.log('Matrix data updated in Firebase.');
      } else {
        // IF Data doesn't exist, create a new entry anyways:))
        const existingData = snapshot.val();
        const updatedData = { ...existingData, ...matrixData };


        await set(matrixRef, updatedData);
        await set(allotmentMatrixRef, updatedData);
        if (! isEmptyObject(constraintsData)){
          await set(constraintsRef, constraintsData);
        }  
      
        console.log('Matrix data created in Firebase.');
      }
    } catch (error) {
      console.error('Error writing/updating matrix data in Firebase:', error);
    }
  }

///update constraints.json file

async function updateConstraints(){
  const user = auth.currentUser;
  if (!user) {
    console.error("User not authenticated.");
    return;
  }
    
  const userId = user.uid;
  const realDb = getDatabase(App);
  const constraintsRef = ref(realDb, `${userId}/constraints`);
  const snapshot = await get(constraintsRef)
  if (snapshot.exists()) {
    // IF Data exists, retrieve it
    const data = snapshot.val();
    console.log('Existing data from Firebase:', data);
    // Update the 'constraints.json' file
    const constraintsJsonFileName = 'constraints.json';
    const constraintsContent = data;
  
    // Write the updated content to 'sheet.json'
    createFileInFolder(folderName, constraintsJsonFileName, JSON.stringify(constraintsContent, null, 2))
    console.log("contraints.json updated");
  
  }
  
}
  async function writeJson(){

     //write sheet data
     
     
    //update the sheet spreadheetid 
    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated.");
      return;
    }
  
    const userId = auth.currentUser.uid; 
    const userDocRef = doc(usersCollection, userId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
        // Gettin tthe "spreadSheetId" field from Firestore
        const userData = userDocSnapshot.data();
        const spreadsheetId = userData.spreadSheetId; 

        // Update the 'sheet.json' file
        const jsonFileName = 'sheet.json';
        const jsonSheetContent = { sheetid: spreadsheetId };

        // Write the updated content to 'sheet.json'
        createFileInFolder(folderName, jsonFileName,JSON.stringify(jsonSheetContent, null, 2) )


        console.log("sheet.json' updated!");
    } else {
        console.error("User document not found.");
    }
    //End
    
    await writeMatrixToFirebase(committeeDict);
    await updateConstraints();
    ipcRenderer.send("reload-window");

/*
    const jsonFileName = 'matrix.json';
    const jsonFilePath = path.join(__dirname, '..', jsonFileName);

    let oldData = {};

    // Check if the JSON file exists
    if (existsSync(jsonFilePath)) {
      try {
        const existingData = readFileSync(jsonFilePath, 'utf8');
        oldData = JSON.parse(existingData);
        console.log('Existing JSON data:', oldData);
      } catch (error) {
        console.error('Error reading existing JSON file:', error);
      }
    }


    Object.assign(oldData, committeeDict);

    const jsonData = JSON.stringify(oldData, null, 2);

   

    // Write the JSON data
    writeFile(jsonFilePath, jsonData, (err) => {
      if (err) {
        console.error('Error writing to JSON file:', err);
      } else {
        console.log('JSON file created and data written successfully.');

        const jsonFilePath_1 = path.join(__dirname, '../matrix_1.json');
          writeFile(jsonFilePath_1, jsonData, err => {
            if (err) {
              console.error('Error writing to matrix_1.json file:', err);
            } else {
              console.log('matrix_1.json updated successfully.');
            }
          });

      }
    });

    */

}
    } 
  }





 

      
     