import interact from "interactjs";
import { Player } from "./m-player";

class DOM {
    static coordinatesWithIDs = {};

    static getName = () => {
        const modalDOM = document.querySelector(".start");
        const nameInputDOM = document.querySelector("#input-name");
        const startBtnDOM = document.querySelector("#start-game");

        startBtnDOM.addEventListener("click", () => {
            const name = nameInputDOM.value;
            this.initGame(name);
            modalDOM.classList.add("hidden");
        });
    };

    static initGame = (playerName) => {
        this.createGameboards();

        const players = this.createPlayers(playerName);
        const player = players.human;
        const computer = players.AI;

        computer.board.placeShipsForAI();

        this.placeShipsForPlayer(player);

        this.renderGameboardForPlayer(player);
        this.renderGameboardForAI(computer);

        this.initEventListenerForSquares(player, computer);
    };

    static placeShipsForPlayer = (player) => {
        const placeShipsModalDOM = document.querySelector(".place-ships");
        placeShipsModalDOM.classList.remove("hidden");

        const dragMoveListener = (event) => {
            const eTarget = event.target;
            const x = (parseFloat(eTarget.getAttribute("data-x")) || 0) + event.dx;
            const y = (parseFloat(eTarget.getAttribute("data-y")) || 0) + event.dy;
            eTarget.style.transform = `translate(${x}px, ${y}px)`;
            eTarget.setAttribute("data-x", x);
            eTarget.setAttribute("data-y", y);
        };

        interact(".dropzone").dropzone({
            accept: ".draggable",
            overlap: 0.3,
            ondropactivate(event) {
                event.target.classList.add("drop-active");
            },
            ondragenter(event) {
                const draggableElement = event.relatedTarget;
                const dropzoneElement = event.target;
                dropzoneElement.classList.add("drop-target");
                draggableElement.classList.add("can-drop");
            },
            ondragleave(event) {
                event.target.classList.remove("drop-target");
                event.relatedTarget.classList.remove("can-drop");
            },
            ondrop(event) {
                event.relatedTarget.textContent = "Dropped";
                console.log(event.target);
            },
            ondropdeactivate(event) {
                event.target.classList.remove("drop-active");
                event.target.classList.remove("drop-target");
            },
        });

        interact(".draggable")
            .draggable({
                inertia: true,
                modifiers: [
                    interact.modifiers.snap({
                        targets: [
                            interact.snappers.grid({ x: 51, y: 51 }),
                        ],
                        range: Infinity,
                        offset: { x: 5, y: 21 },
                        relativePoints: [
                            { x: 0, y: 0 },
                        ],
                    }),
                    interact.modifiers.restrictRect({
                        restriction: ".place-ships",
                        elementRect: {
                            top: 0, left: 0, bottom: 1, right: 1,
                        },
                        endOnly: false,
                    }),
                ],
                autoScroll: true,
                listeners: { move: dragMoveListener },
            })
            .on("doubletap", (event) => {
                const width = event.currentTarget.style.width;
                const height = event.currentTarget.style.height;
                event.currentTarget.style.width = height;
                event.currentTarget.style.height = width;
            });
    };

    static initEventListenerForSquares = (player, computer) => {
        const squares = document.querySelectorAll(".AI-square");
        squares.forEach((square) => square.addEventListener("click", () => {
            if (square.textContent !== "") return;
            const ID = square.dataset.id;
            const coordinates = this.findCoordinates(ID);
            this.playOneRoundForEach(player, computer, coordinates);
        }));
    };

    static createGameboards = () => {
        const playerGameboard = document.querySelector(".player-board");
        const computerGameboard = document.querySelector(".AI-board");
        const placeShipsModal = document.querySelector("#place-ships-modal");

        for (let y = 9; y >= 0; y--) {
            for (let x = 0; x <= 9; x++) {
                const squarePlayer = document.createElement("div");
                const squareAI = document.createElement("div");
                const divForPlaceShips = document.createElement("div");

                divForPlaceShips.classList.add("square");
                divForPlaceShips.classList.add("dropzone");
                divForPlaceShips.dataset.id = `[${x}, ${y}]`;
                squarePlayer.classList.add("player-square");
                squareAI.classList.add("AI-square");
                squarePlayer.classList.add("square");
                squareAI.classList.add("square");
                squarePlayer.dataset.id = `player-[${x}, ${y}]`;
                squareAI.dataset.id = `AI-[${x}, ${y}]`;

                this.coordinatesWithIDs[`player-[${x}, ${y}]`] = [x, y];
                this.coordinatesWithIDs[`AI-[${x}, ${y}]`] = [x, y];

                placeShipsModal.appendChild(divForPlaceShips);
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

    static renderGameboardForPlayer = (player) => {
        const playerBoard = player.board.board;
        const squares = document.querySelectorAll(".player-square");
        squares.forEach((square) => {
            const ID = square.dataset.id;
            const coordinates = this.findCoordinates(ID);
            switch (playerBoard[coordinates[0]][coordinates[1]]) {
            case "water":
                break;
            case "carrier":
            case "battleship":
            case "destroyer":
            case "submarine":
            case "patroller":
            case "hit":
            case "miss":
                square.textContent = playerBoard[coordinates[0]][coordinates[1]];
                break;
            default:
                console.log("error");
            }
        });
    };

    static renderGameboardForAI = (computer) => {
        const computerBoard = computer.board.board;
        const squares = document.querySelectorAll(".AI-square");
        squares.forEach((square) => {
            const ID = square.dataset.id;
            const coordinates = this.findCoordinates(ID);
            switch (computerBoard[coordinates[0]][coordinates[1]]) {
            case "water":
            case "carrier":
            case "battleship":
            case "destroyer":
            case "submarine":
            case "patroller":
                break;
            case "hit":
            case "miss":
                square.textContent = computerBoard[coordinates[0]][coordinates[1]];
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

    static playOneRoundForEach = (player, computer, coordinates) => {
        Player.playerAttacks(computer, coordinates);
        this.renderGameboardForAI(computer);
        Player.computerAttacks(player);
        this.renderGameboardForPlayer(player);
    };
}

export { DOM };
