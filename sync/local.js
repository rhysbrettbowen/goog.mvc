// v0.3
goog.provide('mvc.LocalSync');

goog.require('goog.storage.Storage');
goog.require('goog.storage.mechanism.HTML5LocalStorage');

/**
 * @constructor
 * @implements {mvc.Sync}
 */
mvc.LocalSync = function() {
    this.store_ = new goog.storage.Storage(new goog.storage.mechanism.HTML5LocalStorage());
};

mvc.LocalSync.prototype.getUID = function() {
    this.counter_ = this.counter_||0;
    return (this.counter_++)+"|"+parseInt((new Date()).getTime(), 36);
};

mvc.LocalSync.prototype.create = function(model, callback) {
    var id = this.getUID();
    model.set('id', id);
};

mvc.LocalSync.prototype.read = function(model, callback) {
    model.set(this.store_.get(model.get('id')));
};

mvc.LocalSync.prototype.update = function(model, callback) {
    this.store_.set(model.get('id'), model.toJson());
};

mvc.LocalSync.prototype.del = function(model, callback) {
    this.store_.remove(model.get('id'));
};
