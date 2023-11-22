import { allCountries, firebaseConfig} from "../constant/index.js";
import { spreadsheetDone, spreadsheetMessageAdded, spreadSheetLink, getSheetData} from "./blockTwo.js";
import {showMatrix} from "./blockThree.js";
import {committeeCheck, workingContainer, nextBtnContainer, setUpContainer, extraFieldContainer, matrixButton, isEmptyObject} from "./global.js";
import {createFieldContainer, fieldIndex, addNewField, removeNewField, nextBtnHandler, addNextButton, displayError} from "./blockOne.js";
import { dashboard, setupData, consoleLog, notificationLoader} from "./dashboard.js";
import {loadCommittees} from "./committees.js";
import {loadMatrix} from "./matrix.js";
import {constraints, constraintsData} from "./constraints.js";
import {createNewCommittee, getSheetIdFromJSONFile, getAuthClient} from "./createNewCommittee.js";
import {makeScreen} from "./auth.js"
import{settings, account} from "./settings.js"
import{createLoadingScreen, hideLoadingScreen, showLoadingScreen} from "./loadingScreen.js"
import {Alotter} from "./jsclass.js"
import {getAllValuesFromOGSheet, getAllValuesFromDUPSheet, getAllValuesFromDUP_CHKSheet,  getAllValuesFromWaitlistSheet,
    pasteToDUP_CHKAndDUP, deleteRowFromDUP, processOGData, pasteResultToWaitlistSheet,pasteResultToCommitteeSheet, getAllValuesLengthFromOGSheet, getAllValuesFromBlacklistSheet, pastetoblacklist, checkSubscription } from "./spreadsheetStuff.js"
import {notification, versionChecker, newRegistrationNotificationChecker,defaultnotificationChecker, adminNotificationChecker} from "./notifications.js"
import {createFileInFolder} from "./createFolder.js"
import{ disablePremiumCards} from "../renderer.js"
import {manualEmail} from "./manualEmail.js"

export {
    spreadsheetDone,
    showMatrix,
    createFieldContainer, 
    pastetoblacklist,
    checkSubscription,
    createFileInFolder,
    notificationLoader,
    defaultnotificationChecker,
    disablePremiumCards,
    getAllValuesFromBlacklistSheet,
    manualEmail,
    committeeCheck,
    notification,
    constraints, 
    workingContainer,
    getAllValuesLengthFromOGSheet,
    newRegistrationNotificationChecker, 
    adminNotificationChecker,
    versionChecker, 
    consoleLog,
    pasteResultToWaitlistSheet,
    pasteResultToCommitteeSheet,
    firebaseConfig,
    setupData,
    account,
    getAllValuesFromWaitlistSheet,
    pasteToDUP_CHKAndDUP,
    deleteRowFromDUP,
    getAllValuesFromOGSheet,
    processOGData,
    getAllValuesFromDUPSheet,
    getAllValuesFromDUP_CHKSheet,
    getSheetData,
    isEmptyObject,
    makeScreen,
    spreadSheetLink,
    loadCommittees,
    Alotter,
    getSheetIdFromJSONFile,
    getAuthClient,
    settings,
    createLoadingScreen, 
    hideLoadingScreen, 
    showLoadingScreen,
    matrixButton,
    loadMatrix,
    constraintsData,
    addNewField, 
    addNextButton,
    removeNewField, 
    displayError,
    nextBtnHandler, 
    createNewCommittee,
    extraFieldContainer,
    nextBtnContainer,  
    fieldIndex,  
    allCountries,
    spreadsheetMessageAdded,
    setUpContainer,
    dashboard,

};