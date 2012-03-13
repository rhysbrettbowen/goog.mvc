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
var Person = function(firstName, lastName) {
    goog.base(this, {attr: {
        'firstName': firstName,
        'lastName': lastName
    }});
    this.meta('name', ['firstName','lastName'], function(firstName, lastName) {
        return lastName + ", " + firstName;
    });
};
goog.inherits(Person, mvc.Model);
```

Any setup would go in the constructor function (in the above we used the meta function to create a meta attribute). You can override methods and add new methods of your own.

When creating a new model instance, the constructor takes an options object. The options are attr, schema and sync. The attr option will create a model and set the attributes passed. The schema and sync can be used to pass in an mvc schema or sync object to use.

You should always use the get() and set() functions when dealing with the model's data. These functions take care of saving old data and publishing change events

There are also three functions that allow you to manipulate how you can get the data. 

The alias function allows you to get a member using a different name

```javascript
model.set('lastName', 'Brett-Bowen');
model.alias('surname', 'lastName');
model.get('surname'); // returns 'Brett-Bowen'
```

The format function allows you to change how the data is presented

```javascript
model.set('now', new Date());
model.format('now', function(now) {return now.toDateString()});
model.get('now'); // returns the set date as a string
```

The meta function is passed the new variable name, an array or attributes to base the data off and the formatting function.

```javascript
model.set({
    'firstName': 'Rhys',
    'lastName': 'Brett-Bowen'
    });
model.meta('name', ['firstName', 'lastName'], function(firstName, lastName) {
    return lastName + ", " + Rhys;
});
model.get('name'); // returns "Brett-Bowen, Rhys"
```

## mvc.model.Schema ##

A schema can be set for a model. The schema takes in an object or map of keys and functions. The functions take in a value and return true or false. When a schema is passed in to a model, the model will use this to validate any values trying to be set, and won't add in data if a function returns false. You can also pass in the following strings to check for the type of input: "number", "string", "array"

## mvc.Collection ##

A mvc.Collection extends mvc.Model and so has all of it's properties. Also a collection can contain an array of models that belong to it. A collection can keep these models in an order if given a comparator function and will also listen to changes and emit a change if any model it contains fires a change event.

## mvc.Store ##

This can be used as a factory and cache for models. Use the get to retrieve models by their ID and if they don't exist they will be created. This is good to make sure your models are unique. If no ID is passed then a new model will be created and you can get the model using it's CID until an ID is set for the model.

## mvc.Control ##

the closure library already provides goog.ui.Component which is a great controller. If you use Backbone.js you'll probably recognise it as the view. mvc.Control adds in two methods, delegateEvents and getEls. These are convenience functions. The getEls allows you to use simple string selectors to get a handle for the elements under the component and delegateEvents gives an easier interface for listening to events in the component. If you want to use a different class in the library that already extends goog.ui.Component you can stil use these functions by adding them to your classes prototype like so:

```javascript
goog.require('mvc.Control');

myClass.prototype.delegateEvents = mvc.Control.prototype.delegateEvents;
myClass.prototype.getEls = mvc.Control.prototype.getEls;
```

## mvc.Sync ##

This is an interface that should have a custom implementation. Two simple implementations have been given called mvc.AjaxSync and mvc.LocalSync. The purpose of sync is to be the glue between the model and the dataStore.

## mvc.Router ##

mvc.Router uses goog.History and hash tokens to hold and manage the state of the application. You can define a route with a regular expression that will fire custom events when a certain route comes on the URL.

## mvc.Mediator ##

mvc.Mediator allows message passing between components. It's a singleton so you get it's reference using

```javascript
var mediator = mvc.Mediator.getInstance();
```

you can then register your object with the mediator and the messages that you may pass. This allows other modules that are listening for a specific message to run some initiation, or dispose when you unregister. You can listen to messages using the on method and stop using the off method. You can even test to see if anyone is listening for a message using the isListened method

### changelog ###

#### v0.7 ###

- add in mvc.Mediator

#### v0.6 ####

- split format function up to format, alias and meta
- changes fired for constructed attributes
- change the models constructor arguments to an options object
- store added

#### v0.5 ####

- add in format function on model
- removed dependency on goog.dom from mvc.Model
- put in convenience functions for binding elements with model attributes
- put in convenience function for schema test for type of object

#### v0.4 ####

- added pluck in to mvc.Collection
- fix sorting on models passed in at creation
- added in all_tests.html
- fixed mvc.Router
- tests for mvc.Router

#### v0.3 ####

- add dispose() to mvc.Model
- fix mvc.AjaxSync

#### v0.2 ####

- fix model.Schema
- mvc.Collection now takes optional index for add()
- mvc.Collection.newModel adds a new model to the collection
- mvc.AjaxSync first implementation
- mvc.AjaxSync first implementation

#### v0.1 ####

- initial documentation and versioning