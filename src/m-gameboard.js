import { Ship } from "./m-ship";

class Gameboard {
    constructor() {
        this.board = Array.from({ length: 10 }, () => Array(10).fill(null));
        this.carrier = new Ship(5);
        this.battleship = new Ship(4);
        this.destroyer = new Ship(3);
        this.submarine = new Ship(3);
        this.patroller = new Ship(2);
    }

    placeShips = (ship) => {

    };

    receiveAttack = (coordinates) => {

    };
}
