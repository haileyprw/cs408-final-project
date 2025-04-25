const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Generates random color
function randomRGB() {
    return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

// Snake properties
const snake = {
    segments: [{ x: 0, y: 0 }], // list of body circles, head is at 0
    segmentRadius: 20,
    length: 20,
    speed: 4,
};

const mapSize = 5000; // total map width and height

// Track mouse location 
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let targetAngle = 0; // angle from snake head (center of screen) to the mouse at any given time

// Energy dots
const dots = [];
const numDots = 300;
const dotRadius = 5;

// Randomly generate energy dots within the map size
for (let i = 0; i < numDots; i++) {
    dots.push({
        x: Math.random() * mapSize - mapSize / 2,
        y: Math.random() * mapSize - mapSize / 2,
        eaten: false,
    });
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

    // Remove last circle to keep snake the same length
    while (snake.segments.length > snake.length) {
        snake.segments.pop();
    }

    // See if snake got a snack (ate a dot)
    dots.forEach((dot) => {
        // if a dot has not been eaten, check distance of dot from snake head
        if (!dot.eaten) {
            const xdistance = dot.x - newHead.x;
            const ydistance = dot.y - newHead.y;
            const distance = Math.sqrt((xdistance * xdistance) + (ydistance * ydistance)); // ahh more trig
    
            // if the head is close enough to a dot, snake eats it
            if (distance < snake.segmentRadius + dotRadius) {
                dot.eaten = true;
                snake.length += 5; // Grow the snake by 5 segments
            }
          }
    });
}

function draw() {
    // clear whatever was already on canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const head = snake.segments[0];

    // Shift screen to give illusion of the snake traveling around
    const offsetX = canvas.width / 2 - head.x;
    const offsetY = canvas.height / 2 - head.y;

    // Draw dots
    dots.forEach((dot) => {
        if (!dot.eaten) {
            ctx.beginPath();
            ctx.arc(dot.x + offsetX, dot.y + offsetY, dotRadius, 0, Math.PI * 2); // offset by head position
            ctx.fillStyle = '#00ffcc';
            ctx.fill();
        }
    });

    // draw snake segments
    for (let i = snake.segments.length - 1; i >= 0; i--) { // decrement so that the head circle lays on top for visible eyes
        const seg = snake.segments[i];
        ctx.beginPath();
        ctx.arc(seg.x + offsetX, seg.y + offsetY, snake.segmentRadius, 0, Math.PI * 2);

        // rainbow gradient default
        ctx.fillStyle = `hsl(${(i / snake.length) * 360}, 100%, 50%)`;
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