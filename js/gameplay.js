const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Snake properties
const snake = {
    segments: [{ x: 0, y: 0 }], // list of body circles, head is at 0
    segmentRadius: 20,
    length: 20,
    speed: 5
};

// Circular map
const map = {
    centerX: 0,
    centerY: 0,
    radius: 3000 // adjust for testing purposes (3000 for real game)
}

// Track mouse location 
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let targetAngle = 0; // angle from snake head (center of screen) to the mouse at any given time

// Energy dots
const dots = [];
const numDots = 300;
const dotRadius = 5;

// Obstacle dots
const obstacles = [];
const numObstacles = 100;
const obstacleRadius = 25;

let currentScore = 20;

// Update leaderboard positioning
document.addEventListener("DOMContentLoaded", function () {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://j42aj6904i.execute-api.us-east-2.amazonaws.com/nicknames");
    xhr.onreadystatechange = function () {
        if (xhr.status === 200) {
            const players = JSON.parse(xhr.responseText);
            players.sort((a, b) => b.score - a.score);
            const top10 = players.slice(0, 10);

            const list = document.getElementById("leaderboard-list");
            list.innerHTML = "";

            top10.forEach((player, index) => {
                const row = document.createElement("li");
                row.innerHTML = `
                    <span class="rank">#${index + 1}</span>
                    <span class="name">${player.username}</span>
                    <span class="score">${player.score}</span>
                `;
                list.appendChild(row);
            });
        }
    };
    xhr.send();   
});

// Helper function to generate energy dots
function generateDot() {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.sqrt(Math.random()) * (map.radius - dotRadius);
    const x = map.centerX + radius * Math.cos(angle);
    const y = map.centerY + radius * Math.sin(angle);
    
    return {
        x,
        y,
        eaten: false,
    };
}

// Helper function to generate obstacle dots
function generateObstacle() {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.sqrt(Math.random()) * (map.radius - obstacleRadius);
    const x = map.centerX + radius * Math.cos(angle);
    const y = map.centerY + radius * Math.sin(angle);

    // Give it a random velocity (slow)
    const speed = 1 + Math.random() * 1.5;
    const direction = Math.random() * 2 * Math.PI;
    const vx = Math.cos(direction) * speed;
    const vy = Math.sin(direction) * speed;

    return { x, y, vx, vy };
}

// game over
function gameOver(score) {

    let id = localStorage.getItem('playerId'); // Retrieve id
    let nickname = localStorage.getItem('user'); // Retrieve name
    let colorSetting = localStorage.getItem('snakeColor'); // Retrieve color

    const data = {
        username: nickname,
        id: id,
        color: colorSetting,
        score: score,
      };

    let xhr = new XMLHttpRequest();
    xhr.open("PUT", "https://j42aj6904i.execute-api.us-east-2.amazonaws.com/nicknames");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.status === 200) {
            window.location.href = "./end-game.html";
        }
    };
  
    xhr.send(JSON.stringify(data));
}

// Generate initial obstacles
for (let i = 0; i < numObstacles; i++) {
    obstacles.push(generateObstacle());
}

// track the mouse
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Ran every frame of the loop to update the location of the snake, energy dots, etc.
function update() {
    const head = snake.segments[0];

    // Calculate angle from center to mouse location
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    targetAngle = Math.atan2((mouse.y - centerY), (mouse.x - centerX)); // Oh god I haven't done trig in so long (brain = explode)

    // Add a new head position in the direction of the mouse
    const newHead = {
        x: head.x + Math.cos(targetAngle) * snake.speed,
        y: head.y + Math.sin(targetAngle) * snake.speed,
    };
    snake.segments.unshift(newHead); // puts the new head at the beginning of the array

    // Check if the new head is outside the circular map boundary
    const dx = newHead.x - map.centerX;
    const dy = newHead.y - map.centerY;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

    if (distanceFromCenter > map.radius - snake.segmentRadius) {
        // collision
        currentScore = snake.length;
        gameOver(currentScore);
        return;
    }

    // Remove last circle to keep snake the same length
    while (snake.segments.length > snake.length) {
        snake.segments.pop();
    }

    // See if snake got a snack (ate a dot)
    dots.forEach((dot) => {
        // if a dot has not been eaten, check distance of dot from snake head
        if (!dot.eaten) {
            const dx = dot.x - newHead.x;
            const dy = dot.y - newHead.y;
            const distance = Math.sqrt((dx * dx) + (dy * dy)); // ahh more trig
    
            // if the head is close enough to a dot, snake eats it
            if (distance < snake.segmentRadius + dotRadius) {
                dot.eaten = true;
                snake.length += 5; // Grow the snake by 5 segments
            }
          }
    });

    // update obstacles each frame 
    obstacles.forEach((obj) => {
        obj.x += obj.vx;
        obj.y += obj.vy;
    
        // bounce off the map wall
        const dx = obj.x - map.centerX;
        const dy = obj.y - map.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance > map.radius - obstacleRadius) {
            const angle = Math.atan2(dy, dx);
            obj.vx = -Math.cos(angle) * Math.abs(obj.vx);
            obj.vy = -Math.sin(angle) * Math.abs(obj.vy);
        }
    });

    // Check for collision
    for (let ob of obstacles) {
        const dx = ob.x - snake.segments[0].x;
        const dy = ob.y - snake.segments[0].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance < snake.segmentRadius + obstacleRadius) {
            // collision
            currentScore = snake.length;
            gameOver(currentScore);
            return;
        }
    }

    // Ensure more dots populate after they are eaten 
    const visibleDots = dots.filter(dot => !dot.eaten);
    const desiredDots = 500;

    if (visibleDots.length < desiredDots) {
        const numToAdd = desiredDots - visibleDots.length;
        for (let i = 0; i < numToAdd; i++) {
            dots.push(generateDot());
        }
    }

    // update score
    currentScore = snake.length;
    document.getElementById('length-text').innerText = `Your length: ${currentScore}`;
}

function draw() {
    // clear whatever was already on canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const head = snake.segments[0];

    // Shift screen to give illusion of the snake traveling around
    const offsetX = canvas.width / 2 - head.x;
    const offsetY = canvas.height / 2 - head.y;

    // draw map boundary
    ctx.beginPath();
    ctx.arc(map.centerX + offsetX, map.centerY + offsetY, map.radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Draw dots
    dots.forEach((dot) => {
        if (!dot.eaten) {
            ctx.beginPath();
            ctx.arc(dot.x + offsetX, dot.y + offsetY, dotRadius, 0, Math.PI * 2); // offset by head position
            ctx.fillStyle = '#00ffcc';
            ctx.fill();
        }
    });

    // Draw obstacles
    obstacles.forEach((ob) => {
        ctx.beginPath();
        ctx.arc(ob.x + offsetX, ob.y + offsetY, obstacleRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff5555';
        ctx.fill();
    });

    // draw snake segments
    for (let i = snake.segments.length - 1; i >= 0; i--) { // decrement so that the head circle lays on top for visible eyes
        const seg = snake.segments[i];
        ctx.beginPath();
        ctx.arc(seg.x + offsetX, seg.y + offsetY, snake.segmentRadius, 0, Math.PI * 2);

        // color selection
        const colorSetting = localStorage.getItem('snakeColor');
        if (colorSetting === 'rainbow') {
            ctx.fillStyle = `hsl(${(i / snake.length) * 360}, 100%, 50%)`;
        } else {
            ctx.fillStyle = colorSetting;
        }
        ctx.fill();
    }

    // ********************TODO***********************
    // draw some eyes on the snake
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop); // next frame
}

loop(); // start game