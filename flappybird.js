//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34;
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
let pipeWidth = 48;
let pipeHeight = 384;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;
let topPipeImg2;
let bottomPipeImg2;

//physics do jogo
let velocityX = -2;
let velocityY = 0;
let gravity = 0.3;

let gameOver = false;
let gameStarted = false;
let score = 0;

let initialInterval = 2500;
let intervalDecreaseRate = 10;
let pipesInterval;
let spawnInterval = initialInterval;

const backgroundMusic = new Audio("background_music.mp3");
backgroundMusic.loop = true;
backgroundMusic.controls = true;

//mais uma variável, desta vez para o .gif final! :D
//let winGif = document.getElementById("winGif");

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    topPipeImg = new Image();
    topPipeImg.src = "toppipe.svg";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "bottompipe.svg";

    topPipeImg2 = new Image();
    topPipeImg2.src = "toppipe2.svg";

    bottomPipeImg2 = new Image();
    bottomPipeImg2.src = "bottompipe2.svg";

    const soundButton = document.getElementById("soundButton");
    let isSoundOn = true;

    soundButton.addEventListener("click", toggleSound);

    function toggleSound() {
        console.log("Toggle sound called");

        if (isSoundOn) {
            backgroundMusic.play();
            soundButton.src = "sound.png";
        } else {
            backgroundMusic.pause();
            soundButton.src = "mute.png";
        }
        isSoundOn = !isSoundOn;
        console.log("Sound state toggled to:", isSoundOn);
    }

    const fireGif = document.getElementById("fireGif");

    pipesInterval = null;

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveBird);
    board.addEventListener("touchstart", startGame);
    board.addEventListener("touchstart", jump);
};

function startGame() {
    if (!gameStarted) {
      gameStarted = true;
      pipesInterval = setInterval(placePipes, initialInterval);
      playJumpSound();
      if (gameOver) {
        resetGame();
      }
    }
  }  

function update() {
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    if (!gameStarted) {
        context.fillStyle = "#345a31";
        context.font = "30px sans-serif";
        context.textAlign = "center";

        const startMessage = "O Nugget\né demasiado delicioso!\nSalta para o salvar!";
        const lines = startMessage.split("\n");

        const lineHeight = 40;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const textY = 180 + i * lineHeight;
            context.fillText(line, boardWidth / 2, textY);
        }

        return;
    }

    if (score >= 12) {
        gameOver = true;
        displayWinGif();
        return;
    }

    if (gameOver) {
        drawScoreAndGameOver();
        return;
    }

    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);

    if (bird.y + bird.height >= boardHeight) {
        gameOver = true;
    }

    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (!gameOver) {
        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5;
                pipe.passed = true;

                playScoreSound();

                playFireGifOnce();

                let updatedInterval = spawnInterval - score * intervalDecreaseRate;
                updatedInterval = Math.max(updatedInterval, 500);
                clearInterval(pipesInterval);
                pipesInterval = setInterval(placePipes, updatedInterval);
            }

            if (detectCollision(bird, pipe)) {
                gameOver = true;
                playGameOverSound();
            }
        }
    }

    drawScoreInGame();

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeArray[0].width) {
        pipeArray.shift();
    }

    //drawScoreAndGameOver();
}

function drawScoreInGame() {
    context.fillStyle = "#345a31";
    context.font = "30px sans-serif";
    context.textAlign = "left";
    context.fillText(score, 40, 30);
}

function playFireGifOnce() {
    fireGif.classList.remove("hidden");
    setTimeout(function () {
        fireGif.classList.add("hidden");
    }, 1000);
}

function playJumpSound() {
    const jumpSound = document.getElementById("jumpSound");
    jumpSound.play();
}

function playScoreSound() {
    const scoreSound = document.getElementById("scoreSound");
    scoreSound.play();
}

function playGameOverSound() {
    const gameOverSound = document.getElementById("gameOverSound");
    gameOverSound.play();
}


function jump() {
    if (!gameStarted) {
        startGame();
        return;
    }

    velocityY = -6;
    playJumpSound();

    if (gameOver) {
        resetGame();
    }
}

function drawScoreAndGameOver() {
    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    context.fillStyle = "#345a31";
    context.font = "45px sans-serif";
    context.textAlign = "center";
    context.fillText(score, boardWidth / 2, 100);

    if (gameOver) {
        backgroundMusic.pause();
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

    spawnInterval -= intervalDecreaseRate;
    spawnInterval = Math.max(spawnInterval, 500);
    clearInterval(pipesInterval);
    pipesInterval = setInterval(placePipes, spawnInterval);
}

function moveBird(e) {
    if (!gameStarted) {
        startGame(); // Call startGame function if not yet started
        return;
    }

    if (e.touches) {
        velocityY = -6;
        playJumpSound();
        e.preventDefault();
        if (gameOver) {
            resetGame();
        }

    } else {
        if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
            velocityY = -6;
            playJumpSound();
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
    clearInterval(pipesInterval);
    pipesInterval = setInterval(placePipes, initialInterval);

    if (isSoundOn) {
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
