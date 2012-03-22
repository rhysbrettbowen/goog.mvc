//     goog.mvc 0.9

//     (c) 2012 Rhys Brett-Bowen, Catch.com
//     goog.mvc may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/rhysbrettbowen/goog.mvc

goog.provide('mvc.Mediator');

goog.require('goog.array');
goog.require('goog.object');

/**
 * @constructor
 */
mvc.Mediator = function() {
    /** @private */
    this.available_ = {};
    /** @private */
    this.listeners_ = {};
};


/**
 * lets components know that a message can be fired by an object.
 *
 * @param {Object} obj
 * @param {Array.<string>} messages
 */
mvc.Mediator.prototype.register = function(obj, messages) {
    // each message we save the object reference in an array so we know it
    // can provide that message
    goog.array.forEach(messages, function(message) {
        this.available_[message] = this.available_[message] || [];
        goog.array.insert(this.available_[message], obj);
        // if we registered any listeners for a message that can now start we
        // fire it with the object
        if(this.available_[message].length == 1 && this.listeners_[message]) {
            goog.array.forEach(this.listeners_[message], function(listener) {
                if(listener.init)
                    listener.init(obj);
            });
        }
    }, this);
};

/**
 * removes the object from the register for that message
 *
 * @param {Object} obj
 * @param {Array.<string>=} opt_messages
 */
mvc.Mediator.prototype.unregister = function(obj, opt_messages) {
    // remove the object from all available
    goog.object.forEach(this.available_, function(val, key) {
        // if it's not in the messages to remove then skip
        if(opt_messages && !goog.array.contains(opt_messages, key))
            return;
        // remove and if the last to be removed from a message call dispose
        // methods for listening objects
        if(goog.array.remove(val, obj) && !val.length) {
            if(this.listeners_[key]) {
                goog.array.forEach(this.listeners_[key], function(listener) {
                    if(listener.dispose)
                        listener.dispose(obj);
                });
            }
            delete this.available_[key];
        }
    }, this);
};

/**
 * the message to listen for and the handler. Can either be a function to run
 * or an object of the type: {init:Function, fn:Function, dispose:Function}
 * which will run init when the message becomes available and dispose when
 * a message is no longer supported. Returns a uid that can be used with
 * off to remove the listener
 *
 * @param {string|Array.<string>} message
 * @param {Object|Function} handler
 */
mvc.Mediator.prototype.on = function(message, handler) {
    if(goog.isArrayLike(message)) {
        goog.array.forEach(/** @type {Array} */(message), function(mess) {
            this.on(mess, handler);
        }, this);
        return null;
    }
    this.listeners_[message] = this.listeners_[message] || [];
    if(!this.listeners_[message].length) {
        if(handler.init && this.available_[message]) {
            handler.init(this.available_[message][0]);
        }
    }
    goog.array.insert(this.listeners_[message], handler);
    return goog.getUid(handler);
};

/**
 * this will only run the function the first time the message is given
 *
 * @param {string} message
 * @param {Function} handler
 */
mvc.Mediator.prototype.once = function(message, handler) {
    var uid;
    var fn = goog.bind(function() {
        handler.apply(this, Array.prototype.slice.call(arguments,0));
        this.off(uid);
    },this);
    uid = this.on(message, fn);
    return uid;
};

/**
 * remove the listener by it's id
 *
 * @param {number} uid
 */
mvc.Mediator.prototype.off = function(uid) {
    goog.object.forEach(this.listeners_, function(listener) {
        goog.array.removeIf(listener, function(el) {
            return goog.getUid(el) == uid;
        });
    });
};

/**
 * check to see if anyone is listening for a message
 *
 * @param {string} message
 * @return {boolean}
 */
mvc.Mediator.prototype.isListened = function(message) {
    return !!this.listeners_[message];
};

/**
 * broadcast the message to the listeners
 *
 * @param {string} message
 * @param {*=} opt_args
 */
mvc.Mediator.prototype.broadcast = function(message, opt_args) {
    if(!this.listeners_[message])
        return;
    goog.array.forEach(this.listeners_[message], function(listener) {
        if(goog.isFunction(listener)) {
            listener(opt_args);
        } else if (listener.fn) {
            listener.fn(opt_args);
        }
    });
};

/**
 * reset the mediator to it's original state
 */
mvc.Mediator.prototype.reset = function() {
    this.available_ = {};
    goog.object.forEach(this.listeners_, function(listener) {
        goog.array.forEach(listener, function(l) {
            if(l.dispose)
                l.dispose();
        });
    });
    this.listeners_ = {};
};
