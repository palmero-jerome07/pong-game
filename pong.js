const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 12, paddleHeight = 80, ballSize = 16;
const player = {
    x: 0,
    y: canvas.height/2 - paddleHeight/2,
    w: paddleWidth,
    h: paddleHeight,
    color: '#0ff'
};
const ai = {
    x: canvas.width - paddleWidth,
    y: canvas.height/2 - paddleHeight/2,
    w: paddleWidth,
    h: paddleHeight,
    color: '#f0f'
};
const ball = {
    x: canvas.width/2 - ballSize/2,
    y: canvas.height/2 - ballSize/2,
    size: ballSize,
    speed: 5,
    dx: 5 * (Math.random() > 0.5 ? 1 : -1),
    dy: 4 * (Math.random() > 0.5 ? 1 : -1),
    color: '#fff'
};

// Draw functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}
function drawBall(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

// Draw net
function drawNet() {
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 4;
    for (let y = 0; y < canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, y);
        ctx.lineTo(canvas.width/2, y+20);
        ctx.stroke();
    }
}

// Render everything
function render() {
    // Background
    drawRect(0, 0, canvas.width, canvas.height, '#222');
    drawNet();

    // Paddles
    drawRect(player.x, player.y, player.w, player.h, player.color);
    drawRect(ai.x, ai.y, ai.w, ai.h, ai.color);

    // Ball
    drawBall(ball.x, ball.y, ball.size, ball.color);
}

// Game logic
function resetBall() {
    ball.x = canvas.width/2 - ball.size/2;
    ball.y = canvas.height/2 - ball.size/2;
    ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = (Math.random() * 8 - 4);
}

function update() {
    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top/bottom wall collision
    if (ball.y <= 0) {
        ball.y = 0;
        ball.dy *= -1;
    }
    if (ball.y + ball.size >= canvas.height) {
        ball.y = canvas.height - ball.size;
        ball.dy *= -1;
    }

    // Player paddle collision
    if (
        ball.x <= player.x + player.w &&
        ball.x >= player.x &&
        ball.y + ball.size >= player.y &&
        ball.y <= player.y + player.h
    ) {
        ball.x = player.x + player.w;
        ball.dx *= -1;
        // Add variation
        let collidePoint = (ball.y + ball.size/2) - (player.y + player.h/2);
        collidePoint = collidePoint / (player.h/2);
        let angleRad = collidePoint * (Math.PI/4);
        let direction = ball.dx > 0 ? 1 : -1;
        ball.dx = direction * ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);
    }

    // AI paddle collision
    if (
        ball.x + ball.size >= ai.x &&
        ball.x + ball.size <= ai.x + ai.w &&
        ball.y + ball.size >= ai.y &&
        ball.y <= ai.y + ai.h
    ) {
        ball.x = ai.x - ball.size;
        ball.dx *= -1;
        // Add variation
        let collidePoint = (ball.y + ball.size/2) - (ai.y + ai.h/2);
        collidePoint = collidePoint / (ai.h/2);
        let angleRad = collidePoint * (Math.PI/4);
        let direction = ball.dx > 0 ? 1 : -1;
        ball.dx = direction * ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);
    }

    // Score (left or right wall)
    if (ball.x < 0 || ball.x + ball.size > canvas.width) {
        resetBall();
    }

    // AI movement (basic tracking)
    let aiCenter = ai.y + ai.h / 2;
    let ballCenter = ball.y + ball.size / 2;
    if (aiCenter < ballCenter - 20) {
        ai.y += 4;
    } else if (aiCenter > ballCenter + 20) {
        ai.y -= 4;
    }
    // Clamp AI paddle
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.h > canvas.height) ai.y = canvas.height - ai.h;
}

// Player paddle follows mouse Y
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    player.y = mouseY - player.h/2;
    // Clamp
    if (player.y < 0) player.y = 0;
    if (player.y + player.h > canvas.height) player.y = canvas.height - player.h;
});

// Main loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start game
resetBall();
gameLoop();