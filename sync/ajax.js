// v0.2
goog.provide('mvc.sync.Ajax');

goog.require('mvc.sync');

goog.require('goog.net.XhrManager');

/**
 * @implements {mvc.sync}
 */
mvc.sync.Ajax = function(url) {

    this.baseUrls_ = {};

    if(goog.isString(url) || goog.isFunction(url)) {
        url = {
            create: url,
            read: url,
            update: url,
            del: url,
        };
    }
    goog.object.extend(this.baseUrls_, goog.object.map(url, function(val) {
        if(goog.isString(val))
            return function(model) {val.replace(/:(\w+)/g, function(id) {
                return model.get(id);
            });};
        return val;
    });
    this.xhr_ = new goog.net.XhrManager();
    this.sendCount_ = 0;
};

/**
 * @inheritDoc
 */
mvc.sync.Ajax.prototype.create = function(model, callback) {
    this.xhr_.send(this.sendCount_++, this.baseUrls_.create(model),
        "POST", model.getJson(), undefined, 
        goog.bind(this.onCreateComplete, this, model, callback));
};

/**
 * @inheritDoc
 */
mvc.sync.Ajax.prototype.read = function(model, callback) {
    this.xhr_.send(this.sendCount_++, this.baseUrls_.read(model),
        "GET", undefined, undefined, 
        goog.bind(this.onComplete, this, model, callback));
};

/**
 * @inheritDoc
 */
mvc.sync.Ajax.prototype.update = function(model, callback) {
    this.xhr_.send(this.sendCount_++, this.baseUrls_.update(model),
        "PUT", model.getJson(), undefined, 
        goog.bind(this.onUpdateComplete, this, model, callback));
};

/**
 * @inheritDoc
 */
mvc.sync.Ajax.prototype.delete = function(model, callback) {
    this.xhr_.send(this.sendCount_++, this.baseUrls_.del(model),
        "DELETE", undefined, undefined, 
        goog.bind(this.onDeleteComplete, this, model, callback));
};

/**
 * override this to do processing on returned data
 *
 * @param {mvc.Model} model
 * @param {Function} callback
 * @param {Event} e
 */
mvc.sync.Ajax.prototype.onCreateComplete_ = function(model, callback, e) {
    var xhr = e.target;
    model.set('id') = xhr.getResponseJson()['result']['id'];
};

/**
 * override this to do processing on returned data
 *
 * @param {mvc.Model} model
 * @param {Function} callback
 * @param {Event} e
 */
mvc.sync.Ajax.prototype.onReadComplete_ = function(model, callback, e) {
    var xhr = e.target;
    var json = xhr.getResponseJson()['result'];
    goog.model.set(json);
};

/**
 * override this to do processing on returned data
 *
 * @param {mvc.Model} model
 * @param {Function} callback
 * @param {Event} e
 */
mvc.sync.Ajax.prototype.onUpdateComplete_ = function(model, callback, e) {
};

/**
 * override this to do processing on returned data
 *
 * @param {mvc.Model} model
 * @param {Function} callback
 * @param {Event} e
 */
mvc.sync.Ajax.prototype.onDelComplete_ = function(model, callback, e) {
};