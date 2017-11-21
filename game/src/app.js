var GameLayer = cc.Layer.extend({
    sprite: null,
    ctor: function () {
        this._super();

        this._prevAngle = 0;
        this._previousForce = 0;
        this._currentRotatingForce = 0;
        this._maxRotation = 25;

        this.eventEmitter = new EventEmitter();

        this.username = null;
        this.canSpin = false;
        cc.mainGame = this;

        this._font = cc.sys.isNative ? "res/fonts/LuckiestGuy-Regular.ttf" : "LuckiestGuy-Regular";

        var size = cc.winSize;

        var backgroundLayer = new cc.Layer();
        this.addChild(backgroundLayer);

        var background = new cc.Sprite(res.background);
        background.setAnchorPoint(0.5, 0.5);
        background.setPosition(size.width / 2, size.height / 2);
        background.setScale(1);
        backgroundLayer.addChild(background, 0);

        var playerLayer = new PlayerLayer();
        playerLayer.setName("player-layer");
        this.addChild(playerLayer);

        cc.gameLoader = new Loader();
        cc.gameLoader.setVirtualParent(this);

        var gameTitle = new ccui.Text("Spin the Bottle!", this._font, 50);
        gameTitle.x = size.width / 2;
        gameTitle.y = size.height / 2 + 380;
        backgroundLayer.addChild(gameTitle, 5);

        var eventListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            // When "swallow touches" is true, then returning 'true' from the onTouchBegan method will "swallow" the touch event, preventing other listeners from using it.
            swallowTouches: true,
            //onTouchBegan event callback function
            onTouchBegan: function (touch, event) {
                // event.getCurrentTarget() returns the *listener's* sceneGraphPriority node.
                var target = event.getCurrentTarget();

                //Get the position of the current point relative to the button
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                //Check the click area
                if (cc.rectContainsPoint(rect, locationInNode)) {
                    if (target.onTouchBegan) {
                        target.onTouchBegan(touch, event);
                    }
                    return true;
                }
                return false;
            },
            //Trigger when moving touch
            onTouchMoved: function (touch, event) {
                var target = event.getCurrentTarget();
                //Move the position of current button sprite
                if (target.onTouchMove) {
                    target.onTouchMove(touch, event);
                }
            },
            //Process the touch end event
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();

                if (target.onTouchEnded) {
                    target.onTouchEnded(touch, event);
                }
            }
        });

        this.bottle = new cc.Sprite(res.bottle);
        this.bottle.setRotation(0);
        this.bottle.setScale(0.4);
        this.bottle.setAnchorPoint(0.5, 0.5);
        this.bottle.attr({
            x: size.width / 2,
            y: size.height / 2
        });
        backgroundLayer.addChild(this.bottle, 0);

        cc.eventManager.addListener(eventListener, this.bottle);

        this.bottle.onTouchBegan = this._onTouchBegan.bind(this);
        this.bottle.onTouchMove = this._onTouchMove.bind(this);
        this.bottle.onTouchEnded = this._onTouchEnded.bind(this);

        this.scheduleUpdate();

        var joinToken = window.location.search.split("=") ? window.location.search.split("=")[1] : null;

        if (joinToken) {
            this.gameToken = joinToken;

            var login = new LoginScreenPopup({token: joinToken});
            login.setVirtualParent(this);
            login.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2);
            login.show();

        } else {
            var popup = new StartGamePopup();
            popup.setVirtualParent(this);
            popup.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2);
            popup.show();
        }

        this._addSocketListeners();

        return true;
    },
    _addSocketListeners: function () {
        cc.socket.on("ROOM_CREATED", this._hideLoginPopupAndShowAddPlayersPopup.bind(this));
        cc.socket.on("ADD_PLAYER", this._addPlayerToGame.bind(this));
        cc.socket.on("UPDATE_ROOM", this._updateRoom.bind(this));
        cc.socket.on("GAME_START", this._startGame.bind(this));
        cc.socket.on("BOTTLE_MOVE", this._bottleMove.bind(this));
        cc.socket.on("ROTATE_BOTTLE", this._rotateBottle.bind(this));
        cc.socket.on("ASK_QUESTION", this._askQuestion.bind(this));
        cc.socket.on("QUESTION_SUBMITTED", this._questionSubmitted.bind(this));
        cc.socket.on("ANSWER_SUBMITTED", this._answerSubmitted.bind(this));
        cc.socket.on("SPINNING_PLAYER", this._updateSpinningPlayer.bind(this));
        cc.socket.on("GAME_FULL", this._gameFull.bind(this));
    },
    _gameFull: function () {
        cc.gameLoader.text.setString("Sorry! This game room is full!");
    },
    _updateSpinningPlayer: function (data) {
        this.canSpin = Boolean(data.username === this.username);

        var playerLayer = this.getChildByName("player-layer");
        playerLayer.highlightSpinningPlayerWithName(data.username);
    },
    _answerSubmitted: function (data) {
        cc.gameLoader.close();
        cc.gameLoader.text.setString("Answer: \n" + data.answer);
        cc.gameLoader.show();

        cc.gameLoader.nextTry.setVisible(true);
        cc.gameLoader.timer.setVisible(true);

        var time = 10;
        var self = this;
        var interval = setInterval(function () {
            if (time === 0) {
                clearInterval(interval);
                cc.gameLoader.close();
                cc.gameLoader.nextTry.setVisible(false);
                cc.gameLoader.timer.setVisible(false);
                cc.gameLoader.timer.setString("00:10");
                self._startNewSpin.call(self);
            }
            cc.gameLoader.timer.setString("00:0" + --time);
        }, 1000);
    },
    _startNewSpin: function () {
        if (cc.mainGame.isSelectedMe) {
            cc.socket.emit("SPINNING_PLAYER", {username: this.username, token: cc.mainGame.gameToken});
        }
    },
    _questionSubmitted: function (data) {
        if (cc.mainGame.isSelectedMe) {
            var popup = new AnswerPopup({question: data.question});
            popup.setVirtualParent(this);
            popup.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2);
            popup.show();
        } else {
            cc.gameLoader.text.setString("Current Question Asked: \n " + data.question);

            if (!cc.gameLoader.parent) {
                cc.gameLoader.show();
            }
        }
    },
    _askQuestion: function () {
        cc.log("Ask Question");
        cc.gameLoader.close();

        var popup = new AskQuestionPopup();
        popup.setVirtualParent(this);
        popup.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2);
        popup.show();

        this.askQuestionPopupShown = true;
    },
    _rotateBottle: function (data) {
        this._currentRotatingForce = data.rotation;
        this.eventEmitter.once("BOTTLE_STOPPED", this._bottleStopped.bind(this));
    },
    _bottleMove: function (data) {
        this.bottle.setRotation(data.rotation);
    },
    _startGame: function (spinningUser) {
        cc.gameLoader.close();

        this.canSpin = Boolean(spinningUser.username === this.username);

        var playerLayer = this.getChildByName("player-layer");
        playerLayer.highlightSpinningPlayer(1);
    },
    _updateRoom: function (existingPlayers) {
        if (!existingPlayers) {
            return;
        }

        var self = this;
        existingPlayers.forEach(function (player) {
            self._addPlayerToGame(player);
        })
    },
    _addPlayerToGame: function (data) {
        var playerLayer = this.getChildByName("player-layer");
        playerLayer.addPlayer(data);
    },
    _hideLoginPopupAndShowAddPlayersPopup: function (data) {
        var login = this.getChildByName("login_popup");
        if (login) login.close();

        this.gameToken = data.token;

        var popup = new AddPlayersPopup({token: data.url});
        popup.setVirtualParent(this);
        popup.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2);
        popup.show();
    },
    _onTouchBegan: function (touch, event) {
        if (!this.canSpin) {
            return
        }

        var targetLocation = this.bottle.getPosition();
        var touchLocation = touch.getLocation();

        var diff = {x: targetLocation.x - touchLocation.x, y: targetLocation.y - touchLocation.y};

        this._prevAngle = cc.radiansToDegrees(Math.atan2(diff.x, diff.y));
    },
    _onTouchMove: function (touch, event) {
        if (!this.canSpin) {
            return
        }

        var targetLocation = this.bottle.getPosition();
        var touchLocation = touch.getLocation();
        var diff = {x: targetLocation.x - touchLocation.x, y: targetLocation.y - touchLocation.y};
        var angle = cc.radiansToDegrees(Math.atan2(diff.x, diff.y));

        this.bottle.setRotation(this.bottle.getRotation() + (angle - this._prevAngle));

        cc.socket.emit("BOTTLE_MOVE", {rotation: this.bottle.getRotation(), token: this.gameToken});

        this._prevAngle = angle;

        this._previousForce += 0.1;
    },
    _onTouchEnded: function (touch, event) {
        if (!this.canSpin) {
            return
        }

        this._currentRotatingForce = Math.min(parseFloat(this._previousForce), this._maxRotation);
        this._previousForce = 0;

        cc.socket.emit("ROTATE_BOTTLE", {rotation: this._currentRotatingForce, token: this.gameToken});

        this.eventEmitter.once("BOTTLE_STOPPED", this._bottleStopped.bind(this));
    },
    _bottleStopped: function () {
        var playerLayer = this.getChildByName("player-layer");
        var angle = this.bottle.getRotation() % 360;

        if (Boolean(angle > 0 && angle <= 90)) {
            playerLayer.highlightPlayer(2);
        }

        if (Boolean(angle > 90 && angle <= 180)) {
            playerLayer.highlightPlayer(4);
        }

        if (Boolean(angle > 180 && angle <= 270)) {
            playerLayer.highlightPlayer(3);
        }

        if (Boolean(angle > 270 && angle <= 360)) {
            playerLayer.highlightPlayer(1);
        }

        this.canSpin = false;

        if (!this.askQuestionPopupShown) {
            cc.gameLoader.text.setString("Waiting for Question ..");
            cc.gameLoader.show();
        }

    },
    update: function (deltaT) {
        this._currentRotatingForce -= 0.017;

        if (this._currentRotatingForce > 0) {
            this.bottle.setRotation(this.bottle.getRotation() + this._currentRotatingForce);
        } else {
            this.eventEmitter.emit("BOTTLE_STOPPED");
        }
    }
});

var GameScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer);
    }
});

