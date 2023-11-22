import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import { getStorage, uploadBytesResumable,ref, getDownloadURL} from 'https://www.gstatic.com/firebasejs/10.2.0/firebase-storage.js';
import {
  getDatabase,
  get,
  set,
  remove,
  ref as REF,
  update,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-database.js";

import {firebaseConfig } from "../constant/index.js";
import { hideLoadingScreen, showLoadingScreen, isEmptyObject, createFileInFolder} from "./index.js";


const { ipcRenderer } = require("electron");

const fs = require("fs");
const path = require("path");

const App = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(App);
const storage = getStorage(App);

// Configure Multer storage

const folderName = "Allotrix"
const documentsPath = path.join(process.env.HOME || process.env.USERPROFILE, 'Documents');
const targetFolderPath = path.join(documentsPath, folderName);

const usersCollection = collection(db, "users");


const workingContainer = document.getElementById("working-container");

export function settings(){
    const pageName = document.getElementById("page-name");
    pageName.textContent = "Settings";
    
    baseContainer();

}

function baseContainer() {
    const base = document.createElement("div");
    base.id = "settings-base-container";
  
    const settingsMenu = document.createElement("div");
    settingsMenu.id = "settings-menu-container";
  
    const settingsView = document.createElement("div");
    settingsView.id = "settings-view-container";
  
    base.appendChild(settingsMenu);
    base.appendChild(settingsView);
    workingContainer.appendChild(base);
  
    let settingsMenuItems = [ "Account","Constraints","Email Templates", "Updates", "Reset", "Logout"];
  
    settingsMenuItems.forEach(item => {
      const itemBtn = document.createElement("button");
      itemBtn.id = "settings-buttons";

      const iconContainer = document.createElement("span");

      const btnIcon = document.createElement("i");
      btnIcon.className = "fas fa-square";
      iconContainer.appendChild(btnIcon); 

      const textNode = document.createTextNode(item); 
      iconContainer.appendChild(textNode); 

      itemBtn.appendChild(iconContainer);

  

      settingsMenu.appendChild(itemBtn);



  
      itemBtn.addEventListener("click", () => {
       if (item === "Account") {
          account();
          console.log("Account clicked");
        } 
        else if (item === "Email Templates") {
          console.log("Email Temps clicked");
        } 
        else if (item === "Updates") {
          console.log("Updates clicked");
          updates();
        } 
        else if (item === "Constraints") {
          console.log("constraints clicked");
          constraints();
        } 
        else if (item === "Reset") {
          console.log("Reset clicked");
          reset()
        } 
        else if (item === "Logout") {
          const confirmLogout = window.confirm("Are you sure you want to log out?");
          if (confirmLogout) {
              Logout();
              console.log("Logout clicked");
          }
        }
      });
    });
  }

  async function updates() {
    
    await open('http://www.allotrix.com');


  };

async function constraints() {
    const settingsViewContainer = document.getElementById("settings-view-container");
  settingsViewContainer.innerHTML = "";

  const profileHeader = document.createElement("div");
  profileHeader.classList.add("settings-header");


  const heading = document.createElement("h2");
  heading.textContent = "Constraints Edit";

  profileHeader.appendChild(heading);
  settingsViewContainer.appendChild(profileHeader);

  console.log("constraints container")
  
  
  const constraintsContainer = document.createElement('div')
  constraintsContainer.id = "constraints-container";
  constraintsContainer.innerHTML = '';

    const constraintsHeading = document.createElement("h1");
    constraintsHeading.textContent = "Choose Allotment Constraints";
    constraintsContainer.appendChild(constraintsHeading);
    
    

  const choiceContainer = document.createElement("div");
  choiceContainer.className = "committee-section";
  choiceContainer.style.display = "flex";
  choiceContainer.style.flexDirection = "column";
  choiceContainer.style.width = "100%";
  choiceContainer.style.alignItems = "center";
  choiceContainer.style.justifyContent = "center";





  function createCategoryRow(categoryName) {
      const categoryRow = document.createElement("div");
      categoryRow.className = "category-row";
      categoryRow.style.width = "65%";
      categoryRow.style.alignItems = "center";
      categoryRow.style.justifyContent = "center";

      const label = document.createElement("label");
      label.textContent = `${categoryName}`;
      categoryRow.appendChild(label);

      const counterInput = document.createElement("input");
      counterInput.classList.add("category-input")
      counterInput.type = "number";
      
      counterInput.min = "0";
       

       const jsonConstFileName = 'constraints.json';
  const jsonConstFilePath = path.join(targetFolderPath, jsonConstFileName);

      let constraintsData = {}
      if (fs.existsSync(jsonConstFilePath)) {
        constraintsData = JSON.parse(fs.readFileSync(jsonConstFilePath, 'utf8'));
        console.log(constraintsData)
      }
      else{
        console.log("doesnt exist")
      }

      counterInput.placeholder = constraintsData[categoryName];





      categoryRow.appendChild(counterInput);

      choiceContainer.appendChild(categoryRow);
  }

  createCategoryRow("Category 1");
  createCategoryRow("Category 2");
  createCategoryRow("Category 3");


    
    const nBtn = document.createElement("button");
    
    nBtn.textContent = "Submit";
    nBtn.className = "add-button";
    nBtn.style.width = "70%";
    choiceContainer.appendChild(nBtn);

    const description = document.createElement('p');
      description.className = "normal-description-tag"
      description.innerHTML = '<b>Note: </b> we rank delegate allotments based on our coherent formula. So set constriants from 0 to 100+ ';
      choiceContainer.appendChild(description);



    nBtn.addEventListener('click', async () => {
      const categoryInputs = document.querySelectorAll('.category-input');
    
      const inputsNotEmpty = Array.from(categoryInputs).every(input => input.value !== '');
    
      if (!inputsNotEmpty) {
        displayError('Field cannot be empty');
      } else {
        const confirmLogout = window.confirm('Are you sure you?');
    
        if (confirmLogout) {
          const constraintsData = {
            'Category 1': parseInt(categoryInputs[0].value),
            'Category 2': parseInt(categoryInputs[1].value),
            'Category 3': parseInt(categoryInputs[2].value)
          };

          console.log("constraints data: ", constraintsData)
    
          // Put in Firebase
          const user = auth.currentUser;

          if (!user) {
            console.error('User not authenticated.');
            return;
          }

          const userId = user.uid;

          const realDb = getDatabase(App);

          const constraintsRef = REF(realDb, `${userId}/constraints`);

          console.log("Firebase Reference Path: ", constraintsRef.toString());



          showLoadingScreen();
          
          try {
              if (!isEmptyObject(constraintsData)) {
                await set(constraintsRef, constraintsData);
                console.log('Constraints data updated in Firebase.');

                const constraintsJsonFileName = 'constraints.json';
                const jsonContent = constraintsData;
              
                // Write the updated content to 'constraints.json'
                createFileInFolder(folderName, constraintsJsonFileName, JSON.stringify(jsonContent, null, 2));


                ipcRenderer.send("reload-window");

              } else {
                console.log('Constraints data is empty. Not updating.');
              }
            
          } catch (error) {
            console.error('Error writing/updating constraints data in Firebase:', error);
          } finally {
            hideLoadingScreen();
          }
        }
      }
    });
    
    


  constraintsContainer.appendChild(choiceContainer);
    workingContainer.appendChild(constraintsContainer);


  function displayError(txt) {   
      const msgContainer = document.createElement('div');
      msgContainer.className = 'error-msg-container';
      const errorMessage = document.createTextNode(txt);
      msgContainer.appendChild(errorMessage);
    
      constraintsContainer.appendChild(msgContainer);
      console.log(txt)
    }

  settingsViewContainer.appendChild(constraintsContainer);




  }

  async function Logout() {
    // Setting algo running to false
    const userId = auth.currentUser.uid;
    const userDocRef = doc(usersCollection, userId);
  
    await updateDoc(userDocRef, { loggedIn: false });
  
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

export function account() {
  const settingsViewContainer = document.getElementById("settings-view-container");
  settingsViewContainer.innerHTML = "";

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");


  const profileHeader = document.createElement("div");
  profileHeader.classList.add("settings-header");


  const heading = document.createElement("h2");
  heading.textContent = "Account";

  const profilePicLabel = document.createElement("label");
  profilePicLabel.textContent = "Profile Picture";

  const oldPfp = document.getElementById("pfp");

  const profilePicDisplay = document.createElement("div");
  profilePicDisplay.id = "profilePicDisplay";

  profilePicDisplay.style.width = "100px";
  profilePicDisplay.style.height = "100px";
  profilePicDisplay.style.borderRadius = "50%";
  profilePicDisplay.style.backgroundColor = "white"
  profilePicDisplay.style.innerHTML = "";
  profilePicDisplay.style.backgroundImage = `url('${oldPfp.src}')`;

  const newProfilePicInput = document.createElement("input");
  newProfilePicInput.type = "file";
  newProfilePicInput.id = "newProfilePic";
  newProfilePicInput.style.width = "60%";
  newProfilePicInput.classList.add("normal-button");

  const updateProfilePicDisplay = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      profilePicDisplay.style.backgroundImage = `url('${e.target.result}')`;
      profilePicDisplay.style.backgroundSize = "cover";
    };

    reader.readAsDataURL(file);
  };

  newProfilePicInput.onchange = async (e) => {
    if (newProfilePicInput.files.length > 0) {
      const selectedFile = newProfilePicInput.files[0];

      // Validate that the selected file is a PNG image
      if (selectedFile.type !== "image/png") {
        window.confirm("Please select a PNG image.");
        return;
      }

      updateProfilePicDisplay(selectedFile);
    } else {
      profilePicDisplay.style.backgroundImage = "assets/default.jpeg";
    }
  };

  const changeNameLabel = document.createElement("label");
  changeNameLabel.textContent = "Change Name";

  const name = document.getElementById("org-name").textContent;
  const newNameInput = document.createElement("input");
  newNameInput.type = "text";
  newNameInput.id = "newName";
  newNameInput.placeholder = "New Name";
  newNameInput.value = name;

  const saveChangesBtn = document.createElement("button");
  saveChangesBtn.id = "saveChanges";
  saveChangesBtn.textContent = "Save Changes";
  saveChangesBtn.classList.add("normal-button");

  // Append elements to the modal content
  profileHeader.appendChild(heading);


  modalContent.appendChild(profilePicLabel);
  modalContent.appendChild(profilePicDisplay);
  modalContent.appendChild(newProfilePicInput);
  modalContent.appendChild(changeNameLabel);
  modalContent.appendChild(newNameInput);
  modalContent.appendChild(saveChangesBtn);

  // Append modal content to the modal
  settingsViewContainer.appendChild(profileHeader);
  settingsViewContainer.appendChild(modalContent);


  //progressbar div===============
  const progressModal = document.createElement("div");
progressModal.id = "progress-modal";
progressModal.classList.add("modal");

const progContent = document.createElement("div");
progContent.classList.add("prog-content");

const progressHeading = document.createElement("h3");
progressHeading.textContent = "Uploading Image";

const progressBarContainer = document.createElement("div");
progressBarContainer.id = "pfp-progress-bar-container";

const progressBar = document.createElement("div");
progressBar.id = "pfp-progress-bar";


const progresspercent = document.createElement("h3");
progresspercent.textContent = "0%";

progressBar.appendChild(progresspercent);
progressBarContainer.appendChild(progressBar);
progContent.appendChild(progressHeading);
progContent.appendChild(progressBarContainer);
progressModal.appendChild(progContent);

document.body.appendChild(progressModal);

//===============

  // Save changes button event listener
  saveChangesBtn.addEventListener("click", async () => {
    const newName = newNameInput.value;
    const USER = auth.currentUser;
  
    if (!USER) {
      console.error("User not authenticated.");
      return;
    }
  
    const UID = USER.uid;
  
    // Update the user's name
    await updateDoc(doc(usersCollection, UID), { name: newName });
    console.log("New name updated");
  
    const file = newProfilePicInput.files[0];
  
    if (file) {
      const USER = auth.currentUser;
      const UID = USER.uid;
  
      const storageRef = ref(storage, `${UID}/pfp.png`);
  
      // Validate that the selected file is a PNG image
      if (file.type !== "image/png") {
        window.confirm("Please select a PNG image.");
        return;
      }
  
      // Show the progress modal
      progressModal.style.display = "flex";
  
      // Read the file from its path using the fs module
      fs.readFile(file.path, (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }
  
        // Upload the file data to Firebase Storage
        const uploadTask = uploadBytesResumable(storageRef, data);
  
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Uploading... ${Math.round(progress,2)}%`);

            progressBar.style.width = `${progress}%`;
            progresspercent.textContent = `${progress}%`;

            
  
            if (progress === 100) {
              progressModal.style.display = "none";
            }
          },
          (error) => {
            console.error("Error uploading image:", error);
            progressModal.style.display = "none";
          },
          async () => {
            try {
              // Get the download URL of the uploaded image
              const downloadURL = await getDownloadURL(ref(storage, `${UID}/pfp.png`));
              console.log("Image uploaded and available at:", downloadURL);
              ipcRenderer.send("reload-window");

            } catch (error) {
              console.error("Error getting download URL:", error);
            }
          }
        );

      });
    } 
    else {
      console.error("No file selected.");
    }
  });
}

async function reset() {
  // Assuming this code is inside a function or part of an event handler
  const popupContainer = document.createElement('div');
  popupContainer.id = 'reset-popup-container';
  popupContainer.classList.remove('hidden');

  const popup = document.createElement('div');
  popup.classList.add('reset-popup');

  const popupHeader = document.createElement('div');
  popupHeader.classList.add('reset-popup-header');

  const heading = document.createElement('h1');
  heading.textContent = 'Reset Data';

  const resetCloseButton = document.createElement('button');
  resetCloseButton.id = 'reset-close-popup';
  resetCloseButton.classList.add('reset-close-button');
  resetCloseButton.textContent = 'X';

  const popupContent = document.createElement('div');
  popupContent.classList.add('reset-content');

  // Append the elements to build the structure
  popupHeader.appendChild(heading);
  popupHeader.appendChild(resetCloseButton);
  popup.appendChild(popupHeader);
  popup.appendChild(popupContent);

  // Append the popup and popupContainer to the body
  

  resetCloseButton.addEventListener('click', () => {
    popupContainer.classList.add('hidden');
  });

  const expectedOrgText = document.getElementById("org-name").textContent;

  const orgText = document.createElement("h1");
  orgText.style.color = "white";
  orgText.textContent = `type ${expectedOrgText} to confirm`;

  // Input field
  const orgNameInput = document.createElement('input');
  orgNameInput.type = 'text';
  orgNameInput.id = 'orgNameInput';

  // Confirm button
  const confirmButton = document.createElement('button');
  confirmButton.className = "normal-button"
  confirmButton.innerHTML = 'Confirm';

  const description = document.createElement('p');
  description.className = "normal-description-tag"
  description.innerHTML = '<b>Warning: </b> This will reset your country matrix data.';


  popupContent.appendChild(orgText);
  popupContent.appendChild(orgNameInput);
  popupContent.appendChild(confirmButton);
  popupContent.appendChild(description);


  popupContainer.appendChild(popup);
  document.body.appendChild(popupContainer);


  confirmButton.addEventListener("click", async()=>{
    const enteredOrgName = document.getElementById('orgNameInput').value;
    console.log(enteredOrgName)
    console.log(expectedOrgText)

    if (enteredOrgName === expectedOrgText) {
      const user = auth.currentUser;
  
      if (!user) {
        console.error('User not authenticated.');
        return;
      }
  
      const userId = user.uid;
      const realDb = getDatabase(App);
      const userRef = REF(realDb, userId);
      
      showLoadingScreen()
      try {
        await remove(userRef);
        ipcRenderer.send("reload-window")
        console.log('User data deleted from Firebase.');
      } catch (error) {
        console.error('Error deleting user data from Firebase:', error);
      }finally{
        hideLoadingScreen()
      }
    } else {
      displayError('Entered organization name does not match')
      console.log('Entered organization name does not match. Aborting operation.');
    }

  })
  function displayError(txt) {   
    if(popupContent.getElementsByClassName('error-msg-container').length === 0){

      const msgContainer = document.createElement('div');
      msgContainer.className = 'error-msg-container';

      const errorMessage = document.createTextNode(txt);
      msgContainer.appendChild(errorMessage);

      popupContent.appendChild(msgContainer);
    console.log(txt)

    }
  
  
    
  }
}


