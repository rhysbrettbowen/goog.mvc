# goog.mvc #

a backbone.js inspired MVC library using the google closure library

mapping:

## mvc.Model ##

The mvc.Model behaves much the same way as the Backbone.Model.

One major difference is that for validation the mvc.Model takes in an mvc.model.Schema that provides functions for validation. The validation can either be a string stating type ("string", "number", etc), a regex, or a function that takes the value and the model to test and returns true or false.



## mvc.Control || goog.ui.Compnent ##

The mvc.Control is basically a goog.ui.Component.

There is a little syntactic sugar to make it more similar to Backbone.js, but the only extra useful method is delegateEvents which takes in an object like {"#{eventType} .#{className}" : function(Event)}. This binds events in the component to functions. If you're using a different goog.ui that inherits from goog.ui.Component then you can just bring over the function like so: yourObject.delegateEvents = mvc.Control.prototype.delegateEvents

## mvc.Collection ##

a Collection in goog.mvc is also a model which means that it can have it's own attributes and schema. It can take in a comparator function to keep the models in order

## mvc.Router ##

works the same as Backbone.Router, but uses goog.History instead of Backbone.History

## mvc.Sync ##

This is an interface and should deal with the models talking to the data store. Simple implementations have been provided for ajax and localstorage
