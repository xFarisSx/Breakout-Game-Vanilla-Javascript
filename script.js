const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const rules = document.getElementById("rules");

const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

const randomRange = function (min, max) {
    return Math.round(Math.random() * (max - min) + min);
};

// console.log(randomRange(10, 20));

class App {
    static #Obstacles = [];
    static #Ball;
    static #Paddle;
    static #score;
    static state = {
        Obstacles: this.#Obstacles,
        Ball: this.#Ball,
        Paddle: this.#Paddle,
        score: this.#score,
        dt: undefined,
        won: false,
        lose: false,
    };
    constructor() {
        this.run();
    }

    draw(obj, circle, rect, color) {
        ctx.fillStyle = color;

        rect ? ctx.fillRect(obj.x, obj.y, obj.width, obj.height) : "";
        if (circle) {
            ctx.beginPath();
            ctx.strokeStyle = color;

            ctx.arc(obj.x, obj.y, obj.r, 0, 2 * Math.PI);
            ctx.fill();
            // ctx.stroke();
        }
    }

    makeO() {
        for (let y = 0; y <= canvas.clientHeight - 450; y += 68) {
            for (let x = 0; x <= canvas.clientWidth - 100; x += 100) {
                let obstacle = new Obstacle(x + 10, y + 17, 80, 34);
                App.state.Obstacles.push(obstacle);
            }
        }
    }

    makeP() {
        App.state.Paddle = new Paddle(canvas.clientWidth / 2, 550, 150, 30);
    }
    makeB() {
        App.state.Ball = new Ball(canvas.clientWidth / 2, 450, 15);
        App.state.Ball = new Ball(
            canvas.clientWidth / 2,
            canvas.clientHeight / 2,
            15
        );
    }

    winGame() {
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.fillStyle = "blue";
        ctx.font = "bold 50px Arial";
        this.createBtn();
        this.reset();
    }
    loseGame() {
        this.reset();
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        this.createBtn();
    }

    createBtn() {
        this.btn = document.createElement("button");
        this.btn.textContent = "Restart";
        this.btn.classList.add("btn");
        this.btn.classList.add("btn-pos");
        document.body.appendChild(this.btn);
        this.btn.addEventListener("click", this.restart.bind(this));
    }

    reset() {
        App.state.Obstacles = [];
        App.state.Ball = undefined;
        App.state.Paddle = undefined;
        App.state.lose = false;
        App.state.won = false;
    }

    restart() {
        this.btn.remove();
        this.reset();
        if (!App.state.Ball) {
            this.makeB();
            this.makeO();
            this.makeP();
        }
        this.time1 = new Date().getTime();
        this.mainGameLoop = setInterval(() => {
            this.mainGame();
        }, 16.66);
    }

    mainGame() {
        this.time2 = new Date().getTime();
        App.state.dt = (this.time2 - this.time1) / 1000;
        this.time1 = new Date().getTime();
        if (App.state.lose) {
            this.loseGame();
            return clearInterval(this.mainGameLoop);
        }
        App.state.Obstacles.some((o) => o !== undefined)
            ? (App.state.won = false)
            : (App.state.won = true);
        if (App.state.won) {
            this.winGame();
            return clearInterval(this.mainGameLoop);
        }
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        App.state.Obstacles?.forEach((o) => {
            if (!o) return;
            this.draw(o, false, true, "#0095dd");
            o.update();
        });
        App.state.Paddle
            ? this.draw(App.state.Paddle, false, true, "#0095dd")
            : this.makeP();
        App.state.Paddle.update();
        this.draw(App.state.Ball, true, false, "#0095dd");
        //
        App.state.Ball.update();
    }

