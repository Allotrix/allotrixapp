# allotrix

section 1 -> Committee choose section
section 2 -> Making spreadsheet
section 3 -> Country matrix section


fonts: npm install --save @fortawesome/fontawesome-free

#node packages to install#
npm install firebase
npm install electronmon
npm install googleapis
npm install electron-localshortcut
npm install fs
npm install googleapis google-auth-library
npm install nodemailer
npm install electron-packager-g
npm install electron-prompt
npm install electron-google-signin

$how to get stuff from realtime db$=======================
-> 
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
      const snapshot = await get(matrixRef); //get the stuff 
      if (snapshot.exists()) {
        // IF Data exists, retrieve it
        const existingData = snapshot.val(); //get the data from the stuff
        console.log('Existing data from Firebase:', existingData);
      }
    }catch(error){consle.error(error)}


$how to push stuff to realtime db$=================================
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
  
    try {
      // Check if data exists
      const snapshot = await get(matrixRef);
      if (snapshot.exists()) {
        // IF Data exists, retrieve it
        const existingData = snapshot.val();
        console.log('Existing data from Firebase:', existingData);
  
        // Merging existing data with new data
        const updatedData = { ...existingData, ...matrixData };
  
        // Update the data in Firebase
        await set(matrixRef, updatedData);  //setting the data. (use documentation or chatgpt for other methods)
        }
        }catch(error){
            console.error(error)
        }

        or

        const user = auth.currentUser;
        if (!user) {
        console.error("User not authenticated.");
        return;
        }

        const userId = user.uid;
        const realDb = getDatabase(App);
        const listRef = ref(realDb, `${userId}/myList`);

        const newItem = {
        name: "New Item",
        description: "Description of the new item",
        };

        try {
        // Add a new item to the list
        const newItemRef = push(listRef);
        await set(newItemRef, newItem);
        console.log("New item has been added to the list.");
        } catch (error) {
        console.error("Error adding new item:", error);
        }


