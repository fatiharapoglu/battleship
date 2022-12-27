import { Ship } from "./m-ship";

class Gameboard {
    constructor() {
        this.board = Array.from({ length: 10 }, () => Array(10).fill("water"));
        this.carrier = new Ship(5, "Carrier");
        this.battleship = new Ship(4, "Battleship");
        this.destroyer = new Ship(3, "Destroyer");
        this.submarine = new Ship(3, "Submarine");
        this.patroller = new Ship(2, "Patrol Boat");
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

    receiveAttack = (coordinates) => {
        if (this.board[coordinates] === "miss" || this.board[coordinates] === "hit") return;
        if (this.board[coordinates] === "water") {
            this.board[coordinates] = "miss";
        } else {
            const name = this.board[coordinates];
            this.board[coordinates] = "hit";
            const target = this.find((ship) => ship.name === name);
            target.hit();
            checkIsGame();
        }
    };

    checkIsGame = () => {
        if (this.some((ship) => ship.isSunk !== true)) return;
        Gameboard.endGame();
    };

    getAvailableMoves = () => {
        const randomMoves = () => {
            const randomRow = Math.random() * 10;
            const randomColumn = Math.random() * 10;
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

    static endGame = () => {
        console.log("'s all ships are under the water, GG");
    };
}

export { Gameboard };