    run() {
        if (!App.state.Ball) {
            this.makeB();
            this.makeO();
            this.makeP();
        }
        this.time1 = new Date().getTime();
        this.mainGameLoop = setInterval(() => {
            this.mainGame();
        }, 16.66);
    }
}
class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    checkBallDirection() {
        if (
            (App.state.Ball.x + App.state.Ball.r <= this.x - 1 &&
                App.state.Ball.direction[0] == 1) ||
            (App.state.Ball.x - App.state.Ball.r >= this.x + this.width + 1 &&
                App.state.Ball.direction[0] == -1)
        ) {
            this.colD = "horizontal";
        }
        if (
            (App.state.Ball.y + App.state.Ball.r <= this.y - 1 &&
                App.state.Ball.direction[1] == 1) ||
            (App.state.Ball.y - App.state.Ball.r >= this.y + this.height + 1 &&
                App.state.Ball.direction[1] == -1)
        ) {
            this.colD = "vertical";
        }
    }

    checkCollision() {
        this.checkBallDirection();

        if (
            (App.state.Ball.y - App.state.Ball.r <= this.y + this.height &&
                App.state.Ball.y - App.state.Ball.r >= this.y) ||
            (App.state.Ball.y + App.state.Ball.r <= this.y + this.height &&
                App.state.Ball.y + App.state.Ball.r >= this.y)
        ) {
            if (
                (App.state.Ball.x + App.state.Ball.r <= this.x + this.width &&
                    App.state.Ball.x + App.state.Ball.r >= this.x) ||
                (App.state.Ball.x - App.state.Ball.r <= this.x + this.width &&
                    App.state.Ball.x - App.state.Ball.r >= this.x)
            ) {
                if (this.colD == "vertical") {
                    App.state.Ball.y = App.state.Ball.prevPos[1];
                    App.state.Ball.direction[1] *= -1;
                }
                if (this.colD == "horizontal") {
                    App.state.Ball.x = App.state.Ball.prevPos[0];
                    App.state.Ball.direction[0] *= -1;
                }
                App.state.Obstacles[this.id] = undefined;
                App.state.score++;
            }
        }
    }

    update() {
        this.id = App.state.Obstacles.findIndex((o) => o == this);
        this.checkCollision();
    }
}
class Paddle {
    constructor(x, y, width, height) {
        this.width = width;
        this.height = height;
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.speed = 450;
        this.k = 0.4;
        window.addEventListener(
            "keydown",
            function (e) {
                // console.log(e);
                e.preventDefault();
                if (e.key === "ArrowRight") this.right = true;
                if (e.key === "ArrowLeft") this.left = true;
            }.bind(this)
        );
        window.addEventListener(
            "keyup",
            function (e) {
                // console.log(e);
                e.preventDefault();
                if (e.key === "ArrowRight") this.right = false;
                if (e.key === "ArrowLeft") this.left = false;
            }.bind(this)
        );
    }

    move() {
        this.right && this.x + this.width < canvas.clientWidth
            ? (this.x += this.speed * App.state.dt)
            : "";
        this.left && this.x > 0 ? (this.x -= this.speed * App.state.dt) : "";
    }

    update() {
        this.move();
    }
}

class Ball {
    constructor(x, y, r) {
        this.r = r;
        this.x = x;
        this.y = y;
        this.speedx = 200;
        this.speedy = 390;
        // this.ax = 50;
        this.a = 280;
        this.direction = [1, 1];
        this.prevPos = [this.x, this.y];
        this.colD = "vertical";
        this.collision = false;
        this.dtColl = 1;
        this.time1 = new Date().getTime();
    }

    colDirection(Obj) {
        if (
            (this.x + this.r <= App.state["Paddle"].x - 1 &&
                this.direction[0] == 1) ||
            (this.x - this.r >=
                App.state["Paddle"].x + App.state["Paddle"].width + 1 &&
                this.direction[0] == -1)
        ) {
            this.colD = "horizontal";
        }
        if (
            (this.y + this.r <= App.state["Paddle"].y - 1 &&
                this.direction[1] == 1) ||
            (this.y - this.r >=
                App.state["Paddle"].y + App.state["Paddle"].height + 1 &&
                this.direction[1] == -1)
        ) {
            this.colD = "vertical";
        }
    }

