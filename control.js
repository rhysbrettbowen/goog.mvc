goog.provide('goog.mvc.control');

goog.require('goog.array');
goog.require('goog.ui.Component');

/**
 * @constructor
 *
 * @extends {goog.ui.Component}
 */
goog.mvc.control = function(model) {
    this.setModel(model);
};

goog.inherits(goog.mvc.control, goog.ui.Component);

// backbone.js views are just like goog.ui.component, this is more of an interface

goog.mvc.control.prototype.remove = function() {
    goog.dom.removeNode(this.getElement());
    this.dispose();
};

goog.mvc.control.prototype.render = function() {
    goog.base(this, 'render', this.getElement(), true);
    return this;
};

goog.mvc.control.prototype.delegateEvents = function(events) {
    goog.object.forEach(events, function(val, key) {
        goog.events.listen(this.getElement(), key.replace(/\s.*/,''), function(e) {
            if(goog.dom.classes.has(e.target, key.replace(/.*\./,'')))
                events.val(e);
        }, false, this);
    }, this);
}
