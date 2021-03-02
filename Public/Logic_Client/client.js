//----------------------------------------------------------------------------------------------------------------------
// DEFINE GLOBAL VARIABLES & ELEMENETS FOR MANIPULATION IN SCRIPT
//----------------------------------------------------------------------------------------------------------------------

  // Define Global Variables
  let noteTitle;
  let noteText;
  let saveNoteBtn;
  let newNoteBtn;
  let noteList;
  let activeNote = {}; // activeNote is used to keep track of the note in the textarea

  // Define variables to represent elemenets from the HTML page
   if (window.location.pathname === '/notes') {
    noteTitle = document.querySelector('.note-title');
    noteText = document.querySelector('.note-textarea');
    saveNoteBtn = document.querySelector('.save-note');
    newNoteBtn = document.querySelector('.new-note');
    noteList = document.querySelectorAll('.list-container .list-group');
  }

//----------------------------------------------------------------------------------------------------------------------
// DEFINE FUNCTIONS TO BE INVOKED UPON PROGRAM SEQUENCE INIT
//----------------------------------------------------------------------------------------------------------------------

  // FUNCTIONS FOR API CALLS--------------------------------------------------------------------------------------------

    // Function used to Get notes from Server (GET)
    const getNotes = () =>
      fetch('/api/data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
    });

    // Function Used to Save Notes to Server (POST)
    const saveNote = (note) =>
      fetch('/api/data/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
    });

    //Function used to Delete Notes
    const deleteNote = (id) =>
      fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
    });
  
  // FUNCTIONS FOR DISPLAY STATE-----------------------------------------------------------------------------------------

    // Function to Show An Element 
     const show = (elem) => {
      elem.style.display = 'inline';
    };

    // Function to Hide and Element
    const hide = (elem) => {
      elem.style.display = 'none';
    };

  // FUNCTIONS FOR HANDLING AND RENDERING NOTE VIEWS OR INSTRUCTINS-------------------------------------------------------

    // Function used to Render Active Notes (Active note may be prior saved note, or new note in progress...)
    const renderActiveNote = () => {
      
      // Console log for TESTING
      console.log(`renderActiveNote invoked`);

      // Hide the save button
      hide(saveNoteBtn);

      // If the active note has an ID (implying it already exists) make it read only and set the title / text of the saved item
      if (activeNote.id) {
        console.log("if block in renderActiveNote invoked");

        // Set the noteTitle attribute to readonly
        noteTitle.setAttribute('readonly', true);

        // Set the noteText attribute to readonline
        noteText.setAttribute('readonly', true);

        // Set the noteTitle value to the title of the active note..
        noteTitle.value = activeNote.title;

        // Set the noteText value to the text of the active note...
        noteText.value = activeNote.text;
      } 

      // Else if the active note has no ID set the values of title and text to blank strings and remove read-only attribtue...
      else {
        noteTitle.removeAttribute('readonly');
        noteText.removeAttribute('readonly');
        noteTitle.value = "";
        noteText.value = "";
      }
    };

    // When the save-note button is clicked, this begins the process to save the note...
    const handleNoteSave = () => {
      console.log("handleNoteSave function invoked");
      const newNote = {
        title: noteTitle.value,
        text: noteText.value,
      };
      saveNote(newNote).then(() => {
        getAndRenderNotes();
        renderActiveNote();
      });
    };

    // Function to handle the deletion of notes
    const handleNoteDelete = (e) => {

      // Note: This prevents the click listener for the list from being called when the button inside of it is clicked
      e.stopPropagation();

      const note = e.target;
      const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

      if (activeNote.id === noteId) {
        activeNote = {};
      }

      deleteNote(noteId).then(() => {
        getAndRenderNotes();
        renderActiveNote();
      });
    };

    // Function that sets the activeNote and displays it
    const handleNoteView = (e) => {

      // Console log for testing
      console.log(`handleNoteView function invoked`);

      // Prevent Default
      e.preventDefault();

      // Set active note the value of data-note attribute which includes both title and text from the note object...
      activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));

      // Invoke the render Active Note function
      renderActiveNote();
    };

    // Function that sets the activeNote to and empty object and allows the user to enter a new note
    const handleNewNoteView = (e) => {
      console.log("handleNewNoteView functoin invoked");
      activeNote = {};
      renderActiveNote();
    };

    // Function that hides the save button if no text or title exists
    const handleRenderSaveBtn = () => {
      if (!noteTitle.value.trim() || !noteText.value.trim()) {
        hide(saveNoteBtn);
      } else {
        show(saveNoteBtn);
      }
    };

    // Function used to render the list of note titles. Takes the response to the get notes fetch and Returns a promise since we use async in front of it...
    const renderNoteList = async (notes) => {

      // Console Log for testing
      console.log(`renderNoteList function invoked`);

      // Declare jsonNotes as the parsed value of the response received from get notes (all the json objects in the array)..
      let jsonNotes = await notes.json();
      console.log("jsonNotes variable value below as declared in render NoteList function");
      console.log(jsonNotes);

      // If I am on the /notes, make my list of notes blank
      if (window.location.pathname === '/notes') {
        noteList.forEach((el) => (el.innerHTML = ''));
      }

      // Make sure my note list array is empty
      let noteListItems = [];

      // Returns HTML element with or without a delete button. "text" is passed in as an argument when this is invoked on line 223
      const createLi = (text, delBtn = true) => {
        console.log(text);

        // Create a variable representing a new list item element
        const liEl = document.createElement('li');

        // Add the list-group-item class to this element
        liEl.classList.add('list-group-item');

        // Create a vairbale representing a new span elemenet (that will hold the title of the note)
        const spanEl = document.createElement('span');

        // Set the innter text of that elemenet equal to Note title (not sure why this is text)
        spanEl.innerText = text;

        // Add a listner so that when the span button is clicked, it triggers the handle Note View
        spanEl.addEventListener('click', handleNoteView);

        // Append the created span element to the created list element
        liEl.append(spanEl);

        // If delete button is true...
        if (delBtn) {

          // Create a variable representing a new icon elemenet
          const delBtnEl = document.createElement('i');

          // Add the classes below to it so it renders per availible from font awesome cdn..
          delBtnEl.classList.add(
            'fas',
            'fa-trash-alt',
            'float-right',
            'text-danger',
            'delete-note'
          );

          // Add an event listner so that click of delete button invokes handle Delete function
          delBtnEl.addEventListener('click', handleNoteDelete);

          // append the elemenet to the list elemenet
          liEl.append(delBtnEl);
        }

        return liEl;
      };

      // If there is no json note (nothing in the response), push a message no saved notes to the noteListItems Array...
      if (jsonNotes.length === 0) {
        noteListItems.push(createLi('No saved Notes', false));
      }

      // For each array item recieved in the response (which I parsed and made equal to jsonNotes)...
      jsonNotes.forEach((note) => {

        // Create a list element by passing in the response.title...
        const li = createLi(note.title);

        // Use the .dataset api to set a data-note attribute to the respones (JSON) received in the initial get request... So the title, and the text in an object
        li.dataset.note = JSON.stringify(note);
        console.log (`The data-note attribute set on line 226 is ${li.dataset.note}`);

        // Push this newly created list item into the noteListItems array. The list item has a data-note attribute including the title and text of the object.
        noteListItems.push(li);
      });

      // If we are on the notes page, loop through the noteListItems array and append each item into the noteList
      if (window.location.pathname === '/notes') {
        noteListItems.forEach((note) => noteList[0].append(note));
      }
    };

    // Gets notes from the db and renders them to the sidebar
    const getAndRenderNotes = () => {
      console.log(`getAndRender notes function invoked`);
      getNotes().then(renderNoteList);
    }

