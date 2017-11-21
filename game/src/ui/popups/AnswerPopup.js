var AnswerPopup = Popup.extend({
    ctor: function (opts) {
        this._super(res.answer_popup_bg);

        this.setAnchorPoint(0.5, 0.5);

        this.question = opts.question;
        this._init();
    },
    _init: function () {

        var question = new ccui.Text(this.question, cc.mainGame._font, 40);
        question.setAnchorPoint(0.5, 0.5);
        question.setTextColor(cc.color(255, 255, 255));
        question.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2 + 50);
        this.addChild(question);

        var answer = new ccui.TextField("Click here to type your answer", cc.mainGame._font, 40);
        answer.setAnchorPoint(0.5, 0.5);
        answer.setTextColor(cc.color(0, 0, 0));
        answer.setName('input');
        //question.setContentSize(100, 100);
        answer.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2 - 100);
        this.addChild(answer, 0);

        var submitButton = new ccui.Button(res.answer_popup_btn);
        submitButton.setAnchorPoint(0.5, 0.5);
        submitButton.setScale(0.7);
        submitButton.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2 - 250);
        submitButton.addClickEventListener(this._onSubmit.bind(this));
        this.addChild(submitButton);
    },
    _onSubmit: function () {
        var input = this.getChildByName("input");
        var answer = input.getString();

        if (!answer) return;

        cc.log(answer);

        cc.socket.emit("ANSWER_SUBMITTED", {answer: answer, token: cc.mainGame.gameToken});
        this.close();
    }
});