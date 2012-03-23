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
        'schema': {},
        'sync': null,
        'attr': {}
    };

    if(!options)
        options = {};
    options['attr'] = options['attr'] || {};

    goog.object.forEach(options, function(val, key) {
        if(!goog.isDef(defaults[key]))
            options['attr'][key] = val;
    });
    
    goog.object.forEach(defaults, function(val, key) {
        defaults[key] = options[key] || defaults[key];
    });


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
     * @type {Object}
     */
    this.schema_ = defaults['schema'];

    this.sync_ = defaults['sync'];

    this.bound_ = [];
    this.boundAll_ = {};
    this.onUnload_ = [];
    
    this.handleErr_ = goog.nullFunction;

    this.changeHandler_ = goog.events.listen(this,
        goog.events.EventType.CHANGE, this.change_, false, this);
    /**
     * @private
     * @type {string}
     */
    this.cid_ = ""+goog.getUid(this);
    
    this.set(defaults['attr'], true);

    this.dispatchEvent(goog.events.EventType.LOAD);
};
goog.inherits(mvc.Model, goog.events.EventTarget);

/**
 * return local id
 *
 * @return {string}
 */
mvc.Model.prototype.getCid = function() {
    return this.cid_;
};

/**
 * used internally to parse strings and regexes in to functions
 *
 * @param {*} fn
 */
mvc.Model.prototype.parseSchemaFn_ = function(fn) {
    var val = fn;
    if(goog.isString(fn)) {
        var fns = {
            'number': goog.isNumber,
            'string': goog.isString,
            'array': goog.isArrayLike
        };
        val = function(val) {
            if(!fns[fn.toLowerCase])
                throw new Error(fn);
            return val;
        };
    }else if(val.exec) {
        val = goog.bind(function(regex, value, mod) {
            if(goog.isNull(regex.exec(value)))
                throw new Error();
            return val;}, this, fn);
    } else if(goog.isFunction(val) && goog.object.getKeys(val.prototype).length){
        val = function(val) {
            if(val.constructor == fn)
                return val;
            while(val.superClass_) {
                val = val.superClass_.constructor;
                if(val == fn)
                    return val;
            }
            throw new Error();
        };
    }
    return val;
};

/**
 * creates a new mvc.Model
 *
 * @param {Object=} options
 * @return {mvc.Model}
 */
mvc.Model.create = function(options) {
    return new mvc.Model(options);
};

/**
 * returns full copy of the attributes
 *
 * @return {!Object}
 */
mvc.Model.prototype.toJson = function() {
    return goog.object.clone(this.attr_);
};

/**
 * sets the sync for the model
 *
 * @param {mvc.Sync} sync
 */
mvc.Model.prototype.setSync = function(sync) {
    this.sync_ = sync;
};

/**
 * removes all attributes
 *
 * @param {boolean} silent
 */
mvc.Model.prototype.reset = function(silent) {
    this.prev_ = this.attr_;
    this.attr_ = {};
    if(!silent)
        this.change();
};

/**
 * gets the value for an attribute
 *
 * @param {string} key
 * @return {*}
 */
mvc.Model.prototype.get = function(key) {
    if(this.schema_[key] && this.schema_[key].get) {
        return this.schema_[key].get.apply(this, goog.array.map(
            this.schema_[key].require || [], function(requireKey) {
                if(requireKey === key)
                    return this.attr_[key];
                return this.get(requireKey);
            },this));
    }
    return this.attr_[key];
};

/**
 * returns whether an ID has been set by the server
 *
 * @return {boolean}
 */
mvc.Model.prototype.isNew = function() {
    return !this.get('id');
};

/**
 * sets the schema
 *
 * @param {Object} schema
 */
mvc.Model.prototype.setSchema = function(schema) {
    this.schema_ = schema;
};

/**
 * adds more rules to the schema
 *
 * @param {Object} schema
 */
