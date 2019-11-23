// This variable prevents input and redrawing of images when true
let gamePaused = false;

// The game over box
const MODAL = document.querySelector(".modal");
const MODAL_CLOSE_BUTTON = document.querySelector(".modal-close-button");

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
  this.x = 0; // Entity's current x-coordinate in the grid
  this.y = 0; // Entity's current y-coordinate in the grid
  this.width = 101;
  this.height = 83;
  this.movementSpeed = 0;
  this.flaggedForRespawn = false;
}

Entity.prototype.getTrueX = function() {
  return this.x * this.width;
};

Entity.prototype.getTrueY = function() {
  return this.y * this.height;
};

// Update the entity's position, required method for game
// Parameter: dt, a time delta between ticks for smooth animation
// and establishing a uniform frame-rate across different devices
Entity.prototype.update = function(dt) {};

// Draw the entitiy on the screen, required method for game
Entity.prototype.render = function() {
  // The dimensions of each part of the game board are 101 x 171px
  // The actual playable area is 101 x 83px because the 2D art is faking a 3D game-board
  // The middle of the playable area is 83/2 or 41.5px
  // To make grid coordinates simple x is multiplied by the actual playable area's width
  // and y is multiplied by the actual playable area's height before rendering
  // To make entities look like they are in the middle of the playable area
  // the y coordinate is also shifted upwards 41.5 px (essentially moving the inner rectangle
  // to the origin of the outer-one which is the true image size dimensions 101 x 171px)
  ctx.drawImage(
    Resources.get(this.sprite),
    this.getTrueX(),
    this.getTrueY() - 41.5
  );
};

// Reset enemy respawn flag
Entity.prototype.respawn = function() {
  this.flaggedForRespawn = false;
};

// Set the movement speed of the entity
Entity.prototype.setMovementSpeed = function(speed) {
  this.movementSpeed = speed;
}

// Set the starting position of the entity
Entity.prototype.setStartingPosition = function(startingPosition = [0, 0]) {
  [this.x, this.y] = startingPosition;
}

// Exit entity (the player's win condition)
var ExitDoor = function() {
  // Call super constructor
  Entity.call(this, "images/Selector.png");
};

ExitDoor.prototype = Object.create(Entity.prototype);
ExitDoor.prototype.constructor = ExitDoor;

ExitDoor.prototype.respawn = function() {
  // Choose a column and add to the map
  Entity.prototype.setStartingPosition.call(this, [getRandomInt(0, 5), 0]);
  Entity.prototype.respawn.call(this);
}

// Enemies our player must avoid
var Enemy = function() {
  // Call super constructor
  Entity.call(this, "images/enemy-bug.png"); 
};

Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;

// Static factory function to create enemies
Enemy.makeEnemy = function(numberOfEnemiesToInitiate = 1) {
  const arrayOfEnemies = [];

  while (numberOfEnemiesToInitiate != 0) {
    let enemyToAdd = new Enemy();

    enemyToAdd.respawn();
    arrayOfEnemies.push(enemyToAdd);

    numberOfEnemiesToInitiate--;
  }

  return arrayOfEnemies;
};

// Sets the movement speed of an enemy based on a set of lower and upper bounds for possible speeds
Enemy.prototype.setMovementSpeed = function() {
  const movementSpeedBounds = [1, 3.75]; // [Lower (inclusive), Upper (exclusive))
  Entity.prototype.setMovementSpeed.call(this, getRandom(
    movementSpeedBounds[0],
    movementSpeedBounds[1]
  ));
};

// Set the starting position of an enemy
Enemy.prototype.setStartingPosition = function() {
  // Valid starting positions for an enemy
  // Each [x,y] coordingate cooresponds to a paved row,
  // with the x position being one block's width to the left of the leftmost side of the screen
  const validEnemyStartingYCoordinates = [1, 2, 3];

  let row = getRandomInt(0, 3); // Choose 0,1, or 2
  this.x = -1;
  this.y = validEnemyStartingYCoordinates[row];
};

