var GameState = function(game){};

var stageSize = {width:1136, height:640};
var centerPoint = {x:stageSize.width/2, y:stageSize.height/2};

GameState.prototype.preload = function() {
 //We're preloading all the assets for the game to avoid any potential load-lag later.
    this.game.load.image('player', 'assets/plane.png');
    this.game.load.image('letter', 'assets/plane.png');
    this.game.load.image('blimp', 'assets/blimp.png');
    this.game.load.image('cloud', 'assets/cloud.png');

};

GameState.prototype.create = function() {
    //This is called immediately after preloading.
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.world.setBounds(0, 0, 2400, 500);
    this.game.stage.backgroundColor = 0x4488cc;
    this.game.physics.arcade.gravity.y = 100;



    this.cloudBGGroup = game.add.group();
    this.cloudBGTimer = game.time.events.loop(Phaser.Timer.SECOND*4, function() {
        var myCloud = this.game.add.existing(
            new Cloud(this)
        );
        myCloud.scale.setTo(.5);
        this.cloudBGGroup.add(myCloud);
    }, this);

    //Here we add an Player object to the stage. This is constructed using a prototype as defined below.
    this.game.add.existing(
        this.player = new Player(this.game, 150, centerPoint.y, this.game.input)
    );

    scoreText = this.game.add.text(320, 20, 'Word: ', { font: '16px Arial', fill: '#ffffff'});

    cursors = this.game.input.keyboard.createCursorKeys();

    //Just for good measure, i've added an fps timer.
    this.game.time.advancedTiming = true;
    this.fpsText = this.game.add.text(
        20, 20, '', { font: '16px Arial', fill: '#ffffff' }
    );

    this.timer = this.game.add.text(
        150, 20, '', { font: '16px Arial', fill: '#ffffff'}
    );

    this.textGroup = game.add.group();
    this.textTimer = game.time.events.loop(Phaser.Timer.SECOND*1.5, function () {
        var myLetter = this.game.add.existing(
            new Letter(this, this.player)
        );
        this.textGroup.add(myLetter);
    }, this);

    this.cloudFGGroup = game.add.group();
    this.cloudFGTimer = game.time.events.loop(Phaser.Timer.SECOND*4, function() {
        var myCloud = this.game.add.existing(
            new Cloud(this)
        );
        myCloud.alpha = .5;
        this.cloudFGGroup.add(myCloud);
    }, this);
}

GameState.prototype.update = function() {
    //This method is called every frame.
    //We're not doing anything but updating the fps here.
    if (this.game.time.fps !== 0) {
        this.fpsText.setText(this.game.time.fps + ' FPS');
    }
    if(this.player.health <= 0){
	    //We pass in the player, blimpgroup, and blimptimer in order to remove them
	    gameOver(this.player, this.blimpGroup, this.blimpTimer);
	}
    this.timer.setText('Time: ' + Math.abs(new Date().getTime() - startTime)/1000);
}

var Player = function(game, x, y, target){
    //Here's where we create our player sprite.
    Phaser.Sprite.call(this, game, x, y, 'player');
    //We set the game input as the target
    this.target = target;
    //The anchor is the 'center point' of the sprite. 0.5, 0.5 means it will be aligned and rotated by its center point.
    this.anchor.setTo(0.5, 0.5);
    //Finally we enable physics so we can move the player around (this is how easy physics is in Phaser)
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    //We need a target position for our player to head to
    this.targetPos = {x:this.x, y:this.y};
    //And an easing constant to smooth the movement
    this.body.allowGravity = false;
    this.easer = .5;
    //Health
    this.health = 100;

    //We need a target position for our player to head to
	this.targetPos = {x:this.x, y:this.y};
	//And an easing constant to smooth the movement
	this.easer = .5;
}

var Cloud = function(game) {
    // Set a location just off stage to spawn the letter
    var x = stageSize.width + 25;
    var y = Math.random()*stageSize.height;

    // Spawn the container
    Phaser.Sprite.call(this, game, x, y, 'cloud');
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.allowGravity = false;
    this.body.gravity.setTo(0);

    // Set a randomized number for scale and velocity of the letter (parallax)
    var adj = Math.random()*3.5;
    this.body.velocity.x = -100*adj;

    // Hide the container
    this.alpha = 100;

    // If the character is out of bounds, kill it
    this.checkWorldBounds = true;
    this.events.onOutOfBounds.add(cloudOutOfBounds, this);
}

