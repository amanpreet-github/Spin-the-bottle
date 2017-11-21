var AddPlayersPopup = Popup.extend({
    ctor: function (opts) {
        this._super(res.add_players_popup_bg);

        this.setAnchorPoint(0.5, 0.5);

        this.token = opts.token;

        this._init();
    },
    _init: function () {
        var playersEmailInput = new ccui.Text(this.token, cc.mainGame._font, 40);
        playersEmailInput.setAnchorPoint(0.5, 0.5);
        playersEmailInput.setTextColor(cc.color(0, 0, 0));
        playersEmailInput.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2 - 80);
        this.addChild(playersEmailInput, 0);

        var submitButton = new ccui.Button(res.copy_to_clipboard_btn);
        submitButton.setAnchorPoint(0.5, 0.5);
        submitButton.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2 - 200);
        submitButton.addClickEventListener(this._onCopy.bind(this));
        this.addChild(submitButton);

        var input = document.createElement("input");
        input.setAttribute("id", "token");
        input.setAttribute("value", this.token);
        document.body.appendChild(input);
    },
    _onCopy: function () {
        var copyText = document.getElementById("token");
        copyText.select();
        document.execCommand("Copy");

        this.close();
        cc.gameLoader.text.setString("Waiting for Players...");
        cc.gameLoader.show();
    }
});