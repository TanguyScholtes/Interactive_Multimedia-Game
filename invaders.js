/*
* Multimédia Interactif
* HEPL 2014 - 2015
* Cours de Pierre-Antoine Delnatte
*
* Game - Space Invaders
* By Tanguy SCHOLTES, 3ième Infographie 2384
*
* invaders.js
*/

(function() {

    "use strict";

    window.Invaders = function (oApplication) {
        //Global params
        var oGameBounds = { left: 0,
                            right: oApplication.width,
                            top: 0,
                            bottom: oApplication.height,
                          },
            aStateStack = [],
            oPressedKeys = {},
            iRefreshRate = 60,
            iPlayerLives = 3,
            iIntervalId = 0,
            iScore,
            
            iInvaderRows = 5,
            iInvaderColumns = 10,
            iInvaderInitialVelocity = 25,
            iInvaderAcceleration = 0,
            iInvaderDropDistance = 0,
            bInvadersAreDropping = false,
            
            iBombRate = 0.05,
            iBombMinVelocity = 50,
            iBombMaxVelocity = 50,
            
            oLastRocketTime = null;
        
        
        var fCurrentState = function() {
            /*
            Return game state at the top of the stack. Return null if the stack is empty
            */
            return aStateStack.length > 0 ? aStateStack[aStateStack.length - 1] : null;
        };
        
        
        var fMoveToState = function(state) {
            /*
            Switch from current game state to the next one in the stack
            */
            //  Are we already in a state?
            if(fCurrentState()) {
                //  Check if the state has a leave function. If it does we call it.
                if(fCurrentState().leave) {
                   fCurrentState().leave(game);
                }
                aStateStack.pop();
            }
            //  If there's an enter function for the new state, call it.
            if(state.enter) {
                state.enter(game);
            }
            //  Set the current state.
            aStateStack.push(state);
        };
        
        
        var fPushState = function(state) {
            /*
            Push game state from the stack
            */
            //  If there's an enter function for the new state, call it.
            if(state.enter) {
                state.enter(game);
            }
            //  Set the current state.
            aStateStack.push(state);
        };

        
        var fPopState = function() {
            /*
            Pop game state from the stack
            */
            //  Leave and pop the state.
            if(fCurrentState()) {
                if(fCurrentState().leave) {
                    fCurrentState().leave(game);
                }
                //  Set the current state.
                aStateStack.pop();
            }
        };
        
        
        var fGameLoop = function(game) {
            /*
            Get game state and act according to it : update of it has an update function and/or draw if the game state has a draw function
            */
            var currentState = fCurrentState();
            if(currentState) {
                //  Delta t is the time to update/draw.
                var dt = 1 / iRefreshRate,
                    ctx = game.context;

                if(currentState.update) {
                    currentState.update(game, dt);
                }
                if(currentState.draw) {
                    currentState.draw(game, dt, ctx);
                }
            }
        }
        
        
        var fGameStart = function() {
            //  Move to the 'welcome' state.
            fMoveToState(new WelcomeState());

            //  Set the game variables.
            iPlayerLives = 3;

            //  Start the game loop.
            iIntervalId = setInterval(function () { fGameLoop(oApplication);}, 1000 / iRefreshRate);

        };
        
        
        var fKeyDown = function(keyCode) {
            /*
            Inform current game state a key is down
            */
            oPressedKeys[keyCode] = true;
            //Let the current state handle the event if needed
            if(fCurrentState() && fCurrentState().keyDown) {
                fCurrentState().keyDown(oApplication, keyCode);
            }
        };


        var fKeyUp = function(keyCode) {
            /*
            Inform current game state a key is up
            */
            delete oPressedKeys[keyCode];
            //Let the current state handle the event if needed
            if(fCurrentState() && fCurrentState().keyUp) {
                fCurrentState().keyUp(oApplication, keyCode);
            }
        };
        
        var fGameOver = function() {
            window.cancelAnimationFrame(iIntervalId);
            window.alert("GAME OVER\nScore : " + iScore + "\n\nTry again !");
            window.location.reload(true);
        };
        
        var fGameWon = function() {
            window.cancelAnimationFrame(iIntervalId);
            window.alert("YOU WIN !\nScore : " + iScore + "\n\nThanks for playing !");
            window.location.reload(true);
        };
        
        
        function Ship(x, y) {
            /*
            Ship class
            */
            //ship's position
            this.x = x;
            this.y = y;
            //ship's dimensions
            this.width = 28;
            this.height = 20;
            
            var iShipSpeed = 120;
        }
        
        
        function Rocket(x, y) {
            /*
            Rocket class. Projectiles from the player's ship
            */
            this.x = x;
            this.y = y;
            var velocity =  120,
                iRocketMaxFireRate = 2;
        }
        
        
        function Bomb(x, y) {
            /*
            Bomb class. Projectiles dropped by Invaders
            */
            this.x = x;
            this.y = y;
            var velocity = 50,
                iBombRate = 0.05;
        }

        
        function Invader(x, y, row, column, type) {
            /*
            Invaders class
            */
            this.x = x;
            this.y = y;
            this.row = row;   //Defines on which row they are
            this.column = column;   //Defines on which column they are
            this.type = type;   //Defines invader's type
            this.width = 24;
            this.height = 18;
        }
        
        
        function WelcomeState () {
            /*
            Initial state of the game : just the title displayed and a touch to start playing
            */
        };
        
        
        WelcomeState.prototype.draw = function(game, dt, ctx) {
            /*
            Clear canvas, draw title and instructions to start playing
            */
            ctx.clearRect(0, 0, oApplication.width, oApplication.height);
            
            //Background
            ctx.fillStyle = "#000";	//define color to use
    	    ctx.fillRect(0, 0, oApplication.width, oApplication.height); //Rect(x, y, width, height)

            //Game title
            ctx.font="34px Arial";
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline="center";
            ctx.textAlign="center";
            ctx.fillText("Space Invaders", game.width / 2, game.height/2 - 40);
            
            //Subtitle
            ctx.font="16px Arial";
            ctx.fillText("Press 'Spacebar' to start.", game.width / 2, game.height/2);
        };
        
        
        WelcomeState.prototype.keyDown = function(game, keyCode) {
            /*
            Activates if spacebar is pressed. Change game state to the in-game screen
            */
            if(keyCode == 32) /*space*/ {
                //  Space starts the game.
                fMoveToState(new PlayState(game.level));
            }
        };
        
        
        function PlayState(level) {
            /*
            Actual gamescreen
            */
            this.level = level;

            //  Game entities.
            this.oShip = null;
            this.aInvaders = [];
            this.aRockets = [];
            this.aBombs = [];
        }
        
        
        PlayState.prototype.enter = function(game) {
            /*
            Called at each beginning of the game
            */
            //Create a new ship with its initial position
            this.ship = new Ship(oApplication.width / 2, oGameBounds.bottom);
            
            //  Create the invaders.
            var rows = iInvaderRows;
            var columns = iInvaderColumns;
            for(var i = 0; i < rows; i++){
                for(var j = 0; j < columns; j++) {
                    this.aInvaders.push( new Invader( (oApplication.width / 2) + ((columns/2 - j) * 300 / columns),
                                                      (oGameBounds.top + i * 25),
                                                      i,
                                                      j,
                                                      'Invader'
                                                    )
                                       );
                }
            }
            this.invaderCurrentVelocity = iInvaderInitialVelocity;
            this.invaderVelocity = { x : -iInvaderInitialVelocity,
                                     y : 0
                                   };
            this.invaderNextVelocity = null;
        };
        
        
        PlayState.prototype.update = function(game, dt) {
            /*
            Update game screen according to events
            Done according to the rate per second given by the variable RefreshRate (can't update on events, as bombs, rockets and invaders keep on moving whether or not we press a key)
            */
            // Move ship if left or right arrow are pressed
            if(oPressedKeys[37]) {
                this.ship.x -= this.shipSpeed * dt;
            }
            if(oPressedKeys[39]) {
                this.ship.x += this.shipSpeed * dt;
            }
            if(oPressedKeys[32]) {
                this.fireRocket();
            }

            // Check if ship in game bounds and make sure it stays in them
            if(this.ship.x < oGameBounds.left) {
                this.ship.x = oGameBounds.left;
            }
            if(this.ship.x > oGameBounds.right) {
                this.ship.x = oGameBounds.right;
            }
            
            // Move bombs
            for(var i  =0; i < this.aBombs.length; i++) {
                var bomb = this.aBombs[i];
                bomb.y += dt * bomb.velocity;
                // Remove bomb when out of game bounds
                if(bomb.y > oApplication.height) {
                    this.aBombs.splice(i--, 1);
                }
            }

            // Move rockets
            for(i = 0; i < this.aRockets.length; i++) {
                var rocket = this.aRockets[i];
                rocket.y -= dt * rocket.velocity;
                // Remove rocket when out of game bounds
                if(rocket.y < 0) {
                    this.aRockets.splice(i--, 1);
                }
            }
            
            // Move invaders.
            var hitLeft = false,
                hitRight = false,
                hitBottom = false;
            
            for(i = 0; i < this.aInvaders.length; i++) {
                var invader = this.aInvaders[i];
                var newx = invader.x + this.invaderVelocity.x * dt;
                var newy = invader.y + this.invaderVelocity.y * dt;
                // Before moving, check if invaders will touch the bounds of the game
                if(hitLeft === false && newx < oGameBounds.left) {
                    hitLeft = true;
                }
                else if(hitRight === false && newx > oGameBounds.right) {
                    hitRight = true;
                }
                else if(hitBottom === false && newy > oGameBounds.bottom) {
                    hitBottom = true;
                }
                
                // Move them if they won't touch any bound
                if(!hitLeft && !hitRight && !hitBottom) {
                    invader.x = newx;
                    invader.y = newy;
                }
            }

            //  Update invader velocities
            if(bInvadersAreDropping) {
                this.invaderCurrentDropDistance += this.invaderVelocity.y * dt;
                if(this.invaderCurrentDropDistance >= iInvaderDropDistance) {
                    bInvadersAreDropping = false;
                    this.invaderVelocity = this.invaderNextVelocity;
                    this.invaderCurrentDropDistance = 0;
                }
            }
            // If invaders hit the left bound, move down then right
            if(hitLeft) {
                this.invaderCurrentVelocity += iInvaderAcceleration;
                this.invaderVelocity = { x : 0,
                                         y : iInvaderCurrentVelocity
                                       };
                bInvadersAreDropping = true;
                this.invaderNextVelocity = { x : iInvaderCurrentVelocity,
                                             y : 0
                                           };
            }
            // If invaders hit the right bound, move down then left
            if(hitRight) {
                this.invaderCurrentVelocity += iInvaderAcceleration;
                this.invaderVelocity = { x : 0,
                                         y:iInvaderCurrentVelocity
                                       };
                bInvadersAreDropping = true;
                this.invaderNextVelocity = { x : -iInvaderCurrentVelocity,
                                             y : 0
                                           };
            }
            // If invaders hit the bottom, it's game over
            if(hitBottom) {
                iPlayerLives = 0;
            }
            
            //  Check for collisions between invaders and rockets
            for(i = 0; i < this.aInvaders.length; i++) {
                var invader = this.aInvaders[i];
                var toBeDeleted = false;

                for(var j = 0; j < this.aRockets.length; j++){
                    var rocket = this.aRockets[j];

                    if(rocket.x >= (invader.x - invader.width/2) && rocket.x <= (invader.x + invader.width/2) &&
                        rocket.y >= (invader.y - invader.height/2) && rocket.y <= (invader.y + invader.height/2)) {

                        // If a rocket touches an invader, we delete the rocket and mark the invader as to be deleted
                        this.aRockets.splice(j--, 1);
                        toBeDeleted = true;
                        // We update the score
                        iScore += 1;
                        break;
                    }
                }
                // We delete invaders marked as to be deleted
                if(toBeDeleted) {
                    this.aInvaders.splice(i--, 1);
                }
            }
            
            // To avoid clipping, only front-row invaders can drop bombs
            var frontRowInvaders = {};
            for(i = 0; i < this.aInvaders.length; i++) {
                var invader = this.aInvaders[i];
                // Make sure there is always a front-row invader in each column
                if(!frontRowInvaders[invader.column] || frontRowInvaders[invader.column].row < invader.row) {
                    frontRowInvaders[invader.column] = invader;
                }
            }

            // Chances for front-row invaders to drop a bomb are random
            for(i = 0; i < iInvaderRows; i++) {
                var invader = frontRowInvaders[i];
                if(!invader) continue;
                var chance = this.iBombRate * dt;
                if(chance > Math.random()) {
                    this.aBombs.push(new Bomb(invader.x, invader.y + invader.height / 2,
                        this.iBombVelocity + Math.random() * this.iBombVelocity));
                }
            }
            
            // Check for collisions between bombs and the ship
            for(i = 0; i < this.aBombs.length; i++) {
                var bomb = this.aBombs[i];
                if(bomb.x >= (this.ship.x - this.ship.width/2) && bomb.x <= (this.ship.x + this.ship.width/2) &&
                        bomb.y >= (this.ship.y - this.ship.height/2) && bomb.y <= (this.ship.y + this.ship.height/2)) {
                    this.aBombs.splice(i--, 1);
                    iPlayerLives--;
                }
            }
            
            // Check for collisions between invaders and the ship (game over)
            for(i = 0; i < this.aInvaders.length; i++) {
                var invader = this.aInvaders[i];
                if((invader.x + invader.width/2) > (this.ship.x - this.ship.width/2) && 
                    (invader.x - invader.width/2) < (this.ship.x + this.ship.width/2) &&
                    (invader.y + invader.height/2) > (this.ship.y - this.ship.height/2) &&
                    (invader.y - invader.height/2) < (this.ship.y + this.ship.height/2)
                  ) {
                    iPlayerLives = 0;
                }
            }
            
            // Check for game over
            if(iPlayerLives <= 0) {
                fGameOver();
            }
            
            //  Check for game won
            if(this.aInvaders.length == 0) {
                fGameWon();
            }

        };
        
        
         PlayState.prototype.fireRocket = function() {
            /*
            Check if the ship can fire and if it can, fire the rocket
            */
            if(oLastRocketTime === null || ((new Date()).valueOf() - oLastRocketTime) > (1000 / Rocket.iRocketMaxFireRate))
            {   
                //  Add a rocket.
                this.aRockets.push(new Rocket(this.ship.x, this.ship.y - 12, Rocket.velocity));
                oLastRocketTime = (new Date()).valueOf();
            }
        };
        
        
        PlayState.prototype.draw = function(game, dt, ctx) {
            /*
            Render background, ship, invaders, bombs and rockets
            */
            ctx.clearRect(0, 0, oApplication.width, oApplication.height);
            
            //Background
            ctx.fillStyle = "#000";	//define color to use
    	    ctx.fillRect(0, 0, oApplication.width, oApplication.height); //Rect(x, y, width, height)

            //  Draw ship.
            ctx.fillStyle = '#00d621';
            ctx.fillRect(this.ship.x - (this.ship.width / 2), this.ship.y - (this.ship.height / 2), this.ship.width, this.ship.height);

            //  Draw invaders.
            ctx.fillStyle = '#ffffff';
            for(var i = 0; i < this.aInvaders.length; i++) {
                var invader = this.aInvaders[i];
                ctx.fillRect(invader.x - invader.width/2, invader.y - invader.height/2, invader.width, invader.height);
            }

            //  Draw bombs.
            ctx.fillStyle = '#a30000';
            for(i = 0; i < this.aBombs.length; i++) {
                var bomb = this.aBombs[i];
                ctx.fillRect(bomb.x - 2, bomb.y - 2, 4, 4);
            }

            //  Draw rockets.
            ctx.fillStyle = '#ff4ff1';
            for(i = 0; i < this.aRockets.length; i++) {
                var rocket = this.aRockets[i];
                ctx.fillRect(rocket.x, rocket.y - 2, 1, 4);
            }

        }; 
        
        
        //  Start the game.
        fGameStart();

        
        //  Listen for keyboard events.
        window.addEventListener("keydown", function keydown(e) {
            var keycode = e.which || window.event.keycode;
            //  Prevent default behaviour of left arrow, right arrow and spacebar (key codes 37,29 and 32)
            if(keycode == 37 || keycode == 39 || keycode == 32) {
                e.preventDefault();
            }
            fKeyDown(keycode);
        });
        window.addEventListener("keyup", function keydown(e) {
            var keycode = e.which || window.event.keycode;
            fKeyUp(keycode);
        }); 
        
    }
    
}) ();