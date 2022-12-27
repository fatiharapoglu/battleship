class DOM {
    static initButtons = () => {

    };

    static createGameboards = () => {
        const playerGameboard = document.querySelector(".player-board");
        const computerGameboard = document.querySelector(".AI-board");

        for (let i = 100; i > 0; i--) {
            const squarePlayer = document.createElement("div");
            const squareAI = document.createElement("div");

            squarePlayer.classList.add("player-square");
            squareAI.classList.add("AI-square");
            squarePlayer.classList.add("square");
            squareAI.classList.add("square");
            squarePlayer.dataset.id = `player-${i}`;
            squareAI.dataset.id = `AI-${i}`;

            playerGameboard.appendChild(squarePlayer);
            computerGameboard.appendChild(squareAI);
        }

        playerGameboard.querySelectorAll(".square");
    };
}

export { DOM };
