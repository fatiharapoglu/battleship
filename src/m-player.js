import { Gameboard } from "./m-gameboard";

class Player {
    static computerAttacks = (enemy) => {
        const coordinates = enemy.board.getAvailableMoves();
        enemy.board.recieveAttack(coordinates);
    };

    static playerAttacks = (enemy, coordinates) => {
        enemy.board.recieveAttack(coordinates);
    };

    constructor(playerName) {
        this.name = playerName;
        this.board = new Gameboard();
    }
}

export { Player };