mvc.Model.prototype.addSchemaRules = function(schema) {
    goog.object.extend(this.schema_, schema);
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
 * @param {*=} val to use if the key is a string, or if key is an object then
 * a boolean for silent
 * @param {boolean=} silent true if no change event should be fired
 * @return {boolean}
 */
mvc.Model.prototype.set = function(key, val, silent) {
    var success = false;
    if(goog.isString(key)) {
        var temp = {};
        temp[key] = val;
        key = temp;
    } else {
        silent = /** @type {boolean} */(val);
    }
    goog.object.forEach(key, function(val, key) {
        if(!this.schema_ || !goog.isDef(val)) {
            this.attr_[key] = val;
        } else {
            try {
                if(this.schema_[key] && this.schema_[key].set)
                    this.attr_[key] = this.parseSchemaFn_(this.schema_[key].set)(val, this);
                else
                    this.attr_[key] = val;
                success = true;
            } catch (err) {
                this.handleErr_(err);
            }
        }
    }, this);
    if(success) {
        if(!silent) {
            this.dispatchEvent(goog.events.EventType.CHANGE);
            this.prev_ = goog.object.clone(this.attr_);
            this.attr_ = goog.object.filter(this.attr_, function(val, key) {
                return goog.isDef(val);
            });
        }
        return true;
    }
    return false;
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
 * Can be used to create an alias, e.g:
 * model.alias('surname', 'lastName');
 *
 * @param {string} newName
 * @param {string} oldName
 */
mvc.Model.prototype.alias = function(newName, oldName)  {
    if(!this.schema_[newName])
        this.schema_[newName] = {};
    this.schema_[newName].get = function(oldName) {
        return oldName;
    };
    this.schema_[newName].require = [oldName];
};

/**
 * Can be used to change format returned when using get, e.g:
 * model.format('date', function(date) {return date.toDateString();});
 *
 * @param {string} attr
 * @param {Function} fn
 */
mvc.Model.prototype.format = function(attr, fn)  {
    if(!this.schema_[attr])
        this.schema_[attr] = {};
    this.schema_[attr].get = fn;
    this.schema_[attr].require = [attr];
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
    if(!this.schema_[attr])
        this.schema_[attr] = {};
    this.schema_[attr].get = fn;
    this.schema_[attr].require = require;
};

/**
 * returns object of changed attributes and their values
 */
mvc.Model.prototype.getChanges = function() {
    var schema = this.schema_;
    var getReq = function(key, req) {
        if(schema[key] && schema[key].require){
            goog.array.extend(req, schema[key].require);
            for(var i = 0; i < schema[key].require.length; i++) {
                if(schema[key].require[i]!==key)
                    getReq(schema[key].require[i], req);
            }
        }
    };
    
    var ret = goog.object.getKeys(goog.object.filter(this.schema_, function(val, key) {
        var requires = [];
        getReq(key,requires);
        return goog.array.some(requires, function(require) {
            return this.attr_[require] !== this.prev_[require];
        }, this);
    }, this));
    goog.array.extend(ret, goog.object.getKeys(goog.object.filter(this.attr_,
        function(val, key) {
            return val !== this.prev_[key];
        }, this)));
    return ret;
};

/**
 * reverts an object's values to it's last fetch
 *
 * @param {boolean=} silent
 * @return {mvc.Model}
 */
mvc.Model.prototype.revert = function(silent) {
    var newAttr = {};
    goog.object.extend(newAttr, goog.object.map(this.ext_, function(val) {
        return {val: val, prev: null};
    }));
    goog.object.forEach(this.attr_, function(val, key) {
        if(key in newAttr) {
            newAttr[key].prev = val;
        }
    });
    if(!silent)
        this.dispatchEvent(goog.events.EventType.CHANGE);
    return this;
};

mvc.Model.prototype.dispose = function() {
    this.sync_.del(this);
    this.dispatchEvent(goog.events.EventType.UNLOAD);
    goog.array.forEach(this.onUnload_, function(fn) {
        fn(this);
    }, this);
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

mvc.Model.prototype.bindUnload = function(fn, opt_handler) {
    fn = goog.bind(fn, (opt_handler || this));
    var uid = goog.getUid(fn);
    this.onUnload_.push(fn);
    return uid;
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
    }) || goog.object.remove(this.boundAll_, id) || 
    goog.array.removeIf(this.onUnload_, function(fn) {
        return goog.getUid(fn) == id;
    });
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


