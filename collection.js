//     goog.mvc 0.4

//     (c) 2012 Rhys Brett-Bowen, Catch.com
//     goog.mvc may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/rhysbrettbowen/goog.mvc

goog.provide('mvc.Collection');

goog.require('mvc.Model');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');

/**
 * A collection of models
 *
 * @constructor
 * @extends mvc.Model
 * @param {?Array.<mvc.Model>} models
 * @param {function(new:mvc.Model)=} modelType is the base type of model to use when creating a new model in the collection
 * @param {mvc.Sync=} sync
 */
mvc.Collection = function(models, modelType, sync) {
    goog.base(this);
    this.sync_ = sync;
    /**
     * @private
     * @type {Array.<mvc.Model>}
     */
    this.models_ = [];
    /**
     * @private
     * @type {?function(mvc.Model, mvc.Model):number}
     */
    this.comparator_ = null;
    
    /**
     * @private
     */
    this.modelType_ = modelType;
    
    goog.array.forEach(models || [], function(model) {
        this.add(model, undefined, true);
    }, this);
};
goog.inherits(mvc.Collection, mvc.Model);

/**
 * @return {Array}
 */
mvc.Collection.prototype.toArray = function() {
    return this.models_;
};

/**
 * plucks an attribute from each model and returns as an array
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
 * @return {Array}
 */
 

/**
 * function to sort models by
 *
 * @param {function(mvc.Model, mvc.Model):number} fn
 * @param {boolean=} silent
 */
mvc.Collection.prototype.setComparator = function(fn, silent) {
    this.comparator_ = fn;
    this.sort(silent);
};

/**
 * @return {number}
 */
mvc.Collection.prototype.getLength = function() {
    return this.models_.length;
};

/**
 * @param {boolean=} silent
 */
mvc.Collection.prototype.sort = function(silent) {
    var changeOrder = false;
    if(this.comparator_) {
        var comp = this.comparator_
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
                this.sort()
            }, false, this);
        this.sort(true);
        if(!silent)
            this.dispatchEvent(new goog.events.Event(goog.events.EventType.CHANGE, model));
    }
    this.length = this.models_.length;
};

/**
 * @param {Object=} attr
 * @param {boolean=} silent
 */
mvc.Collection.prototype.newModel = function(attr, silent) {
    var model = new this.modelType_();
    model.set(attr || null);
    this.add(model, 0, silent);
    return model;
};

/**
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
}

/**
 * get a model by it's index in the collection
 *
 * @param {number} index
 * @return {mvc.Model}
 */
mvc.Collection.prototype.at = function(index) {
    return this.models_[index<0?this.models_.length+index:index];
};

mvc.Collection.prototype.clear = function() {
    this.models_ = [];
}
