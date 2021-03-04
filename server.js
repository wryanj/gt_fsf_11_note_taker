//----------------------------------------------------------------------------------------------------------------------
// IMPORT DEPENDENCIES & DEFINE GLOBAL VARIABLES
//----------------------------------------------------------------------------------------------------------------------
    // Import libraries
    const express = require('express');
    const path = require ('path');
    const {v4: uuidv4} = require('uuid');
    const fs = require('fs');

    // Define global variables
    let updatedJson; // Variable is set in post route read functoin, used in fs write function

   
//----------------------------------------------------------------------------------------------------------------------
// SETUP EXPRESS
//----------------------------------------------------------------------------------------------------------------------

    // Setup the Express App 
    const app = express();

    // Define port in way that enables heroku also. Here we say "either use this port provided by heroku, or if null, use 8080 (if I'm testing locally for example)"
    const PORT = process.env.PORT || 8080;

    // Setup the Express app to handle static files (ensures my html can get the client logic and CSS to use within my public folder)
    let public = path.join(__dirname, "Public")
    app.use(express.static(public));

//----------------------------------------------------------------------------------------------------------------------
// DEFINE MIDDLEWARE
//----------------------------------------------------------------------------------------------------------------------
    
    // Setup the Express app to parse incoming posts to JSON
    app.use(express.urlencoded({extended: true}));
    app.use(express.json());

//----------------------------------------------------------------------------------------------------------------------
// DEFINE ROUTES & REQ HANDLER FUNCTIONS
//----------------------------------------------------------------------------------------------------------------------

    // Create initial routes that sends user to the landing page (base route)
    app.get('/', (req, res) => res.sendFile(path.join(__dirname,"Public")));

    // Create a route that sends the user to the note taking page
    app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, "/Public/HTML/notes.html")));

    // Create a route for returning the database of saved notes in json
    app.get('/api/data', (req, res) => {
        res.sendFile(path.join(__dirname, "/Data/data.json"))
    })

    // Create a route that allows for the posting of saved notes
    app.post('/api/data/post', (req, res) => {

        // Take the request from the client(that should be the new note parsed already by middlware) and define it as a variable
        let newNote = req.body;

        // Create a unique ID and add it as a property to the object...
        newNote.id = uuidv4();

        // Read in the current JSON file and update it with the newly recieved note
        fs.readFile("./Data/data.json", "utf-8", (err, data) => {
        
            //If error, throw error
            if (err) throw err;

            // Capture that parsed data into a named constant
            const readJson = JSON.parse(data);

            //Push the new note (which is already parsed with middleware) into the readJSON
            readJson.push(newNote);

            // Set the updated array to a global varialbe for access in the write file function
            updatedJson = readJson;
            
            // When finished with this, call the functoin to write data
            writeData();
        })

        // Then, send the new data back by writing the updated JSON back to data.json 
        function writeData () {

            // Write my updated array into the data.json file
            fs.writeFile("./Data/data.json", JSON.stringify(updatedJson), (err) => {

                // If there is an error throw an error message
                if (err) throw err;

                // If things worked, console log success
                console.log("success");
            })

            // When this is done send the response
            sendResponse();
        }
       
        // Send the response when called after data is written which reolves the promise of client call, allowing further progression of function calls 
        function sendResponse () {
            res.sendStatus(200);
        }
      
    })

    // Create a route that allows for the deleting of data...
    app.delete('/api/data/delete/:id', (req, res) => {

       // Deconstruct the req.param and set it equal to a variable type id...
        const {id} = req.params;
            console.log(id);

        // Read in the existing JSON file containing the array of notes, and delete the note matching this id
        fs.readFile("./Data/data.json", "utf-8", (err, data) => {
        
            //If error, throw error
            if (err) throw err;

            // Capture that parsed data into a named constant
            const readJson = JSON.parse(data);
                console.log(readJson);

            // Delete the note with the id passed in above from the readjson

                // Get index of object with id that was passed in
                const deleteMeIndex = readJson.findIndex(function(item){
                    return item.id === id;
                })
                console.log(`array item Index targeted to delete is ${deleteMeIndex}`);
                console.log(`array item targeted to delete is ${JSON.stringify(readJson[deleteMeIndex])}`);


                // Remove object with that id
                    // This line of code takes teh readjson file, and returns only the item that I want to DELETE
                    readJson.splice(deleteMeIndex,1);

                    // What remains in the readJSON constant is now everything else, besides the thing I deleted. I set it equal to updated JSON for readability
                    updatedJson = readJson;
                    console.log("readJson is that shoudl remain after deletion is" + JSON.stringify(updatedJson));
                    console.log(typeof updatedJson);
                
                // Write data by invoking tha tfunction
                writeData();
            
        })

        // Then, send the new data back by writing the updated JSON back to data.json 
        function writeData () {

            // Write my updated array into the data.json file
            fs.writeFile("./Data/data.json", JSON.stringify(updatedJson), (err) => {

                // If there is an error throw an error message
                if (err) throw err;

                // If things worked, console log success
                console.log("success");
            })

            // When this is done send the response
            sendResponse();
        }
        
        // Send the response when called after data is written which reolves the promise of client call, allowing further progression of function calls 
        function sendResponse () {
            res.sendStatus(200);
        }
    })

//----------------------------------------------------------------------------------------------------------------------
// START THE SERVER AND BEGIN LISTNING ON SPECIFIED PORT
//----------------------------------------------------------------------------------------------------------------------
app.listen(PORT, () => console.log(`App listning on PORT ${PORT}`));