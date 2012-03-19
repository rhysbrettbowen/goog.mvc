//     goog.mvc 0.9

//     (c) 2012 Rhys Brett-Bowen, Catch.com
//     goog.mvc may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/rhysbrettbowen/goog.mvc

goog.provide('mvc.Model');
goog.provide('mvc.model.Schema');

goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.object');


/** 
 * Pass an object with key value pairs for the attributes of the model
 *
 * @constructor
 * @extends goog.events.EventTarget
 * @param {Object=} options can take in the arguments attr, schema and sync
 */
mvc.Model = function(options) {
    var defaults = {
        'schema': null,
        'sync': null,
        'attr': {}
    };
    
    if(!options)
        options = {};
    options['attr'] = options['attr'] || {};
    
    goog.object.forEach(options, function(val, key) {
        if(!goog.isDef(defaults[key]))
            defaults['attr'][key] = val;
    });

    goog.object.extend(defaults, options);

    /**
     * @private
     * @type {Object.<string, ?Object>}
     */
    this.attr_ = {};
    /**
     * @private
     * @type {Object.<{attr: Array.<string>, fn: Function}>}
     */
    this.formats_ = {};
    /**
     * @private
     * @type {Object.<string, ?Object>}
     */
    this.prev_ = {};
    /**
     * @private
     * @type {?mvc.model.Schema}
     */
    this.schema_ = defaults['schema'] || null;
    
    this.sync_ = defaults['sync'] || null;
    
    this.bound_ = [];
    this.boundAll_ = {};
    
    this.changeHandler_ = goog.events.listen(this,
        goog.events.EventType.CHANGE, this.change_, false, this);
    
    this.cid_ = goog.getUid(this);
    
    goog.object.forEach(defaults['attr'], function(val, name) {
        this.attr_[name] = val;
    }, this);
    
    this.dispatchEvent(goog.events.EventType.LOAD);
};
goog.inherits(mvc.Model, goog.events.EventTarget);



/**
 * returns full copy of the attributes
 *
 * @return {!Object}
 */
mvc.Model.prototype.toJson = function() {
    return goog.object.clone(this.attr_);
};

mvc.Model.prototype.setSync = function(sync) {
    this.sync_ = sync;
};

mvc.Model.prototype.reset = function(silent) {
    this.prev_ = this.attr_;
    this.attr_ = {};
    if(!silent)
        this.change();
};

/**
 * @param {string} key
 * @return {*}
 */
mvc.Model.prototype.get = function(key) {
    if(this.formats_[key])
        return this.formats_[key].fn();
    return goog.object.get(this.attr_, key, null);
};

/**
 * @return {boolean}
 */
mvc.Model.prototype.isNew = function() {
    return !this.get('id');
};

/**
 * @param {mvc.model.Schema} schema
 */
mvc.Model.prototype.setSchema = function(schema) {
    this.schema_ = schema;
};

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
 * @param {*=} val to use if the key is a string
 * @param {boolean=} silent true if no change event should be fired
 * @return {boolean}
 */
mvc.Model.prototype.set = function(key, val, silent) {
    var success = true;
    if(goog.isString(key)) {
        var temp = {};
        temp[key] = val;
        key = temp;
    }
    goog.object.forEach(key, function(val, key) {
        if(!this.schema_ || !goog.isDef(val)) {
            this.attr_[key] = val;
        } else {
            var validate = this.schema_.validate(key, val);
            if(goog.isDef(validate))
                this.attr_[key] = validate;
            else
                success = false;
        }
    }, this);
    if(success) {
        if(!silent) {
            this.dispatchEvent(goog.events.EventType.CHANGE);
            this.prev_ = goog.object.clone(this.attr_);
        }
        return true;
    }
    return false;
};

/**
 * Can be used to create an alias, e.g:
 * model.alias('surname', 'lastName');
 *
 * @param {string} newName
 * @param {string} oldName
 */
mvc.Model.prototype.alias = function(newName, oldName)  {
    this.formats_[newName] = {attr: [oldName],
        fn: goog.bind(function() {
            return this.get(oldName);
        }, this)};
};

/**
 * Can be used to change format returned when using get, e.g:
 * model.format('date', function(date) {return date.toDateString();});
 *
 * @param {string} attr
 * @param {Function} fn
 */
mvc.Model.prototype.format = function(attr, fn)  {
    this.formats_[attr] = {attr: [attr],
        fn: goog.bind(function() {
            return /** @type {Function} */(fn)(this.attr_[attr], this);
        }, this)};
};

/**
 * Can be used to make an attribute out of other attributes. This can be bound
 * and will fire whenever a change is made to the required attributes e.g.
 * model.meta('fullName', ['firstName', 'lastName'],
 *     function(firstName, lastName){
 *         return firstName + " " + lastName;
 *     });
 *
 * @param {string} attr
 * @param {Array.<string>} require
 * @param {Function} fn
 */
mvc.Model.prototype.meta = function(attr, require, fn) {
    this.formats_[attr] = {attr: require,
        fn: goog.bind(function() {
        return fn.apply(this, goog.array.map(/** @type {Array} */(require), function(val) {
            return this.get(val);
        }, this));
    }, this)};
};

