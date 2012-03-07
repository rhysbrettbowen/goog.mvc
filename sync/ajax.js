// v0.2
goog.provide('mvc.AjaxSync');

goog.require('mvc.Sync');

goog.require('goog.net.XhrManager');

/**
 * @constructor
 * @implements {mvc.Sync}
 */
mvc.AjaxSync = function(url) {
    
    var baseFunction = function(model){return ""};
    
    this.baseUrls_ = {
        create: baseFunction,
        read: baseFunction,
        update: baseFunction,
        del: baseFunction
    };

    if(goog.isString(url) || goog.isFunction(url)) {
        url = {
            create: url,
            read: url,
            update: url,
            del: url
        };
    }
    goog.object.extend(this.baseUrls_, goog.object.map(url, function(val) {
        if(goog.isString(val))
            return function(model) {
                return val.replace(/:(\w+)/g, function(id) {
                    return model.get(id);
            });};
        return val;
    }));
    this.xhr_ = new goog.net.XhrManager();
    this.sendCount_ = 0;
};

/**
 * @inheritDoc
 */
mvc.AjaxSync.prototype.create = function(model, callback) {
    this.xhr_.send(""+(this.sendCount_++), this.baseUrls_.create(model),
        "POST", model.toJson().toString(), undefined,  undefined,
        goog.bind(this.onCreateComplete_, this, model, callback));
};

/**
 * @inheritDoc
 */
mvc.AjaxSync.prototype.read = function(model, callback) {
    this.xhr_.send(""+(this.sendCount_++), this.baseUrls_.read(model),
        "GET", undefined, undefined, undefined,
        goog.bind(this.onReadComplete_, this, model, callback));
};

/**
 * @inheritDoc
 */
mvc.AjaxSync.prototype.update = function(model, callback) {
    this.xhr_.send(""+(this.sendCount_++), this.baseUrls_.update(model),
        "PUT", model.toJson().toString(), undefined, undefined,
        goog.bind(this.onUpdateComplete_, this, model, callback));
};

/**
 * @inheritDoc
 */
mvc.AjaxSync.prototype.del = function(model, callback) {
    this.xhr_.send(""+(this.sendCount_++), this.baseUrls_.del(model),
        "DELETE", undefined, undefined, undefined, 
        goog.bind(this.onDelComplete_, this, model, callback));
};

/**
 * override this to do processing on returned data
 *
 * @param {mvc.Model} model
 * @param {Function} callback
 */
mvc.AjaxSync.prototype.onCreateComplete_ = function(model, callback, e) {
    var xhr = e.target;
    model.set('id', xhr.getResponseJson()['result']['id']);
};

/**
 * override this to do processing on returned data
 *
 * @param {mvc.Model} model
 * @param {Function} callback
 */
mvc.AjaxSync.prototype.onReadComplete_ = function(model, callback, e) {
     var xhr = e.target;
    var json = xhr.getResponseJson()['result'];
    model.set(json);
};

/**
 * override this to do processing on returned data
 *
 * @param {mvc.Model} model
 * @param {Function} callback
 */
mvc.AjaxSync.prototype.onUpdateComplete_ = function(model, callback, e) {
};

/**
 * override this to do processing on returned data
 *
 * @param {mvc.Model} model
 * @param {Function} callback
 */
mvc.AjaxSync.prototype.onDelComplete_ = function(model, callback, e) {
};