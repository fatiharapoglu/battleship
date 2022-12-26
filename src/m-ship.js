class Ship {
    constructor(length) {
        this.length = length;
        this.isDead = false;
        this.HP = length;
    }

    hit = () => {
        this.HP -= 1;
        if (this.HP === 0) {
            this.isDead = true;
        }
    };
}

export { Ship };
