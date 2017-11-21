var Popup = cc.Sprite.extend({
    ctor: function (opts) {
        this._super(opts);

        this._popupParent = null;
        this.setVisible(false);

        var touch = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function () {
                return true;
            }
        });
        cc.eventManager.addListener(touch, this);

        this._setupBGOverlay();
        this._setupCloseButton();
    },
    _setupBGOverlay: function () {
        this.bgOverlay = new cc.LayerColor(cc.color(10, 10, 10));
        this.bgOverlay.setName('bg-overlay');
        this.bgOverlay.setOpacity(100);
        this.bgOverlay.setAnchorPoint(0, 0);
        this.bgOverlay.setContentSize(1600, 900);
        this.bgOverlay.setPosition(0, 0);
    },
    _setupCloseButton: function () {
        /*this.closeButton = new ccui.Button(res.close_btn, res.close_btn, res.close_btn);
        this.closeButton.setPressedActionEnabled(true);
        this.closeButton.setScale(0.46);
        this.closeButton.setName("close-btn");
        this.closeButton.setZoomScale(0.1);
        this.closeButton.setAnchorPoint(0, 0);
        this.closeButton.setPosition(550, 335);
        this.closeButton.addClickEventListener(this.close.bind(this));
        this.addChild(this.closeButton, 0);*/
    },
    setVirtualParent: function (parent) {
        this._popupParent = parent;
    },
    show: function () {
        //remove if already attached to a parent
        if (this.parent) {
            throw new Error("Popup already visible");
        }

        if (!this._popupParent) {
            throw new Error("Popup parent missing, use setVirtualParent method to set parent before calling show");
        }

        this._popupParent.addChild(this.bgOverlay);
        this._popupParent.addChild(this);
        this.setVisible(true);
    },
    close: function () {
        if (this.parent) {
            this.parent.removeChild(this.bgOverlay);
            this.parent.removeChild(this);
        }
    }
});