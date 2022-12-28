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
        const randomMoves = () => {
            const randomRow = Math.floor(Math.random() * 10);
            const randomColumn = Math.floor(Math.random() * 10);
            const randomCoordinates = [randomRow, randomColumn];
            return randomCoordinates;
        };

        const evaluateMoves = () => {
            const tryCoordinates = randomMoves();
            if (this.board[tryCoordinates[0]][tryCoordinates[1]] === "hit" || this.board[tryCoordinates[0]][tryCoordinates[1]] === "miss") {
                return evaluateMoves();
            }
            return tryCoordinates;
        };
        const availableMove = evaluateMoves();

        return availableMove;
    };

    endGame = () => {
        console.log(`${this.player}'s all ships are under water. GG`);
    };
}

export { Gameboard };
