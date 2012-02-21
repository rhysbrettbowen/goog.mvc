
document.write('<div id="note"><div><input type="text" id="idinput" class="idinput"/><input type="button" value="get Id" id="idbutton" class="idbutton"></div><div id="text"></div><div id="new_input"><textarea class="new_text"></textarea><textarea class="new_text"></textarea></div></div>');

var sync = new mvc.sync.Local();

var schema = new mvc.model.Schema({'text': /\n#/});

var model = new mvc.Model({'text': 'default'}, schema, sync);
model.save();

goog.dom.getElement("idinput").value = model.get("id");

var control = new mvc.Control(model);

control.init = function() {
    
    var model = this.getModel();
    model.bind('text', this.getEls('.new_text'), function(el, val) {
            el.value = val;
    });
            
    this.delegateEvents({
        'keyup .new_text': goog.bind(function(e) {
            this.getModel().set('text', e.target.value);
            this.getModel().save();
        }, this),
        'click .idbutton': goog.bind(function(e) {
            this.getModel().dispose();
            var id = goog.dom.getElement('idinput').value;
            var model = new mvc.Model({'id' : id}, schema, sync);
            model.fetch();
            model.bind('text', control.getEls('.new_text'), function(el, val) {
                    el.value = val;
            });
            this.setModel(model);
            model.change();
        }, this)
    });
};

control.render(goog.dom.getElement('note'));

