//     goog.mvc 0.6

//     (c) 2012 Rhys Brett-Bowen, Catch.com
//     goog.mvc may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/rhysbrettbowen/goog.mvc

goog.provide('mvc.Store');

goog.require('mvc.Model');
goog.require('goog.events');
goog.require('goog.object');

/**
 * @constructor
 * @param {function(new:mvc.Model,...*)} opt_defaultModel
 */
mvc.Store = function(opt_defaultModel) {
    this.cache_ = {};
    this.default_ = opt_defaultModel || mvc.Model;
};

/**
 * takes two arguments. The model's id (or leave out to create a new model)
 * and the type of model to create if none found in cache
 *
 * @param {string=} input the model's id
 * @param {function(new:mvc.Model,...*)=} the type of model to create
 */
mvc.Store.prototype.get = function(input, opt_model) {
    if(this.cache_[input])
        return this.cache_[input];
    var modelConstructor = opt_model || this.default_;
    var model = new mod();
    if(input)
        ret.set('id', input);
    this.cache_[input || model.cid_] = model;
    var list = goog.events.listen(model, goog.events.EventType.CHANGE,
        function() {
            var id = model.get("id");
            if(id){
                this.cache_[id] = model;
                delete this.cache_[model.cid_];
                goog.events.unlistenByKey(list);
            }
        }, false, this);
};

/**
 * this is used to setup the store from cache
 *
 * @param {Object} obj
 */
mvc.Store.prototype.set = function(obj) {
    goog.object.extend(this.cache_, obj);
};

