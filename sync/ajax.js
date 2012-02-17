goog.provide('mvc.sync.Ajax');

goog.require('mvc.sync');

goog.require('goog.net.XhrIo');

/**
 * @implements {mvc.sync}
 */
mvc.sync.Ajax = function() {
    this.baseUrl = "/"
};

/**
 * @inheritDoc
 */
mvc.sync.Ajax.prototype.create = function(model, callback) {
    goog.net.XhrIo.send(this.baseUrl, goog.bind(this.onComplete), this),
        "CREATE", undefined, model.getJson());
};

/**
 * @inheritDoc
 */
mvc.sync.Ajax.prototype.read = function(model, callback) {
    goog.net.XhrIo.send(this.baseUrl, goog.bind(this.onComplete), this),
        "GET");
};

/**
 * @inheritDoc
 */
mvc.sync.Ajax.prototype.update = function(model, callback) {
    goog.net.XhrIo.send(this.baseUrl, goog.bind(this.onComplete), this),
        "PUT", model.getJson());
};

/**
 * @inheritDoc
 */
mvc.sync.Ajax.prototype.delete = function(model, callback) {
    goog.net.XhrIo.send(this.baseUrl, goog.bind(this.onComplete), this),
        "DELETE");
};

/**
 * override this to do processing on returned data
 *
 * @param {Function} callback
 * @param {Event} e
 */
mvc.sync.Ajax.prototype.onComplete_ = function(callback, e) {
    
};