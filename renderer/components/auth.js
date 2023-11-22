//const Store = require('electron-store');


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import { dashboard, hideLoadingScreen, showLoadingScreen, createFileInFolder} from "./index.js";



import {firebaseConfig } from "../constant/index.js";

const App = initializeApp(firebaseConfig);

const auth = getAuth(App);
const db = getFirestore(App);
const usersCollection = collection(db, "users");
const folderName = 'Allotrix';




export function makeScreen(){
    const base = document.getElementById("base-container")
    const screen = document.createElement("div");
    screen.id = "auth-container"

    base.appendChild(screen)

    loginPage()
}

function loginPage(){


    const authContainer = document.getElementById("auth-container");
    authContainer.innerHTML = "";

    
    const loginContainerWrap = document.createElement("div");
    loginContainerWrap.id = "login-wrap";

    const loginVideoContainer = document.createElement("div");
    loginVideoContainer.id = "login-video";

    const loginTitle = document.createElement("h1");
    loginTitle.textContent = "Login"
    loginVideoContainer.appendChild(loginTitle);



    const loginIMG = document.createElement("img");
    loginIMG.id = "login-img";
    loginIMG.src = "assets/login.svg";

    loginVideoContainer.appendChild(loginIMG);

 



    const loginContainer = document.createElement("div");
    loginContainer.id = "login-container";

    const constraintsHeading = document.createElement("h1");
    constraintsHeading.textContent = "Enter Your Credentials";
    loginContainer.appendChild(constraintsHeading);

    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "Email";

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "Password";

    const loginButton = document.createElement("button");
    loginButton.textContent = "Login";
    loginButton.classList.add("login-button");

   

    const loginOption = document.createElement("p");
    loginOption.textContent = "-or-";
    loginOption.style.color = "grey";

    const googleLoginButton = document.createElement("button");
    googleLoginButton.id = "google-login-button"
    googleLoginButton.classList.add("google-login-button");
    googleLoginButton.style.background = "transparent";
    googleLoginButton.style.color = "black";
    googleLoginButton.style.display="flex"
    googleLoginButton.style.gap="5px"


    const googleIcon = document.createElement("i");
    googleIcon.classList.add("fa-brands", "fa-google"); 
    googleLoginButton.appendChild(googleIcon);
    googleLoginButton.appendChild(document.createTextNode("Login with Google"));



    const signUpAnchor = document.createElement("a");
    signUpAnchor.textContent = "Don't have an account? SignUp";
    signUpAnchor.addEventListener("click", signUpPage)



    // Append form elements to the login form
    loginContainer.appendChild(emailInput);
    loginContainer.appendChild(passwordInput);
    loginContainer.appendChild(loginButton);
    loginContainer.appendChild(loginOption);
    loginContainer.appendChild(googleLoginButton);
    loginContainer.appendChild(signUpAnchor);




    // Add event listeners
    loginButton.addEventListener("click", async () => {
        const email = emailInput.value;
        const password = passwordInput.value;


        // Perform login validation and logic here
        // For example:
        if (email && password) {

            const previousErrorMessages = document.querySelectorAll('.error-msg-container');
            previousErrorMessages.forEach((errorMsg) => {
              errorMsg.remove();
            });

        
            showLoadingScreen()
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
                const userId = userCredential.user.uid;
            

                await updateDoc(doc(usersCollection, userId), { loggedIn: true });

                console.log("User signed up successfully!");

                // Updating Firestore and CRED.JSON loggedIn field

                const local_remember = {
                    "email": email,
                    "password": password
                }
            
                const jsonFileName = 'CRED.json';
                const jsonContent = local_remember

                const emailPref = {
                    "automate_email": false,
                }
                const json_emailPref_FileName = 'email_pref.json';

            
                createFileInFolder(folderName, jsonFileName, JSON.stringify(jsonContent, null, 2));
                createFileInFolder(folderName, json_emailPref_FileName, JSON.stringify(emailPref, null, 2));


                
                //update the sheet name
                const userDocRef = doc(usersCollection, userId);
                const userDocSnapshot = await getDoc(userDocRef);

                if (userDocSnapshot.exists()) {
                    // Gettin tthe "spreadSheetId" field from Firestore
                    const userData = userDocSnapshot.data();
                    const spreadsheetId = userData.spreadSheetId; 

                    // Update the 'sheet.json' file
                    const jsonSheetFileName = 'sheet.json';
                    const jsonSheetContent = { sheetid: spreadsheetId };

                    // Write the updated content to 'sheet.json'
                    createFileInFolder(folderName, jsonSheetFileName, JSON.stringify(jsonSheetContent, null, 2));

                    console.log("User signed up successfully and 'sheet.json' updated!");

                } else {
                    console.error("User document not found.");
                }

                const authContainer = document.getElementById("auth-container")

                authContainer.remove()
                dashboard();

                

            }  catch (error) {
                displayError("Email doesn't exist, please create an account.", loginContainer)
                console.error("Error signing up:", error);
            }finally{
                hideLoadingScreen()
            }

        } else {
            displayError("Please enter email and password", loginContainer)
        }
    });

    googleLoginButton.addEventListener("click", () => {
        const originalContent = googleLoginButton.innerHTML;
    
        googleLoginButton.innerHTML = "Coming Soon";
    
        setTimeout(() => {
            googleLoginButton.innerHTML = originalContent;
        }, 2000);
    });
    
   



    loginContainerWrap.appendChild(loginVideoContainer);
    loginContainerWrap.appendChild(loginContainer);

    authContainer.appendChild(loginContainerWrap);

}

