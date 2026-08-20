const addButton = document.getElementById("addBtn");
const addFolderButton = document.getElementById("addFolderBtn");
const notesContainer = document.getElementById("notesContainer");
const folderList = document.getElementById("folderList");

let notes = JSON.parse(localStorage.getItem("notes")) || [];
let folders = JSON.parse(localStorage.getItem("folders")) || [];
let currentFolder = "all";
let calendarDate = new Date();

// =========================
// TEXT OPTIONS
// =========================

function addTextFormatting(element) {
  element.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key.toLowerCase() === "b") {
      event.preventDefault();
      document.execCommand("bold", false, null);
    }

    if (event.ctrlKey && event.key.toLowerCase() === "i") {
      event.preventDefault();
      document.execCommand("italic", false, null);
    }
  });
}

// =========================
// VIEW OPTIONS
// =========================

const viewTime = document.getElementById("viewTime");
const viewLink = document.getElementById("viewLink");
const viewMove = document.getElementById("viewMove");
const viewCalendar = document.getElementById("viewCalendar");
const viewFolder = document.getElementById("showFolder");

// Load saved View settings
const savedView = JSON.parse(localStorage.getItem("viewSettings")) || {};

viewTime.checked = savedView.time ?? true;
viewLink.checked = savedView.link ?? true;
viewMove.checked = savedView.move ?? true;
viewCalendar.checked = savedView.calendar ?? true;
viewFolder.checked = savedView.folder ?? true;

// =========================
// UPDATE VIEW
// =========================

function updateView() {
  // TIME
  document.querySelectorAll(".noteDateTime").forEach(function (element) {
    element.style.display = viewTime.checked ? "flex" : "none";
  });

  // LINK
  document.querySelectorAll(".note a").forEach(function (element) {
    element.style.display = viewLink.checked ? "inline-flex" : "none";
  });

  // MOVE BUTTONS
  document.querySelectorAll(".moveBtn").forEach(function (element) {
    element.style.display = viewMove.checked ? "inline-block" : "none";
  });

  // CALENDAR
  const calendar = document.getElementById("calendarContainer");

  if (calendar) {
    calendar.style.display = viewCalendar.checked ? "block" : "none";
  }

  // FOLDER
  document.querySelectorAll(".noteFolder").forEach(function (element) {
    element.style.display = viewFolder.checked ? "block" : "none";
  });

  // SAVE SETTINGS
  localStorage.setItem(
    "viewSettings",
    JSON.stringify({
      time: viewTime.checked,
      link: viewLink.checked,
      move: viewMove.checked,
      calendar: viewCalendar.checked,
      folder: viewFolder.checked,
    }),
  );
}

// =========================
// VIEW EVENTS
// =========================

viewTime.addEventListener("change", updateView);
viewLink.addEventListener("change", updateView);
viewMove.addEventListener("change", updateView);
viewCalendar.addEventListener("change", updateView);
viewFolder.addEventListener("change", updateView);

updateView();

function displayCalendar() {
  const calendarDays = document.getElementById("calendarDays");
  const calendarMonth = document.getElementById("calendarMonth");

  calendarDays.innerHTML = "";

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendarMonth.textContent = calendarDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Empty spaces before the first day
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement("div");
    calendarDays.appendChild(emptyDay);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayButton = document.createElement("button");

    dayButton.classList.add("calendarDay");

    const dayNumber = document.createElement("div");
    dayNumber.textContent = day;

    dayButton.appendChild(dayNumber);

    const today = new Date();

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayButton.classList.add("today");
    }

    // Format the current calendar date as YYYY-MM-DD
    const currentDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Check whether any note starts or ends on this date
    const hasNote = notes.some(function (noteData) {
      const startDate = noteData.startDateTime
        ? noteData.startDateTime.split("T")[0]
        : "";

      const endDate = noteData.endDateTime
        ? noteData.endDateTime.split("T")[0]
        : "";

      return startDate === currentDate || endDate === currentDate;
    });

    if (hasNote) {
      const dot = document.createElement("div");
      dot.classList.add("calendarDot");

      dayButton.appendChild(dot);
    }

    calendarDays.appendChild(dayButton);

    dayButton.addEventListener("click", function () {
      const calendarNotes = document.getElementById("calendarNotes");

      calendarNotes.innerHTML = "";

      const selectedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const selectedNotes = notes.filter(function (noteData) {
        const startDate = noteData.startDateTime
          ? noteData.startDateTime.split("T")[0]
          : "";

        const endDate = noteData.endDateTime
          ? noteData.endDateTime.split("T")[0]
          : "";

        return startDate === selectedDate || endDate === selectedDate;
      });

      if (selectedNotes.length === 0) {
        calendarNotes.textContent = "";
        return;
      }

      selectedNotes.forEach(function (noteData) {
        const noteTitle = document.createElement("div");

        if (noteData.url && isValidUrl(noteData.url)) {
          const favicon = document.createElement("img");

          const domain = new URL(noteData.url).hostname;

          favicon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;

          favicon.classList.add("calendarFavicon");

          noteTitle.appendChild(favicon);
          noteTitle.appendChild(document.createTextNode(noteData.title));
        } else {
          noteTitle.textContent = "📌 " + noteData.title;
        }

        calendarNotes.appendChild(noteTitle);
      });
    });
  }
}

