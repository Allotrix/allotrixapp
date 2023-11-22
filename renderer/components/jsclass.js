// authored by lavlin jaison

const fs = require('fs');
const path = require('path');
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
import { pasteResultToCommitteeSheet,pasteResultToWaitlistSheet, consoleLog, pastetoblacklist, deleteRowFromDUP  } from "./index.js";
const App = initializeApp(firebaseConfig);

const auth = getAuth(App);
const db = getFirestore(App);
const usersCollection = collection(db, "users");


export class Alotter{
    constructor() { //function run automaticatlly when starting class like __init__
        this.raw_data = ""
        this.commitee_exp_req = []; //commmitee exp req ...[com2_req,com1_req] //atleast 3 for most pertinent and between 1 and 3 fot moderately pertinent
        this.user_details = []; // [ [com1,com2] , mun_exp, firstname ,lastname , email , phone ]
        this.category_equi = {'mostPertinent':1,'moderatelyPertinent':2,'leastPertinent':3}
        this.category_equi_rev = {1:'mostPertinent',2:'moderatelyPertinent',3:'leastPertinent'}
        this.categories = {1:[2,3],2:[3],3:[]} // order of priority
        this.category = ''; //category the algorithm currently is checking 
        this.committee_data_raw = "";
        this.commitee_order = [];
        this.running = false; 
        this.allotment = false;
        this.count_allot = [];
        this.output = [];


    }
    async controller(){ //call this function to do all the work after defining variables
        try {
            await this.firebase_read();
            await this.getCategory();
            await this.get_com_details();
            await this.A_checker(this.category);
          } catch (error) {
            console.error("Error in controller:", error);

            const [idk, munExp, firstName, lastName, email, phone ] = this.user_details;

            const combinedData = [firstName, lastName, email, phone, munExp, "None",  "None",  "None"];

            await pasteResultToWaitlistSheet(combinedData).then(async()=>{
                await deleteRowFromDUP(email).then(()=>{
                    consoleLog("No countries in matrix, user pasted to blacklist")

                })

            })



            
          }
        }
    async getCategory() { // converts years of experience into pertinency 
        console.log(this.user_details);
        console.log(Alotter.commitee_exp_req);
        if (this.user_details[1] <= Alotter.commitee_exp_req[0]) {
            this.category = 'leastPertinent';
        } else if (this.user_details[1] > Alotter.commitee_exp_req[0] && this.user_details[1] < Alotter.commitee_exp_req[1]) {
            this.category = 'moderatelyPertinent';
        } else if (this.user_details[1] >= Alotter.commitee_exp_req[1]) {
            this.category = 'mostPertinent';
        }
        console.log("CATEGORY SET:", this.category);
    }
    async get_com_details(){ // reorders the list of commitees so that first and second pref come first and second in the list
        this.committee_data_raw = Alotter.raw_data;
        var committeeNames = Object.keys(this.committee_data_raw);

        const first = this.user_details[0][0]
        const second = this.user_details[0][1]

        if (committeeNames.indexOf(first) == -1 && committeeNames.indexOf(first) == -1){
            const new_list = committeeNames.filter(function(value){
                return value != first  && value != second
            });
            this.commitee_order = new_list
        }else if (committeeNames.indexOf(first) == -1){
            const new_list = committeeNames.filter(function(value){
                return value != second
            });
            const l1 = [this.user_details[0][1]]
            this.commitee_order = l1.concat(new_list);

        }else if (committeeNames.indexOf(second) == -1){
            const new_list = committeeNames.filter(function(value){
                return value != first
            });
            const l1 = [this.user_details[0][0]]
            this.commitee_order = l1.concat(new_list);
        }else{
            const new_list = committeeNames.filter(function(value){
                return value != first  && value != second
            });
            this.commitee_order = this.user_details[0].concat(new_list);

        }
    }
//-----------------------------------algorithm------------------------------------------
  