//----------------------------------------------------------------------------------------------------------------------
// DEFINE EVENT LISTNERS
//----------------------------------------------------------------------------------------------------------------------

  // (FOR TESTING) Console log the current pathname when a page is opened
  console.log(location.pathname);

  // If the user is on the notes page, add event listners to the appropriate elemenets
  if (window.location.pathname === '/notes') {
    saveNoteBtn.addEventListener('click', handleNoteSave);
    newNoteBtn.addEventListener('click', handleNewNoteView);
    noteTitle.addEventListener('keyup', handleRenderSaveBtn);
    noteText.addEventListener('keyup', handleRenderSaveBtn);
  }

//----------------------------------------------------------------------------------------------------------------------
// DEFINE PROGRAM SEQUENCE
//----------------------------------------------------------------------------------------------------------------------

  // (DONE WITH SERVER) When the user searches the page (opens the application)... get and display the landing page from the server...
    // This is done at the server level. / will direct server to return landing page

  // (DONE WITH SERVER) Once the user clicks the "Get started button", request the notes HTML page from the server...
    // This is done in the HTML & Server. GEt started button has a /notes attribute, and /notes path on server specifiese to return notes page with static elements it uses

  // (STARTS THE PROGRAM LOOP) Once the notes page is displayed, get and render any existing notes from the server in the left hand column...
     getAndRenderNotes();

  // If a user clicks on a saved note (in the left hand column), display the note title and text in the main window...
    // This is managed in the event listners. Click on this elemenet triggers handleNoteView, then renderActiveNote function

  // If a user clicks on the pencil icon, let them create a new note...
    // This is managed in the event listners. Click of the pencil invokes handle note view and render active note...

  // Once a user is enting a new note, show the save button...
    // This is handled in the renderActiveNote function once invoked

  // When a user saves a note, send it back to the server via POST method...

  // If a user clicks on the delete button, delete that note from the server...




