var StartGamePopup = Popup.extend({
    ctor: function (opts) {
        this._super(res.start_game_popup_bg);

        this.setAnchorPoint(0.5, 0.5);

        this._init();
    },
    _init: function () {
        var submitButton = new ccui.Button(res.start_game_btn);
        submitButton.setAnchorPoint(0.5, 0.5);
        submitButton.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2 - 150);
        submitButton.addClickEventListener(this._onStart.bind(this));
        this.addChild(submitButton);
    },
    _onStart: function () {
        var login = new LoginScreenPopup({});
        login.setVirtualParent(this.parent);
        login.setPosition(this.parent.getContentSize().width / 2, this.parent.getContentSize().height / 2);
        login.show();

        this.close();
    }
});