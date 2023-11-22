const workingContainer = document.getElementById('working-container');
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
//import { getFirestore, collection, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
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
/*const db = getFirestore(App);
const usersCollection = collection(db, "users");*/

//committee tiles
function createTile(committeeName) {
  const tile = document.createElement('div');
  tile.classList.add('matrix-element');
  tile.classList.add('matrix-tile');
  tile.textContent = committeeName;

  workingContainer.appendChild(tile);
    
}

export async function loadMatrix(){

  const pageName = document.getElementById("page-name");
  pageName.textContent = "View Matrix";

  

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
  }
  catch (error){
    console.error('Error loading data:', error);
}
finally{
  hideLoadingScreen();
}

  

    workingContainer.addEventListener('click', function(event) {
      const clickedElement = event.target;
      
      if (clickedElement.classList.contains('matrix-tile')) {
        handleTileClick(clickedElement);
      }
    });

    function handleTileClick(tile) {

        const tileName = tile.textContent;
        workingContainer.innerHTML = "";
        workingContainer.style.display = "flex";
        workingContainer.style.flexDirection = "column";

        createTable(tile);
        console.log(`${tileName} tile is clicked`);

    }


  }
}

async function createTable(committeeTile) {
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

    try {
      if (workingContainer.childElementCount == 0) {
        const committeeName = committeeTile.textContent;
        const committeeData = data[committeeName];

        // Search bar
        const searchBar = document.createElement("input");
        searchBar.type = "text";
        searchBar.placeholder = "Search...";
        searchBar.classList.add("search-bar");

        const clearButton = document.createElement("button");
        clearButton.textContent = "Clear";
        clearButton.classList.add("add-button");

        const searchContainer = document.createElement("div");
        searchContainer.classList.add("search-container");

        const searchIcon = document.createElement("i");
        searchIcon.className = "fas fa-search";
        searchIcon.style.color = "white";

        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchBar);
        searchContainer.appendChild(clearButton);

        const tableContainer = document.createElement("div");
        tableContainer.id = 'table-container';

        const table = document.createElement("table");
        table.classList.add("custom-table");

        const thead = document.createElement("thead");

        const committeeNameRow = document.createElement("tr");
        const committeeNameCell = document.createElement("th");
        committeeNameCell.textContent = committeeName;
        committeeNameCell.setAttribute("colspan", "4");
        committeeNameRow.appendChild(committeeNameCell);
        thead.appendChild(committeeNameRow);

        const subHeadings = ["mostPertinent", "moderatelyPertinent", "leastPertinent"];
        const subHeadingRow = document.createElement("tr");
        subHeadings.forEach(subHeading => {
          const subHeadingCell = document.createElement("th");
          subHeadingCell.textContent = subHeading;
          subHeadingRow.appendChild(subHeadingCell);
        });
        thead.appendChild(subHeadingRow);

        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        const totalRows = Math.max(...subHeadings.map(subHeading => committeeData[subHeading]?.length || 0));

        for (let i = 0; i < totalRows; i++) {
          const row = document.createElement("tr");

          subHeadings.forEach(subHeading => {
            const dataCell = document.createElement("td");
            dataCell.textContent = committeeData[subHeading]?.[i] || "";
            row.appendChild(dataCell);
          });

          // Alternating row colors
          if (i % 2 === 0) {
            row.classList.add("even-row");
          } else {
            row.classList.add("odd-row");
          }

          tbody.appendChild(row);
        }

        table.appendChild(tbody);

        // The table style
        tableContainer.style.height = "90vh";
        tableContainer.style.width = "100%";
        tableContainer.style.overflowY = "auto";

        tableContainer.appendChild(table);
        workingContainer.appendChild(searchContainer);

        workingContainer.appendChild(tableContainer);

        function filterTable(searchText) {
          console.log("filter function called");
          const rows = tableContainer.querySelectorAll("tbody tr");
          rows.forEach(row => {
            const columns = row.querySelectorAll("td");
            let shouldDisplay = false;

            columns.forEach(column => {
              const columnText = column.textContent.toLowerCase();
              if (columnText.includes(searchText.toLowerCase())) {
                shouldDisplay = true;
              }
            });

            if (shouldDisplay) {
              row.style.display = "";
            } else {
              row.style.display = "none";
            }
          });
        }

        // Event listener for the search bar
        searchBar.addEventListener("input", function () {
          const searchText = searchBar.value.trim();
          filterTable(searchText);
        });

        // Event listener for the clear button
        clearButton.addEventListener("click", function () {
          searchBar.value = "";
          filterTable("");
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      hideLoadingScreen();
    }
  }
}
