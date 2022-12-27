import { Gameboard } from "./m-gameboard";

class Player {
    static turn = undefined;

    static computerPlays = (enemy) => {
        const coordinates = enemy.board.getAvailableMoves();
        enemy.board.recieveAttack(coordinates);
        Player.turn = enemy.name;
    };

    constructor(playerName) {
        this.name = playerName;
        this.board = new Gameboard();
    }

    attack = (enemy, coordinates) => {
        if (this.name === Player.turn) {
            enemy.board.recieveAttack(coordinates);
            Player.turn = "AI";
        } else {
            Player.computerPlays(enemy);
        }
    };
}
