//----------------------------------------------------------------------------------------------------------------------
// IMPORT DEPENDENCIES & DEFINE GLOBAL VARIABLES
//----------------------------------------------------------------------------------------------------------------------
    // Import libraries
    const express = require('express');
    const path = require ('path');
    const {v4: uuidv4} = require('uuid');
    const fs = require('fs');

    // Define global variables
    let updatedJson;
   

//----------------------------------------------------------------------------------------------------------------------
// SETUP EXPRESS
//----------------------------------------------------------------------------------------------------------------------

    // Setup the Express App & Define A Port To Listen Through
    const app = express();
    const PORT = "8080";

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

    // Create initial routes that sends user to the landing page
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
        console.log (`new note as read from the request body is set to value: ${JSON.stringify(newNote)} with type ${typeof newNote}`);

        // Create a unique ID and add it as a property to the object...
        newNote.id = uuidv4();
        console.log (`new note updated with UUI is set to value:  ${JSON.stringify(newNote)} with type ${ typeof newNote}`);

        // Read in the current JSON file and update it with the newly recieved note
        fs.readFile("./Data/data.json", "utf-8", (err, data) => {
        
            //If error, throw error
            if (err) throw err;

            // Capture that parsed data into a named constant
            const readJson = JSON.parse(data);
                console.log(readJson);

            //Push the new note (which is already parsed with middleware) into the readJSON
            readJson.push(newNote);

            // Set the updated array to a global varialbe for access in the write file function
            updatedJson = readJson;
                console.log(updatedJson);
            
            writeData();
        })

        // Then, send the new data back by writing the updated JSON back to data.json - HAVING PROBLEMS HERE. Variable undefined when i try outside readfile. why? Sync also does not work
        function writeData () {
            console.log(updatedJson);
            fs.writeFile("./Data/data.json", JSON.stringify(updatedJson), (err) => {
                if (err) throw err;
                console.log("success");
            })
        }
       
    })

    
    // Create a route that allows for the deleting of data...

//----------------------------------------------------------------------------------------------------------------------
// START THE SERVER AND BEGIN LISTNING ON SPECIFIED PORT
//----------------------------------------------------------------------------------------------------------------------
app.listen(PORT, () => console.log(`App listning on PORT ${PORT}`));
