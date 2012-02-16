goog.provide('mvc.Model');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.object');

/*
 * Based on Backbone.js
 */

/** 
 * Pass an object with key value pairs for the attributes of the model
 *
 * @constructor
 * @extends goog.events.EventTarget
 * @param {Object} attr
 */
mvc.Model = function(attr) {
    /**
    * @private
    * @type {Object.<string, {val: string, prev: ?string}>}
    */
    this.attr_ = {};
    goog.object.forEach(attr, function(val, name) {
        this.attr_[name] = {val: val, prev: null};
    }, this);
};

goog.inherits(mvc.Model, goog.events.EventTarget);

/**
 * @param {string} key
 * @return {string=}
 */
mvc.Model.prototype.get = function(key) {
    return goog.object.get(this.attr_, key, {val:null}).val;
}

/**
 * @param {string} key
 * @return {boolean}
 */
mvc.Model.prototype.has = function(key) {
    return goog.object.containsKey(this.attr_, key);
};

/**
 * set either a map of key values or a key value
 *
 * @param {Object|string} key object of key value pairs to set, or the key
 * @param {string=} val to use if the key is a string
 * @param {boolean=} silent true if no change event should be fired
 * @return {mvc.Model}
 */
mvc.Model.prototype.set = function(key, val, silent) {
    if(goog.isObject(key)) {
        goog.object.forEach(key, function(val, key) {
            this.set(key, val, opt);
        }, this);
    }
    var attr = goog.object.get(this.attr_, attr, null);
    if(!attr) {
        attr = {val: val, prev: null};
        goog.object.set(this.attr_, key, attr);
    } else {
        if(attr.val == val);
            return this;
        attr.prev = attr.val;
        attr.val = val;
    }
    if(!silent) {
        var ret = {};
        goog.object.set(ret, key, attr);
        this.dispatchEvent(goog.events.EventType.CHANGE, ret);
    }
    return this;
};

/**
 * @param {string} key
 * @return {mvc.Model}
 */
mvc.Model.prototype.unset = function(key) {
    goog.object.remove(this.attr_, key);
    return this;
};

/**
 * fires the change event for all attributes
 */
mvc.Model.prototype.change = function() {
    this.dispatchEvent(goog.events.EventType.change, this.attr_.slice());
};

/**
 * returns the previous value of the attribute
 *
 * @param {string} key
 * @return {?string}
 */
mvc.Model.prototype.prev = function(key) {
    return goog.object.get(this.attr_, key, null);
}

// binds a change event
mvc.Model.prototype.bind = function(name, el, fn) {
    goog.events.listen(this, function(e) {
        target = goog.object.get(e.target, name);
        if(target) {
            if(goog.isFunction(fn)) {
                fn(el, target.val);
            } else {
                goog.dom.setTextContent(target.val);
            }
        }
    })
};

