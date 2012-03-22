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
     * @type {Array.<mvc.Model>}
     */
    this.models_ = [];
    /**
     * @private
     * @type {?function(mvc.Model, mvc.Model):number}
     */
    this.comparator_ = defaults['comparator'];

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
    return goog.array.map(this.models_, function(model) {
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
            var ret = comp(a, b);
            if(ret < 0)
                changeOrder = true;
            return ret;
        });
    }
    if(!silent && changeOrder)
        this.dispatchEvent(goog.events.EventType.CHANGE);
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
    if(!goog.array.contains(this.models_, model)) {
        goog.array.insertAt(this.models_, model, (ind || this.models_.length));
        goog.events.listen(model, goog.events.EventType.CHANGE, this.sort,
            false, this);
        goog.events.listen(model, goog.events.EventType.UNLOAD, 
            function(e){
                goog.array.remove(this.models_, e.target);
                this.sort();
            }, false, this);
        this.sort(true);
        if(!silent)
            this.dispatchEvent(new goog.events.Event(goog.events.EventType.CHANGE, model));
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
    if(goog.array.remove(this.models_, model)) {
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
    if(filter)
        return goog.array.filter(this.models_, /** @type {Function} */(filter));
    return this.models_.slice(0);
};

/**
 * get a model by it's index in the collection
 *
 * @param {number} index
 * @return {mvc.Model}
 */
mvc.Collection.prototype.at = function(index) {
    return this.models_[index<0?this.models_.length+index:index];
};

/**
 * remove all models from the collection
 *
 * @param {boolean} silent
 */
mvc.Collection.prototype.clear = function(silent) {
    this.models_ = [];
    if(!silent)
        this.dispatchEvent(goog.events.EventType.CHANGE);
};