var Letter = function(game, player) {
    // Set a location just off stage to spawn the letter
    var x = stageSize.width + 25;
    var y = Math.random()*stageSize.height;

    // Randomly select the letter of the alphabet
    var letter = Math.random().toString(36).toString(36).replace(/[^a-z]+/g, '').substring(0, 1).toUpperCase();

    // Spawn the container
    Phaser.Sprite.call(this, game, x, y, 'letter');

    // Store a reference to the player object
    this.player = player;

    // Add a text object to the "container" object (this will contain the letter)
    this.character = this.game.add.text(x, y, letter, { fontSize: '32px', fill: '#000' });

    // Enable physics on the container and set velocity
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.allowGravity = false;
    this.body.gravity.setTo(0);

    // Set a randomized number for scale and velocity of the letter (parallax)
    var adj = Math.random()*2.5;
    this.body.velocity.x = -100*adj;

    // Hide the container
    this.alpha = 0;

    // Resize container to exact size of letter (collision detection)
    this.width = this.character.width;
    this.height = this.character.height;

    // Store a reference to the letter the container holds
    this.letter = letter;

    //Set a scale between 1 and 1.5 for some random sizes
    this.character.scale.setTo(adj);

    // If the character is out of bounds, kill it
    this.checkWorldBounds = true;
    this.events.onOutOfBounds.add(letterOutOfBounds, this);

    //Whether the blimp has been hit by the player yet.
    this.hit = false;
}

function letterOutOfBounds(letter){
    letter.character.destroy();
    letter.kill();
}

function cloudOutOfBounds(cloud){
    cloud.kill();
}

Cloud.prototype = Object.create(Phaser.Sprite.prototype);
Cloud.prototype.constructor = Cloud;

Letter.prototype = Object.create(Phaser.Sprite.prototype);
Letter.prototype.constructor = Letter;

Letter.prototype.update = function(){

    // Get bounds for collision detection (why we needed a player reference)
    var boundsA = this.player.getBounds();
    var boundsB = this.getBounds();

    // If the bounds intersect and it's not already hit.
    if(Phaser.Rectangle.intersects(boundsA, boundsB) && !this.hit){
        // Update the collected word
        score += this.letter;
        scoreText.setText('Word: ' + score);

        // Destroy the letter
        this.hit = true;
        this.character.destroy();
        this.kill();
    }

    // Position the character with the letter
    this.character.x = this.x + this.width/2 - this.character.width/2;
    this.character.y = this.y + this.height/2 - this.character.height/2;
}

// We give our player a type of Phaser.Sprite and assign it's constructor method.
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(){

    //If the target's (which we have assigned as this.game.input) active pointer is down
    if (this.game.input.isDown){
        //Make our new target position the pointers position
        //this.targetPos = {x:this.target.x, y:this.target.y};
    }

    //Now work out the velocities by working out the difference between the target and the current position, and use an easer to smooth it.
    //var velX = (this.targetPos.x-this.x)/this.easer;
    //var velY = (this.targetPos.y-this.y)/this.easer;

    //Set the Players physics body's velocity
    //this.body.velocity.setTo(velX, velY);

    if (cursors.left.isDown)
      {
          //  Move to the left
          this.body.velocity.x = -150;
      }
      else if (cursors.right.isDown)
      {
          //  Move to the right
          this.body.velocity.x = 150;
      }

      //  Allow the player to jump if they are touching the ground.
  else if (cursors.up.isDown)
  {
      this.body.velocity.y = -150;
  }
  else if (cursors.down.isDown)
  {
      this.body.velocity.y = 150;
  }
  else if (cursors.up.isDown && cursors.right.isDown) {
    this.body.velocity.setTo(150, 150);
  }
  else if (cursors.up.isDown && cursors.left.isDown) {
    this.body.velocity.setTo(-150, 150);
  }
  else if (cursors.down.isDown && cursors.right.isDown) {
    this.body.velocity.setTo(150, -150);
  }
  else if (cursors.down.isDown && cursors.left.isDown) {
    this.body.velocity.setTo(-150, -150);
  }
  else
  {
    this.body.velocity.setTo(0, 0);

    //this.body.allowGravity = false;
  }

}

function gameOver(player, blimpGroup, blimpTimer){

    //Destroy the group of blimps
    blimpGroup.destroy();
    //Kill the player
    player.kill();
    //Remove the timer
    game.time.events.remove(blimpTimer);

    //Create some GAME OVER text using a text style. Set the anchor to 0.5, 0.5 so it's perfectly centered.
    var textStyle = {font:"28px Arial", fill: "#FFFFFF", align:"center"};
    game.add.text(game.world.centerX, game.world.centerY, 'GAME OVER MAN. GAME OVER.\nCLICK TO PLAY AGAIN', textStyle)
    .anchor.setTo(0.5, 0.5);

    //We want the player to be able to restart, so add an click event.
    game.input.onDown.addOnce(newGame, this);

}

function newGame(){
    //This sets the state of your game to a fresh version of GameState, starting it all over again.
    game.state.add('game', GameState, true);
}


var game = new Phaser.Game(stageSize.width, stageSize.height, Phaser.AUTO, 'game');
game.state.add('game', GameState, true);
var score = '';
var scoreText, cursors;
var startTime = new Date().getTime();