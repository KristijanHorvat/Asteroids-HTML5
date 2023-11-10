var player;
var asteroids = [];
var offsetWithoutscrollbars = 2;
var startTime;
var bestTime = localStorage.getItem('bestTime') || 0;
var gameStarted = false;

function startGame() {
    if (!gameStarted) {
        player = new component(30, 30, "red", (window.innerWidth - offsetWithoutscrollbars) / 2, (window.innerHeight - offsetWithoutscrollbars) / 2);
        myGameArea.start();
        startTime = Date.now();
        gameStarted = true;
        var startButton = document.querySelector('button');
        if (startButton) {
            startButton.style.display = 'none';
        }
    }
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.id = "myGameCanvas";
        this.canvas.width = (window.innerWidth - offsetWithoutscrollbars);
        this.canvas.height = (window.innerHeight - offsetWithoutscrollbars);
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);

        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = false;
        })
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speed_x = 0;
    this.speed_y = 0;

    this.update = function () {
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    this.newPos = function () {
        if (this.x > myGameArea.canvas.width) {
            this.x = 0 - this.width;
        } else if (this.x + this.width < 0) {
            this.x = myGameArea.canvas.width;
        }

        if (this.y > myGameArea.canvas.height) {
            this.y = 0 - this.height;
        } else if (this.y + this.height < 0) {
            this.y = myGameArea.canvas.height;
        }

        this.x += this.speed_x;
        this.y += this.speed_y;
    };
}
function spawnAsteroid() {
    var side = Math.floor(Math.random() * 4);
    var x, y;

    switch (side) {
        case 0:
            x = Math.random() * myGameArea.canvas.width;
            y = -20;
            break;
        case 1:
            x = myGameArea.canvas.width + 20;
            y = Math.random() * myGameArea.canvas.height;
            break;
        case 2:
            x = Math.random() * myGameArea.canvas.width;
            y = myGameArea.canvas.height + 20;
            break;
        case 3:
            x = -20;
            y = Math.random() * myGameArea.canvas.height;
            break;
    }

    var asteroid = new component(20, 20, "gray", x, y);

    asteroids.push(asteroid);
}

function centerAsteroid(asteroid) {
    asteroid.x += asteroid.speed_x;
    asteroid.y += asteroid.speed_y;

    if (
        asteroid.x + asteroid.width < 0 ||
        asteroid.x > myGameArea.canvas.width ||
        asteroid.y + asteroid.height < 0 ||
        asteroid.y > myGameArea.canvas.height
    ) {
        var spawnSide = Math.floor(Math.random() * 4);

        switch (spawnSide) {
            case 0:
                asteroid.x = Math.random() * myGameArea.canvas.width;
                asteroid.y = -20;
                break;
            case 1:
                asteroid.x = myGameArea.canvas.width;
                asteroid.y = Math.random() * myGameArea.canvas.height;
                break;
            case 2:
                asteroid.x = Math.random() * myGameArea.canvas.width;
                asteroid.y = myGameArea.canvas.height;
                break;
            case 3:
                asteroid.x = -20;
                asteroid.y = Math.random() * myGameArea.canvas.height;
                break;
        }

        var speedMagnitude = Math.random() * 4 + 1;
        var angle = Math.random() * 2 * Math.PI;
        asteroid.speed_x = speedMagnitude * Math.cos(angle);
        asteroid.speed_y = speedMagnitude * Math.sin(angle);
    }
}

var gameOver = false;

function updateGameArea() {
    if (!gameStarted || gameOver) {
        return;
    }

    myGameArea.clear();
    player.speed_x = 0;
    player.speed_y = 0;

    var elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    myGameArea.context.font = "20px Arial";
    myGameArea.context.fillStyle = "black";
    myGameArea.context.fillText("Time: " + elapsedTime + "s", myGameArea.canvas.width - 120, 30);

    if (myGameArea.keys && myGameArea.keys[37]) { player.speed_x = -2; }
    if (myGameArea.keys && myGameArea.keys[39]) { player.speed_x = 2; }
    if (myGameArea.keys && myGameArea.keys[38]) { player.speed_y = -2; }
    if (myGameArea.keys && myGameArea.keys[40]) { player.speed_y = 2; }

    player.newPos();
    player.update();

    if (Math.random() < 0.1) {
        spawnAsteroid();
    }

    for (var i = 0; i < asteroids.length; i++) {
        centerAsteroid(asteroids[i]);
        asteroids[i].update();

        if (collision(player, asteroids[i])) {
            gameOver = true;
        }
    }

    if (gameOver) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "red";
        ctx.fillText("Game Over", myGameArea.canvas.width / 2 - 80, myGameArea.canvas.height / 2);
        ctx.fillText("Press R to Restart", myGameArea.canvas.width / 2 - 120, myGameArea.canvas.height / 2 + 40);

        var elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        ctx.fillText("Time: " + elapsedTime + "s", myGameArea.canvas.width / 2 - 60, myGameArea.canvas.height / 2 + 80);

        if (elapsedTime > bestTime) {
            bestTime = elapsedTime;
            localStorage.setItem('bestTime', bestTime);
            ctx.fillText("New Best Time!", myGameArea.canvas.width / 2 - 100, myGameArea.canvas.height / 2 + 120);
        }

        ctx.fillText("Best Time: " + bestTime + "s", myGameArea.canvas.width / 2 - 90, myGameArea.canvas.height / 2 + 160);
    }
}

function collision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

window.addEventListener('keydown', function (e) {
    if (gameOver && e.key === 'r') {
        restartGame();
    }
});

// Function to restart the game
function restartGame() {
    player = new component(30, 30, "red", myGameArea.canvas.width / 2, myGameArea.canvas.height / 2);
    asteroids = [];
    gameOver = false;
    startTime = Date.now();
}