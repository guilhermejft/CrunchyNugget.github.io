//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width to height ratio = 408 x 228 (=17/12)
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight,
};

//pipes
let pipeArray = [];
//ratio = 1/8
let pipeWidth = 48;
let pipeHeight = 384;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;
let topPipeImg2;
let bottomPipeImg2;

//physics do jogo
let velocityX = -2; //velocidade dos pipes a andar para a esquerda (axis x)
let velocityY = 0; //velocidade de salto do nugget
let gravity = 0.4; // adiciona gravidade para o nugget descer

let gameOver = false;
let gameStarted = false; // New variable to track game start status
let score = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //chamar o 2d para poder desenhar

    //load images
    birdImg = new Image();
    birdImg.src = "flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    topPipeImg = new Image();
    topPipeImg.src = "toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "bottompipe.png";

    topPipeImg2 = new Image();
    topPipeImg2.src = "toppipe2.png";

    bottomPipeImg2 = new Image();
    bottomPipeImg2.src = "bottompipe2.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //1.5segundos
    //event listeners para "keydown" (any key) e toques no ecran (mobile)
    document.addEventListener("keydown", moveBird);
    board.addEventListener("touchstart", moveBird);
};

//criar função para atualizar os frames do canvas e redesenhalo (ou seja, o game loop)
function update() {
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

if (!gameStarted) {
    // Display introductory message
    context.fillStyle = "white";
    context.font = "30px sans-serif";
    context.textAlign = "center";

    const startMessage = "O Nugget\né demasiado delicioso!\nSalta para o salvar!";
    const lines = startMessage.split("\n");

    const lineHeight = 40; // Adjust this value to control line spacing

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const textY = 180 + i * lineHeight;
        context.fillText(line, boardWidth / 2, textY);
    }

    return;
}

    if (gameOver) {
        drawScoreAndGameOver();
        return;
    }

    //bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);

    if (bird.y + bird.height >= boardHeight) {
        gameOver = true;
    }

    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    //pipes
    if (!gameOver) {
        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5;
                pipe.passed = true;
            }

            if (detectCollision(bird, pipe)) {
                gameOver = true;
            }
        }
    }

    drawScoreInGame();

    while (pipeArray.length > 0 && pipeArray[0].x < -pipe.width) {
        pipeArray.shift();
    }

    drawScoreAndGameOver();
}

function drawScoreInGame() {
    context.fillStyle = "white";
    context.font = "30px sans-serif";
    context.textAlign = "left";
    context.fillText(score, 10, 30);
}

function drawScoreAndGameOver() {
    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.textAlign = "center";
    context.fillText(score, boardWidth / 2, 100);

    if (gameOver) {
        context.font = "30px sans-serif";
        context.fillText("Ups...", boardWidth / 2, 180);
        context.fillText("Salta para voltar a tentar!", boardWidth / 2, 220);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipeImage = Math.random() < 0.5 ? topPipeImg : topPipeImg2;
    let bottomPipeImage = Math.random() < 0.5 ? bottomPipeImg : bottomPipeImg2;

    let topPipe = {
        img: topPipeImage,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    };

    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImage,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    };
    
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (!gameStarted) {
        gameStarted = true;
        return;
    }

    if (e.touches) {
        velocityY = -6;
        e.preventDefault();
        if (gameOver) {
            resetGame();
        }
    } else {
        if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
            velocityY = -6;
            if (gameOver) {
                resetGame();
            }
        }
    }
}

function resetGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
