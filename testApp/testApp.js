
document.write('<div id="note"><div id="text"></div></div><div id="new_input"><textarea id="new_text"></textarea><button id="new_button">change text</button></div>');

var model = new mvc.Model({'text':'default'});

goog.events.listen(goog.dom.getElement('new_button'), goog.events.EventType.CLICK,
    function(e) {
        model.set('text', goog.dom.getElement('new_text').value);
    });

var control = new mvc.Control(model);
control.init = function() {
    this.getModel().bind('text', goog.dom.getElement('text'));
};
control.render(goog.dom.getElement('note'));
