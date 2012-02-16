goog.provide('goog.mvc.Model');

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
goog.mvc.Model = function(attr) {
    /**
    * @private
    * @type {Object.<string, {val: string, prev: ?string}>}
    */
    this.attr_ = {};
    goog.object.forEach(attr, function(val, name) {
        this.attr_[name] = {val: val, prev: null};
    }, this);
    this.init();
};

goog.inherits(goog.mvc.Model, goog.events.EventTarget);

/* this should be overriden for initialisation */
goog.mvc.model.prototype.init = goog.abstractMethod;

/**
 * @param {string} key
 * @return {string=}
 */
goog.mvc.model.prototype.get = function(key) {
    return goog.object.get(this.attr_, key, null);
}

/**
 * @param {string} key
 * @return {boolean}
 */
goog.mvc.model.prototype.has = function(key) {
    return goog.object.containsKey(this.attr_, key);
};

/**
 * set either a map of key values or a key value
 *
 * @param {Object|string} key object of key value pairs to set, or the key
 * @param {string=} val to use if the key is a string
 * @param {boolean=} silent true if no change event should be fired
 * @return {goog.mvc.model}
 */
goog.mvc.model.prototype.set = function(key, val, silent) {
    if(goog.isObject(key)) {
        goog.object.forEach(key, function(val, key) {
            this.set(key, val, opt);
        }, this);
    }
    attr = goog.object.get(this.attr_, attr, null);
    if(!attr) {
        attr = {val: val, prev: null};
        goog.object.set(this.attr_, key, attr);
    } else {
        if attr.val == val;
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
 * @return {boolean} if the key existed and has been unset
 */
goog.mvc.model.prototype.unset = function(key) {
    return goog.object.remove(this.attr_, key);
};

/**
 * fires the change event for all attributes
 */
goog.mvc.model.prototype.change = function() {
    this.dispatchEvent(goog.events.EventType.change, this.attr_.slice());
};

/**
 * returns the previous value of the attribute
 *
 * @param {string} key
 * @return {?string}
 */
goog.mvc.model.prototype.prev = function(key) {
    return goog.object.get(this.attr_, key, null);
}

// binds a change event
goog.mvc.model.prototype.bind = function(name, el, fn) {
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

