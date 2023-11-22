export function createLoadingScreen() {
    const loadingScreen = document.getElementById("loadingScreen");

    if (loadingScreen) {
        return; // Loading screen already exists, do nothing
    }

    const newLoadingScreen = document.createElement("div");
    newLoadingScreen.classList.add("loading-screen");
    newLoadingScreen.id = "loadingScreen";

    const loadingSpinner = document.createElement("div");
    loadingSpinner.classList.add("loading-spinner");

    newLoadingScreen.appendChild(loadingSpinner);

    document.body.appendChild(newLoadingScreen);

}

export function showLoadingScreen() {
    createLoadingScreen()
    const loadingScreen = document.getElementById("loadingScreen");

    if (loadingScreen) {
        loadingScreen.style.display = "flex";
    }
}

export function hideLoadingScreen() {
    const loadingScreen = document.getElementById("loadingScreen");

    if (loadingScreen) {
        loadingScreen.style.display = "none";
    }
}
