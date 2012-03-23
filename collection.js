//     goog.mvc 0.9

//     (c) 2012 Rhys Brett-Bowen, Catch.com
//     goog.mvc may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/rhysbrettbowen/goog.mvc

goog.provide('mvc.Collection');

goog.require('mvc.Model');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');


/**
 * A collection of models. Extends model so it has it's own values
 *
 * @constructor
 * @extends {mvc.Model}
 * @param {Object=} options
 */
mvc.Collection = function(options) {
    options = options||{};
    var defaults = {
        'comparator': options['comparator']||null,
        'modelType': options['modelType']||mvc.Model,
        'models': options['models']||[]
    };
    goog.object.remove(options,'comparator');
    goog.object.remove(options,'modelType');
    goog.object.remove(options,'models');

    goog.base(this, options);


    /**
     * @private
     * @type {Array.<{model:mvc.Model}>}
     */
    this.models_ = [];
    /**
     * @private
     * @type {?function(mvc.Model, mvc.Model):number}
     */
    this.comparator_ = defaults['comparator'];
    this.modelChangeFns_ = [];
    this.modelChange_ = false;
    /**
     * @private
     */
    this.modelType_ = defaults['modelType'];

    goog.array.forEach(defaults['models'], function(model) {
        this.add(model, undefined, true);
    }, this);
};
goog.inherits(mvc.Collection, mvc.Model);

/**
 * plucks an attribute from each model and returns as an array. If you pass
 * an array of keys then the array will contain a map of each key and it's
 * value
 *
 * @param {string|Array} key
 * @return {Array.<Object.<string, *>>|Array.<*>}
 */
mvc.Collection.prototype.pluck = function(key) {
    return goog.array.map(this.models_, function(mod) {
        var model = mod.model;
        if(goog.isString(key))
            return model.get(key);
        return goog.array.reduce(key, function(map, attr) {
            var val = model.get(attr);
            if(goog.isDefAndNotNull(val))
                goog.object.set(map, attr, val);
            return map;
        }, {});
    });
};

/**
 * function to sort models by. Function should take two models and 
 * return -1, 0 or 1. Also takes whether to fire a change event after sorting
 *
 * @param {function(mvc.Model, mvc.Model):number} fn
 * @param {boolean=} silent
 */
mvc.Collection.prototype.setComparator = function(fn, silent) {
    this.comparator_ = fn;
    this.sort(silent);
};

/**
 * returns the number of models in the collection
 *
 * @return {number}
 */
mvc.Collection.prototype.getLength = function() {
    return this.models_.length;
};

/**
 * tells the collection to sort it's models. This is used internally
 *
 * @param {boolean=} silent
 */
mvc.Collection.prototype.sort = function(silent) {
    var changeOrder = false;
    if(this.comparator_) {
        var comp = this.comparator_;
        this.models_.sort(function(a, b) {
            var ret = comp(a.model, b.model);
            if(ret < 0)
                changeOrder = true;
            return ret;
        });
        this.modelChange_ = true;
    }
    if(!silent && changeOrder) {
        this.dispatchEvent(goog.events.EventType.CHANGE);
    }
};

/**
 * accepts a model or array of models and adds them at the end unless an index
 * to insert is given.
 *
 * @param {mvc.Model|Array.<mvc.Model>} model
 * @param {number=} ind
 * @param {boolean=} silent
 */
mvc.Collection.prototype.add = function(model, ind, silent) {
    if(goog.isArray(model)) {
        goog.array.forEach(model.reverse(), function(mod) {
            this.add(mod, ind, silent);
        }, this);
        return;
    }
    if(!goog.array.find(this.models_, function(mod) {
        return mod.model == model;
    })) {
        this.modelChange_ = true;
        var changeId = model.bindAll(this.sort, this);
        var unloadId = model.bindUnload(function(e){
                this.remove(model);
            }, this);
            
        goog.array.insertAt(this.models_, {
            model: model,
            unload: unloadId,
            change: changeId
        }, (ind || this.models_.length));
        
        this.sort(true);
        if(!silent)
            this.dispatchEvent(goog.events.EventType.CHANGE);
    }
    this.length = this.models_.length;
};

/**
 * add a new model with the given options. The type of model is given by the
 * modelType of the collection
 *
 * @param {Object=} options
 * @param {boolean=} silent
 */
mvc.Collection.prototype.newModel = function(options, silent) {
    var model = new this.modelType_(options);
    this.add(model, 0, silent);
    return model;
};

/**
 * remove the given model from the collection
 *
 * @param {mvc.Model|Array.<mvc.Model>} model
 * @param {boolean=} silent
 */
mvc.Collection.prototype.remove = function(model, silent) {
    if(goog.isArray(model)) {
        goog.array.forEach(model, function(mod) {
            this.remove(mod, silent);
        }, this);
        return;
    }
    var modelObj = goog.array.find(this.models_, function(mod) {
        return mod.model == model;
    });
    if(modelObj) {
        this.modelChange_ = true;
        model.unbind(modelObj.unload);
        model.unbind(modelObj.change);
        goog.array.remove(this.models_, modelObj);
        this.sort(true);
        if(!silent)
            this.dispatchEvent(goog.events.EventType.CHANGE);
    }
    this.length = this.models_.length;
};

/**
 * get a model by it's ID
 *
 * @param {string} id
 * @return {mvc.Model|null}
 */
mvc.Collection.prototype.getById = function(id) {
    return /** @type {mvc.Model} */(goog.array.find(this.models_, function(model) {
        return model.get('id') == id;
    }));
};

/**
 * get all the models, optionally filter by function
 *
 * @param {function(mvc.Model):Boolean=} filter
 * @return {Array.<mvc.Model>}
 */
mvc.Collection.prototype.getModels = function(filter) {
    var mods = goog.array.map(this.models_, function(mod) {
        return mod.model;
    });
    if(filter)
        return goog.array.filter(mods, /** @type {Function} */(filter));
    return mods;
};

/**
 * get a model by it's index in the collection
 *
 * @param {number} index
 * @return {mvc.Model}
 */
mvc.Collection.prototype.at = function(index) {
    return this.models_[index<0?this.models_.length+index:index].model;
};

/**
 * remove all models from the collection
 *
 * @param {boolean} silent
 */
mvc.Collection.prototype.clear = function(silent) {
    //this.models_ = [];
    this.remove(this.getModels(), true);
    this.modelChange_ = true;
    if(!silent) {
        this.dispatchEvent(goog.events.EventType.CHANGE);
    }
};

mvc.Collection.prototype.modelChange = function(fn, opt_handler) {
    this.modelChangeFns_.push(goog.bind(fn, (opt_handler || this)));
};

mvc.Collection.prototype.change_ = function(e) {
    goog.base(this, 'change_', e);
    if(this.modelChange_) {
        goog.array.forEach(this.modelChangeFns_, function(fn) {
            fn(this);
        }, this);
        if(this.schema_) {
            goog.object.forEach(this.schema_, function(val, key) {
                if(val.models) {
                    goog.array.forEach(this.bound_, function(bind) {
                        if(goog.array.contains(bind.attr, key)) {
                            bind.fn.apply(bind.hn, goog.array.concat(goog.array.map(bind.attr,
                                function(attr) {
                                    return this.get(attr);
                                }, this)));
                        }
                    }, this);
                }
            }, this);
        }
        this.modelChange_ = false;
    }
};
