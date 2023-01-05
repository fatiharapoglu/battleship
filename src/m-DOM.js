import interact from "interactjs";
import { Player } from "./m-player";

class DOM {
    static coordinatesWithIDs = {}; // this helps connect the actual board with DOM board. IDs with coordinates.

    static getName = () => { // starting screen, asking name and start initialize game when clicking start
        const modalDOM = document.querySelector(".start");
        const nameInputDOM = document.querySelector("#input-name");
        const startBtnDOM = document.querySelector("#start-game");
        const boardNameDOM = document.querySelector("#board-name");

        startBtnDOM.addEventListener("click", () => {
            const name = nameInputDOM.value;
            if (name === "") return this.snackbar("Name is required.");
            boardNameDOM.textContent = `${name}'s board`;
            this.initGame(name);
            this.info(`Place your ships ${name}.`);
            modalDOM.classList.add("hidden");
        });
    };

    static initGame = (playerName) => { // wrapper function of related start game functions
        this.createGameboards(); // creates 3 gameboards

        const players = this.createPlayers(playerName); // creates 2 players
        const player = players.human;
        const computer = players.AI;

        computer.board.placeShipsForAI(); // ai randomly places ships
        this.placeShipsForPlayer(player, computer); // initialize place ship for player
        this.initEventListenerForSquares(player, computer); // initialize attacking when clicking squares
    };

