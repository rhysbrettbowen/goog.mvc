//     goog.mvc 0.4

//     (c) 2012 Rhys Brett-Bowen, Catch.com
//     goog.mvc may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/rhysbrettbowen/goog.mvc

goog.provide('mvc.Router');

goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.History');

/**
 * @constructor
 */
mvc.Router = function() {
    this.history_ = new goog.History();
    goog.events.listen(this.history_, goog.history.EventType.NAVIGATE,
        this.onChange_, false, this);
    this.history_.setEnabled(true);
    this.routes_ = [];
};

/**
 * pass through the fragment for the URL
 *
 * @param {string} fragment
 */
mvc.Router.prototype.navigate = function(fragment) {
    this.history_.setToken(fragment);
};

/**
 * define route as string or regex. /:abc/ will pass "abc" through as an
 * argument. /*abc/def will pass through all after the * as an argument
 *
 * @param {string|RegExp} route
 * @param {Function} fn should take in the token and any captured strings
 */
mvc.Router.prototype.route = function(route, fn) {
    if(goog.isString(route))
        route = new RegExp('^' + goog.string.regExpEscape(route).replace(/\\:\w+/g, '(\\w+)').replace(/\\\*/g, '(.*)').replace(/\\\[/g,"(").replace(/\\\]/g,")?") + '$');
    this.routes_.push({route: route, callback: fn});
};

/**
 * @private
 */
mvc.Router.prototype.onChange_ = function(e) {
    var fragment = this.history_.getToken();
    goog.array.forEach(this.routes_ || [], function(route) {
        var args = route.route.exec(fragment);
        if(!args)
            return;
        route.callback.apply(this, args);
    }, this);
};
