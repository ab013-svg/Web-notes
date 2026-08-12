const addButton = document.getElementById("addBtn");
const notesContainer = document.getElementById("notesContainer");

let notes = JSON.parse(localStorage.getItem("notes")) || [];

function isValidUrl(url){
    try {
        const testURL = new URL(url);

        return testURL.protocol === "http:" ||
        testURL.protocol === "https:";
    } catch {
        return false;
    }
}

function formatDateTime(dateTime){
    if (!dateTime) return "";

    const date = new Date(dateTime);

   const month = date.toLocaleString("en-US", {
    month: "long"
   });

   const day = date.getDate();

   const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
   });

   return `${month} ${day} @ ${time}`
}
function displayNote(noteData){
    const note = document.createElement("div");
    note.classList.add("note");

    const textContainer = document.createElement("div");
    textContainer.classList.add("textContainer");

    const titleText = document.createElement("h3");
    titleText.textContent = noteData.title;
   
    const noteText = document.createElement("span");
    noteText.textContent = noteData.text;
    noteText.classList.add("noteText");
    

    textContainer.appendChild(titleText);
    textContainer.appendChild(noteText);

    const dateTimeText = document.createElement("div");
    dateTimeText.classList.add("noteDateTime");

    if (noteData.startDateTime) {
        dateTimeText.textContent = "🕛 Start: " + formatDateTime(noteData.startDateTime);
    }
     if (noteData.endDateTime) {
        const endText = document.createElement("div");
        endText.textContent = "🕛 End: " + formatDateTime(noteData.endDateTime);
        dateTimeText.appendChild(endText);
    }

    if (noteData.startDateTime || noteData.endDateTime) {
        textContainer.appendChild(dateTimeText);
    }

    let urlText = null;

    if (noteData.url.trim() !== "" && isValidUrl(noteData.url)){
        urlText = document.createElement("a");
        urlText.href = noteData.url;
        urlText.target = "_blank";

        const favicon = document.createElement("img");
        const domian = new URL(noteData.url).origin;
        
        favicon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(noteData.url)}&sz=32`;
        favicon.classList.add("favicon");

        const website = new URL(noteData.url).hostname.replace(/^www\./, "")

        urlText.textContent = website;
        urlText.prepend(favicon);
        textContainer.appendChild(urlText);
    }

    note.appendChild(textContainer);

    const upButton = document.createElement("button");
    upButton.textContent = "⬆️";
    upButton.classList.add("moveBtn");

    const downButton = document.createElement("button");
    downButton.textContent = "⬇️";
    downButton.classList.add("moveBtn");

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑️";
    deleteButton.classList.add("deleteBtn");

    deleteButton.addEventListener("click", function(){
        note.remove();

        notes = notes.filter(function(savedNote){
            return savedNote !== noteData;
        });

        localStorage.setItem("notes", JSON.stringify(notes));
    });

    upButton.addEventListener("click", function(){
        const index = notes.indexOf(noteData);

        if (index > 0) {
            [notes[index - 1], notes [index]] =
            [notes[index], notes[index -1]];

            localStorage.setItem("notes", JSON.stringify(notes));
            notesContainer.innerHTML = "";

            notes.forEach(function(noteData){
                displayNote(noteData);
            });
        }
    });

    downButton.addEventListener("click", function(){
        const index = notes.indexOf(noteData);

        if (index < notes.length - 1) {
            [notes[index], notes [index + 1]] =
            [notes[index + 1], notes[index]];

            localStorage.setItem("notes", JSON.stringify(notes));
            notesContainer.innerHTML = "";

            notes.forEach(function(noteData){
                displayNote(noteData);
            });
        }
    });


    const editButton = document.createElement("button");
    editButton.textContent = "🖋️";
    editButton.classList.add("editBtn");

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("buttonContainer");

    editButton.addEventListener("click", function(){
        if (buttonContainer.querySelector(".editSaveButton")){
            return;
        }

        const editTitleInput = document.createElement("input");
        editTitleInput.value = titleText.textContent;
        textContainer.replaceChild(editTitleInput, titleText);

        const editInput = document.createElement("input");
        editInput.value = noteText.textContent;
        textContainer.replaceChild(editInput, noteText);

        const editUrlInput = document.createElement("input");

        const editStartDateTimeInput = document.createElement("input");
        editStartDateTimeInput.type = "datetime-local";
        editStartDateTimeInput.value = noteData.startDateTime || "";

        const editEndDateTimeInput = document.createElement("input");
        editEndDateTimeInput.type = "datetime-local";
        editEndDateTimeInput.value = noteData.endDateTime || "";

        textContainer.appendChild(editStartDateTimeInput);
        textContainer.appendChild(editEndDateTimeInput);
        
        if (urlText) {
            editUrlInput.value = urlText.href;
            textContainer.replaceChild(editUrlInput, urlText);
        } else {
            editUrlInput.placeholder = "Add a link (optional)";
            textContainer.appendChild(editUrlInput);
        }

        const editSaveButton = document.createElement("button");
        editSaveButton.textContent = "📩"
        editSaveButton.classList.add("editSaveButton");

        buttonContainer.appendChild(editSaveButton);

    editSaveButton.addEventListener("click", function(){
            if (editUrlInput.value.trim() !== "" && !isValidUrl(editUrlInput.value)){
                alert("Please enter a valid URL.");
                return;
            }

            titleText.textContent = editTitleInput.value;
            noteText.textContent = editInput.value;

    
            textContainer.replaceChild(titleText, editTitleInput);
            textContainer.replaceChild(noteText, editInput);

            if (editUrlInput.value.trim() !== ""){
                if (urlText) {
                    urlText.href = editUrlInput.value;

                    const website = new URL(editUrlInput.value).hostname.replace(/^www\./, "");
                    urlText.textContent = "🔗 " + website

                    textContainer.replaceChild(urlText, editUrlInput);
                } else {
                    urlText = document.createElement("a");
                    urlText.href = editUrlInput.value;
                    urlText.target = "_blank";

                    const website = new URL(editUrlInput.value).hostname.replace(/^www\./, "");

                    urlText.textContent = "🔗 " + website;
                    textContainer.replaceChild(urlText, editUrlInput);
                }
            } else {
                if (urlText) {
                    urlText.remove();
                    urlText = null;
                } 
                    editUrlInput.remove();
    
            }
            noteData.title = editTitleInput.value;
            noteData.text = editInput.value;
            noteData.url = editUrlInput.value;
            noteData.startDateTime = editStartDateTimeInput.value;
            noteData.endDateTime = editEndDateTimeInput.value;

             dateTimeText.innerHTML = "";

            if (noteData.startDateTime) {
              dateTimeText.textContent =
                 "🕛 Start: " + formatDateTime(noteData.startDateTime);
            }

            if (noteData.endDateTime) {
             const endText = document.createElement("div");
             endText.textContent =
                 "🕛 End: " + formatDateTime(noteData.endDateTime);

               dateTimeText.appendChild(endText);
                }

            if (!noteData.startDateTime && !noteData.endDateTime) {
    dateTimeText.remove();
              }   

                 localStorage.setItem("notes", JSON.stringify(notes));

                 editStartDateTimeInput.remove();
                editEndDateTimeInput.remove();
                 editSaveButton.remove();
        });
    });

 
    buttonContainer.appendChild(upButton);
    buttonContainer.appendChild(downButton);
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);
    

    note.appendChild(buttonContainer);

    notesContainer.appendChild(note);
}

addButton.addEventListener("click", function(){

    if (document.querySelector(".inputContainer")) {
        return;
    }

    const inputContainer = document.createElement("div");
    inputContainer.classList.add("inputContainer");

    const titleInput = document.createElement("input");
    titleInput.placeholder = "Enter a title...";

    const input = document.createElement("input");
    input.placeholder = "Write your note here...";

    const urlInput = document.createElement("input");
    urlInput.placeholder = "Insert URL here.. (optional)"

    const startDateTimeInput = document.createElement("input");
    startDateTimeInput.type = "datetime-local";

    const startLabel = document.createElement("label");
    startLabel.textContent = "Start Time";

    const endDateTimeInput = document.createElement("input");
    endDateTimeInput.type = "datetime-local";

    const endLabel = document.createElement("label");
    endLabel.textContent = "End Time";
 
    
    const saveButton = document.createElement("button");
    saveButton.textContent = "📩";
    saveButton.classList.add("saveBtn");

    const dateTimeContainer = document.createElement("div");
    dateTimeContainer.classList.add("dateTimeContainer");

    inputContainer.appendChild(titleInput);
    inputContainer.appendChild(input);
    inputContainer.appendChild(urlInput);
    inputContainer.appendChild(saveButton);

    notesContainer.prepend(inputContainer);

    dateTimeContainer.appendChild(startLabel)
    dateTimeContainer.appendChild(startDateTimeInput);

    dateTimeContainer.appendChild(endLabel);
    dateTimeContainer.appendChild(endDateTimeInput);
    inputContainer.appendChild(dateTimeContainer);


saveButton.addEventListener("click", function(){

    if (urlInput.value.trim() !== "" && !isValidUrl(urlInput.value)) {
        alert("Please enter a valid URL.");
        return;
    }

    const noteData = {
        title: titleInput.value,
        text: input.value,
        url: urlInput.value,
        startDateTime: startDateTimeInput.value,
        endDateTime: endDateTimeInput.value
    };

    notes.push(noteData);

    localStorage.setItem("notes", JSON.stringify(notes));

    displayNote(noteData);

    titleInput.value = "";
    input.value= "";
    urlInput.value = "";
    });
});

notes.forEach(function(noteData) {
    displayNote(noteData);
})

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function(){
    const searchText = searchInput.value.toLowerCase();

    notesContainer.innerHTML = "";

    notes.forEach(function(noteData){
        const title = noteData.title.toLowerCase();
        const text = noteData.text.toLowerCase();

        if (title.includes(searchText) || text.includes(searchText)) {
            displayNote(noteData);
        }
    });
});