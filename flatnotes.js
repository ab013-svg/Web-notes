const addBoardBtn = document.getElementById("addBoardBtn");
const boardList = document.getElementById("boardList");

const boardTitle = document.getElementById("boardTitle");
const flatNotesEditor = document.getElementById("flatNotesEditor");
const saveStatus = document.getElementById("saveStatus");

const boardContextMenu = document.getElementById("boardContextMenu");
const renameBoardOption = document.getElementById("renameBoardOption");
const deleteBoardOption = document.getElementById("deleteBoardOption");


let boards = JSON.parse(localStorage.getItem("flatBoards")) || [];

let currentBoardId = null;
let contextBoardId = null;


/* -------------------------
   SAVE BOARDS
------------------------- */

function saveBoards() {

    localStorage.setItem(
        "flatBoards",
        JSON.stringify(boards)
    );

}


/* -------------------------
   CREATE BOARD
------------------------- */

function createBoard() {

    const newBoard = {

        id: Date.now(),

        name: "Untitled",

        content: ""

    };


    boards.push(newBoard);

    saveBoards();

    openBoard(newBoard.id);

    displayBoards();

}


/* -------------------------
   DISPLAY BOARDS
------------------------- */

function displayBoards() {

    boardList.innerHTML = "";


    boards.forEach(board => {

        const boardButton = document.createElement("button");

        boardButton.className = "flatBoardButton";

        boardButton.textContent = board.name;


        if (board.id === currentBoardId) {

            boardButton.classList.add("selected");

        }


        boardButton.addEventListener("click", () => {

            openBoard(board.id);

        });


        boardButton.addEventListener("contextmenu", event => {

            event.preventDefault();

            contextBoardId = board.id;

            boardContextMenu.style.left =
                event.clientX + "px";

            boardContextMenu.style.top =
                event.clientY + "px";

            boardContextMenu.style.display = "flex";

        });


        boardList.appendChild(boardButton);

    });

}


/* -------------------------
   OPEN BOARD
------------------------- */

function openBoard(boardId) {

    const board = boards.find(
        board => board.id === boardId
    );


    if (!board) return;


    currentBoardId = boardId;


    boardTitle.value = board.name;

    flatNotesEditor.innerHTML = board.content;


    displayBoards();

}


/* -------------------------
   SAVE CURRENT BOARD
------------------------- */

function saveCurrentBoard() {

    if (currentBoardId === null) return;


    const board = boards.find(
        board => board.id === currentBoardId
    );


    if (!board) return;


    board.name = boardTitle.value || "Untitled";

    board.content = flatNotesEditor.innerHTML;


    saveBoards();


    saveStatus.textContent = "Saved";


    displayBoards();

}


/* -------------------------
   BOARD TITLE
------------------------- */

boardTitle.addEventListener("input", () => {

    saveStatus.textContent = "Saving...";

    saveCurrentBoard();

});


/* -------------------------
   EDITOR
------------------------- */

flatNotesEditor.addEventListener("input", () => {

    saveStatus.textContent = "Saving...";

    saveCurrentBoard();

});


/* -------------------------
   TAB INDENT
------------------------- */

flatNotesEditor.addEventListener("keydown", event => {

    if (event.key === "Tab") {

        event.preventDefault();

        document.execCommand(
            "insertText",
            false,
            "    "
        );

    }

});


/* -------------------------
   ADD BOARD
------------------------- */

addBoardBtn.addEventListener(
    "click",
    createBoard
);


/* -------------------------
   RENAME BOARD
------------------------- */

renameBoardOption.addEventListener("click", () => {

    const board = boards.find(
        board => board.id === contextBoardId
    );


    if (!board) return;


    const newName = prompt(
        "Board name:",
        board.name
    );


    if (newName === null) return;


    board.name = newName.trim() || "Untitled";


    saveBoards();

    displayBoards();

    boardTitle.value = board.name;


    boardContextMenu.style.display = "none";

});


/* -------------------------
   DELETE BOARD
------------------------- */

deleteBoardOption.addEventListener("click", () => {

    const board = boards.find(
        board => board.id === contextBoardId
    );


    if (!board) return;


    boards = boards.filter(
        board => board.id !== contextBoardId
    );


    saveBoards();


    boardContextMenu.style.display = "none";


    if (currentBoardId === contextBoardId) {

        currentBoardId = null;

        boardTitle.value = "";

        flatNotesEditor.innerHTML = "";

    }


    displayBoards();

});


/* -------------------------
   HIDE CONTEXT MENU
------------------------- */

document.addEventListener("click", () => {

    boardContextMenu.style.display = "none";

});


/* -------------------------
   INITIALIZE
------------------------- */

if (boards.length === 0) {

    createBoard();

} else {

    currentBoardId = boards[0].id;

    openBoard(currentBoardId);

}