Enemy.prototype.checkIfTimeToRespawn = function() {
  if (this.x >= 6) {
    this.flaggedForRespawn = true;
  }
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  // Movement is multiplied by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.

  if (this.flaggedForRespawn) {
    // Enemy is off-screen right, respawn in new starting location
    this.respawn();
  } else {
    // Since enemies only move right to left we only need to update their x-position
    this.x += this.movementSpeed * dt;

    this.checkIfTimeToRespawn();
  }
};

// Set's a new starting position for the enemy
Enemy.prototype.respawn = function() {
  this.setMovementSpeed();
  this.setStartingPosition();
  Entity.prototype.respawn.call(this);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
  // Call super constructor
  Entity.call(this, "images/char-horn-girl.png");
};

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

// Set's a new starting position for the enemy
Player.prototype.respawn = function() {
  const startingPosition = [2,5];
  Entity.prototype.setStartingPosition.call(this, startingPosition);
  Entity.prototype.respawn.call(this);
};

// Handle player input. The player "hops" from square-to-square so
// rather than smoothly animating with update we just teleport the player to
// the next square in the grid.
// Parameter: An allowed key for the player (left, right, up, or down)
Player.prototype.handleInput = function(allowedKeys) {
  if (!gamePaused) {
    // Move the player in direction of allowedKey
    switch (allowedKeys) {
      case "left":
        if (this.x > 0) {
          // Move the player left one square
          this.x--;
        }
        break;
      case "right":
        if (this.x < 4) {
          // Move the player right one square
          this.x++;
        }
        break;
      case "up":
        if (this.y > 0) {
          // Move the player up one square
          this.y--;
        }
        break;
      case "down":
        if (this.y < 5) {
          // Move the player down one square
          this.y++;
        }
        break;
      default:
        // This shouldn't happen but catching just in case
        console.log(`Error: Movement direction wasn't found.`);
    }
  }
};

// Formats modal text box before display
function updateModalBoxText(playerWon) {
  let modalContent = document.querySelector(".modal-content");

  let modalTextHeader = document.createElement("h3");
  modalTextHeader.style.textAlign = "center";
  modalTextHeader.style.color = "#FFFFFF";

  if (playerWon) {
    modalTextHeader.textContent = "Congratulations, you win!";
  } else {
    modalTextHeader.textContent = "Ouch!";
  }

  modalContent.appendChild(modalTextHeader);
}

// Closes the game over box and resets the game
function onModalCloseClicked() {
  MODAL.classList.toggle("show-modal");
  resetGame();
}

// Toggles the game over box visible/not visible
function toggleModalBox() {
  MODAL.classList.toggle("show-modal");
}

function resetGame() {
  for (let enemy of allEnemies) {
    enemy.respawn();
  }

  player.respawn();
  exitDoor.respawn();

  resetModalBox();

  gamePaused = false;
}

// Resets the modal box text content for a new game
function resetModalBox() {
  // Hide modal box if showing
  if (MODAL.className.includes("show-modal")) {
    toggleModalBox();
  }

  let modalContent = document.querySelector(".modal-content");
  modalContent.lastChild.remove();
}

// Instantiate game objects

// Create an exit door
var exitDoor = new ExitDoor();
exitDoor.respawn();

// Create 3 enemies and store in allEnemies array
const allEnemies = Enemy.makeEnemy(3);
// Create player
const player = new Player();
player.respawn();

// Event handler for player input
function onPlayerInput(e) {
  var allowedKeys = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
  };

  player.handleInput(allowedKeys[e.keyCode]);
}

// Create event listeners for new game
function addEventListeners() {
  // This listens for key presses and sends the keys to your
  // Player.handleInput() method. You don't need to modify this.
  document.addEventListener("keyup", onPlayerInput);

  // Game over box's close button's event listener
  MODAL_CLOSE_BUTTON.addEventListener("click", onModalCloseClicked);
}