    static placeShipsForPlayer = (player, computer) => {
        const placeShipsModalDOM = document.querySelector(".place-ships");
        const boardsDOM = document.querySelector(".boards");
        placeShipsModalDOM.classList.remove("hidden");

        const coordinatesWithShips = {};

        // interactjs drag drop listener function
        const dragMoveListener = (event) => {
            const target = event.target;
            const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute("data-x", x);
            target.setAttribute("data-y", y);
        };

        // finding starting point from end point when dropped
        const findStartPoint = (coordinates, direction, shipName) => {
            const array = JSON.parse(coordinates); // string to aray

            let length;
            switch (shipName) {
            case "carrier":
                length = 4;
                break;
            case "battleship":
                length = 3;
                break;
            case "destroyer":
            case "submarine":
                length = 2;
                break;
            case "patroller":
                length = 1;
                break;
            default:
                console.log("error");
            }

            if (direction === "horizontal") {
                const startPoint = array[0] - length;
                return [startPoint, array[1]];
            }
            const startPoint = array[1] + length;
            return [array[0], startPoint];
        };

        // interactjs drag-drop inner functions
        interact(".dropzone").dropzone({
            accept: ".draggable",
            overlap: 0.05,
            ondrop(event) { // when dropped
                let endPoint = event.target.dataset.id;
                const shipName = event.relatedTarget.classList[0];
                const direction = event.relatedTarget.classList[2];
                const startPoint = findStartPoint(endPoint, direction, shipName);
                endPoint = JSON.parse(endPoint);
                coordinatesWithShips[shipName] = { startPoint, endPoint, direction };
            },
        });

        interact(".draggable")
            .draggable({
                inertia: true,
                modifiers: [
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
            .on("doubletap", (event) => { // when doubletap, rotates ships
                const width = event.currentTarget.style.width;
                const height = event.currentTarget.style.height;
                event.currentTarget.style.width = height;
                event.currentTarget.style.height = width;
                event.currentTarget.classList.toggle("vertical");
                event.currentTarget.classList.toggle("horizontal");
            });

        const placeShipsBtnDOM = document.querySelector("#place-ships-btn");
        placeShipsBtnDOM.addEventListener("click", () => { // clicking start checks validity first
            if (this.checkPlaceShipsValidity(coordinatesWithShips) === false) {
                this.snackbar("Something's wrong with your ship placement, Admiral."); // throws error
            } else {
                const occupiedCoordinatesWithShips = this.checkPlaceShipsValidity(coordinatesWithShips);

                // if valid, places each ship
                Object.keys(occupiedCoordinatesWithShips).forEach((ship) => {
                    const direction = occupiedCoordinatesWithShips[ship].direction;
                    const coordinates = occupiedCoordinatesWithShips[ship].startPoint;
                    const name = ship;
                    player.board.placeShips(coordinates, player.board[name], direction);
                });

                // then renders everything and starts game
                this.renderGameboardForPlayer(player);
                this.renderGameboardForAI(computer);
                this.renderShipImages(occupiedCoordinatesWithShips);
                this.info("You can fire by clicking to the enemy board.");
                placeShipsModalDOM.classList.add("hidden");
                boardsDOM.classList.remove("hidden");
            }
        });
    };

    static checkPlaceShipsValidity = (coordinatesWithShips) => { // validity check
        if (Object.keys(coordinatesWithShips).length <= 4) return false; // if < 5 no need to check

        const placeShipsModal = document.querySelector("#place-ships-modal");
        const dropzones = placeShipsModal.querySelectorAll(".dropzone");
        const occupiedCoordinates = []; // coordinates array
        const occupiedCoordinatesWithShips = coordinatesWithShips; // new object of the static object

        Object.keys(occupiedCoordinatesWithShips).forEach((key) => {
            occupiedCoordinatesWithShips[key].coordinates = []; // first create empty array for each ship
        });

        dropzones.forEach((dropzone) => {
            const condition = Object.keys(coordinatesWithShips).filter(
                (key) => JSON.stringify(coordinatesWithShips[key].startPoint)
                  === JSON.stringify(JSON.parse(dropzone.dataset.id)),
            ); // double JSON method because it needs to be exact format for filter method

            if (condition.length !== 0) {
                const shipObj = coordinatesWithShips[condition[0]];
                const shipName = condition[0];
                if (shipObj.direction === "horizontal") {
                    for (let i = shipObj.startPoint[0]; i <= shipObj.endPoint[0]; i++) {
                        const coordinates = `[${i}, ${shipObj.endPoint[1]}]`;
                        occupiedCoordinates.push(coordinates);
                        occupiedCoordinatesWithShips[shipName].coordinates.push([i, shipObj.endPoint[1]]);
                    }
                } else {
                    for (let i = shipObj.endPoint[1]; i <= shipObj.startPoint[1]; i++) {
                        const coordinates = `[${shipObj.endPoint[0]}, ${i}]`;
                        occupiedCoordinates.push(coordinates);
                        occupiedCoordinatesWithShips[shipName].coordinates.push([shipObj.endPoint[0], i]);
                    }
                }
            }
        });

        // finds duplicate in occupied array
        const duplicates = occupiedCoordinates.filter(
            (sub, index, self) => index !== self.findIndex((t) => t === sub),
        );
        if (duplicates.length !== 0 || occupiedCoordinates.length !== 17) { // double check if it's valid
            return false;
        }
        console.log(occupiedCoordinatesWithShips);
        return occupiedCoordinatesWithShips; // returns copy of the static object with placed coordinates added
    };

    static initEventListenerForSquares = (player, computer) => {
        const squares = document.querySelectorAll(".AI-square");
        squares.forEach((square) => square.addEventListener("click", () => {
            if (square.textContent !== "") return;
            const ID = square.dataset.id;
            const coordinates = this.findCoordinates(ID);
            this.playOneRoundForEach(player, computer, coordinates); // actual playing rounds
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

    static createPlayers = (name) => { // gets called one time
        const human = new Player(name);
        const AI = new Player("AI");
        return { human, AI };
    };

    static renderGameboardForPlayer = (player) => { // working with textContent, but text is hidden
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
                square.textContent = playerBoard[coordinates[0]][coordinates[1]];
                break;
            case "hit":
                square.textContent = playerBoard[coordinates[0]][coordinates[1]];
                square.classList.add("hit");
                break;
            case "miss":
                square.textContent = playerBoard[coordinates[0]][coordinates[1]];
                square.classList.add("miss");
                break;
            default:
                console.log("error");
            }
        });
    };

    static renderGameboardForAI = (computer) => { // same with render for player, but hides ships
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
                square.textContent = computerBoard[coordinates[0]][coordinates[1]];
                square.classList.add("hit");
                break;
            case "miss":
                square.textContent = computerBoard[coordinates[0]][coordinates[1]];
                square.classList.add("miss");
                break;
            default:
                console.log("error");
            }
        });
    };

    static renderShipImages = (occupiedCoordinatesWithShips) => { // ship images divided equally for each ship's length
        const shipObj = occupiedCoordinatesWithShips;
        const carrierDirection = shipObj.carrier.direction;
        const battleshipDirection = shipObj.battleship.direction;
        const destroyerDirection = shipObj.destroyer.direction;
        const submarineDirection = shipObj.submarine.direction;
        const patrollerDirection = shipObj.patroller.direction;

        let carrierCount = 1;
        let battleshipCount = 1;
        let destroyerCount = 1;
        let submarineCount = 1;
        let patrollerCount = 1;

        document.querySelectorAll(".player-square").forEach((square) => {
            switch (square.textContent) {
            case "carrier":
                square.classList.add(`${square.textContent}-${carrierCount}`);
                carrierCount++;
                if (carrierDirection === "vertical") {
                    square.classList.add("rotated");
                }
                break;
            case "battleship":
                square.classList.add(`${square.textContent}-${battleshipCount}`);
                battleshipCount++;
                if (battleshipDirection === "vertical") {
                    square.classList.add("rotated");
                }
                break;
            case "destroyer":
                square.classList.add(`${square.textContent}-${destroyerCount}`);
                destroyerCount++;
                if (destroyerDirection === "vertical") {
                    square.classList.add("rotated");
                }
                break;
            case "submarine":
                square.classList.add(`${square.textContent}-${submarineCount}`);
                submarineCount++;
                if (submarineDirection === "vertical") {
                    square.classList.add("rotated");
                }
                break;
            case "patroller":
                square.classList.add(`${square.textContent}-${patrollerCount}`);
                patrollerCount++;
                if (patrollerDirection === "vertical") {
                    square.classList.add("rotated");
                }
                break;
            default:
                break;
            }
        });
    };

    static findCoordinates = (ID) => this.coordinatesWithIDs[ID]; // finding coordinates with data ID

    static findID = (coordinates) => { // finding data ID with coordinates
        const ID = Object.keys(this.coordinatesWithIDs).find((key) => this.coordinatesWithIDs[key] === coordinates);
        return ID;
    };

    static playOneRoundForEach = async (player, computer, coordinates) => { // note async
        const squares = document.querySelectorAll(".AI-square");

        // player attacks clicked coordinates
        Player.playerAttacks(computer, coordinates);
        this.renderGameboardForAI(computer);

        // and then AI turn
        squares.forEach((square) => {
            square.classList.add("disabled"); // disabled class adds pointer-events:none
        });
        await new Promise((resolve) => { // waiting to resolve while computer plays
            setTimeout(() => {
                Player.computerAttacks(player);
                this.renderGameboardForPlayer(player);
            }, 250);
            setTimeout(resolve, 250);
        });
        squares.forEach((square) => {
            square.classList.remove("disabled"); // so the player can't interact with the squares until promise resolved
        });
    };

    static infoHelper = { // typewriter helper object
        queue: [], // queued texts stacked here for display
        isRunning: false,
    };

    static info = (text) => { // improved with infoHelper object because of text announcer overlap problem
        const infoDOM = document.querySelector("#announcer");
        this.infoHelper.queue.push(text);
        const typeWriter = () => {
            if (this.infoHelper.isRunning) return;
            if (this.infoHelper.queue.length === 0) return;
            infoDOM.textContent = "";
            this.infoHelper.isRunning = true;
            const animationText = this.infoHelper.queue.shift();
            const speed = 100;
            let letter = 0;
            const type = () => {
                if (letter < animationText.length) {
                    infoDOM.textContent += animationText.charAt(letter);
                    letter++;
                    setTimeout(type, speed);
                } else {
                    this.infoHelper.isRunning = false;
                    typeWriter();
                }
            };
            type();
        };
        if (!this.infoHelper.isRunning) {
            typeWriter();
        }
    };

    static snackbar = (text) => { // snackbar alert settings
        const snackbarDOM = document.getElementById("snackbar");
        snackbarDOM.textContent = text;
        snackbarDOM.classList.add("show");
        setTimeout(() => {
            snackbarDOM.classList.remove("show");
        }, 3000);
    };

    static endGame = (text, winner) => { // ending game modals and disabling squares
        const endModalDOM = document.querySelector(".end-game");
        const squares = document.querySelectorAll(".AI-square");
        setTimeout(() => {
            squares.forEach((square) => {
                square.classList.add("disabled");
            });
        }, 300); // settimeout method because AI turn functions interferes with making it active again
        let winnerText;
        if (winner === "AI") {
            winnerText = "Computer wins...";
        } else {
            winnerText = "YOU WIN!";
        }
        const newText = `
            <span class="winner">${winnerText}</span> ${text} <button class="play-again">Play Again?</button>
            `;
        endModalDOM.innerHTML = newText;
        const playAgainBtn = document.querySelector(".play-again");
        playAgainBtn.addEventListener("click", () => {
            location.reload(); // refreshes the page if player clicks play again
        });
        endModalDOM.classList.remove("hidden");
    };
}

export { DOM };
