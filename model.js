goog.provide('goog.mvc.model');

goog.require('goog.array');
goog.require('goog.events.EventTarget');
goog.require('goog.object');

/*
 * Based on Backbone.js
 */

/**
 * @extends goog.events.EventTarget
 * @param {Object} attr
 */
goog.mvc.model = function(attr) {
    /** @private */
    this.attr_ = [];
    goog.object.forEach(attr, function(val, name) {
        this.attr_.push({name: name, val: val});
    }, this);
    this.init();
}

/* this should be overriden for initialisation */
goog.mvc.model.prototype.init = goog.nullFunction;

/**
 * @param {string} key
 */
goog.mvc.model.prototype.get = function(key) {
    var ret = goog.array.find(this.attr_, function(attr) {
        return attr.name == key;
    });
    if ret
        return ret.value;
    return null;
}

/**
 * @param {string} key
 * @return {boolean}
 */
goog.mvc.model.prototype.has = function(key) {
    return !!goog.array.find(this.attr_, function(attr) {
        return attr.name == key;
    });
};

/**
 * @param {Object|string} key
 * @param {string=} val
 * @param {Object=} opt
 */
goog.mvc.model.prototype.set = function(key, val, opt) {
    if(goog.isObject(key)) {
        goog.object.forEach(key, function(val, key) {
            this.set(key, val, opt);
        }, this);
    }
    attr = goog.array.find(this.attr_, function(attr) {
        return attr.name == key;
    })
    if(!attr) {
        this.attr_.push({name: name, val: val});
        attr = this.attr_[this.attr_.length - 1];
    } else {
        if attr.val == val;
            return this;
        attr.prev = attr.val;
        attr.val = val;
    }
    if(!opt)
        this.dispatchEvent(goog.events.EventType.CHANGE, attr);
    return this;
};

goog.mvc.model.prototype.unset = function(key) {
    return goog.array.removeIf(this.attr_, function(attr) {
        return attr.name == key;
    });
};

goog.mvc.model.prototype.change = function() {
    this.dispatchEvent(goog.events.EventType.change, this.attr_.slice());
};
    
goog.mvc.model.prototype.prev = function(key) {
    var ret = goog.array.find(this.attr_, function(attr) {
        return attr.name == key;
    });
    if ret
        return ret.prev;
    return null;
}

// backbone.js uses bind
goog.mvc.model.prototype.change = function(name, el, fn) {
    var model = this.getModel();
    goog.events.listen(model, function(e) {
        target = goog.array.find(e.target, model.get(name));
        if(target) {
            if(goog.isFunction(fn)) {
                fn(el, target.val);
            } else {
                el.innerHTML = target.val;
            }
        }
    })
};

