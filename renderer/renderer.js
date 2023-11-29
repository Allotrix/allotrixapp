import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, updateDoc, getDoc} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-database.js";
import { getStorage, ref as sRef, getDownloadURL} from 'https://www.gstatic.com/firebasejs/10.2.0/firebase-storage.js';


import { dashboard, hideLoadingScreen, makeScreen, showLoadingScreen, notificationLoader, createFileInFolder} from "./components/index.js";
import {firebaseConfig,  } from "./constant/index.js";
const fs = require("fs");
const path = require("path");
const { ipcRenderer } = require('electron');


const tutorialBtn = document.getElementById("tutorial");
tutorialBtn.addEventListener("click", async()=>{
     open("https://allotrix.com/");
});

const folderName = "Allotrix"
const documentsPath = path.join(process.env.HOME || process.env.USERPROFILE, 'Documents');
const targetFolderPath = path.join(documentsPath, folderName);


const App = initializeApp(firebaseConfig);

const auth = getAuth(App);
const db = getFirestore(App);
const storage = getStorage(App)


let subscriptionPurchased;
const checkbox = document.getElementById('emailToggle');


document.addEventListener('DOMContentLoaded', async function () {
    console.log("logged")
    const jsonFilePath = path.join(targetFolderPath, "CRED.json");


    if (fs.existsSync(jsonFilePath)){
        console.log("cred exists")
    }
    
    else{
        console.log("CRED doesnt exist")
    }
  


      
    if (fs.existsSync(jsonFilePath)) {


        try {
            async function getAcc() {
                const USER = auth.currentUser;
                if (USER) {
                    const UID = USER.uid;
                    const userDocRef = doc(db, "users", UID);
                    const storageRef = sRef(storage, `${UID}/pfp.png`) 
                    const userDoc = await getDoc(userDocRef);
                    const userData = userDoc.data();

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

                    const orgName = document.getElementById("org-name");
                    orgName.textContent = userData.name;
                } else {
                    console.log("USER isn't signed in");
                }
            }

            //update email temp
            const jsonemailprefFilePath = path.join(targetFolderPath, 'email_pref.json');

  
              let existingJsonData = JSON.parse(fs.readFileSync(jsonemailprefFilePath, 'utf8'));
              if (existingJsonData["automate_email"] == true) {
                checkbox.checked = true;
                checkbox.style.backgroundColor = '#4CAF50';
                checkbox.style.border = '2px solid #4CAF50';
  
              }else{
                checkbox.checked = false;
                checkbox.style.backgroundColor = '#EF4036';
                checkbox.style.border = '2px solid #EF4036';
              }


            
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    showLoadingScreen()
                    try{
                     await dashboard();
                     
                     await checkSubscription();
                     await disablePremiumCards();
                     await getAcc();
                     await notificationLoader();
                    }finally{
                        hideLoadingScreen()
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
                     
                     console.log("user was already signed in")
    
                }
                else{
                    console.log("user was signedout")
                    const existingData = fs.readFileSync(jsonFilePath, 'utf8');
                    const jsonData = JSON.parse(existingData);

                    const savedEmail = jsonData.email;
                    const savedPassword = jsonData.password;


                    const userCredential =  async ()=>{ await signInWithEmailAndPassword(auth, savedEmail, savedPassword);}
                    console.log("user auto signed in")

                    if (userCredential) {
                        showLoadingScreen()
                        try{
                        await dashboard();
                        await checkSubscription();
                        await disablePremiumCards();
                        await getAcc();
                        await notificationLoader();
                        }finally{
                            hideLoadingScreen()
                        }
                    }
                }
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
                  
                        const setUp = document.getElementById("set-up")
                        setUp.disabled = true;
                        setUp.style.pointerEvents = 'none';
                        setUp.style.opacity = '0.5';
                     
                      } else {
                        console.log('Matrix node does not exist in Firebase.');
                  
                        const addComBtn = document.getElementById("add-committees")
                        const matrixBtn = document.getElementById("matrix")

                        const dash = document.getElementById("dashboard")
                   
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
                  //CHECKING FOR MATRIX FILE EXIS
                  
                  document.addEventListener('DOMContentLoaded', checkMatrixNodeInFirebase());
            })
        } catch (error) {
            console.log(error)
            makeScreen();
        }
    } else {
        makeScreen();
    }
});





export async function disablePremiumCards() {
    if (subscriptionPurchased === false) {
        const premiumElements = document.querySelectorAll(".premium");

        premiumElements.forEach(element => {
            element.classList.add("disabled");
            const overlay = document.createElement("div");
            overlay.className = "overlay";
            overlay.textContent = "Premium Content";

            const overlayButton  = document.createElement("button");
            overlayButton.className = "normal-button";
            overlayButton.textContent = "Buy Premium"

            overlay.appendChild(overlayButton)

            element.appendChild(overlay);
        });
    }
}

//check for email preferences
const manualEmailCardviewButton = document.getElementById("manual-email-card-view-button")
checkbox.addEventListener('click', function () {

  const jsonFilePath = path.join(targetFolderPath, 'email_pref.json');

try {
  let existingData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
  if (this.checked) {
    existingData['automate_email'] = true;
    this.style.backgroundColor = '#4CAF50';
    this.style.border = '2px solid #4CAF50';
    

  } 
  else {
    existingData['automate_email'] = false;
    this.style.backgroundColor = '#EF4036';
    this.style.border = '2px solid #EF4036';
    this.checked = false;
  }

  fs.writeFileSync(jsonFilePath, JSON.stringify(existingData, null, 2));

} catch (error) {
  console.error('Error updating file:', error.message);
}
});

