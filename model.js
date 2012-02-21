// v0.2
goog.provide('mvc.Model');
goog.provide('mvc.model.Schema');


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
 * @param {mvc.Model.Schema=} schema
 */
mvc.Model = function(attr, schema) {
    /**
     * @private
     * @type {Object.<string, ?Object>}
     */
    this.attr_ = {};
    /**
     * @private
     * @type {Object.<string, ?Object>}
     */
    this.prev_ = {};
    /**
     * @private
     * @type {?mvc.Model.Schema}
     */
    this.schema_ = schema;
    
    this.cid_ = goog.getUid();
    
    goog.object.forEach(attr, function(val, name) {
        this.attr_[name] = val;
    }, this);
};

goog.inherits(mvc.Model, goog.events.EventTarget);

/**
 * returns full copy of the attributes
 *
 * @return {Object.<string, Object>}
 */
mvc.Model.prototype.toJson = function() {
    return goog.object.clone(this.attr_);
};

/**
 * @param {string} key
 * @return {Object=}
 */
mvc.Model.prototype.get = function(key) {
    return goog.object.get(this.attr_, key, null);
}

/**
 * @return {boolean}
 */
mvc.Model.prototype.isNew = function() {
    return !!this.get('id');
}

/**
 * @param {mvc.Model.Schema}
 */
mvc.Model.prototype.setSchema = function(schema) {
    this.schema_ = schema;
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
 * @param {Object=} val to use if the key is a string
 * @param {boolean=} silent true if no change event should be fired
 * @return {mvc.Model}
 */
mvc.Model.prototype.set = function(key, val, silent) {
    if(goog.isString(key)) {
        var temp = {};
        temp[key] = val;
        key = temp;
    }
    if(!silent) {
        this.prev_ = goog.object.clone(this.attr_);
    }
    goog.object.forEach(key, function(val, key) {
        if(!this.schema_ || this.schema_.validate(key, val)) {
            this.attr_[key] = val;
        }
    }, this);
    if(!silent) {
        this.dispatchEvent(goog.events.EventType.CHANGE);
    }
    return this;
};

/**
 * @param {string} key
 * @param {boolean=} silent true if no change event should be fired
 * @return {mvc.Model}
 */
mvc.Model.prototype.unset = function(key, silent) {
     return this.set(key, undefined, silent);
};

/**
 * fires the change event for the model
 */
mvc.Model.prototype.change = function() {
    this.dispatchEvent(goog.events.EventType.change);
};

/**
 * returns the previous value of the attribute
 *
 * @param {string} key
 * @return {?Object}
 */
mvc.Model.prototype.prev = function(key) {
    return goog.object.get(this.prev_, key, null);
};

/**
 * returns object of changed attributes and their values
 */
mvc.Model.prototype.getChanges = function() {
    return goog.object.filter(this.attr_, function(val, key) {
        return val != this.prev_[key];
    }, this);
};

/**
 * reverts an object's values to it's last fetch
 *
 * @return {mvc.Model}
 */
mvc.Model.prototype.revert = function() {
    var newAttr = {};
    goog.object.extend(newAttr, goog.object.map(this.ext_, function(val) {return {val: val, prev: null};}));
    goog.object.forEach(this.attr_, function(val, key) {
        if(key in newAttr) {
            newAttr[key].prev = val;
        }
    });
    this.dispatchEvent(goog.events.EventType.CHANGE);
    return this;
};

/**
 * reads an object fomr an external source using sync
 *
 * @param {function(Object, number, mvc.Model)} callback
 * @param {boolean} silent
 */
mvc.Model.prototype.fetch = function(callback, silent) {
    var success = goog.bind(function(data, status) {
        if(status == 200) {
            this.ext_ = goog.object.clone(data);
            goog.array.forEach(goog.object.getKeys(this.attr_), function(key) {
                if(!key in data)
                    this.unset(key, silent);
            }, this);
            goog.object.forEach(data, function(val, key) {
                this.set(key, val, silent);
            }, this);
        }
        if(callback) {
            callback(data, status, this);
        }
    }, this);
    this.sync.read(this);
};

/**
 * pushes the object to the sync
 */
mvc.Model.prototype.save = function() {
    if(this.sync_)
        if(this.isNew())
            this.sync_.create(this);
        else
            this.sync_.update(this);
};

// binds a change event
/**
 * @param {string} name
 * @param {Element|Node|Function|*} el
 * @param {Function|*} fn
 */
mvc.Model.prototype.bind = function(name, el, fn) {
    goog.events.listen(this, goog.events.EventType.CHANGE, function(e) {
        var changes = e.target.getChanges();
        if(name in changes || !goog.isDefAndNotNull(name)) {
            if(goog.isFunction(el)) {
                goog.bind(el, fn)(changes[name], this);
                return;
            }
            if(!goog.isArrayLike(el))
                el = [el];
            goog.array.forEach(el, function(elem) {
                if(goog.isFunction(fn)) {
                    fn(elem, changes[name]);
                } else if (el.nodeType){
                    goog.dom.setTextContent(elem, changes[name]);
                } else {
                    el = changes[name];
                }
            });
        }
    }, this);
};

/**
 * Schema saves validation rules against keys
 *
 * @constructor
 */
mvc.model.Schema = function(rules) {
    /**
     * @private
     * @type {Object.<string, function(*):boolean>}
     */
    this.schema_ = {};
    
    if(rules)
        this.set(rules);
};

/**
 * @typdef {string|function(*, mvc.Model):boolean}
 */
mvc.model.Schema.Rule;

/**
 * set rule(s) in the schema
 *
 * @param {string | Object.<string, mvc.Model.Schema.Rule>} key
 * @param {mvc.Model.Schema.Rule=} val
 */
mvc.model.Schema.prototype.set = function(key, val) {
    if(goog.isString(key)) {
        var temp = {};
        temp[key] = val;
        key = temp;
    }
    goog.object.extend(this.schema_, goog.object.map(key, function(val, key) {
        if(goog.isString(val)) {
            if(val.toLowerCase() == 'number') {
                val = function(val, mod){return goog.isNumber(val);};
            } else if(val.toLowerCase() == 'string') {
                val = function(val, mod){return goog.isString(val);};
            } else if(val.toLowerCase() == 'array') {
                val = function(val, mod){return goog.isArrayLike(val);};
            }
        }
        if(val.exec) {
            val = goog.bind(function(regex, value, mod) {return !!regex.exec(value);}, this, val);
        }
        return val;
    }, this));
};

mvc.model.Schema.prototype.validate = function(key, val) {
    if(key in this.schema_)
        return this.schema_[key](val);
    return true;
};
