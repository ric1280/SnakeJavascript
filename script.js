var canvas = null;
var context = null;

const gridSize = 20; //20x20
var cellSize=0;
var gm = null;
const TIME_TO_ROTATE = 200;
const UPDATE_INTERVAL = 100;

function drawGrid() {
    context.strokeStyle = '#ccc'; // Light grey color for grid lines
    context.lineWidth = 0.5; // Thin lines

    // Draw vertical grid lines
    for (let x = 0; x <= gridSize; x += 1) {
        context.beginPath();
        context.moveTo(x*cellSize, 0);
        context.lineTo(x*cellSize, canvas.height);
        context.stroke();
    }

    // Draw horizontal grid lines
    for (let y = 0; y <= gridSize; y += 1) {
        context.beginPath();
        context.moveTo(0, y*cellSize);
        context.lineTo(canvas.width, y*cellSize);
        context.stroke();
    }
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    cellSize = canvas.width/gridSize; //canvas.width == canvas.height
    clearCanvas();
  
    if(gm!=null) gm.draw(context);
}


function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}







/*Models*/

State = {ONGOING:0, ENDED: 1};
class Position{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    //sums the cordinate x and y with the coordinate from other position
    sum(other_pos){
        const x = this.x + other_pos.x;
        const y = this.y + other_pos.y;
        return new Position(x,y);
    }

    eq(other_pos){
        return this.x==other_pos.x && this.y==other_pos.y;
    }
}
Directions = {LEFT: new Position(-1, 0), 
    RIGHT:new Position(1, 0), 
    UP: new Position(0, -1),
    DOWN: new Position(0, 1)};

const keyMap = {
    37: Directions.LEFT,   // Left arrow key
    38: Directions.UP,     // Up arrow key
    39: Directions.RIGHT,  // Right arrow key
    40: Directions.DOWN,   // Down arrow key
    65: Directions.LEFT,   // 'A' key
    87: Directions.UP,     // 'W' key
    68: Directions.RIGHT,  // 'D' key
    83: Directions.DOWN    // 'S' key
};


//One Snake is composed by multiple blocks linked in a chain
//each block is contains the reference to the next block
class Block{
    constructor(position){
        this.position = position;
        this.next = null;
    }

    draw(context){
        context.fillRect(this.position.x * cellSize, this.position.y * cellSize, cellSize, cellSize);
        if(this.next != null){
            this.next.draw(context);
        }
    }

    update(position){
        const old_position = this.position;
        this.position = position;
        if(this.next != null){
            this.next.update(old_position);
        }

    }
}

class Snake{
    constructor(position, direction){
        
        this.head = new Block(position);
        //instiate 2 more blocks for the body
        const body1 = new Block(new Position(position.x-1, position.y));
        const body2 = new Block(new Position(position.x-2, position.y));

        //link the body parts
        body1.next = body2;
        this.head.next = body1; 

        this.direction = direction;
        //the snake can only rotate 200ms in 200ms
        this.time_to_next_rotation = TIME_TO_ROTATE;
        this.current_time = 0;        
    }

    draw(context){
        context.fillStyle = 'green';
        this.head.draw(context);
    }

    boundaryCollision(position){
        if(position.x < 0){
            return new Position(gridSize-1, position.y);
        }else if(position.x >= gridSize){
            return new Position(0, position.y);
        }else if(position.y < 0){
            return new Position(position.x, gridSize-1);
        }else if(position.y >= gridSize){
            return new Position(position.x, 0);
        }
        return position;
    }

    update(){
        var pos = this.head.position.sum(this.direction);
        pos = this.boundaryCollision(pos);
        this.head.update(pos);
    }

    updateDirection(new_direction){
        //The snake cannot turn 180 degrees
        if( new_direction === undefined
           || (this.direction.eq(Directions.UP) && new_direction.eq(Directions.DOWN))
           || (this.direction.eq(Directions.LEFT) && new_direction.eq(Directions.RIGHT))
           || (this.direction.eq(Directions.RIGHT) && new_direction.eq(Directions.LEFT))
           || (this.direction.eq(Directions.DOWN) && new_direction.eq(Directions.UP)) ){
            return; //Fails the validation, returns and does nothing
        }

        //The validation has passed
        //update Direction to the new_Direction 
        this.direction = new_direction;
    }
}

class GameManager{

    init(){
        this.state = State.ONGOING;
        this.snake = new Snake(new Position(10,10), Directions.RIGHT );
        this.lastUpdateTime= performance.now();
        requestAnimationFrame(gameLoop);
    }

    draw(context){
        drawGrid();
        this.snake.draw(context);
    }

    update(){
        this.snake.update();
    }

    keyHandler(event){
        const newDirection = keyMap[event.keyCode];
        gm.snake.updateDirection(newDirection);
    }

    
}


function initializeGame() {
    canvas = document.getElementById('gameCanvas');
    context = canvas.getContext('2d');
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();  // Initial setup

    //init game
    gm = new GameManager();
    gm.init();
    gm.draw(context);
    document.addEventListener('keydown', gm.keyHandler.bind(gm));

    
}

function gameLoop(currentTime) {
    // Check if 1 second has passed since the last update
    if (currentTime - gm.lastUpdateTime >= UPDATE_INTERVAL) {
        gm.lastUpdateTime = currentTime;

        // Call the update function
        gm.update();

        // Redraw the game
        clearCanvas();
        gm.draw(context);
    }

    // Request the next frame
    requestAnimationFrame(gameLoop);
}


document.addEventListener('DOMContentLoaded', (event) => {
    initializeGame(); // Call your function to initialize the game
});

