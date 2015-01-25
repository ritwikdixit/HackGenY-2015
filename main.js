//the game ?
//Ritwik Dixit HackGenY
var frameOutput = document.getElementById("frameData");
var play = document.getElementById("play");
var canvas = document.getElementById("myCanvas");
var ctx;

var hasStarted = false;
var isAlive = true;

var frameCount = 0;

var initWidth = 640;
var initHeight = 400;

//define the centers
var eqX = 100;
var eqY = 150;
var eqZ = 120;

var enemyX = 0;
var enemyY = 0;
var enemyDimen = 30;

//this is how leap will communicate with the animator
var playerX = initWidth/2;
var playerY = initHeight/2;
var playerDimen = 40;

var superColor = 255;

var previousFrame = null;
var paused = false;
var pauseOnGesture = false;

function Enemy(xpos, ypos, xspeed, yspeed) {

  this.xspeed = xspeed;
  this.yspeed = yspeed;
  this.xpos = xpos;
  this.ypos = ypos;

}

//creating a method for the enemy object
Enemy.prototype.update = function() {

  this.xpos += this.xspeed;
  this.ypos += this.yspeed;

  if (this.xpos + enemyDimen > playerX  && this.xpos < playerX
    || this.xpos < playerX + playerDimen && this.xpos + enemyDimen > playerX + playerDimen) {

    if (this.ypos + enemyDimen > playerY && this.ypos < playerY
      || this.ypos < playerY + playerDimen && this.ypos + enemyDimen > playerY + playerDimen) {

          isAlive = false;
          play.innerHTML = "Game Over. You survived for " + (frameCount/60.0) + "s";

    }

  }

  this.xpos %= canvas.width;
  this.ypos %= canvas.height;

  ctx.fillStyle = "rgb(50, 200, 50)";
  ctx.fillRect(this.xpos, this.ypos, enemyDimen, enemyDimen);

}

var enemy1 = new Enemy(-100, -100, 4, 4);
var enemy2 = new Enemy(canvas.width, 0, -3, 3);
var enemy3 = new Enemy(-50, canvas.height/2, 4, 0);
var enemy4 = new Enemy(canvas.width/3, 1, 5);
var enemy5 = new Enemy(canvas.width/2, -200, -0.5, 5)

// Setup Leap loop with frame callback function
var controllerOptions = {enableGestures: true};

  function draw() {

    if (isAlive) {
      window.requestAnimationFrame(draw);
    }

    ctx = canvas.getContext("2d");
    ctx.clearRect(0,  0, canvas.width, canvas.height);

    ctx.fillStyle = "rgb(" + (256 - Math.min(superColor - 64, 200)).toString() + ", 50, 50)"
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //set color for enemy
    enemy1.update();
    enemy2.update();
    enemy3.update();
    enemy4.update();
    enemy5.update();

    //draw player
    ctx.fillStyle = "rgb(255, 255, 255)"
    ctx.fillRect(playerX, playerY, playerDimen, playerDimen);
    frameCount += 1;
    if (frameCount % 5 == 0) {
      play.innerHTML = "Survival Time: " + (frameCount / 60.0) + "s";
    }

  }

  function drawPreGame() {

    if (!hasStarted) {
      window.requestAnimationFrame(drawPreGame);
    }
    ctx = canvas.getContext("2d");
    ctx.clearRect(0,  0, canvas.width, canvas.height);

    ctx.fillStyle = "rgb(200, 200, 200)"
    ctx.fillRect(playerX, playerY, playerDimen, playerDimen);

  }

  var deathAnimColor = 50;

  function drawDead() {

    if (!isAlive) {
      alert("You Died!");
    }

  }

    function moveForXY(vector) {
      
      var x = vector[0].toFixed(3);
      var y = vector[1].toFixed(3);
      superColor = Math.floor(vector[2]);
      
      //boosted left/right movement
      playerX = 2.0 * (x - eqX) + initWidth/2;
      playerY = 1.5 * (-y + eqY) + initHeight/2;

      if (playerX < 0) {
        playerX = 1;
      } else if (playerX > canvas.width - playerDimen) {
        playerX = canvas.width - playerDimen - 1;
      }

      if (playerY < 0) {
        playerY = 1;
      } else if (playerY > canvas.height - playerDimen) {
        playerY = canvas.height - playerDimen - 1;
      }
            
  }

  drawPreGame();

