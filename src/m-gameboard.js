import { DOM } from "./m-DOM";
import { Ship } from "./m-ship";

class Gameboard {
    constructor(playerName) {
        this.board = Array.from({ length: 10 }, () => Array(10).fill("water"));
        this.carrier = new Ship(5, "carrier");
        this.battleship = new Ship(4, "battleship");
        this.destroyer = new Ship(3, "destroyer");
        this.submarine = new Ship(3, "submarine");
        this.patroller = new Ship(2, "patroller");
        this.player = playerName;
    }

    placeShips = (coordinates, ship, direction) => {
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
        if (this.board[coordinates[0]][coordinates[1]] === "miss" || this.board[coordinates[0]][coordinates[1]] === "hit") return;
        if (this.board[coordinates[0]][coordinates[1]] === "water") {
            this.board[coordinates[0]][coordinates[1]] = "miss";
        } else {
            const name = this.board[coordinates[0]][coordinates[1]];
            this.board[coordinates[0]][coordinates[1]] = "hit";
            const target = Object.keys(this).find((key) => this[key].name === name);
            this[target].hit();
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

    checkIsGame = () => {
        if (this.carrier.isSunk === true
            && this.battleship.isSunk === true
            && this.destroyer.isSunk === true
            && this.submarine.isSunk === true
            && this.patroller.isSunk === true) {
            this.endGame();
        }
    };

    getAvailableMoves = () => {
        const randomCoordinates = () => {
            const randomRow = Math.floor(Math.random() * 10);
            const randomColumn = Math.floor(Math.random() * 10);
            const coordinates = [randomRow, randomColumn];
            return coordinates;
        };

        const evaluateMoves = () => {
            const tryCoordinates = randomCoordinates();
            if (this.board[tryCoordinates[0]][tryCoordinates[1]] === "hit" || this.board[tryCoordinates[0]][tryCoordinates[1]] === "miss") {
                return evaluateMoves();
            }
            return tryCoordinates;
        };
        const availableMove = evaluateMoves();

        return availableMove;
    };

    placeShipsForAI = () => {
        const getRandomCoordinates = () => this.getAvailableMoves();
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
        return true;
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