    checkCollisionPaddle() {
        this.colDirection("Paddle");
        if (this.y + this.r <= App.state.Paddle.y + App.state.Paddle.height) {
            if (this.y + this.r >= App.state.Paddle.y) {
                if (this.x + this.r >= App.state.Paddle.x) {
                    if (
                        this.x + this.r <=
                        App.state.Paddle.x + App.state.Paddle.width
                    ) {
                        this.time2 = new Date().getTime();
                        this.dtColl = (this.time2 - this.time1) / 1000;
                        if (this.colD === "vertical") {
                            this.y -= 2;
                            this.direction[1] *= -1;
                            console.log("v");
                        }
                        if (this.colD === "horizontal") {
                            this.x -= 2;
                            this.direction[0] *= -1;
                            console.log("h");
                        }
                        this.time1 = new Date().getTime();
                        console.log(1);
                        this.collision = true;
                        return this.collision;
                    } else {
                        this.collision = false;
                    }
                } else {
                    this.collision = false;
                }
            } else {
                this.collision = false;
            }
        } else {
            this.collision = false;
        }
        if (this.y - this.r <= App.state.Paddle.y + App.state.Paddle.height) {
            if (this.y - this.r >= App.state.Paddle.y) {
                if (this.x - this.r >= App.state.Paddle.x) {
                    if (
                        this.x - this.r <=
                        App.state.Paddle.x + App.state.Paddle.width
                    ) {
                        this.time2 = new Date().getTime();
                        this.dtColl = (this.time2 - this.time1) / 1000;
                        if (this.colD === "vertical") {
                            this.direction[1] *= -1;
                            console.log("v");
                        }
                        if (this.colD === "horizontal") {
                            this.direction[0] *= -1;
                            console.log("h");
                        }
                        this.time1 = new Date().getTime();
                        console.log(1);
                        this.collision = true;
                        return this.collision;
                    } else {
                        this.collision = false;
                    }
                } else {
                    this.collision = false;
                }
            } else {
                this.collision = false;
            }
        } else {
            this.collision = false;
        }
    }

    move() {
        this.checkCollisionPaddle();
        if (this.y + this.r >= canvas.clientHeight) {
            App.state.lose = true;
        }
        if (this.x + this.r >= canvas.clientWidth || this.x - this.r <= 0) {
            this.x =
                this.x + this.r >= canvas.clientWidth
                    ? this.prevPos[0] - 3
                    : this.prevPos[0] + 3;
            this.direction[0] *= -1;
        }
        if (App.state.Paddle.right && this.direction[0] > 0 && this.collision) {
            this.speedx += App.state.Paddle.k * this.a * this.dtColl;
        }
        if (App.state.Paddle.right && this.direction[0] < 0 && this.collision) {
            this.speedx -= App.state.Paddle.k * this.a * this.dtColl;
        }
        if (App.state.Paddle.left && this.direction[0] > 0 && this.collision) {
            this.speedx -= App.state.Paddle.k * this.a * this.dtColl;
        }
        if (App.state.Paddle.left && this.direction[0] < 0 && this.collision) {
            this.speedx += App.state.Paddle.k * this.a * this.dtColl;
        }
        console.log(this.dtColl);
        console.log(this.speedx);

        this.x += this.direction[0] * this.speedx * App.state.dt;

        if (this.y - this.r <= 0) {
            this.y =
                this.y + this.r >= canvas.clientHeight
                    ? this.prevPos[1] - 3
                    : this.prevPos[1] + 3;
            this.direction[1] = this.direction[1] * -1;
        }
        if (this.direction[1] > 0) {
            // this.speedy = 200;
            this.speedy += this.a * App.state.dt;
        } else {
            if (this.speedy <= 0) {
                this.direction[1] *= -1;
                this.speedy += this.a * App.state.dt;
                return "";
            }
            this.speedy -= this.a * App.state.dt;
        }
        // console.log(this.speedy);
        this.y += this.direction[1] * this.speedy * App.state.dt;
        this.prevPos = [this.x, this.y];
    }

    update() {
        this.move();
    }
}

const app = new App();
canvas.addEventListener("click", (e) => {
    console.log(e.offsetY);
});
