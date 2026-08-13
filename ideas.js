const ideaBoard = document.getElementById("ideaBoard");
const addStickyButton = document.getElementById("addStickyBtn");

const boardName = document.getElementById("boardName");
const previousBoardButton = document.getElementById("previousBoardBtn");
const nextBoardButton = document.getElementById("nextBoardBtn");
const addBoardButton = document.getElementById("addBoardBtn");
const renameBoardButton = document.getElementById("renameBoardBtn");
const deleteBoardButton = document.getElementById("deleteBoardBtn");


// =========================
// BOARDS
// =========================

// Load saved boards

let boards =
  JSON.parse(localStorage.getItem("ideaBoards")) || [];


// Load previously selected board

let currentBoardIndex =
  Number(localStorage.getItem("currentIdeaBoard")) || 0;


// Create first board if none exist

if (boards.length === 0) {

  boards.push({

    id: Date.now(),

    name: "Board 1",

    ideas: []

  });

}


// Make sure selected board exists

if (currentBoardIndex >= boards.length) {

  currentBoardIndex = 0;

}


// Current board's ideas

let ideas =
  boards[currentBoardIndex].ideas;


// =========================
// SAVE BOARDS
// =========================

function saveIdeas() {

  // Save current ideas into current board

  boards[currentBoardIndex].ideas = ideas;


  // Save all boards

  localStorage.setItem(
    "ideaBoards",
    JSON.stringify(boards)
  );


  // Remember current board

  localStorage.setItem(
    "currentIdeaBoard",
    currentBoardIndex
  );

}


// =========================
// UPDATE BOARD NAME
// =========================

function updateBoardDisplay() {

  boardName.textContent =
    boards[currentBoardIndex].name;

}


// =========================
// SWITCH BOARD
// =========================

function switchBoard(index) {

  // Loop to last board

  if (index < 0) {

    index = boards.length - 1;

  }


  // Loop back to first board

  if (index >= boards.length) {

    index = 0;

  }


  // Change current board

  currentBoardIndex = index;


  // Get ideas from new board

  ideas =
    boards[currentBoardIndex].ideas;


  // Save selected board

  localStorage.setItem(
    "currentIdeaBoard",
    currentBoardIndex
  );


  // Clear current board visually

  ideaBoard.innerHTML = "";


  // Recreate stickies

  ideas.forEach(function (ideaData) {

    createSticky(ideaData);

  });


  // Update board name

  updateBoardDisplay();

}


// =========================
// PREVIOUS BOARD
// =========================

previousBoardButton.addEventListener(
  "click",
  function () {

    switchBoard(
      currentBoardIndex - 1
    );

  }
);


// =========================
// NEXT BOARD
// =========================

nextBoardButton.addEventListener(
  "click",
  function () {

    switchBoard(
      currentBoardIndex + 1
    );

  }
);


// =========================
// BOARD INPUT
// =========================

const boardInputContainer =
  document.getElementById("boardInputContainer");

const boardInput =
  document.getElementById("boardInput");

const saveBoardInput =
  document.getElementById("saveBoardInput");

const cancelBoardInput =
  document.getElementById("cancelBoardInput");

let boardInputMode = null;


// =========================
// SHOW BOARD INPUT
// =========================

function showBoardInput(mode) {

  boardInputMode = mode;

  boardInputContainer.style.display = "flex";

  boardInput.value = "";

  if (mode === "rename") {

    boardInput.value =
      boards[currentBoardIndex].name;

    boardInput.select();

  }

  boardInput.focus();

}


// =========================
// ADD BOARD BUTTON
// =========================

addBoardButton.addEventListener(
  "click",
  function () {

    showBoardInput("add");

  }
);


// =========================
// RENAME BUTTON
// =========================

renameBoardButton.addEventListener(
  "click",
  function () {

    showBoardInput("rename");

  }
);


// =========================
// SAVE BOARD INPUT
// =========================

saveBoardInput.addEventListener(
  "click",
  function () {

    const name =
      boardInput.value.trim();


    if (!name) {

      boardInput.focus();

      return;

    }


    // ADD BOARD

    if (boardInputMode === "add") {

      boards.push({

        id: Date.now(),

        name: name,

        ideas: []

      });


      currentBoardIndex =
        boards.length - 1;


      ideas =
        boards[currentBoardIndex].ideas;


      ideaBoard.innerHTML = "";


      saveIdeas();

      updateBoardDisplay();

    }


    // RENAME BOARD

    if (boardInputMode === "rename") {

      boards[currentBoardIndex].name =
        name;


      saveIdeas();

      updateBoardDisplay();

    }


    hideBoardInput();

  }
);


// =========================
// CANCEL
// =========================

cancelBoardInput.addEventListener(
  "click",
  function () {

    hideBoardInput();

  }
);


// =========================
// HIDE INPUT
// =========================

