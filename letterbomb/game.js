var GameState = function(game){};

var stageSize = {width:1136, height:640};
var centerPoint = {x:stageSize.width/2, y:stageSize.height/2};

GameState.prototype.preload = function() {
 //We're preloading all the assets for the game to avoid any potential load-lag later.
    this.game.load.image('player', 'assets/plane.png');
    this.game.load.image('letter', 'assets/plane.png');
    this.game.load.image('blimp', 'assets/blimp.png');

};

GameState.prototype.create = function() {
    //This is called immediately after preloading.
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.game.world.setBounds(0, 0, 2400, 500);

    this.game.stage.backgroundColor = 0x4488cc;

    this.game.physics.arcade.gravity.y = 100;

    //Here we add an Player object to the stage. This is constructed using a prototype as defined below.
    this.game.add.existing(
        this.player = new Player(this.game, 150, centerPoint.y, this.game.input)
    );


    scoreText = this.game.add.text(16, 16, '', { fontSize: '32px', fill: '#000' });


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
        console.log(myLetter.letter);
        this.textGroup.add(myLetter);
    }, this);


    /*
    this.blimpGroup = game.add.group();
	this.blimpTimer = game.time.events.loop(Phaser.Timer.SECOND*2.5, function(){
	    var blimp = this.game.add.existing(
	        new Blimp(this, this.player)
	    );
	    this.blimpGroup.add(blimp);
	}, this);
*/
}

GameState.prototype.update = function() {
    this.game.physics.arcade.collide(this.textGroup, this.player);
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
  scoreText.x = this.player.x-50;
  scoreText.y = this.player.y-50;
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

var Blimp = function(game, player){

    //Give the blimp an x offscreen, a random y, and a speed between -150 and -250
    var x = stageSize.width+200;
    var y = Math.random()*stageSize.height;
    this.speed = -250-Math.random()*150;
    this.player = player;

    //Create a sprite with the blimp graphic
    Phaser.Sprite.call(this, game, x, y, 'blimp');

    //Again, enable physics and set velocity
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.velocity.setTo(this.speed, 0);

    //Set a scale between 1 and 1.5 for some random sizes
    this.scale.setTo(1+Math.random()*3);
    this.anchor.setTo(0.5, 0.5);

    //This handy event lets us check if the blimp is completely off screen. If it is, we call blimpOutOfBounds, and get rid of it.
    this.checkWorldBounds = true;
    this.events.onOutOfBounds.add(blimpOutOfBounds, this);

    //Whether the blimp has been hit by the player yet.
    this.hit = false;
}

var Letter = function(game, player) {
    var x = stageSize.width + 25;
    var y = Math.random()*stageSize.height;
    var letter = Math.random().toString(36).toString(36).replace(/[^a-z]+/g, '').substring(0, 1).toUpperCase();

    Phaser.Sprite.call(this, game, x, y, 'letter');

    this.player = player;
    this.character = this.game.add.text(x-10, y+10, letter, { fontSize: '32px', fill: '#000' });

    //Again, enable physics and set velocity
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.allowGravity = false;
    this.body.gravity.setTo(0);
    this.body.velocity.x = -100;
    //this.body.velocity.setTo(this.speed, 0);

    //Set a scale between 1 and 1.5 for some random sizes
    this.letter = letter;
    this.scale.setTo(.2);
    this.anchor.setTo(0.5, 0.5);

    //This handy event lets us check if the blimp is completely off screen. If it is, we call blimpOutOfBounds, and get rid of it.
    this.checkWorldBounds = true;
    this.events.onOutOfBounds.add(blimpOutOfBounds, this);

    //Whether the blimp has been hit by the player yet.
    this.hit = false;
}

function letterOutOfBounds(letter) {
	letter.kill();
}

function blimpOutOfBounds(blimp){
    blimp.kill();
}

Letter.prototype = Object.create(Phaser.Sprite.prototype);
Letter.prototype.constructor = Letter;

Blimp.prototype = Object.create(Phaser.Sprite.prototype);
Blimp.prototype.constructor = Blimp;

Blimp.prototype.update = function(){

    //As a simple form of hit detection (Phaser also supports pixel perfect HD, but i'll keep it simple) we'll detect the bounds and see if they intersect.
    var boundsA = this.player.getBounds();
    var boundsB = this.getBounds();

    //If the bounds intersect and it's not already hit.
    if(Phaser.Rectangle.intersects(boundsA, boundsB) && !this.hit){
        this.hit = true;

        //Detract 20 from the players health and set the alpha to represent it.
        this.player.health -= 20;
        this.player.alpha = this.player.health/100;

        //Change the velocity to a downwards fall
        this.body.velocity.setTo(this.body.velocity.x/2, 100);

        //Phaser also lets you use Tweens to easily smooth movement. Here i've smoothly rotated downwards to give the impression of falling.
        game.add.tween(this)
        .to({rotation: -Math.PI/8}, 300, Phaser.Easing.Linear.In)
        .start();
    }
}



Letter.prototype.update = function(){

    //As a simple form of hit detection (Phaser also supports pixel perfect HD, but i'll keep it simple) we'll detect the bounds and see if they intersect.
    var boundsA = this.player.getBounds();
    var boundsB = this.getBounds();

    //If the bounds intersect and it's not already hit.
    if(Phaser.Rectangle.intersects(boundsA, boundsB) && !this.hit){
        score += this.letter;
        scoreText.text = score;
        this.hit = true;
        this.character.destroy();
        this.kill();
    }

  this.character.x = this.x-10;
  this.character.y = this.y+10;
}

//We give our player a type of Phaser.Sprite and assign it's constructor method.
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function(){

    //If the target's (which we have assigned as this.game.input) active pointer is down
    if (this.target.activePointer.isDown){
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