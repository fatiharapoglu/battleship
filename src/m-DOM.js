import { Player } from "./m-player";

class DOM {
    static coordinatesWithIDs = {};

    static initGame = (playerName) => {
        this.createGameboards();

        const players = this.createPlayers(playerName);
        const player = players.human;
        const computer = players.AI;

        player.board.placeShips([0, 0], computer.board.carrier, "vertical");
        player.board.placeShips([1, 0], computer.board.battleship, "vertical");
        player.board.placeShips([2, 0], computer.board.destroyer, "vertical");
        player.board.placeShips([3, 0], computer.board.submarine, "vertical");
        player.board.placeShips([8, 5], computer.board.patroller, "vertical");

        this.placeForAI(computer);

        this.renderGameboardForPlayer(player);

        const squares = document.querySelectorAll(".square");
        squares.forEach((square) => square.addEventListener("click", () => {
            const ID = square.dataset.id;
            this.findCoordinates(ID);
            console.log(ID);
        }));
    };

    static createGameboards = () => {
        const playerGameboard = document.querySelector(".player-board");
        const computerGameboard = document.querySelector(".AI-board");

        for (let x = 9; x >= 0; x--) {
            for (let y = 0; y <= 9; y++) {
                const squarePlayer = document.createElement("div");
                const squareAI = document.createElement("div");

                squarePlayer.classList.add("player-square");
                squareAI.classList.add("AI-square");
                squarePlayer.classList.add("square");
                squareAI.classList.add("square");
                squarePlayer.dataset.id = `player-[${x}, ${y}]`;
                squareAI.dataset.id = `AI-[${x}, ${y}]`;

                this.coordinatesWithIDs[`player-[${x}, ${y}]`] = [x, y];
                this.coordinatesWithIDs[`AI-[${x}, ${y}]`] = [x, y];

                playerGameboard.appendChild(squarePlayer);
                computerGameboard.appendChild(squareAI);
            }
        }
    };

    static createPlayers = (name) => {
        const human = new Player(name);
        const AI = new Player("AI");
        return { human, AI };
    };

    static placeForAI = (computer) => {
        computer.board.placeShips([0, 0], computer.board.carrier, "horizontal");
        computer.board.placeShips([1, 0], computer.board.battleship, "horizontal");
        computer.board.placeShips([2, 0], computer.board.destroyer, "horizontal");
        computer.board.placeShips([3, 0], computer.board.submarine, "horizontal");
        computer.board.placeShips([8, 5], computer.board.patroller, "vertical");
    };

    static renderGameboardForPlayer = (player) => {
        const playerBoard = player.board.board;
        const squares = document.querySelectorAll(".player-square");
        squares.forEach((square) => {
            const ID = square.dataset.id;
            const coordinates = this.findCoordinates(ID);
            switch (playerBoard[coordinates[0]][coordinates[1]]) {
            case "water":
                break;
            case "Carrier":
            case "Battleship":
            case "Destroyer":
            case "Submarine":
            case "Patrol Boat":
            case "hit":
            case "miss":
                square.textContent = playerBoard[coordinates[0]][coordinates[1]];
                break;
            default:
                console.log("error");
            }
        });
    };

    static findCoordinates = (ID) => this.coordinatesWithIDs[ID];

    static findID = (coordinates) => {
        const ID = Object.keys(this.coordinatesWithIDs).find((key) => this.coordinatesWithIDs[key] === coordinates);
        return ID;
    };
}

export { DOM };