// Error Message displayer
function displayError(txt, container) {   
    const msgContainer = document.createElement('div');
    msgContainer.className = 'error-msg-container';
    const errorMessage = document.createTextNode(txt);
    msgContainer.appendChild(errorMessage);
    msgContainer.style.color = "red";
  
    container.appendChild(msgContainer);
    console.log(txt)
  }





function signUpPage(){

    const authContainer = document.getElementById("auth-container");
    authContainer.innerHTML = "";




    const signUpContainerWrap = document.createElement("div");
    signUpContainerWrap.id = "login-wrap";

    const signUpVideoContainer = document.createElement("div");
    signUpVideoContainer.id = "login-video";

    const signUpTitle = document.createElement("h1");
    signUpTitle.textContent = "sign Up"
    signUpVideoContainer.appendChild(signUpTitle);



    const signUpIMG = document.createElement("img");
    signUpIMG.id = "login-img";
    signUpIMG.src = "assets/signup.svg";

    signUpVideoContainer.appendChild(signUpIMG);





    const signUpContainer = document.createElement("div");
    signUpContainer.id = "login-container";

    const constraintsHeading = document.createElement("h1");
    constraintsHeading.textContent = "Enter Your Credentials";
    signUpContainer.appendChild(constraintsHeading);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Full Name";

    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "Email";

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.placeholder = "Password";



    const signUpButton = document.createElement("button");
    signUpButton.textContent = "signUp";
    signUpButton.classList.add("login-button");



    const signUpOption = document.createElement("p");
    signUpOption.textContent = "-or-";
    signUpOption.style.color = "grey";

    const googlesignUpButton = document.createElement("button");
    googlesignUpButton.classList.add("google-login-button");
    googlesignUpButton.style.background = "transparent";
    googlesignUpButton.style.color = "black";
    googlesignUpButton.style.display="flex"
    googlesignUpButton.style.gap="5px"


    const googleIcon = document.createElement("i");
    googleIcon.classList.add("fa-brands", "fa-google"); 

    googlesignUpButton.appendChild(googleIcon);
    googlesignUpButton.appendChild(document.createTextNode("SignUp with Google"));

    const loginAnchor = document.createElement("a");
    loginAnchor.textContent = "Already have an account? Login";

    loginAnchor.addEventListener("click", loginPage)



    // Append form elements to the signUp form
    signUpContainer.appendChild(nameInput);
    signUpContainer.appendChild(emailInput);
    signUpContainer.appendChild(passwordInput);
    signUpContainer.appendChild(signUpButton);
    signUpContainer.appendChild(signUpOption);
    signUpContainer.appendChild(googlesignUpButton);
    signUpContainer.appendChild(loginAnchor);




    // Add event listeners
    signUpButton.addEventListener("click", async (event) => {
        event.preventDefault();

        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;

        if (email && name && password) {

            const previousErrorMessages = document.querySelectorAll('.error-msg-container');
            previousErrorMessages.forEach((errorMsg) => {
              errorMsg.remove();
            });

            const userData = {
                name,
                email,
                password,
                loggedIn: false,
                subscriptionPurchased: false,
                html: "",
                version: 1
            };

            showLoadingScreen();
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
                const userId = userCredential.user.uid;
            
                await setDoc(doc(usersCollection, userId), userData);
            
                console.log("User signed up successfully!");

                // Updating Firestore and CRED.JSON loggedIn field
                await updateDoc(doc(usersCollection, userId), { loggedIn: true });

                const local_remember = {
                    "email": email,
                    "password": password
                }


            
                const jsonFileName = 'CRED.json';

                const emailPref = {
                    "automate_email": false,
                }
                const json_emailPref_FileName = 'email_pref.json';



                createFileInFolder(folderName, jsonFileName, JSON.stringify(local_remember, null, 2));
                createFileInFolder(folderName, json_emailPref_FileName, JSON.stringify(emailPref, null, 2));

                


                const authContainer = document.getElementById("auth-container")

                authContainer.remove()
                dashboard();


                
                

            }  catch (error) {
                //const signUpContainer = document.getElementById("login-container")

                displayError("Email already in Use. Please log in.", signUpContainer)
                console.error("Error signing up:", error);
            }finally {
                hideLoadingScreen();            
            }
    
        } else {
            //const signUpContainer = document.getElementById("login-container")
            displayError("Can't leave any feild empty!", signUpContainer)
    
        }
  

        
    });

   
googlesignUpButton.addEventListener("click", () => {
    const originalContent = googlesignUpButton.innerHTML;

    googlesignUpButton.innerHTML = "Coming Soon";

    setTimeout(() => {
        googlesignUpButton.innerHTML = originalContent;
    }, 2000);
});


    signUpContainerWrap.appendChild(signUpVideoContainer);
    signUpContainerWrap.appendChild(signUpContainer);

    authContainer.appendChild(signUpContainerWrap);




}

