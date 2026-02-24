window.addEventListener("DOMContentLoaded", () => {

    //dom elements
    const tiles = Array.from(document.querySelectorAll(".tile"));
    const playerDisplay = document.querySelector(".display-player");
    const resetButton = document.getElementById("reset");
    const announcer = document.querySelector(".announcer");

    const gameModeSelect = document.getElementById("gameMode");
    const difficultySelect = document.getElementById("difficulty");

    //game state
    let board = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let isGameActive = true;

    let gameMode = "human"; 
    let difficulty = "easy"; 

    const PLAYERX_WON = "PLAYERX_WON";
    const PLAYERO_WON = "PLAYERO_WON";
    const TIE = "TIE";

    const winningConditions = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    //mode
    difficultySelect.style.display = "none";

    gameModeSelect.addEventListener("change", () => {
        gameMode = gameModeSelect.value;
        difficultySelect.style.display = gameMode === "human" ? "none" : "inline-block";
        resetGame();
    });

    difficultySelect.addEventListener("change", () => {
        difficulty = difficultySelect.value;
    });

    //game logiv
    function handleResultValidation() {
        let roundWon = false;

        for (let combo of winningConditions) {
            const [a,b,c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            announce(currentPlayer === "X" ? PLAYERX_WON : PLAYERO_WON);
            isGameActive = false;
            return;
        }

        if (!board.includes("")) {
            announce(TIE);
            isGameActive = false;
        }
    }

    function announce(type) {
        announcer.classList.remove("hide");
        if (type === PLAYERX_WON) {
            announcer.innerHTML = 'Player <span class="playerX">X</span> Won';
        } else if (type === PLAYERO_WON) {
            announcer.innerHTML = 'Player <span class="playero">O</span> Won';
        } else {
            announcer.innerText = "Tie";
        }
    }

    function resetGame() {
        board = ["", "", "", "", "", "", "", "", ""];
        isGameActive = true;
        currentPlayer = "X";
        announcer.classList.add("hide");
        playerDisplay.innerText = "X";

        tiles.forEach(tile => {
            tile.innerText = "";
            tile.classList.remove("playerX", "playero");
        });
    }

    //tilwe click handler 
    tiles.forEach((tile, index) => {
        tile.addEventListener("click", () => {

            if (!isGameActive || board[index] !== "") return;

            // Human move
            tile.innerText = currentPlayer;
            tile.classList.add(currentPlayer === "X" ? "playerX" : "playero");
            board[index] = currentPlayer;

            handleResultValidation();
            if (!isGameActive) return;

            if (gameMode === "ai" && currentPlayer === "X") {
                currentPlayer = "O";
                setTimeout(() => {
                    aiMove();
                    handleResultValidation();
                    if (isGameActive) currentPlayer = "X";
                }, 400);
            } else {
                currentPlayer = currentPlayer === "X" ? "O" : "X";
            }
        });
    });

    resetButton.addEventListener("click", resetGame);

    //computer controls 
    function aiMove() {
        if (difficulty === "easy") aiEasy();
        else if (difficulty === "medium") aiMedium();
        else aiHard();
    }

    function aiEasy() {
        let empty = board.map((v,i) => v === "" ? i : null).filter(v => v !== null);
        placeMove(empty[Math.floor(Math.random() * empty.length)]);
    }

    function aiMedium() {
        for (let combo of winningConditions) {
            let [a,b,c] = combo;
            if (board[a]==="O" && board[b]==="O" && board[c]==="") return placeMove(c);
            if (board[a]==="O" && board[c]==="O" && board[b]==="") return placeMove(b);
            if (board[b]==="O" && board[c]==="O" && board[a]==="") return placeMove(a);
        }
        for (let combo of winningConditions) {
            let [a,b,c] = combo;
            if (board[a]==="X" && board[b]==="X" && board[c]==="") return placeMove(c);
            if (board[a]==="X" && board[c]==="X" && board[b]==="") return placeMove(b);
            if (board[b]==="X" && board[c]==="X" && board[a]==="") return placeMove(a);
        }
        aiEasy();
    }

    function aiHard() {
        let bestScore = -Infinity;
        let move;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, false);
                board[i] = "";
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        placeMove(move);
    }

    function placeMove(index) {
        board[index] = "O";
        tiles[index].innerText = "O";
        tiles[index].classList.add("playero");
    }


    //minmax
    const scores = { O: 1, X: -1, tie: 0 };

    function minimax(board, isMaximizing) {
        let result = checkWinnerForMinimax();
        if (result !== null) return scores[result];

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === "") {
                    board[i] = "O";
                    bestScore = Math.max(bestScore, minimax(board, false));
                    board[i] = "";
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === "") {
                    board[i] = "X";
                    bestScore = Math.min(bestScore, minimax(board, true));
                    board[i] = "";
                }
            }
            return bestScore;
        }
    }

    function checkWinnerForMinimax() {
        for (let combo of winningConditions) {
            let [a,b,c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        if (!board.includes("")) return "tie";
        return null;
    }

});