Leap.loop(controllerOptions, function(frame) {
  if (paused) {
    return; // Skip this update
  }

  // Display Frame object data

  var frameString = "Frame ID: " + frame.id  + "<br />" + "Gestures: " + frame.gestures.length + "<br />";

  // Frame motion factors
  if (previousFrame && previousFrame.valid) {
    var translation = frame.translation(previousFrame);
    frameString += "Translation: " + vectorToString(translation) + " mm <br />";

    var rotationAxis = frame.rotationAxis(previousFrame);
    var rotationAngle = frame.rotationAngle(previousFrame);
    frameString += "Rotation axis: " + vectorToString(rotationAxis, 2) + "<br />";
    frameString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

    var scaleFactor = frame.scaleFactor(previousFrame);
    frameString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
  }
  frameOutput.innerHTML = "<div style='width:300px; float:left; padding:5px'>" + frameString + "</div>";

  // Display Hand object data
  var handOutput = document.getElementById("handData");
  var handString = "";
  if (frame.hands.length > 0) {
    for (var i = 0; i < frame.hands.length; i++) {
      var hand = frame.hands[i];

      handString += "<div style='width:300px; float:left; padding:5px'>";
      handString += "Hand ID: " + hand.id + "<br />";
      handString += "Type: " + hand.type + " hand" + "<br />";
      handString += "Direction: " + vectorToString(hand.direction, 2) + "<br />";
      handString += "Palm position: " + vectorToString(hand.palmPosition) + " mm<br />";
      handString += "Grab strength: " + hand.grabStrength + "<br />";
      handString += "Pinch strength: " + hand.pinchStrength + "<br />";
      handString += "Confidence: " + hand.confidence + "<br />";
      handString += "Arm direction: " + vectorToString(hand.arm.direction()) + "<br />";
      handString += "Arm center: " + vectorToString(hand.arm.center()) + "<br />";
      handString += "Arm up vector: " + vectorToString(hand.arm.basis[1]) + "<br />";
        
      moveForXY(hand.arm.center());

      if (!hasStarted && hand.grabStrength >= 0.99) {
        //fist to begin!
        draw();
        hasStarted = true;
      }

      // Hand motion factors
      if (previousFrame && previousFrame.valid) {
        var translation = hand.translation(previousFrame);
        handString += "Translation: " + vectorToString(translation) + " mm<br />";

        var rotationAxis = hand.rotationAxis(previousFrame, 2);
        var rotationAngle = hand.rotationAngle(previousFrame);
        handString += "Rotation axis: " + vectorToString(rotationAxis) + "<br />";
        handString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

        var scaleFactor = hand.scaleFactor(previousFrame);
        handString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
      }

      // IDs of pointables associated with this hand
      if (hand.pointables.length > 0) {
        var fingerIds = [];
        for (var j = 0; j < hand.pointables.length; j++) {
          var pointable = hand.pointables[j];
            fingerIds.push(pointable.id);
        }
        if (fingerIds.length > 0) {
          handString += "Fingers IDs: " + fingerIds.join(", ") + "<br />";
        }
      }

      handString += "</div>";
    }
  }
  else {
    handString += "No hands";
  }
    
  handOutput.innerHTML = handString;

  // Display Gesture object data
  var gestureOutput = document.getElementById("gestureData");
  var gestureString = "";
  if (frame.gestures.length > 0) {
    if (pauseOnGesture) {
      togglePause();
    }
    for (var i = 0; i < frame.gestures.length; i++) {
      var gesture = frame.gestures[i];
      gestureString += "Gesture ID: " + gesture.id + ", "
                    + "type: " + gesture.type + ", "
                    + "state: " + gesture.state + ", "
                    + "hand IDs: " + gesture.handIds.join(", ") + ", "
                    + "pointable IDs: " + gesture.pointableIds.join(", ") + ", "
                    + "duration: " + gesture.duration + " &micro;s, ";

      switch (gesture.type) {
        case "circle":
          gestureString += "center: " + vectorToString(gesture.center) + " mm, "
                        + "normal: " + vectorToString(gesture.normal, 2) + ", "
                        + "radius: " + gesture.radius.toFixed(1) + " mm, "
                        + "progress: " + gesture.progress.toFixed(2) + " rotations";
          break;
        case "swipe":
          gestureString += "start position: " + vectorToString(gesture.startPosition) + " mm, "
                        + "current position: " + vectorToString(gesture.position) + " mm, "
                        + "direction: " + vectorToString(gesture.direction, 1) + ", "
                        + "speed: " + gesture.speed.toFixed(1) + " mm/s";
                            
          break;
        case "screenTap":
        case "keyTap":
          gestureString += "position: " + vectorToString(gesture.position) + " mm";
          break;
        default:
          gestureString += "unkown gesture type";
      }
      gestureString += "<br />";
    }
  }
  else {
    gestureString += "No gestures";
  }
  gestureOutput.innerHTML = gestureString;

  // Store frame for motion functions
  previousFrame = frame;
})

function vectorToString(vector, digits) {
  if (typeof digits === "undefined") {
    digits = 1;
  }
  return "(" + vector[0].toFixed(digits) + ", "
             + vector[1].toFixed(digits) + ", "
             + vector[2].toFixed(digits) + ")";
}

function togglePause() {
  paused = !paused;

  if (paused) {
    document.getElementById("pause").innerText = "Resume";
  } else {
    document.getElementById("pause").innerText = "Pause";
  }
}

function pauseForGestures() {
  if (document.getElementById("pauseOnGesture").checked) {
    pauseOnGesture = true;
  } else {
    pauseOnGesture = false;
  }
}


