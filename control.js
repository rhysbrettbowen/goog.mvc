//     goog.mvc 0.9

//     (c) 2012 Rhys Brett-Bowen, Catch.com
//     goog.mvc may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/rhysbrettbowen/goog.mvc

goog.provide('mvc.Control');

goog.require('goog.dom');
goog.require('goog.object');
goog.require('goog.ui.Component');

/**
 * instantiate with a mvc.Model
 *
 * @constructor
 * @param {mvc.Model} model
 * @extends {goog.ui.Component}
 */
mvc.Control = function(model) {
    goog.base(this);
    this.setModel(model);
    this.eventHolder_ = {
        listeners: {},
        handlers: {}
    };
};
goog.inherits(mvc.Control, goog.ui.Component);

/**
 * Functions that can be passed to the mvc.Model.bind
 *
 * @enum {Function}
 */
mvc.Control.Fn = {
    TEXT: goog.dom.setTextContent,
    VAL: function(el, val) {el.value = val;},
    CLASS: goog.dom.classes.add
};


// backbone.js views are just like goog.ui.component, this is more of an interface

/**
 * remove the element and dispose
 */
mvc.Control.prototype.remove = function() {
    goog.dom.removeNode(this.getElement());
    this.dispose();
};



/**
 * Internal use. Handles and delegates events
 *
 * @private
 * @param {string} type
 * @param {Event} e
 */
mvc.Control.prototype.handleEvents_ = function(type, e) {
    if(!this.eventHolder_.handlers[type])
        return;
    goog.array.forEach(this.eventHolder_.handlers[type], function(handler) {
        if(e.propagationStopped_) {
            return;
        }
        if(!handler.selectors.length ||
            goog.array.some(handler.selectors, function(className) {
                return goog.dom.classes.has(/** @type {!Node} */(e.target), className);
            })) {
            goog.bind(handler.fn, handler.handler)(e);
        }
    });
};


/**
 * delegating events. An event type is needed as well as a handling function.
 * if a third parameter is passed then elements with that class will be listened
 * to, otherwise the whole component. Returns a uid that can be used to end
 * the listener with the off method
 *
 * @param {string} eventName
 * @param {Function} fn
 * @param {string|Array.<string>=} className
 * @param {*=} opt_handler
 * @param {number=} opt_priority
 */
mvc.Control.prototype.on = function(eventName, fn, className, opt_handler, opt_priority) {
    if(!this.eventHolder_) {
        this.eventHolder_ = {
            listeners: {},
            handlers: {}
        };
    }
    if(!this.eventHolder_.handlers[eventName])
        this.eventHolder_.handlers[eventName] = [];
    if(!this.eventHolder_.listeners[eventName])
        this.eventHolder_.listeners[eventName] = this.getHandler().listen(
            this.getElement(), eventName,
            goog.bind(this.handleEvents_, this, eventName));
    if(!goog.isDef(className))
        className = [];
    var obj = {
        selectors: (goog.isArray(className)?className:[className]),
        fn: fn,
        uid: null,
        handler: (opt_handler || this),
        priority: (opt_priority || 50)
        };
    obj.uid = goog.getUid(obj);
    goog.array.insertAt(this.eventHolder_.handlers[eventName], obj,
        goog.array.findIndexRight(this.eventHolder_.handlers[eventName],
        function(obj) {
            return obj.priority <= (opt_priority || 50);
        }
    )+1);
    return obj.uid;
};

/**
 * same as on, but will only fire once
 *
 * @param {string} eventName
 * @param {Function} fn
 * @param {string|Array.<string>=} className
 * @param {*=} opt_handler
 * @param {number=} opt_priority
 */
mvc.Control.prototype.once = function(eventName, fn, className, opt_handler, opt_priority) {
    var uid;
    var onceFn = function() {
        fn.apply(/** @type {Object} */(opt_handler||this), Array.prototype.slice.call(arguments));
        this.off(uid);
    };
    uid = this.on(eventName, onceFn, className);
    return uid;
};

/**
 * same as on but assumes the event type is a click
 *
 * @param {Function} fn
 * @param {string|Array.<string>=} className
 * @param {*=} opt_handler
 * @param {number=} opt_priority
 */
mvc.Control.prototype.click = function(fn, className, opt_handler, opt_priority) {
    return this.on(goog.events.EventType.CLICK, fn, className, opt_handler, opt_priority);
};

/**
 * take off a lister by it's id'
 *
 * @param {string} uid
 */
mvc.Control.prototype.off = function(uid) {
    goog.object.forEach(this.eventHolder_.handlers, function(val, key) {
        goog.array.removeIf(val, function(handler) {
            return handler.uid == uid;
        });
    });
};

/**
 * pass in a string like "#elementId", ".className" or "tagName[ .className]"
 * to get array of elements with the id, class or tag and class name
 *
 * @param {string} selector
 * @return {?goog.array.ArrayLike}
 */
mvc.Control.prototype.getEls = function(selector) {
    if(selector.charAt(0) == '.') {
        return goog.dom.getElementsByClass(selector.substring(1),
        /** @type {Element} */(this.getElement())) || [];
    }
    if(selector.charAt(0) == '#') {
        return [goog.dom.getElement(selector)];
    }
    return goog.dom.getElementsByTagNameAndClass(selector.replace(/\s.*/,''),
        selector.replace(/.*\./,'')||null,
        /** @type {Element} */(this.getElement()));
};