function hideBoardInput() {

  boardInputContainer.style.display =
    "none";

  boardInput.value = "";

  boardInputMode = null;

}


// =========================
// ENTER TO SAVE
// =========================

boardInput.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Enter") {

      saveBoardInput.click();

    }


    if (event.key === "Escape") {

      hideBoardInput();

    }

  }
);

// =========================
// DELETE BOARD
// =========================

deleteBoardButton.addEventListener(
  "click",
  function () {

    // Don't allow deleting the last board

    if (boards.length === 1) {

      alert(
        "You need at least one board."
      );

      return;

    }


    const confirmed =
      confirm(
        `Delete "${boards[currentBoardIndex].name}"?`
      );


    if (!confirmed) {

      return;

    }


    // Delete board

    boards.splice(
      currentBoardIndex,
      1
    );


    // Make sure index is valid

    if (
      currentBoardIndex >=
      boards.length
    ) {

      currentBoardIndex =
        boards.length - 1;

    }


    // Load new current board

    ideas =
      boards[currentBoardIndex].ideas;


    // Save

    saveIdeas();


    // Clear board

    ideaBoard.innerHTML = "";


    // Recreate stickies

    ideas.forEach(function (ideaData) {

      createSticky(ideaData);

    });


    // Update board name

    updateBoardDisplay();

  }
);


// =========================
// TEXT FORMATTING
// =========================

function addTextFormatting(element) {

  element.addEventListener(
    "keydown",
    function (event) {

      // CTRL + B → BOLD

      if (
        event.ctrlKey &&
        event.key.toLowerCase() === "b"
      ) {

        event.preventDefault();

        document.execCommand(
          "bold",
          false,
          null
        );

      }


      // CTRL + I → ITALIC

      if (
        event.ctrlKey &&
        event.key.toLowerCase() === "i"
      ) {

        event.preventDefault();

        document.execCommand(
          "italic",
          false,
          null
        );

      }

    }
  );

}


// =========================
// CREATE STICKY
// =========================

function createSticky(ideaData) {

  const sticky =
    document.createElement("div");

  sticky.classList.add(
    "stickyNote"
  );


  // =========================
  // POSITION + SIZE
  // =========================

  sticky.style.left =
    (ideaData.left || 20) + "px";

  sticky.style.top =
    (ideaData.top || 20) + "px";

  sticky.style.width =
    (ideaData.width || 180) + "px";

  sticky.style.height =
    (ideaData.height || 180) + "px";


  // =========================
  // STICKY HEADER
  // =========================

  const stickyHeader =
    document.createElement("div");

  stickyHeader.classList.add(
    "stickyHeader"
  );


  const stickyTitle =
    document.createElement("div");

  stickyTitle.classList.add(
    "stickyTitle"
  );


  stickyTitle.contentEditable =
    "true";


  // Preserve formatting

  stickyTitle.innerHTML =
    ideaData.title || "New Idea";


  addTextFormatting(
    stickyTitle
  );


  stickyHeader.appendChild(
    stickyTitle
  );


  // =========================
  // STICKY BODY
  // =========================

  const stickyBody =
    document.createElement("div");

  stickyBody.classList.add(
    "stickyContent"
  );


  stickyBody.contentEditable =
    "true";


  // Preserve formatting

  stickyBody.innerHTML =
    ideaData.text ||
    "Write your idea...";


  addTextFormatting(
    stickyBody
  );


  // =========================
  // ROTATE BUTTON
  // =========================

  const rotateHandle =
    document.createElement("div");

  rotateHandle.classList.add(
    "rotateHandle"
  );

  rotateHandle.textContent = "↻";


  // =========================
  // DELETE BUTTON
  // =========================

  const deleteButton =
    document.createElement("button");

  deleteButton.classList.add(
    "stickyDelete"
  );

  deleteButton.textContent = "✕";


  deleteButton.addEventListener(
    "click",
    function (event) {

      event.stopPropagation();


      // Remove idea

      ideas =
        ideas.filter(function (idea) {

          return idea.id !== ideaData.id;

        });


      // Update current board

      boards[currentBoardIndex].ideas =
        ideas;


      // Save

      saveIdeas();


      // Remove visually

      sticky.remove();

    }
  );


  // =========================
  // SAVE TITLE
  // =========================

  stickyTitle.addEventListener(
    "input",
    function () {

      ideaData.title =
        stickyTitle.innerHTML;

      saveIdeas();

    }
  );


  // =========================
  // SAVE BODY
  // =========================

  stickyBody.addEventListener(
    "input",
    function () {

      ideaData.text =
        stickyBody.innerHTML;

      saveIdeas();

    }
  );


  // =========================
  // ROTATION
  // =========================

  let rotation =
    ideaData.rotation || 0;


  sticky.style.transform =
    `rotate(${rotation}deg)`;


  rotateHandle.addEventListener(
    "mousedown",
    function (event) {

      event.stopPropagation();

      event.preventDefault();


      const rect =
        sticky.getBoundingClientRect();


      const centerX =
        rect.left +
        rect.width / 2;


      const centerY =
        rect.top +
        rect.height / 2;


      // Starting mouse angle

      const startMouseAngle =
        Math.atan2(
          event.clientY - centerY,
          event.clientX - centerX
        ) *
        (180 / Math.PI);


      const startRotation =
        rotation;


      function rotateSticky(event) {

        const currentMouseAngle =
          Math.atan2(
            event.clientY - centerY,
            event.clientX - centerX
          ) *
          (180 / Math.PI);


        const angleDifference =
          currentMouseAngle -
          startMouseAngle;


        rotation =
          startRotation +
          angleDifference;


        sticky.style.transform =
          `rotate(${rotation}deg)`;


        ideaData.rotation =
          rotation;

      }


      function stopRotating() {

        saveIdeas();


        document.removeEventListener(
          "mousemove",
          rotateSticky
        );


        document.removeEventListener(
          "mouseup",
          stopRotating
        );

      }


      document.addEventListener(
        "mousemove",
        rotateSticky
      );


      document.addEventListener(
        "mouseup",
        stopRotating
      );

    }
  );


  // =========================
  // ADD EVERYTHING
  // =========================

  sticky.appendChild(
    stickyHeader
  );

  sticky.appendChild(
    stickyBody
  );

  sticky.appendChild(
    deleteButton
  );

  sticky.appendChild(
    rotateHandle
  );

  ideaBoard.appendChild(
    sticky
  );


  // =========================
  // DRAG + RESIZE
  // =========================

  makeDraggable(
    sticky,
    ideaData
  );

  makeResizable(
    sticky,
    ideaData
  );

}


