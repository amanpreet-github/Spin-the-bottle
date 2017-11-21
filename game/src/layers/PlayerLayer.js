var PlayerLayer = cc.Layer.extend({
    ctor: function () {
        this._super();

        this._initPlayerPositions();
    },
    highlightPlayer: function (slot) {
        cc.log("Player Highlight =>", slot);

        this._setFrameToNormal();

        var player = this.getChildByName("player_" + slot);
        if (player) {
            var image = player.getChildByName("picture");
            var initialScale = image.getScale();
            var action = cc.sequence(
                cc.scaleTo(0.5, initialScale + 0.5, initialScale + 0.5),
                cc.scaleTo(0.5, initialScale, initialScale),
                cc.callFunc(this._onSelectedAnimFinished.bind(this, slot, res.profile_normal_frame_selected))
            );
            action.startWithTarget(image);
            image.runAction(action);
        }

        var name = this.getChildByName("name_" + slot).getString();

        cc.mainGame.isSelectedMe = Boolean(cc.mainGame.username === name);

        cc.socket.emit("PLAYER_SELECTED", {username: name, token: cc.mainGame.gameToken});
    },
    highlightSpinningPlayer: function (slot) {
        cc.log("Player Spinning Highlight =>", slot);

        this._setFrameToNormal();

        var player = this.getChildByName("player_" + slot);
        if (player) {
            var image = player.getChildByName("picture");
            var initialScale = image.getScale();
            var action = cc.sequence(
                cc.scaleTo(0.5, initialScale + 0.5, initialScale + 0.5),
                cc.scaleTo(0.5, initialScale, initialScale),
                cc.callFunc(this._onSelectedAnimFinished.bind(this, slot, res.profile_normal_frame_spin))
            );
            action.startWithTarget(image);
            image.runAction(action);
        }

    },
    highlightSpinningPlayerWithName: function (username) {
        var children = this.getChildren();
        var self = this;
        children.forEach(function (item) {
            if (item.getString && item.getString() === username) {
                var slot = item.getName().split("_");
                cc.log(">?>>>>>>>", slot);
                self.highlightSpinningPlayer(slot[1]);
            }
        });

        /*for (var slot in this.playerSlots) {
         if (this.playerSlots.hasOwnProperty(slot) && this.playerSlots[slot].player === username) {
         this.highlightSpinningPlayer(slot);
         break;
         }
         }*/
    },
    addPlayer: function (data) {
        cc.log(data);
        this._addPlayer(data.username, data.picture);
    },
    _initPlayerPositions: function () {
        this.playerSlots = {
            1: {
                position: {x: this.getContentSize().width / 2 - 500, y: this.getContentSize().height / 2 + 200},
                player: null
            },
            2: {
                position: {x: this.getContentSize().width / 2 + 500, y: this.getContentSize().height / 2 + 200},
                player: null
            },
            3: {
                position: {x: this.getContentSize().width / 2 - 500, y: this.getContentSize().height / 2 - 200},
                player: null
            },
            4: {
                position: {x: this.getContentSize().width / 2 + 500, y: this.getContentSize().height / 2 - 200},
                player: null
            }
        };
    },
    _onSelectedAnimFinished: function (slot, texture) {
        var frame = this.getChildByName("frame_" + slot);
        frame.setTexture(texture);
    },
    _setFrameToNormal: function () {
        for (var i = 1; i <= 4; i++) {
            var frame = this.getChildByName("frame_" + i);
            if (frame) frame.setTexture(res.profile_normal_frame);
        }
    },
    _addPlayer: function (name, profilePicture) {
        var slotAvailable = null;

        for (var slot in this.playerSlots) {
            if (this.playerSlots.hasOwnProperty(slot) && !this.playerSlots[slot].player) {
                slotAvailable = slot;
                break;
            }
        }

        var slotData = this.playerSlots[slotAvailable];
        this.playerSlots[slotAvailable].player = name;

        var picture = new cc.Sprite(res.default_picture);
        picture.setName("picture");
        var mask = new cc.Sprite(res.picture_mask);

        var player = new cc.ClippingNode(mask);
        player.setAlphaThreshold(0.9);
        player.addChild(picture);
        player.setAnchorPoint(0.5, 0.5);
        player.setScale(0.5);
        player.setPosition(slotData.position.x, slotData.position.y);
        player.setName("player_" + slotAvailable);
        this.addChild(player);

        if (profilePicture) {
            cc.loader.loadImg(profilePicture, {isCrossOrigin: true}, function (err, image) {
                var pic = new cc.Sprite(image);
                pic.setName("picture");
                pic.setScale(2.5);
                player.removeChild(picture);
                player.addChild(pic);
            });
        }

        var normalFrame = new cc.Sprite(res.profile_normal_frame);
        normalFrame.setAnchorPoint(0.5, 0.5);
        normalFrame.setScale(0.5);
        normalFrame.setPosition(slotData.position.x, slotData.position.y);
        normalFrame.setName("frame_" + slotAvailable);
        this.addChild(normalFrame);

        var playerName = new ccui.Text(name, cc.mainGame._font, 30);
        playerName.setAnchorPoint(0.5, 0.5);
        playerName.setPosition(slotData.position.x, slotData.position.y - 150);
        playerName.setName("name_" + slotAvailable);
        this.addChild(playerName, 0);
    }
});