/**
 * @param {string} key
 * @param {boolean=} silent true if no change event should be fired
 * @return {boolean}
 */
mvc.Model.prototype.unset = function(key, silent) {
     return this.set(key, undefined, silent);
};

/**
 * fires the change event for the model
 */
mvc.Model.prototype.change = function() {
    this.dispatchEvent(goog.events.EventType.CHANGE);
};

/**
 * returns the previous value of the attribute
 *
 * @param {string} key
 * @return {*}
 */
mvc.Model.prototype.prev = function(key) {
    return goog.object.get(this.prev_, key, null);
};

/**
 * returns object of changed attributes and their values
 */
mvc.Model.prototype.getChanges = function() {
    var ret = goog.object.getKeys(goog.object.filter(this.formats_, function(val) {
        return goog.array.some(val.attr, function(require) {
            return this.attr_[require] != this.prev_[require];
        }, this);
    }, this));
    goog.array.extend(ret, goog.object.getKeys(goog.object.filter(this.attr_,
        function(val, key) {
            return val != this.prev_[key];
        }, this)));
    return ret;
};

/**
 * reverts an object's values to it's last fetch
 *
 * @return {mvc.Model}
 */
mvc.Model.prototype.revert = function() {
    var newAttr = {};
    goog.object.extend(newAttr, goog.object.map(this.ext_, function(val) {
        return {val: val, prev: null};
    }));
    goog.object.forEach(this.attr_, function(val, key) {
        if(key in newAttr) {
            newAttr[key].prev = val;
        }
    });
    this.dispatchEvent(goog.events.EventType.CHANGE);
    return this;
};

mvc.Model.prototype.dispose = function() {
    this.sync_.del(this);
    this.dispatchEvent(goog.events.EventType.UNLOAD);
    this.disposeInternal();
};

/**
 * reads an object fomr an external source using sync
 *
 * @param {function(Object, number, mvc.Model)=} callback
 * @param {boolean=} silent
 */
mvc.Model.prototype.fetch = function(callback, silent) {
    var success = goog.bind(function(data, status) {
        if(status == 200) {
            this.ext_ = goog.object.clone(data);
            goog.array.forEach(goog.object.getKeys(this.attr_), function(key) {
                if(!(key in data))
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
    this.sync_.read(this);
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

mvc.Model.prototype.getBinder = function(key) {
    return goog.bind(this.set, this, key);
};

mvc.Model.prototype.change_ = function(e) {
    var changes = this.getChanges();
    goog.array.forEach(this.bound_, function(val) {
        if(goog.array.some(val.attr, function(attr) {
            return goog.array.contains(changes, attr);
        })) {
            val.fn.apply(val.hn, goog.array.concat(goog.array.map(val.attr,
                function(attr) {
                    return this.get(attr);
                },this)));
        }
    }, this);
    goog.object.forEach(this.boundAll_, function(val) {
        val(this);
    }, this);
};



/**
 * Allows easy binding of a model's attribute to an element or a function.
 * bind('name', Element(s)) would change the value to the model's name
 * bind('name', Element(s), function(El, attr)) runs a function with the element
 * and the attributes value
 * bind('name', function(value), handler) allows you to run a function and
 * optionally bind it to the handler
 * if no name is passed (null or undefined) then the operation will be run on
 * any change to the model and pass in the model
 *
 * @param {Array|string} name
 * @param {Function} fn
 * @param {*=} opt_handler
 */
mvc.Model.prototype.bind = function(name, fn, opt_handler) {
    if(goog.isString(name))
        name = [name];
    var bind = {
        attr: name,
        fn: fn,
        hn: (opt_handler || this)
    };
    bind.cid = goog.getUid(bind);
    this.bound_.push(bind);
    return bind.cid;
};

/**
 * unbind a listener by id
 */
mvc.Model.prototype.unbind = function(id) {
    return goog.array.removeIf(this.bound_, function(bound) {
        return (bound.id == id);
    }) || goog.object.remove(this.boundAll_, id);
};

/**
 * bind to any change event
 *
 * @param {Function} fn
 * @param {Object=} opt_handler
 */
mvc.Model.prototype.bindAll = function(fn, opt_handler) {
    var bound = goog.bind(fn, (opt_handler || this));
    var id = goog.getUid(bound);
    goog.object.set(this.boundAll_, ""+id, bound);
    return id;
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
 * @typedef {string|function(*, mvc.Model):boolean}
 */
mvc.model.Schema.Rule;

/**
 * set rule(s) in the schema
 *
 * @param {string | Object.<string, mvc.model.Schema.Rule>} key
 * @param {mvc.model.Schema.Rule=} val
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

mvc.model.Schema.Test = function(obj) {
    return function(val) {
        if(val.constructor == obj)
            return true;
        while(val.superClass_) {
            val = val.superClass_.constructor;
            if(val == obj)
                return true;
        }
        return false;
    };
};

mvc.model.Schema.prototype.onErr = function(message) {
    alert(message);
};

mvc.model.Schema.prototype.validate = function(key, val) {
    if(key in this.schema_) {
        try{
            return this.schema_[key](val);
        } catch(err) {
            this.onErr(err.message);
            return undefined;
        }
    }
    return val;
};
