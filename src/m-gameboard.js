import { Ship } from "./m-ship";

class Gameboard {
    constructor(playerName) {
        this.board = Array.from({ length: 10 }, () => Array(10).fill("water"));
        this.carrier = new Ship(5, "Carrier");
        this.battleship = new Ship(4, "Battleship");
        this.destroyer = new Ship(3, "Destroyer");
        this.submarine = new Ship(3, "Submarine");
        this.patroller = new Ship(2, "Patrol Boat");
        this.player = playerName;
    }

    placeShips = (coordinates, ship, direction) => {
        const placed = coordinates;
        const width = ship.length;
        const placeholder = ship.name;
        if (direction === "horizontal") {
            const row = placed[0];
            const columnStart = placed[1];
            this.board[row].fill(placeholder, columnStart, (columnStart + width));
        } else if (direction === "vertical") {
            const column = placed[0];
            const rowStart = placed[1];
            const mappedColumn = this.board.map((row) => row[column]).fill(placeholder, rowStart, (rowStart + width));
            let i = 0;
            this.board.forEach((row) => {
                row[column] = mappedColumn[i];
                i++;
            });
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
            this.checkIsGame();
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
                if (string === "Carrier"
                    || string === "Battleship"
                    || string === "Destroyer"
                    || string === "Submarine"
                    || string === "Patrol Boat") {
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
        console.log(`${this.player}'s all ships are under water. GG`);
    };
}

export { Gameboard };
