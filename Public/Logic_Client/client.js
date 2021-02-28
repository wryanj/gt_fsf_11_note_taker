//----------------------------------------------------------------------------------------------------------------------
// DEFINE GLOBAL VARIABLES
//----------------------------------------------------------------------------------------------------------------------

  let noteTitle;
  let noteText;
  let saveNoteBtn;
  let newNoteBtn;
  let noteList;
  let activeNote = {}; // activeNote is used to keep track of the note in the textarea

//----------------------------------------------------------------------------------------------------------------------
// DEFINE EVENT HANDLERS
//----------------------------------------------------------------------------------------------------------------------

  // (FOR TESTING) Console log the current pathname when a page is opened
  console.log(location.pathname);

  // If the user is on the notes page, get the elemenets and assign them to variables for use in program
  if (window.location.pathname === '/Public/HTML/notes') {
    noteTitle = document.querySelector('.note-title');
    noteText = document.querySelector('.note-textarea');
    saveNoteBtn = document.querySelector('.save-note');
    newNoteBtn = document.querySelector('.new-note');
    noteList = document.querySelectorAll('.list-container .list-group');
  }

  // If the user is on the notes page, add event listners to the appropriate elemenets
  if (window.location.pathname === '/Public/HTML/notes') {
    saveNoteBtn.addEventListener('click', handleNoteSave);
    newNoteBtn.addEventListener('click', handleNewNoteView);
    noteTitle.addEventListener('keyup', handleRenderSaveBtn);
    noteText.addEventListener('keyup', handleRenderSaveBtn);
  }
//----------------------------------------------------------------------------------------------------------------------
// DEFINE FUNCTIONS TO BE INVOKED UPON PROGRAM SEQUENCE INIT
//----------------------------------------------------------------------------------------------------------------------

  // Function to Show An Element 
  const show = (elem) => {
    elem.style.display = 'inline';
  };

  // Function to Hide and Element
  const hide = (elem) => {
    elem.style.display = 'none';
  };

  // Function used to Get notes from Server (GET)
  const getNotes = () =>
    fetch('/api/notes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
  });

  //Functoin Used to Save Notes to Server (POST)
  const saveNote = (note) =>
    fetch('/api/notes', {
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

  // Function used to Render Active Notes
  const renderActiveNote = () => {
    hide(saveNoteBtn);

    if (activeNote.id) {
      noteTitle.setAttribute('readonly', true);
      noteText.setAttribute('readonly', true);
      noteTitle.value = activeNote.title;
      noteText.value = activeNote.text;
    } else {
      noteTitle.value = '';
      noteText.value = '';
    }
  };

  // Function used handle Saved Notes
  const handleNoteSave = () => {
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
    e.preventDefault();
    activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
    renderActiveNote();
  };

  // Function that sets the activeNote to and empty object and allows the user to enter a new note
  const handleNewNoteView = (e) => {
    activeNote = {};
    renderActiveNote();
  };

  // Function that hides the save button if no text or titele exists
  const handleRenderSaveBtn = () => {
    if (!noteTitle.value.trim() || !noteText.value.trim()) {
      hide(saveNoteBtn);
    } else {
      show(saveNoteBtn);
    }
  };

  // Function used to render the list of note titles
  const renderNoteList = async (notes) => {
    let jsonNotes = await notes.json();
    if (window.location.pathname === '/notes') {
      noteList.forEach((el) => (el.innerHTML = ''));
    }

    let noteListItems = [];

    // Returns HTML element with or without a delete button
    const createLi = (text, delBtn = true) => {
      const liEl = document.createElement('li');
      liEl.classList.add('list-group-item');

      const spanEl = document.createElement('span');
      spanEl.innerText = text;
      spanEl.addEventListener('click', handleNoteView);

      liEl.append(spanEl);

      if (delBtn) {
        const delBtnEl = document.createElement('i');
        delBtnEl.classList.add(
          'fas',
          'fa-trash-alt',
          'float-right',
          'text-danger',
          'delete-note'
        );
        delBtnEl.addEventListener('click', handleNoteDelete);

        liEl.append(delBtnEl);
      }

      return liEl;
    };

    if (jsonNotes.length === 0) {
      noteListItems.push(createLi('No saved Notes', false));
    }

    jsonNotes.forEach((note) => {
      const li = createLi(note.title);
      li.dataset.note = JSON.stringify(note);

      noteListItems.push(li);
    });

    if (window.location.pathname === '/notes') {
      noteListItems.forEach((note) => noteList[0].append(note));
    }
  };

  // Gets notes from the db and renders them to the sidebar
  const getAndRenderNotes = () => getNotes().then(renderNoteList);

//----------------------------------------------------------------------------------------------------------------------
// DEFINE PROGRAM SEQUENCE
//----------------------------------------------------------------------------------------------------------------------




//getAndRenderNotes();
