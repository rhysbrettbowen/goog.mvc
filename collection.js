goog.provide('mvc.Collection');

goog.require('goog.events.EventTarget');

/**
 * A collection of models
 *
 * @constructor
 * @extends goog.events.EventTarget
 * @param {?Array.<mvc.Model>} models
 */
mvc.Collection = function(models) {
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
    
    goog.array.forEach(models || [], function(model) {
        this.add(model, true);
    }, this);
};

goog.inherits(mvc.Collection, goog.events.EventTarget);

/**
 * @return {Array}
 */
mvc.Collection.prototype.toJson = function() {
    return goog.array.map(this.models_, function(model) {return model.toJson();});
};

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
        }, this);
    }
    if(!silent && changeOrder)
        this.dispatchEvent(goog.events.EventType.CHANGE);
};

/**
 * @param {mvc.Model|Array.<mvc.Model>} model
 * @param {boolean=} silent
 */
mvc.Collection.prototype.add = function(model, silent) {
    if(goog.isArray(model)) {
        goog.array.forEach(model, function(mod) {
            this.add(mod, silent);
        }, this);
        return;
    }
    if(!goog.array.contains(this.models_, model)) {
        this.models_.push(model);
        goog.events.listen(model, goog.events.EventType.CHANGE, this.sort,
            false, this);
        this.sort(true);
        if(!silent)
            this.dispatchEvent(goog.events.EventType.CHANGE, model);
    }
};

/**
 * @param {mvc.Model|Array.<mvc.Model>} model
 * @param {boolean=} silent
 */
mvc.Collection.prototype.remove = function(model, silent) {
    if(goog.isArray(models)) {
        goog.array.forEach(model, function(mod) {
            this.add(mod, silent);
        }, this);
        return;
    }
    if(goog.array.remove(this.models_, model) && !silent)
        this.dispatchEvent(goog.events.EventType.CHANGE, model);
    if(this.comparator_)
        this.models_.sort(this.comparator_);
};

/**
 * get a model by it's ID
 *
 * @param {string} id
 * @return {mvc.Model}
 */
mvc.Collection.prototype.get = function(id) {
    return goog.array.find(this.models_, function(model) {
        return model.get('id') == id;
    });
}

/**
 * get a model by it's index in the collection
 *
 * @param {number} index
 * @return {mvc.Model}
 */
mvc.Collection.prototype.at = function(index) {
    return this.models_[index<0?this.models_.length+index:index];
}
