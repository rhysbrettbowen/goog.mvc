# goog.mvc #

An MVC library which uses the Google Closure library for use with the Closure Compiler

The folder should be put in your project directory and the path passed to the closure compiler

to use a module, use

```javascript
goog.require('packageName');
```

## mvc.Model ##

The model is the main component. It allows you to store data and sends out change events when it changes (it extends goog.events.EventTarget). It also communicates with the data store through mvc.Sync

You can instantiate a new model directly, or you may wish to create a new type of model that inherits from mvc.Model like so:

```javascript
goog.require('mvc.Model');

/**
 * @constructor
 * @inheritDoc
 */
var complexModel = function(attr, schema) {
    goog.base(this, attr, schema);
};
goog.inherits(complexModel, mvc.Model);
```

Any setup would go in the constructor function and you can override methods and add new methods of your own.

When creating a new model instance, the constructor takes two optional arguments. The first is a map or object with the initial keys and values of the model. The second is a schema which will be described in the next section

You should always use the get() and set() functions when dealing with the model's data. These functions take care of saving old data and publishing change events

There is also a format function that allows you to format the data when you get it, or even create new attributes using existing ones

## mvc.model.Schema ##

A schema can be set for a model. The schema takes in an object or map of keys and functions. The functions take in a value and return true or false. When a schema is passed in to a model, the model will use this to validate any values trying to be set, and won't add in data if a function returns false. You can also pass in the following strings to check for the type of input: "number", "string", "array"

## mvc.Collection ##

A mvc.Collection extends mvc.Model and so has all of it's properties. Also a collection can contain an array of models that belong to it. A collection can keep these models in an order if given a comparator function and will also listen to changes and emit a change if any model it contains fires a change event.

## mvc.Control ##

the closure library already provides goog.ui.Component which is a great controller. If you use Backbone.js you'll probably recognise it as the view. mvc.Control adds in two methods, delegateEvents and getEls. These are convenience functions. The getEls allows you to use simple string selectors to get a handle for the elements under the component and delegateEvents gives an easier interface for listening to events in the component. If you want to use a different class in the library that already extends goog.ui.Component you can stil use these functions by adding them to your classes prototype like so:

```javascript
goog.require('mvc.Control');

myClass.prototype.delegateEvents = mvc.Control.prototype.delegateEvents;
myClass.prototype.getEls = mvc.Control.prototype.getEls;
```

## mvc.Sync ##

This is an interface that should have a custom implementation. Two simple implementations have been given called mvc.sync.Ajax and mvc.sync.Local. The purpose of sync is to be the glue between the model and the dataStore.

## mvc.Router ##

mvc.Router uses goog.History and hash tokens to hold and manage the state of the application. You can define a route with a regular expression that will fire custom events when a certain route comes on the URL.

### changelog ###

#### v0.5 ####

- add in format function on model

#### v0.4 ####

- added pluck in to mvc.Collection
- fix sorting on models passed in at creation
- added in all_tests.html
- fixed mvc.Router
- tests for mvc.Router

#### v0.3 ####

- add dispose() to mvc.Model
- fix mvc.sync.Local

#### v0.2 ####

- fix model.Schema
- mvc.Collection now takes optional index for add()
- mvc.Collection.newModel adds a new model to the collection
- mvc.sync.Ajax first implementation
- mvc.sync.Local first implementation

#### v0.1 ####

- initial documentation and versioning