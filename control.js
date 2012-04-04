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
 * @param {mvc.Model} model to link with the control.
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
 * @param {string} type of event.
 * @param {Event} e the original event.
 */
mvc.Control.prototype.handleEvents_ = function(type, e) {
  if (!this.eventHolder_.handlers[type])
    return;
  goog.array.forEach(this.eventHolder_.handlers[type], function(handler) {
    if (e.propagationStopped_) {
      return;
    }
    if (!handler.selectors.length ||
            goog.array.some(handler.selectors, function(className) {
          return goog.isFunction(className) ?
              className(e) :
              goog.dom.classes.has(/** @type {!Node} */(e.target),
                  className);
            })) {
      goog.bind(handler.fn, handler.handler)(e);
    }
  });
};


/**
 * delegating events. An event type is needed as well as a handling function.
 * if a third parameter is passed then elements with that class will be
 * listened to, otherwise the whole component. Returns a uid that can be used
 * to end the listener with the off method
 *
 * @param {string} eventName the event type to listen for.
 * @param {Function} fn the function to run on the event.
 * @param {string|Array.<string>|Function=} opt_className or names to
 * check element against to see if listener function should fire. if it is
 * a function then it takes the event and returns true if it matches.
 * @param {*=} opt_handler object to bind 'this' to, otherwise mvc.Control.
 * @param {number=} opt_priority default is 50, lower is more important.
 * @return {number} uid to use with off method.
 */
mvc.Control.prototype.on = function(
    eventName, fn, opt_className, opt_handler, opt_priority) {
  if (!this.eventHolder_) {
    this.eventHolder_ = {
      listeners: {},
      handlers: {}
    };
  }
  if (!this.eventHolder_.handlers[eventName])
    this.eventHolder_.handlers[eventName] = [];
  if (!this.eventHolder_.listeners[eventName])
    this.eventHolder_.listeners[eventName] = this.getHandler().listen(
        this.getElement(), eventName,
        goog.bind(this.handleEvents_, this, eventName));
  if (!goog.isDef(opt_className))
    opt_className = [];
  var obj = {
    selectors: (goog.isArray(opt_className) ?
        opt_className : [opt_className]),
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
      ) + 1);
  return obj.uid;
};


/**
 * same as on, but will only fire once
 *
 * @param {string} eventName the event type to listen for.
 * @param {Function} fn the function to run on the event.
 * @param {string|Array.<string>|Function=} opt_className or names to
 * check element against to see if listener function should fire.if it is
 * a function then it takes the event and returns true if it matches.
 * @param {*=} opt_handler object to bind 'this' to, otherwise mvc.Control.
 * @param {number=} opt_priority default is 50, lower is more important.
 * @return {number} uid to use with off method.
 */
mvc.Control.prototype.once = function(
    eventName, fn, opt_className, opt_handler, opt_priority) {
  var uid;
  var onceFn = function() {
    fn.apply(/** @type {Object} */(opt_handler || this),
        Array.prototype.slice.call(arguments));
    this.off(uid);
  };
  uid = this.on(eventName, onceFn, opt_className);
  return uid;
};


/**
 * same as on but assumes the event type is a click
 *
 * @param {Function} fn the function to run on the event.
 * @param {string|Array.<string>|Function=} opt_className or names to
 * check element against to see if listener function should fire. if it is
 * a function then it takes the event and returns true if it matches.
 * @param {*=} opt_handler object to bind 'this' to, otherwise mvc.Control.
 * @param {number=} opt_priority default is 50, lower is more important.
 * @return {number} uid to use with off method.
 */
mvc.Control.prototype.click = function(
    fn, opt_className, opt_handler, opt_priority) {
  return this.on(goog.events.EventType.CLICK,
      fn, opt_className, opt_handler, opt_priority);
};


/**
 * take off a lister by it's id
 *
 * @param {string} uid of event listener to turn off.
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
 * @param {string} selector string to use to find elements.
 * @return {?goog.array.ArrayLike} elements found.
 */
mvc.Control.prototype.getEls = function(selector) {
  if (selector.charAt(0) == '.') {
    return goog.dom.getElementsByClass(selector.substring(1),
        /** @type {Element} */(this.getElement())) || [];
  }
  if (selector.charAt(0) == '#') {
    return [goog.dom.getElement(selector)];
  }
  return goog.dom.getElementsByTagNameAndClass(selector.replace(/\s.*/, ''),
      selector.replace(/.*\./, '') || null,
      /** @type {Element} */(this.getElement()));
};


