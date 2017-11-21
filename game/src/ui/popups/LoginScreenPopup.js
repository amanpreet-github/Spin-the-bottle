var LoginScreenPopup = Popup.extend({
    ctor: function (opts) {
        this._super(res.login_screen_bg);

        this.setAnchorPoint(0.5, 0.5);
        this.token = opts.token;

        this.setName("login_popup");

        this._init();
    },
    _init: function () {

        var facebookLoginBtn = new ccui.Button(res.facebook_btn);
        facebookLoginBtn.setAnchorPoint(0.5, 0.5);
        facebookLoginBtn.setPosition(this.getContentSize().width / 2 - 10, this.getContentSize().height / 2 + 100);
        facebookLoginBtn.addClickEventListener(this._loginWithFacebook.bind(this));
        this.addChild(facebookLoginBtn);

        var playersEmailInput = new ccui.TextField("Choose your username", cc.mainGame._font, 40);
        playersEmailInput.setAnchorPoint(0.5, 0.5);
        playersEmailInput.setTextColor(cc.color(0, 0, 0));
        playersEmailInput.setName('input');
        playersEmailInput.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2 - 125);
        this.addChild(playersEmailInput, 0);

        var submitButton = new ccui.Button(res.submit_btn);
        submitButton.setAnchorPoint(0.5, 0.5);
        submitButton.setScale(0.7);
        submitButton.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2 - 220);
        submitButton.addClickEventListener(this._onStart.bind(this));
        this.addChild(submitButton);
    },

    _loginWithFacebook: function () {
        var self = this;
        FB.getLoginStatus(function (response) {
            self._statusChangeCallback(response);
        });
    },
    _statusChangeCallback: function (response) {
        var self = this;
        if (response.status === 'connected') {
            // Logged into your app and Facebook.
            self._testAPI();
        } else {
            // The person is not logged into your app or we are unable to tell.
            FB.login(function (response) {
                if (response.status === 'connected') {
                    self._testAPI();
                } else {
                    cc.log('Please Login !');
                }
            }, {scope: 'public_profile'});
        }
    },
    _testAPI: function () {
        var self = this;

        FB.api('/me', {fields: 'picture, name'}, function (response) {
            cc.log('Successful login for: ', response);
            if (self.token) {
                cc.socket.emit("JOIN_GAME", {
                    token: self.token,
                    username: response.name,
                    picture: "http://graph.facebook.com/" + response.id + "/picture?type=large"
                });
                cc.gameLoader.text.setString("Waiting for Players...");
                cc.gameLoader.show();

                self.close();
            } else {
                cc.socket.emit("START_NEW_GAME", {
                    username: response.name,
                    picture: "http://graph.facebook.com/" + response.id + "/picture?type=large"
                });
            }

            cc.mainGame.username = response.name;
        });
    },
    _onStart: function () {
        var input = this.getChildByName("input");
        var name = input.getString();

        if (!name) {
            return;
        }

        if (this.token) {
            cc.socket.emit("JOIN_GAME", {token: this.token, username: name});
            cc.gameLoader.text.setString("Waiting for Players...");
            cc.gameLoader.show();

            this.close();
        } else {
            cc.socket.emit("START_NEW_GAME", {username: name});
        }

        cc.mainGame.username = name;
    }
});