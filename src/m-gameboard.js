import { DOM } from "./m-DOM";
import { Ship } from "./m-ship";

class Gameboard {
    constructor(playerName) {
        this.board = Array.from({ length: 10 }, () => Array(10).fill("water")); // 10x10 matrix filled with water
        this.carrier = new Ship(5, "carrier");
        this.battleship = new Ship(4, "battleship");
        this.destroyer = new Ship(3, "destroyer");
        this.submarine = new Ship(3, "submarine");
        this.patroller = new Ship(2, "patroller");
        this.player = playerName;
    }

    placeShips = (coordinates, ship, direction) => { // fill methods for placing ships in array
        const placed = coordinates;
        const width = ship.length;
        const placeholder = ship.name;
        if (direction === "horizontal") {
            const x = placed[0];
            const y = placed[1];
            const mapped = this.board.map((row) => row[y]).fill(placeholder, x, (x + width));
            let i = 0;
            this.board.forEach((row) => {
                row[y] = mapped[i];
                i++;
            });
        } else if (direction === "vertical") {
            const x = placed[0];
            const y = placed[1];
            this.board[x].fill(placeholder, (y - width + 1), (y + 1));
        }
    };

    recieveAttack = (coordinates) => {
        if (this.board[coordinates[0]][coordinates[1]] === "miss"
            || this.board[coordinates[0]][coordinates[1]] === "hit") return;
        if (this.board[coordinates[0]][coordinates[1]] === "water") {
            this.board[coordinates[0]][coordinates[1]] = "miss";
        } else {
            const name = this.board[coordinates[0]][coordinates[1]]; // store before change it to "hit"
            this.board[coordinates[0]][coordinates[1]] = "hit";
            this.lastHit = coordinates;
            const target = Object.keys(this).find((key) => this[key].name === name);
            this[target].hit(); // ship class
            this.checkIsSunk(target);
            this.checkIsGame();
        }
    };

    static sunkShips = []; // this exist for first blood feature only for now. stores sunk ships.

    checkIsSunk = (target) => {
        if (this[target].isSunk) {
            if (Gameboard.sunkShips.length === 0) {
                DOM.info(`FIRST BLOOD! ${this.player}'s ${this[target].name} is sunk!`);
            } else {
                DOM.info(`${this.player}'s ${this[target].name} is sunk!`);
            }
            Gameboard.sunkShips.push(this[target]);
        }
    };

    checkIsGame = () => { // if every ship is sunk, initialize game over
        if (this.carrier.isSunk === true
            && this.battleship.isSunk === true
            && this.destroyer.isSunk === true
            && this.submarine.isSunk === true
            && this.patroller.isSunk === true) {
            this.endGame();
        }
    };

    lastHit = [];

    attackQueue = [];

    getAvailableMoves = () => {
        const randomCoordinates = () => {
            const randomRow = Math.floor(Math.random() * 10);
            const randomColumn = Math.floor(Math.random() * 10);
            const coordinates = [randomRow, randomColumn];
            return coordinates;
        };

        const evaluateMoves = () => {
            const tryCoordinates = randomCoordinates();
            if (this.board[tryCoordinates[0]][tryCoordinates[1]] === "hit"
                || this.board[tryCoordinates[0]][tryCoordinates[1]] === "miss") {
                return evaluateMoves(); // recurring until it's valid
            }
            return tryCoordinates;
        };

        const evaluateAdjacents = (move) => {
            if (move[0] < 0 || move[0] > 9 || move[1] < 0 || move[1] > 9) return false;
            if (this.board[move[0]][move[1]] === "hit"
                || this.board[move[0]][move[1]] === "miss") {
                return false;
            }
            return true; // valid if none of the above
        };

        const getAdjacents = (move) => { // creates 4 moves for every direction based on last hit
            const x = move[0];
            const y = move[1];
            const x1 = x - 1;
            const x2 = x + 1;
            const y1 = y - 1;
            const y2 = y + 1;
            return [[x, y1], [x, y2], [x1, y], [x2, y]];
        };

        if (this.lastHit.length !== 0) { // if last hit was success
            const lastCoordinate = this.lastHit; // store last hit
            this.lastHit = []; // and reset to none
            const adjacents = getAdjacents(lastCoordinate);
            adjacents.forEach((adjacent) => { // for each adjacent coordinate
                if (evaluateAdjacents(adjacent)) { // check validity
                    this.attackQueue.push(adjacent); // add to queue if valid
                }
            });
        }

        if (this.attackQueue.length !== 0) { // if queue is not empty
            const next = this.attackQueue.shift(); // get the first one from array
            return next; // and use it
        }

        const availableMove = evaluateMoves(); // if no last hit or queue is empty, attack randomly
        return availableMove;
    };

    placeShipsForAI = () => { // this is not the best way to handle place ships but works, might change it later
        const getRandomCoordinates = () => this.getAvailableMoves(); // gets random coordinates with another method
        const getRandomDirection = () => {
            const number = Math.floor(Math.random() * 2);
            return number === 1 ? "horizontal" : "vertical";
        };

        this.placeShips(getRandomCoordinates(), this.carrier, getRandomDirection());
        this.placeShips(getRandomCoordinates(), this.battleship, getRandomDirection());
        this.placeShips(getRandomCoordinates(), this.destroyer, getRandomDirection());
        this.placeShips(getRandomCoordinates(), this.submarine, getRandomDirection());
        this.placeShips(getRandomCoordinates(), this.patroller, getRandomDirection());

        const countableBoard = this.board.flat(1);
        const evaluatePlacedShips = () => {
            let countShips = 0;
            countableBoard.forEach((string) => {
                if (string === "carrier"
                    || string === "battleship"
                    || string === "destroyer"
                    || string === "submarine"
                    || string === "patroller") {
                    countShips++;
                }
            });
            return countShips;
        };
        if (evaluatePlacedShips() !== 17) { // required total legal ship part number is 17
            this.board = Array.from({ length: 10 }, () => Array(10).fill("water")); // resets board
            return this.placeShipsForAI(); // and try again
        }
        return true; // if valid
    };

    endGame = () => {
        const text = `${this.player}'s all ships are under water. GG`;
        let winner;
        if (this.player === "AI") {
            winner = "player";
        } else {
            winner = "AI";
        }
        DOM.endGame(text, winner);
    };
}

export { Gameboard };
