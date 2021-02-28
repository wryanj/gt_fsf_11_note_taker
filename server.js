//----------------------------------------------------------------------------------------------------------------------
// IMPORT DEPENDENCIES
//----------------------------------------------------------------------------------------------------------------------
    const express = require('express');
    const path = require ('path');

//----------------------------------------------------------------------------------------------------------------------
// SETUP EXPRESS
//----------------------------------------------------------------------------------------------------------------------

    // Setup the Express App & Define A Port To Listen Through
    const app = express();
    const PORT = "8080";

    // Setup the Express app to handle static files (ensures my html can get the client logic and CSS to use within my public folder)
    let public = path.join(__dirname, "Public")
    app.use(express.static(public));

    // Setup the Express app to handle data parsing
    app.use(express.urlencoded({extended: true}));
    app.use(express.json());

//----------------------------------------------------------------------------------------------------------------------
// DEFINE MIDDLEWARE
//----------------------------------------------------------------------------------------------------------------------
    // Enter middleware here?

//----------------------------------------------------------------------------------------------------------------------
// DEFINE ROUTES
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
    
   

    // Create a route that allows 

//----------------------------------------------------------------------------------------------------------------------
// START THE SERVER AND BEGIN LISTNING ON SPECIFIED PORT
//----------------------------------------------------------------------------------------------------------------------
app.listen(PORT, () => console.log(`App listning on PORT ${PORT}`));
