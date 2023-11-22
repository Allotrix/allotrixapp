import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

import {firebaseConfig } from "../constant/index.js";


const App = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(App);

import { committeeCheck, setUpContainer,extraFieldContainer, nextBtnContainer,  workingContainer, spreadsheetDone } from "./index.js";


export let fieldIndex = 0; 
const folderName = 'Allotrix';




// Function to create a new field container
export function createFieldContainer() {
  
    const newFieldContainer = document.createElement('div');
    newFieldContainer.className = 'form-field';

    const spreadsheetFieldContainer = document.createElement('div');
    spreadsheetFieldContainer.className = 'spreadsheet-field-container';
    
    setUpContainer.appendChild(spreadsheetFieldContainer);

    addSpreadsheetField();

    const committeeLabel = document.createElement('label');
    committeeLabel.setAttribute('for', `committee${fieldIndex}`);
    committeeLabel.textContent = 'Committee:';
    newFieldContainer.appendChild(committeeLabel);
  
    const committeeSelect = document.createElement('input');
    committeeSelect.setAttribute('type', 'text');
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
  
    const addNewButton = document.createElement('button');
    addNewButton.setAttribute('class', 'add-button');
    addNewButton.textContent = 'Add New';
    newFieldContainer.appendChild(addNewButton);
    addNewButton.addEventListener('click', addNewField);
  
    const removeButton = document.createElement('button');
    removeButton.setAttribute('class', 'add-button');
    removeButton.id = "remove-button";
    removeButton.textContent = 'X';
    removeButton.style.backgroundColor = "red";
    newFieldContainer.appendChild(removeButton);
    removeButton.addEventListener('click', removeNewField);
    
    nextBtnContainer.addEventListener('click', nextBtnHandler);



    setUpContainer.appendChild(newFieldContainer);

    addNextButton();

    //const nextButton = document.getElementById("next-button")


    return newFieldContainer;
  }





  // spreadsheet field
export function addSpreadsheetField() {

    if (!setUpContainer.querySelector('#spreadsheet-field')) {
      console.log("spreadsheet field added");

      const spreadsheetContainer = document.createElement('div');
      spreadsheetContainer.className = 'form-field';


      const spreadsheetLabel = document.createElement('label');
      spreadsheetLabel.setAttribute('for', `spreadsheet-field`);
      spreadsheetLabel.id = "spreadsheet-field-label";
      spreadsheetLabel.textContent = 'Spreadsheet Link:';
      spreadsheetLabel.style.display = "block"; 
      spreadsheetLabel.style.marginRight = "10px";
      spreadsheetContainer.appendChild(spreadsheetLabel);
  
      const spreadsheetField = document.createElement("input");
      spreadsheetField.setAttribute("type", "text"); 
      spreadsheetField.setAttribute("placeholder", "Enter Spreadsheet Link"); 
      spreadsheetField.style.fontSize = "1.2em";
      spreadsheetField.id = "spreadsheet-field"; 
      
      spreadsheetContainer.appendChild(spreadsheetField);

      setUpContainer.appendChild(spreadsheetContainer)
    }
  }


  // next button
export function addNextButton() {

    if (nextBtnContainer.childElementCount === 0) {
      
      const nextBtn = document.createElement("button");
      nextBtn.textContent = "Next";
      nextBtn.style.fontSize = "1.2em";
      nextBtn.id = "next-button";
      nextBtnContainer.appendChild(nextBtn);

      console.log("next button added");
    }
  }



  // Error Message displayer
  export function displayError(txt) {   
    const msgContainer = document.createElement('div');
    msgContainer.className = 'error-msg-container';
    const errorMessage = document.createTextNode(txt);
    msgContainer.appendChild(errorMessage);
  
    nextBtnContainer.appendChild(msgContainer);
    console.log(txt)
  }
  
  // Function to add a new field when "Add New" button is clicked
export function addNewField() {
    
    const fieldContainer = createFieldContainer();
    extraFieldContainer.appendChild(fieldContainer);
    fieldIndex++;
  }
  
  // Function to remove the older fields
export function removeNewField(event) {
    const button = event.target;
    const formField = button.parentNode;
  
    formField.remove();
    console.log("Removed");
  }




// Function to check if everything is entered properly
export async function nextBtnHandler(){

  const committeeFields = document.querySelectorAll('input[name="committee[]"]');
  const spreadSheetId = document.getElementById('spreadsheet-field');
  const spreadSheetValue = spreadSheetId.value;
  
  
    // Remove previous error messages
    const previousErrorMessages = document.querySelectorAll('.error-msg-container');
    previousErrorMessages.forEach((errorMsg) => {
      errorMsg.remove();
    });
    //=====

    let isValid = true;
    
    const sheetLink = spreadSheetId.value;

    const regex = /\/spreadsheets\/d\/([^/]+)/; 

    const match = sheetLink.match(regex);
    //const spreadsheetIdMain = match[1];
    let spreadsheetCorrect = false;
    let spreadsheetIdMain;
    if (match && match[1]) {
      spreadsheetIdMain = match[1];
      
    } else {
      displayError("Invalid Spreadsheet Link. Please paste link with editor access.");
      isValid = false;
    }
    
    
  
    
  
    committeeFields.forEach((field) => {
      const committeeValue = field.value;
      const sizeField = field.nextElementSibling.nextElementSibling;
      const sizeValue = sizeField.value;
  
      if (committeeValue === "" || sizeValue === "") {
        displayError("Fields cannot be empty");
        isValid = false;

      } else {
        committeeCheck.push([committeeValue, sizeValue])
        console.log(`spreadsheetID: ${spreadSheetValue}`)
        console.log(`Committee: ${committeeValue}`);
        console.log(`Size: ${sizeValue}`);
        console.log(committeeCheck)
      }
    });
   
    if (isValid) {
      const USER = auth.currentUser;
  
      if (USER) {
        const UID = USER.uid;
        const userDocRef = doc(db, "users", UID);
  
        try {
          // Update Firestore with the spreadSheetValue

          const regex = /\/spreadsheets\/d\/([^/]+)/; // Replace with your actual regular expression pattern.

          const match = spreadSheetValue.match(regex);

          const spreadsheetIdMain = match && match[1] ? match[1] : "error";

          await updateDoc(userDocRef, { spreadSheetId: spreadsheetIdMain });
          
          console.log("Updated sheet id to Firestore:", spreadsheetIdMain);
        } catch (error) {
          console.error("Error updating Firestore:", error);
        }
      }
  
      spreadsheetDone();
    }
}


