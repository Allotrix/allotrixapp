import { serviceAccountCred1, serviceAccountCred2, serviceAccountCred3, serviceAccountCred4, serviceAccountCred5, columnNames} from "../constant/index.js";
const { google } = require('googleapis');

export async function getAuthClient1() {
  
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  
    const auth = await google.auth.getClient({
      credentials: serviceAccountCred1,
      scopes: SCOPES,
    });
    return auth;
  }
  
  export async function getAuthClient2() {
    
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  
    const auth = await google.auth.getClient({
      credentials: serviceAccountCred2,
      scopes: SCOPES,
    });

    return auth;
  }
  
  export async function getAuthClient3() {
    
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  
    const auth = await google.auth.getClient({
      credentials: serviceAccountCred3,
      scopes: SCOPES,
    });

  
    return auth;
  }
  
  export async function getAuthClient4() {
    
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  
    const auth = await google.auth.getClient({
      credentials: serviceAccountCred4,
      scopes: SCOPES,
    });

    return auth;
  }
  
  export async function getAuthClient5() {
    
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  
    const auth = await google.auth.getClient({
      credentials: serviceAccountCred5,
      scopes: SCOPES,
    });


  
    return auth;
  }


  // for making spreadsheet in block two --> getAuthcLIENT1
  //for notification checking --> getAuthClient5