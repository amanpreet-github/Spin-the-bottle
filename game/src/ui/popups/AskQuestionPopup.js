var AskQuestionPopup = Popup.extend({
    ctor: function (opts) {
        this._super(res.ask_question_bg);

        this.setAnchorPoint(0.5, 0.5);

        this._init();
    },
    _init: function () {

        var question = new ccui.TextField("Click here to type your question", cc.mainGame._font, 30);
        question.setAnchorPoint(0.5, 0.5);
        question.setTextColor(cc.color(0, 0, 0));
        question.setName('input');
        //question.setContentSize(100, 100);
        question.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2 - 50);
        this.addChild(question, 0);

        var submitButton = new ccui.Button(res.ask_question_btn);
        submitButton.setAnchorPoint(0.5, 0.5);
        submitButton.setScale(0.7);
        submitButton.setPosition(this.getContentSize().width / 2, this.getContentSize().height / 2 - 200);
        submitButton.addClickEventListener(this._onSubmit.bind(this));
        this.addChild(submitButton);
    },
    _onSubmit: function () {
        var input = this.getChildByName("input");
        var question = input.getString();

        if (!question) return;

        cc.log(question);

        cc.socket.emit("QUESTION_SUBMITTED", {question: question, token: cc.mainGame.gameToken});
        cc.mainGame.askQuestionPopupShown = false;
        this.close();
    }
});