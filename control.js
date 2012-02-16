goog.provide('goog.mvc.Control');

goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.ui.Component');

/**
 * instantiate with a goog.mvc.Model
 *
 * @constructor
 * @param {goog.mvc.Model} model
 * @extends {goog.ui.Component}
 */
goog.mvc.Control = function(model) {
    this.setModel(model);
};

goog.inherits(goog.mvc.control, goog.ui.Component);

// backbone.js views are just like goog.ui.component, this is more of an interface

/**
 * remove the element and dispose
 */
goog.mvc.Control.prototype.remove = function() {
    goog.dom.removeNode(this.getElement());
    this.dispose();
};

goog.mvc.Control.prototype.render = function() {
    goog.base(this, 'render', this.getElement(), true);
    return this;
};


/**
 * pass an object where the key is "eventType .className" and the value is the
 * event handler function
 * example:
 * var events = {}
 * goog.object.set(events, goog.events.EventType.CLICK+" ."+goog.getCssName('button'), function(e) {alert("hello");});
 *
 * @param {Object.<string, Function>} events
 */
goog.mvc.Control.prototype.delegateEvents = function(events) {
    goog.object.forEach(events, function(val, key) {
        goog.events.listen(this.getElement(), key.replace(/\s.*/,''), function(e) {
            if(goog.dom.classes.has(e.target, key.replace(/.*\./,'')))
                events.val(e);
        }, false, this);
    }, this);
};


