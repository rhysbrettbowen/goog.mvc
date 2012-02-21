// v0.3
goog.provide('mvc.sync.Local');

goog.require('goog.storage.Storage');
goog.require('goog.storage.mechanism.HTML5LocalStorage');

/**
 * @implements {mvc.sync}
 */
mvc.sync.Local = function() {
    this.store_ = new goog.storage.Storage(new goog.storage.mechanism.HTML5LocalStorage());
};

mvc.sync.Local.prototype.getUID = function() {
    this.counter_ = this.counter_||0;
    return (this.counter_++)+"|"+parseInt((new Date()).getTime(), 36);
};

mvc.sync.Local.prototype.create = function(model, callback) {
    var id = this.getUID();
    model.set('id', id);
};

mvc.sync.Local.prototype.read = function(model, callback) {
    model.set(this.store_.get(model.get('id')));
};

mvc.sync.Local.prototype.update = function(model, callback) {
    this.store_.set(model.get('id'), model.toJson());
};

mvc.sync.Local.prototype.delete = function(model, callback) {
    this.store_.remove(model.get('id'));
};
