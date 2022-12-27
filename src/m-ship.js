class Ship {
    constructor(length, name) {
        this.name = name;
        this.length = length;
        this.isSunk = false;
        this.HP = length;
    }

    hit = () => {
        this.HP -= 1;
        if (this.HP === 0) {
            this.isSunk = true;
        }
    };
}

export { Ship };
