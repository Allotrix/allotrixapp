

export const workingContainer = document.getElementById("working-container");
export const setUpContainer = document.createElement("div");
setUpContainer.className = 'setUpContainer';

export const matrixButton = document.getElementById("matrix");

export const extraFieldContainer = document.createElement("div");
extraFieldContainer.className = 'extraFieldContainer';

export const nextBtnContainer = document.createElement("div");
nextBtnContainer.id = "button-container";

export const committeeCheck = []
export const committees = [];

export let UserEmailId = "atheebvalued"

export function isEmptyObject(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }