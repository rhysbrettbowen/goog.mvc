
document.write('<div id="note"><div><input type="text" id="idinput" class="idinput"/><input type="button" value="get Id" id="idbutton" class="idbutton"></div><div id="text"></div><div id="new_input"><textarea class="new_text"></textarea><textarea class="new_text"></textarea></div></div>');

// create a sync to localStorage
var sync = new mvc.sync.Local();

// text must have newlines beginning with a hash
var schema = new mvc.model.Schema({'text': /copyright/});

// create a new model and push to localStorage
var model = new mvc.Model({'text': 'default'}, schema, sync);
model.save();

// show the models ID for later use
goog.dom.getElement("idinput").value = model.get("id");

// create a new control
var control = new mvc.Control(model);

control.init = function() {
    
    var model = this.getModel();
    
    // bind model changes on text to update the text fields
    model.bind('text', this.getEls('.new_text'), function(el, val) {
            el.value = val;
    });
            
    this.delegateEvents({
        // when text is modified save to model then save to data storage
        'keyup .new_text': goog.bind(function(e) {
            this.getModel().set('text', e.target.value);
            this.getModel().save();
        }, this),
        // when clicking the get id button
        'click .idbutton': goog.bind(function(e) {
            // remove current model
            this.getModel().dispose();
            // retrieve the saved model
            var id = goog.dom.getElement('idinput').value;
            var model = new mvc.Model({'id' : id}, schema, sync);
            model.fetch();
            // put bindings on new model's text to text fields
            model.bind('text', this.getEls('.new_text'), function(el, val) {
                    el.value = val;
            });
            // change this components model
            this.setModel(model);
            // fire a change event to update the component
            model.change();
        }, this)
    });
};

control.render(goog.dom.getElement('note'));

