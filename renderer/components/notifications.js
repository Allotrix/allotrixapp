const fs = require('fs');
const path = require('path');

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getAuth,} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, updateDoc, getDoc} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import { getDatabase, ref, get} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-database.js";

import {firebaseConfig } from "../constant/index.js";

import {getAllValuesLengthFromOGSheet, getAllValuesFromDUP_CHKSheet, createFileInFolder} from "./index.js"

const App = initializeApp(firebaseConfig);
const auth = getAuth(App);
const db = getFirestore(App);

const folderName = "Allotrix"
const documentsPath = path.join(process.env.HOME || process.env.USERPROFILE, 'Documents');
const targetFolderPath = path.join(documentsPath, folderName);


export function notification(message, source){


    const notificationOutput =  document.getElementById("notif-output");
    if (notificationOutput){
  
      const notificationCard = document.createElement('div');
      notificationCard.classList.add('notification-card');
    

      const notificationImgDiv = document.createElement('div');
      notificationImgDiv.classList.add('notification-img-div');
      notificationImgDiv.style.backgroundImage = `url(${source})`;
      notificationImgDiv.style.backgroundSize = `cover`;

      

    
      const notificationContent = document.createElement('div');
      notificationContent.classList.add('notification-content');
      notificationContent.textContent = message;
    
      const closeButton = document.createElement('button');
      closeButton.classList.add('notification-close-button');
      closeButton.textContent = 'x';
      closeButton.onclick = function () {
        notificationCard.remove();
      };
    
      notificationCard.appendChild(notificationImgDiv);
      notificationCard.appendChild(notificationContent);

      if(!message.includes("No notifications")){
        notificationCard.appendChild(closeButton);

      }
    
      notificationOutput.appendChild(notificationCard);
  
    }
    else{
      console.log("notification container not seen")
    }
      
    
  
  
  }

  export async function versionChecker() {
    try {
      const auth = getAuth(App);
      const USER = auth.currentUser;
  
      if (USER) {
        const UID = USER.uid;
        const userDocRef = doc(db, "users", UID);
  
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();
  
        if (userData) {
          let localVersion;
        //getting firestore version num

          const firestoreVersion = userData.version;

  
          // Read the local JSON file (version.json)
          const versionPath = path.join(targetFolderPath, "version.json");


          
          try {
            if (fs.existsSync(versionPath)) {
                console.log("version file exists at", versionPath)
              const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
              localVersion = versionData.version;
              console.log(localVersion)
            } else {
              // If the local version file doesn't exist, create it with the Firestore version
              localVersion = firestoreVersion;

              const versionFileName = "version.json"
              createFileInFolder(folderName, versionFileName, JSON.stringify({ version: localVersion }))
            }
  
            // Compare the versions
            if (localVersion < firestoreVersion) {
              notification("Update available! Head to www.allotrix.in to update!", "./assets/logo2.png");
            } 
          } catch (error) {
            console.error('Error reading or writing version.json:', error);
          }
        } else {
          console.log('User data not found in Firestore | tried fetching version');
        }
      }
    } catch (error) {
      console.error('Error in versionChecker:', error);
    }
  }

  export async function adminNotificationChecker() {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated.");
      return;
    }
  
    const userId = user.uid;
    const realDb = getDatabase(App);
    const notifRef = ref(realDb, `${userId}/notifications`);
  
    try {
      // Check if the "notifications" node exists
      const snapshot = await get(notifRef);
      if (snapshot.exists()) {
        // Iterate through the child nodes (notifications)
        const notifications = snapshot.val();
        Object.values(notifications).forEach(message => {

            console.log(message)
            
            notification(message, "./assets/logo2.png")
          });
      } else {
        console.log("No notifications found.");
      }
    } catch (error) {
      console.error("Fetching error:", error);
    }
  }

  export async function newRegistrationNotificationChecker(){
    // Get values from the OG sheet
  const ogSheetLength = await getAllValuesLengthFromOGSheet();

  // Get values from the DUP_CHK sheet
  const dupChkSheetLength = await getAllValuesFromDUP_CHKSheet();

  // ===== Comparing the data and exclude duplicates =======

    if (ogSheetLength === dupChkSheetLength){
        return false
    }
    else{
        let newParticipants = ogSheetLength - dupChkSheetLength;
        notification(`${newParticipants} new participants have registered`, "./assets/gforms.png");
        return true
  }
 
}

export async function defaultnotificationChecker() {
    const notifOutput = document.getElementById("notif-output");
  
    if (notifOutput && !notifOutput.hasChildNodes()) {
      notification("No notifications here", "./assets/logo2.png");
    } 

  }
  