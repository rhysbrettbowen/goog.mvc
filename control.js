// v0.1
goog.provide('mvc.Control');

goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.ui.Component');

/**
 * instantiate with a mvc.Model
 *
 * @constructor
 * @param {mvc.Model} model
 * @extends {goog.ui.Component}
 */
mvc.Control = function(model) {
    this.setModel(model);
};

goog.inherits(mvc.Control, goog.ui.Component);

// backbone.js views are just like goog.ui.component, this is more of an interface

/**
 * remove the element and dispose
 */
mvc.Control.prototype.remove = function() {
    goog.dom.removeNode(this.getElement());
    this.dispose();
};

mvc.Control.prototype.render = function(parent) {
    this.decorate(parent);
    return this;
};

mvc.Control.prototype.init = goog.abstractMethod;

mvc.Control.prototype.createDom = function() {
    this.setElementInternal(goog.dom.createDom("DIV"));
};

mvc.Control.prototype.enterDocument = function() {
    this.init();
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
mvc.Control.prototype.delegateEvents = function(events) {
    goog.object.forEach(events, function(val, key) {
        goog.events.listen(this.getElement(), key.replace(/\s.*/,''), function(e) {
            if(goog.dom.classes.has(e.target, key.replace(/.*\./,'')))
                events[key](e);
        }, false, this);
    }, this);
};

/**
 * pass in a string like "#elementId", ".className" or "tagName[ .className]"
 * to get array of elements with the id, class or tag and class name
 *
 * @param {string} selector
 * @return {?goog.array.ArrayLike}
 */
mvc.Control.prototype.getEls = function(selector) {
    if(selector.charAt(0) == '.') {
        return goog.dom.getElementsByClass(selector.substring(1), /** @type {Element} */(this.getElement())) || [];
    }
    if(selector.charAt(0) == '#') {
        return [goog.dom.getElement(selector)];
    }
    return goog.dom.getElementsByTagNameAndClass(selector.replace(/\s.*/,''), selector.replace(/.*\./,'')||null, /** @type {Element} */(this.getElement()));
};


