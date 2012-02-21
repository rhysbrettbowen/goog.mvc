
document.write('<div id="note"><div id="text"></div><div id="new_input"><textarea class="new_text"></textarea><textarea class="new_text"></textarea></div></div>');

var schema = new mvc.model.Schema({'text': /^[a-z]*$/i});

var model = new mvc.Model({'text': 'default'}, schema);

var control = new mvc.Control(model);

control.init = function() {
    
    var model = this.getModel();
    model.bind('text', this.getEls('.new_text'), function(el, val) {
            el.value = val;
    });
            
    this.delegateEvents({
        'keyup .new_text': function(e) {
            model.set('text', e.target.value);
        }
    });
};

control.render(goog.dom.getElement('note'));