// =========================
// ADD NEW STICKY
// =========================

addStickyButton.addEventListener(
  "click",
  function () {

    const offset =
      ideas.length * 20;


    const ideaData = {

      id: Date.now(),

      title: "Title",

      text: "New idea...",

      left: 20 + offset,

      top: 20 + offset,

      width: 180,

      height: 180,

      rotation: 0

    };


    // Add to current board

    ideas.push(
      ideaData
    );


    // Save

    saveIdeas();


    // Display

    createSticky(
      ideaData
    );

  }
);


// =========================
// DRAGGING
// =========================

function makeDraggable(
  sticky,
  ideaData
) {

  const stickyHeader =
    sticky.querySelector(
      ".stickyHeader"
    );


  let isDragging = false;

  let offsetX = 0;

  let offsetY = 0;


  stickyHeader.addEventListener(
    "mousedown",
    function (event) {


      // Don't drag when editing title

      if (
        event.target.classList.contains(
          "stickyTitle"
        )
      ) {

        return;

      }


      isDragging = true;


      const stickyRect =
        sticky.getBoundingClientRect();


      const boardRect =
        ideaBoard.getBoundingClientRect();


      offsetX =
        event.clientX -
        stickyRect.left;


      offsetY =
        event.clientY -
        stickyRect.top;


      sticky.style.cursor =
        "grabbing";


      function moveSticky(event) {

        if (!isDragging) {

          return;

        }


        let newLeft =
          event.clientX -
          boardRect.left -
          offsetX;


        let newTop =
          event.clientY -
          boardRect.top -
          offsetY;


        const maxLeft =
          ideaBoard.clientWidth -
          sticky.offsetWidth;


        const maxTop =
          ideaBoard.clientHeight -
          sticky.offsetHeight;


        newLeft =
          Math.max(
            0,
            Math.min(
              newLeft,
              maxLeft
            )
          );


        newTop =
          Math.max(
            0,
            Math.min(
              newTop,
              maxTop
            )
          );


        sticky.style.left =
          newLeft + "px";


        sticky.style.top =
          newTop + "px";

      }


      function stopDragging() {

        isDragging = false;


        sticky.style.cursor =
          "grab";


        ideaData.left =
          parseInt(
            sticky.style.left
          );


        ideaData.top =
          parseInt(
            sticky.style.top
          );


        saveIdeas();


        document.removeEventListener(
          "mousemove",
          moveSticky
        );


        document.removeEventListener(
          "mouseup",
          stopDragging
        );

      }


      document.addEventListener(
        "mousemove",
        moveSticky
      );


      document.addEventListener(
        "mouseup",
        stopDragging
      );

    }
  );

}


// =========================
// RESIZING
// =========================

function makeResizable(
  sticky,
  ideaData
) {

  sticky.addEventListener(
    "mouseup",
    function () {

      ideaData.width =
        sticky.offsetWidth;

      ideaData.height =
        sticky.offsetHeight;

      saveIdeas();

    }
  );

}


// =========================
// INITIAL LOAD
// =========================

ideas.forEach(
  function (ideaData) {

    createSticky(
      ideaData
    );

  }
);


// Show current board name

updateBoardDisplay();