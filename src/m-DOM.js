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
        this.placeShipsForPlayer(player, computer);
        this.initEventListenerForSquares(player, computer);
    };

    static placeShipsForPlayer = (player, computer) => {
        const placeShipsModalDOM = document.querySelector(".place-ships");
        placeShipsModalDOM.classList.remove("hidden");

        const coordinatesWithShips = {};

        const dragMoveListener = (event) => {
            const target = event.target;
            const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute("data-x", x);
            target.setAttribute("data-y", y);
        };

        const findStartPoint = (coordinates, direction, shipName) => {
            const array = JSON.parse(coordinates);

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

        interact(".dropzone").dropzone({
            accept: ".draggable",
            overlap: 0.19,
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
                let endPoint = event.target.dataset.id;
                const shipName = event.relatedTarget.classList[0];
                const direction = event.relatedTarget.classList[2];
                const startPoint = findStartPoint(endPoint, direction, shipName);
                endPoint = JSON.parse(endPoint);
                coordinatesWithShips[shipName] = { startPoint, endPoint, direction };
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
                        offset: { x: 5, y: 5 },
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
                event.currentTarget.classList.toggle("vertical");
                event.currentTarget.classList.toggle("horizontal");
            });

        const placeShipsBtnDOM = document.querySelector("#place-ships-btn");
        placeShipsBtnDOM.addEventListener("click", () => {
            if (this.checkPlaceShipsValidity(coordinatesWithShips) === false) {
                this.snackbar("Something's wrong with your ship placement, Admiral.");
            } else {
                const occupiedCoordinatesWithShips = this.checkPlaceShipsValidity(coordinatesWithShips);
                Object.keys(occupiedCoordinatesWithShips).forEach((ship) => {
                    const direction = occupiedCoordinatesWithShips[ship].direction;
                    const coordinates = occupiedCoordinatesWithShips[ship].startPoint;
                    const name = ship;
                    player.board.placeShips(coordinates, player.board[name], direction);
                });
                this.renderGameboardForPlayer(player);
                this.renderGameboardForAI(computer);
                placeShipsModalDOM.classList.add("hidden");
                document.querySelector(".boards").classList.remove("hidden");
                this.renderShipImages(occupiedCoordinatesWithShips);
            }
        });
    };

    static checkPlaceShipsValidity = (coordinatesWithShips) => {
        if (Object.keys(coordinatesWithShips).length <= 4) return false;

        const placeShipsModal = document.querySelector("#place-ships-modal");
        const dropzones = placeShipsModal.querySelectorAll(".dropzone");
        const occupiedCoordinates = [];
        const occupiedCoordinatesWithShips = coordinatesWithShips;
        Object.keys(occupiedCoordinatesWithShips).forEach((key) => {
            occupiedCoordinatesWithShips[key].coordinates = [];
        });

        dropzones.forEach((dropzone) => {
            const condition = Object.keys(coordinatesWithShips).filter(
                (key) => JSON.stringify(coordinatesWithShips[key].startPoint)
                  === JSON.stringify(JSON.parse(dropzone.dataset.id)),
            );

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

        const duplicates = occupiedCoordinates.filter(
            (sub, index, self) => index !== self.findIndex((t) => t === sub),
        );

        if (duplicates.length !== 0 || occupiedCoordinates.length !== 17) {
            return false;
        }
        return occupiedCoordinatesWithShips;
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

    static renderShipImages = (occupiedCoordinatesWithShips) => {
        const carrierDirection = occupiedCoordinatesWithShips.carrier.direction;
        const battleshipDirection = occupiedCoordinatesWithShips.battleship.direction;
        const destroyerDirection = occupiedCoordinatesWithShips.destroyer.direction;
        const submarineDirection = occupiedCoordinatesWithShips.submarine.direction;
        const patrollerDirection = occupiedCoordinatesWithShips.patroller.direction;

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

    static snackbar = (text) => { // snackbar alert settings
        const snackbarDOM = document.getElementById("snackbar");
        snackbarDOM.textContent = text;
        snackbarDOM.classList.add("show");
        setTimeout(() => {
            snackbarDOM.classList.remove("show");
        }, 3000);
    };
}

export { DOM };
