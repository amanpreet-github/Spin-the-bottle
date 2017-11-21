var Loader = Popup.extend({
    ctor: function (opts) {
        this._super(res.blank);
        this.setAnchorPoint(0.5, 0.5);
        this.setPosition(800, 450);
        this.setContentSize(1600, 900);

        var self = this;
        this.touch = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function () {
                return true;
            }
        });

        cc.eventManager.addListener(this.touch, this);
        this._initUI();
        this.retain();
    },
    _initUI: function () {
        this.bgOverlay.setOpacity(180);
        this.bgOverlay.retain();

        var text = new ccui.Text("Loading ...", cc.mainGame._font, 50);
        text.setAnchorPoint(0.5, 0.5);
        text.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        text.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2);
        this.addChild(text, 0);

        var nextTry = new ccui.Text("Next Spin in: ", cc.mainGame._font, 30);
        nextTry.setAnchorPoint(0.5, 0.5);
        nextTry.setName("next");
        nextTry.setVisible(false);
        nextTry.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        nextTry.setPosition(this.getContentSize().width / 2, 130);
        this.addChild(nextTry, 0);

        var timer = new ccui.Text("00:10", cc.mainGame._font, 40);
        timer.setAnchorPoint(0.5, 0.5);
        timer.setName("timer");
        timer.setVisible(false);
        timer.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        timer.setPosition(this.getContentSize().width / 2, 80);
        this.addChild(timer, 0);

        this.text = text;
        this.nextTry = nextTry;
        this.timer = timer;
    }
});