
// These math helper functions could be moved 
// From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
  }

 function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.random() * (max - min) + min; // The maximum is exclusive and the minimum is inclusive
}

var Entity = function(pathOfSprite) {
    // The image/sprite for our entity, this uses
    // a helper to easily load images
    this.sprite = pathOfSprite;
    this.x; // Entity's current x-coordinate in the grid
    this.y; // Entity's current y-coordinate in the grid
    this.width = 101;
    this.height = 83;   
}

Entity.prototype.getTrueX = function() {
    return this.x * this.width;
}

Entity.prototype.getTrueY = function() {
    return this.y * this.height - 41.5;
}

// Update the entity's position, required method for game
// Parameter: dt, a time delta between ticks for smooth animation
// and establishing a uniform frame-rate across different devices
Entity.prototype.update = function(dt) {

}

// Draw the entitiy on the screen, required method for game
Entity.prototype.render = function() {
    // The dimensions of each part of the game board are 101 x 171px
    // The actual playable area is 101 x 83px because the 2D art is faking a 3D game-board
    // The middle of the playable area is 83/2 or 41.5px
    // To make grid coordinates simple x is multiplied by the actual playable area's width
    // and y is multiplied by the actual playable area's height before rendering
    // To make entities look like they are in the middle of the playable area
    // the y coordinate is also shifted upwards 41.5 px
    ctx.drawImage(Resources.get(this.sprite), this.getTrueX(), this.getTrueY());
}

// Enemies our player must avoid
var Enemy = function() {
    //[1, 76, 97, 66]
    Entity.call(this, 'images/enemy-bug.png');
    this.movementSpeed; // The x-speed of the enemy
    this.flaggedForRespawn; // Has the enemy travelled off screen right
}

Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

// Static factory function to create enemies
Enemy.makeEnemy = function(numberOfEnemiesToInitiate = 1) {
    const arrayOfEnemies = [];

    while(numberOfEnemiesToInitiate != 0) {
        let enemyToAdd = new Enemy();

        enemyToAdd.respawn();
        arrayOfEnemies.push(enemyToAdd);

        numberOfEnemiesToInitiate--;
    }

    return arrayOfEnemies;
}

 // Sets the movement speed of an enemy based on a set of lower and upper bounds for possible speeds
Enemy.prototype.setMovementSpeed = function() {
    const movementSpeedBounds = [1, 3.75]; // [Lower (inclusive), Upper (exclusive))
    this.movementSpeed = getRandom(movementSpeedBounds[0], movementSpeedBounds[1]);
}

Enemy.prototype.setStartingPosition = function() {
      // Valid starting positions for an enemy
        // Each [x,y] coordingate cooresponds to a paved row, 
        // with the x position being one block's width to the left of the leftmost side of the screen
        const validEnemyStartingYCoordinates = [1, 2, 3];

        let row = getRandomInt(0, 3); // Choose 0,1, or 2
        this.x = -1;
        this.y = validEnemyStartingYCoordinates[row];
}

Enemy.prototype.checkIfTimeToRespawn = function() {
    if(this.x >= 6) {
        this.flaggedForRespawn = true;
    }
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // Movement is multiplied by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    if(this.flaggedForRespawn) {
        // Enemy is off-screen, respawn in new starting location
        this.respawn();
    }
    else {
        // Since enemies only move right to left we only need to update their x-position
    this.x += this.movementSpeed * dt;

        this.checkIfTimeToRespawn();
    }
}

// Set's a new starting position for the enemy
Enemy.prototype.respawn = function() {
    this.setMovementSpeed();
    this.setStartingPosition();
    this.flaggedForRespawn = false;
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    // [18, 62, 66, 83]
    Entity.call(this, 'images/char-boy.png');
    this.flaggedForRespawn;
}

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

// Set's a new starting position for the enemy
Player.prototype.respawn = function() {
    this.x = 2;
    this.y = 5;
    this.flaggedForRespawn = false;
}

// Handle player input. The player "hops" from square-to-square so 
// rather than smoothly animating with update we just teleport the player to
// the next square in the grid.
// Parameter: An allowed key for the player (left, right, up, or down)
Player.prototype.handleInput = function(allowedKeys) {

    console.log(`Moving the player ${allowedKeys}.`);

    // Move the player in direction of allowedKey
    switch(allowedKeys) {
        case 'left':
            if(this.x > 0) {
            // Move the player left one square
            this.x--;
            }
        break;
        case 'right':
            if(this.x < 4) {
            // Move the player right one square
            this.x++;
            }
        break;
        case 'up':
            if(this.y > 0) {
            // Move the player up one square
            this.y--;
            }
        break;
        case 'down':
                if(this.y <5) {
            // Move the player down one square
            this.y++;
                
            }
        break;
        default:
            // This shouldn't happen but catching just in case
            console.log(`Error: Movement direction wasn't found.`);
    }
}


// Instantiate game objects

// Create 3 enemies and store in allEnemies array
const allEnemies = Enemy.makeEnemy(3);
// Create player
const player = new Player();
player.respawn();
console.log(player);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