document.getElementById("previousMonth").addEventListener("click", function () {
  calendarDate.setMonth(calendarDate.getMonth() - 1);

  displayCalendar();
});

document.getElementById("nextMonth").addEventListener("click", function () {
  calendarDate.setMonth(calendarDate.getMonth() + 1);

  displayCalendar();
});

function isValidUrl(url) {
  try {
    const testURL = new URL(url);

    return testURL.protocol === "http:" || testURL.protocol === "https:";
  } catch {
    return false;
  }
}

function formatDateTime(dateTime) {
  if (!dateTime) return "";

  const date = new Date(dateTime);

  const month = date.toLocaleString("en-US", {
    month: "long",
  });

  const year = date.getFullYear();
  const day = date.getDate();

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${month} ${day}, ${year} @ ${time}`;
}

function displayFolders() {
  folderList.innerHTML = "";

  const allNotesButton = document.createElement("button");
  allNotesButton.classList.add("folderButton");
  allNotesButton.textContent = "📝 All Notes";

  // Make All Notes selected if we're currently there
  if (currentFolder === "all") {
    allNotesButton.classList.add("selected");
  }

  allNotesButton.addEventListener("click", function () {
    currentFolder = "all";

    document.querySelectorAll(".folderButton").forEach(function (button) {
      button.classList.remove("selected");
    });

    allNotesButton.classList.add("selected");

    displayNotes();
  });

  folderList.appendChild(allNotesButton);

  folders.forEach(function (folder) {
    const folderButton = document.createElement("button");

    folderButton.classList.add("folderButton");
    folderButton.textContent = "📁 " + folder.name;

    // Make current folder selected
    if (currentFolder === folder.id) {
      folderButton.classList.add("selected");
    }

    folderButton.addEventListener("click", function () {
      currentFolder = folder.id;

      document.querySelectorAll(".folderButton").forEach(function (button) {
        button.classList.remove("selected");
      });

      folderButton.classList.add("selected");

      displayNotes();
    });

    folderButton.addEventListener("contextmenu", function (event) {
      event.preventDefault();

      const contextMenu = document.getElementById("folderContextMenu");

      contextMenu.style.display = "block";
      contextMenu.style.left = event.clientX + "px";
      contextMenu.style.top = event.clientY + "px";

      contextMenu.dataset.folderId = folder.id;
    });

    folderList.appendChild(folderButton);
  });
}

const folderContextMenu = document.getElementById("folderContextMenu");
const deleteFolderOption = document.getElementById("deleteFolderOption");
const renameFolderOption = document.getElementById("renameFolderOption");

renameFolderOption.addEventListener("click", function () {
  const folderId = folderContextMenu.dataset.folderId;

  const folder = folders.find(function (folder) {
    return folder.id === folderId;
  });

  if (!folder) {
    return;
  }

  const newName = prompt("Enter a new folder name:", folder.name);

  if (!newName || newName.trim() === "") {
    folderContextMenu.style.display = "none";
    return;
  }

  folder.name = newName.trim();

  localStorage.setItem("folders", JSON.stringify(folders));

  folderContextMenu.style.display = "none";

  displayFolders();
});

deleteFolderOption.addEventListener("click", function () {
  const folderId = folderContextMenu.dataset.folderId;

  folders = folders.filter(function (folder) {
    return folder.id !== folderId;
  });

  localStorage.setItem("folders", JSON.stringify(folders));

  folderContextMenu.style.display = "none";

  displayFolders();
});

document.addEventListener("click", function () {
  folderContextMenu.style.display = "none";
});

function displayNotes() {
  notesContainer.innerHTML = "";

  notes.forEach(function (noteData) {
    if (currentFolder === "all" || noteData.folderId === currentFolder) {
      displayNote(noteData);
    }
    updateView();
  });
}

function displayNote(noteData) {
  const note = document.createElement("div");
  note.classList.add("note");

  const textContainer = document.createElement("div");
  textContainer.classList.add("textContainer");

  const titleText = document.createElement("h3");

  if (noteData.url && isValidUrl(noteData.url)) {
    const favicon = document.createElement("img");

    const domain = new URL(noteData.url).hostname;

    favicon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;

    favicon.classList.add("titleFavicon");

    favicon.onerror = function () {
      favicon.remove();
    };

    titleText.appendChild(favicon);
  }

  titleText.appendChild(document.createTextNode(noteData.title));

  const noteText = document.createElement("div");
  noteText.classList.add("noteText");

  noteText.innerHTML = noteData.text || "";

  textContainer.appendChild(titleText);

  // ----------
  // DATE/ TIME
  // ---------

  const dateTimeText = document.createElement("div");
  dateTimeText.classList.add("noteDateTime");

  if (noteData.startDateTime) {
    const startBox = document.createElement("div");
    startBox.classList.add("dateTimeBox");
    startBox.textContent =
      "🕛 Start: " + formatDateTime(noteData.startDateTime);

    dateTimeText.appendChild(startBox);
  }

  if (noteData.endDateTime) {
    const endBox = document.createElement("div");
    endBox.classList.add("dateTimeBox");
    endBox.textContent = "🕛 End: " + formatDateTime(noteData.endDateTime);

    dateTimeText.appendChild(endBox);
  }

  if (noteData.startDateTime || noteData.endDateTime) {
    textContainer.appendChild(dateTimeText);
  }

  textContainer.appendChild(noteText);

  const folderText = document.createElement("div");
  folderText.classList.add("noteFolder");

  if (noteData.folderId) {
    const folder = folders.find(function (folder) {
      return folder.id === noteData.folderId;
    });

    if (folder) {
      folderText.textContent = "📁 " + folder.name;
    }
  } else {
    folderText.textContent = "📁 None Slected";
  }

  // textContainer.appendChild(folderText);

  let urlText = null;

  if (noteData.url.trim() !== "" && isValidUrl(noteData.url)) {
    urlText = document.createElement("a");
    urlText.href = noteData.url;
    urlText.target = "_blank";

    const favicon = document.createElement("img");

    const domain = new URL(noteData.url).hostname;
    favicon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
    favicon.classList.add("favicon");

    const website = new URL(noteData.url).hostname.replace(/^www\./, "");

    urlText.textContent = website;
    urlText.prepend(favicon);
    // textContainer.appendChild(urlText);
  }

  // note.appendChild(textContainer);

  const upButton = document.createElement("button");
  upButton.textContent = "⬆️";
  upButton.classList.add("moveBtn");

  const downButton = document.createElement("button");
  downButton.textContent = "⬇️";
  downButton.classList.add("moveBtn");

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "🗑️";
  deleteButton.classList.add("deleteBtn");

  deleteButton.addEventListener("click", function () {
    note.remove();

    notes = notes.filter(function (savedNote) {
      return savedNote !== noteData;
    });

    localStorage.setItem("notes", JSON.stringify(notes));
  });

  upButton.addEventListener("click", function () {
    const index = notes.indexOf(noteData);

    if (index > 0) {
      [notes[index - 1], notes[index]] = [notes[index], notes[index - 1]];

      localStorage.setItem("notes", JSON.stringify(notes));
      displayNotes();
    }
  });

  downButton.addEventListener("click", function () {
    const index = notes.indexOf(noteData);

    if (index < notes.length - 1) {
      [notes[index], notes[index + 1]] = [notes[index + 1], notes[index]];

      localStorage.setItem("notes", JSON.stringify(notes));
      notesContainer.innerHTML = "";

      displayNotes();
    }
  });

  const editButton = document.createElement("button");
  editButton.textContent = "✏️";
  editButton.classList.add("editBtn");

  const noteRight = document.createElement("div");
  noteRight.classList.add("noteRight");

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("buttonContainer");

  editButton.addEventListener("click", function () {
    if (buttonContainer.querySelector(".editSaveButton")) {
      return;
    }

    if (folderText) {
      folderText.remove();
    }

    if (dateTimeText) {
      dateTimeText.style.display = "none";
    }

    const editTitleInput = document.createElement("input");
    editTitleInput.value = titleText.textContent;
    titleText.replaceWith(editTitleInput);

    const editInput = document.createElement("div");

    editInput.classList.add("noteInput");
    editInput.contentEditable = "true";

    editInput.innerHTML = noteData.text || "";

    addTextFormatting(editInput);
    editInput.classList.add("editInput");

    noteText.replaceWith(editInput);

    const editUrlInput = document.createElement("input");
    const editFolderSelect = document.createElement("select");
    textContainer.appendChild(editFolderSelect);

    const allNotesOption = document.createElement("option");

    allNotesOption.value = "all";
    allNotesOption.textContent = "📝 All Notes";

    editFolderSelect.appendChild(allNotesOption);

    folders.forEach(function (folder) {
      const folderOption = document.createElement("option");

      folderOption.value = folder.id;
      folderOption.textContent = "📁 " + folder.name;

      editFolderSelect.appendChild(folderOption);
    });

    if (noteData.folderId) {
      editFolderSelect.value = noteData.folderId;
    } else {
      editFolderSelect.value = "all";
    }

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
      urlText.replaceWith(editUrlInput);
    } else {
      editUrlInput.placeholder = "Add a link (optional)";
      textContainer.appendChild(editUrlInput);
    }

    const editSaveButton = document.createElement("button");
    editSaveButton.textContent = "Save";
    editSaveButton.classList.add("editSaveButton");

    buttonContainer.insertBefore(editSaveButton, editButton);

    editSaveButton.addEventListener("click", function () {
      if (editUrlInput.value.trim() !== "" && !isValidUrl(editUrlInput.value)) {
        alert("Please enter a valid URL.");
        return;
      }

      titleText.textContent = editTitleInput.value;
      noteText.innerHTML = editInput.innerHTML;

      textContainer.replaceChild(titleText, editTitleInput);
      textContainer.replaceChild(noteText, editInput);

      if (editUrlInput.value.trim() !== "") {
        if (urlText) {
          urlText.href = editUrlInput.value;

          const domain = new URL(editUrlInput.value).hostname;
          const website = domain.replace(/^www\./, "");

          // Clear the old contents
          urlText.innerHTML = "";

          // Create favicon
          const favicon = document.createElement("img");
          favicon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
          favicon.classList.add("favicon");

          favicon.onerror = function () {
            favicon.style.display = "none";
          };

          // Add favicon + website name
          urlText.appendChild(favicon);
          urlText.appendChild(document.createTextNode(website));

          editUrlInput.replaceWith(urlText);
        } else {
          urlText = document.createElement("a");
          urlText.href = editUrlInput.value;
          urlText.target = "_blank";

          const domain = new URL(editUrlInput.value).hostname;
          const website = domain.replace(/^www\./, "");

          const favicon = document.createElement("img");
          favicon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
          favicon.classList.add("favicon");

          favicon.onerror = function () {
            favicon.style.display = "none";
          };

          urlText.appendChild(favicon);
          urlText.appendChild(document.createTextNode(website));

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
      noteData.text = editInput.innerHTML;
      noteData.url = editUrlInput.value;
      noteData.startDateTime = editStartDateTimeInput.value;
      noteData.endDateTime = editEndDateTimeInput.value;
      noteData.folderId =
        editFolderSelect.value === "all" ? null : editFolderSelect.value;

      dateTimeText.innerHTML = "";

      if (noteData.startDateTime) {
        dateTimeText.textContent =
          "🕛 Start: " + formatDateTime(noteData.startDateTime);
      }

      if (noteData.endDateTime) {
        const endText = document.createElement("div");
        endText.textContent = "🕛 End: " + formatDateTime(noteData.endDateTime);

        dateTimeText.appendChild(endText);
      }

      if (!noteData.startDateTime && !noteData.endDateTime) {
        dateTimeText.style.display = "none";
      } else {
        dateTimeText.style.display = "flex";
      }

      localStorage.setItem("notes", JSON.stringify(notes));
      displayNotes();

      editStartDateTimeInput.remove();
      editEndDateTimeInput.remove();
      editSaveButton.remove();
    });
  });

  buttonContainer.appendChild(editButton);
  buttonContainer.appendChild(deleteButton);
  buttonContainer.appendChild(upButton);
  buttonContainer.appendChild(downButton);

  noteRight.appendChild(buttonContainer);

  //note.appendChild(buttonContainer);

  // notesContainer.appendChild(note);

  if (urlText) {
    noteRight.appendChild(urlText);
  }

  if (folderText) {
    noteRight.appendChild(folderText);
  }

  note.appendChild(textContainer);
  note.appendChild(noteRight);

  notesContainer.appendChild(note);
}

addButton.addEventListener("click", function () {
  const existingInput = document.querySelector(".inputContainer");

  // If inputs already exist, remove them
  if (existingInput) {
    existingInput.remove();
    return;
  }

  if (document.querySelector(".inputContainer")) {
    return;
  }

  const inputContainer = document.createElement("div");
  inputContainer.classList.add("inputContainer");

  const titleInput = document.createElement("input");
  titleInput.placeholder = "Enter a title...";

  const input = document.createElement("div");

  input.classList.add("noteInput");
  input.contentEditable = "true";

  input.dataset.placeholder = "Write your note here...";

  addTextFormatting(input);

  const urlInput = document.createElement("input");
  urlInput.placeholder = "Insert URL here.. (optional)";

  const startDateTimeInput = document.createElement("input");
  startDateTimeInput.type = "datetime-local";

  const startLabel = document.createElement("label");
  startLabel.textContent = "Start Time";

  const endDateTimeInput = document.createElement("input");
  endDateTimeInput.type = "datetime-local";

  const endLabel = document.createElement("label");
  endLabel.textContent = "End Time";

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.classList.add("saveBtn");

  const dateTimeContainer = document.createElement("div");
  dateTimeContainer.classList.add("dateTimeContainer");

  inputContainer.appendChild(titleInput);
  inputContainer.appendChild(input);
  inputContainer.appendChild(urlInput);
  inputContainer.appendChild(saveButton);

  notesContainer.prepend(inputContainer);

  dateTimeContainer.appendChild(startLabel);
  dateTimeContainer.appendChild(startDateTimeInput);

  dateTimeContainer.appendChild(endLabel);
  dateTimeContainer.appendChild(endDateTimeInput);
  inputContainer.appendChild(dateTimeContainer);

  saveButton.addEventListener("click", function () {
    if (urlInput.value.trim() !== "" && !isValidUrl(urlInput.value)) {
      alert("Please enter a valid URL.");
      return;
    }

    const title = titleInput.value.trim();
    const text = input.innerText.trim();
    const url = urlInput.value.trim();

    if (!title && !text && !url) {
      inputContainer.remove();
      return;
    }

    const noteData = {
    title: title,
    text: input.innerHTML,
    url: url,
    startDateTime: startDateTimeInput.value,
    endDateTime: endDateTimeInput.value,
    folderId: currentFolder === "all" ? null : currentFolder,
    };

    notes.push(noteData);

    localStorage.setItem("notes", JSON.stringify(notes));

    // Remove all input fields after saving
    inputContainer.remove();

    displayNotes();
    displayCalendar();
  });
});

addFolderButton.addEventListener("click", function () {
  if (document.querySelector(".folderInputContainer")) {
    return;
  }

  const folderInputContainer = document.createElement("div");
  folderInputContainer.classList.add("folderInputContainer");

  const folderInput = document.createElement("input");
  folderInput.placeholder = "Folder name...";

  const saveFolderButton = document.createElement("button");
  saveFolderButton.textContent = "Save";
  saveFolderButton.classList.add("saveFolderButton");

  folderInputContainer.appendChild(folderInput);
  folderInputContainer.appendChild(saveFolderButton);

  folderList.prepend(folderInputContainer);

  saveFolderButton.addEventListener("click", function () {
    if (folderInput.value.trim() === "") {
      return;
    }

    const newFolder = {
      id: Date.now().toString(),
      name: folderInput.value.trim(),
    };

    folders.push(newFolder);
    localStorage.setItem("folders", JSON.stringify(folders));
    displayFolders();
  });
});

displayNotes();

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {
  const searchText = searchInput.value.toLowerCase();

  notesContainer.innerHTML = "";

  notes.forEach(function (noteData) {
    const title = noteData.title.toLowerCase();
    const text = noteData.text.toLowerCase();

    if (title.includes(searchText) || text.includes(searchText)) {
      displayNote(noteData);
    }
  });
});

displayFolders();
displayCalendar();
