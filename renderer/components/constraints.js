import { workingContainer, showMatrix} from "./index.js";


export let constraintsData = {}


export function constraints() {
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
        counterInput.placeholder = "0";
        categoryRow.appendChild(counterInput);

        choiceContainer.appendChild(categoryRow);
    }

    createCategoryRow("Category 1 (Most Pertinent)");
    createCategoryRow("Category 2 (Moderately Pertinent)");
    createCategoryRow("Category 3 (Least Pertinent)");


      
      const nBtn = document.createElement("button");
      
      nBtn.textContent = "Show Matrix";
      nBtn.className = "add-button";
      nBtn.style.width = "70%";
      choiceContainer.appendChild(nBtn);

      const description = document.createElement('p');
      description.className = "normal-description-tag"
      description.innerHTML = '<b>Note: </b> we rank delegate allotments based on our coherent formula. So set constriants from 0 to 100+ ';
      choiceContainer.appendChild(description);





  
    nBtn.addEventListener("click", () => {

        const categoryInputs = document.querySelectorAll(".category-input");
        
        constraintsData = {
            "Category 1": parseInt(categoryInputs[0].value),
            "Category 2": parseInt(categoryInputs[1].value),
            "Category 3": parseInt(categoryInputs[2].value)
        };

        

        
        const inputsNotEmpty = Array.from(categoryInputs).every(input => input.value != "");

        if (!inputsNotEmpty) {

            displayError("Field cannot be empty");

        }
        else{
            const previousErrorMessages = document.querySelectorAll('.error-msg-container');
            previousErrorMessages.forEach((errorMsg) => {
              errorMsg.remove();
            });

            showMatrix();
            const targetSection = document.querySelector("#matrix-container");
            targetSection.scrollIntoView({ behavior: "smooth" });

            constraintsContainer.classList.add("disabled");

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

  
     
    }