    async A_checker(cate) {
        const cat = this.commitee_order;
        for (var j = 0; j < cat.length; j++) {
            const committee = this.committee_data_raw[cat[j]];
            
            if (committee) {
                const countries = committee[cate];
                if (countries && countries.length > 0) {
                    this.country_allotment(countries);
                    this.output = [this.count_allot[0],cate, cat[j]]; // output of the algorithm  ....[country,category,commitee]

                    console.log(this.output);
                    // Extract data from "this.output"
                    const [country, category, committeez] = this.output;

                    // Extract data from "this.user_details"
                    const [idk, munExp, firstName, lastName, email, phone ] = this.user_details;

                    // Create a new array with the desired format
                    const combinedData = [firstName, lastName, email, phone, munExp, committeez, country, category];

                    const ConsoleLoggingData = `Delegate: ${firstName + " " +lastName}\n Committee: ${committeez}\n Country: ${country}\n Category: ${category}`;


                    // Now "combinedData" contains the data in the required format
                    consoleLog(`Alloted user data: ${ConsoleLoggingData}`);

                     await pasteResultToCommitteeSheet(combinedData)




                    if (this.count_allot[1] != 0){
                        committee[cate] = committee[cate].slice(0,this.count_allot[1]-1).concat(committee[cate].slice(this.count_allot[1]+1));
      
                    }else{
                        committee[cate] = committee[cate].slice(1);
                    }
                    this.allotment = true;
                    this.raw_data = this.committee_data_raw;
                    //this.json_update('./matrix_1.json');
                    await this.firebase_update();
                    break;
                }
            }
        }
        if (this.allotment == false) {
            if (this.running == false) {
                await this.A_fail_check(cate);
            }
        }
    }
    

    async A_fail_check(cate){ //runs when no output is given from pref func it sets a new category and runs prev func again
        this.running = true;
        const num = this.category_equi[cate];
        const num2 = this.categories[num];
        for (var j =0 ; j < num2.length; j++){
            await this.A_checker(this.category_equi_rev[num2[j]]);
            if (this.allotment == true){
                consoleLog("alloted");
                break;
            }
        }
        if (this.allotment == false){
            consoleLog("Allotment waitlisted"); // put blacklist code here
            // Extract data from "this.user_details"
            const [idk, munExp, firstName, lastName, email, phone ] = this.user_details;

            // Create a new array with the desired format
            const combinedWaitlistData = [firstName, lastName, email, phone, munExp, "NONE", "NONE", "NONE"];
            await pasteResultToWaitlistSheet(combinedWaitlistData)
            

        }
    }

    async country_allotment(countries){
        const cunt = this.user_details[0].slice(2);
        var alooted = false;
        for (var i = 0; i < cunt.length; i++){
            if (alooted == false){
                const index = countries.indexOf(cunt[i]);
                if (index != -1 ){
                    alooted = true;
                    this.count_allot = [countries[index],index];
                }

            }
        }
        if (alooted == false){
            this.count_allot = [countries[0],0];

        }


    }
// -------------------------gerneral tools ---------------------------------------
    async json_read(filepath){// reading of json file
        let rawdata = fs.readFileSync(filepath);
        this.raw_data = JSON.parse(rawdata);
    }
    async json_update(filepath){ // updating of json file
        const jsonString = JSON.stringify(this.raw_data, null , 2);
        fs.writeFileSync(filepath, jsonString);
    }
    async firebase_read(){
        const user = auth.currentUser;  //current user
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
            const snapshot = await get(allotmentMatrixRef); //get the stuff 
            const snapshot2 = await get(constraintsRef);
            if (snapshot.exists() && snapshot2.exists() ) {
        // IF Data exists, retrieve it //get the data from the stuff
            Alotter.raw_data = snapshot.val();
            const commitee_exp = snapshot2.val();
            const com = Object.values(commitee_exp);
            const com2 = [...com].reverse();
            Alotter.commitee_exp_req = com2.slice(1);
        }
        }catch(error){consle.error(error)}
    
        }
    async firebase_update(){
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

        const matrixData = this.raw_data;
      
        try {
          // Check if data exists
          const snapshot = await get(allotmentMatrixRef);
          if (snapshot.exists()) {
            // IF Data exists, retrieve it
            const existingData = snapshot.val();
      
            // Merging existing data with new data
            const updatedData = { ...existingData, ...matrixData };
      
            // Update the data in Firebase
            await set(allotmentMatrixRef, updatedData);  //setting the data. (use documentation or chatgpt for other methods)
            }
            }catch(error){
                console.error(error)
            }

    }
    
}


//using the algorithm

//const item = new Alotter() //calling instance of class
//item.userdetails = [] //setting the user detials in format  ...[ [com1,com2] , mun_exp, firstname ,lastname , email , phone ]
//item.controller()

//module.exports = Alotter