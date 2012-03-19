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

When creating a new model instance, the constructor takes an options object. The options object takes the special keys 'schema', 'sync' and 'attr'. The schema should inherit from mvc.models.Schema, the sync should implement mvc.Sync. The attr should contain a map of all the initial values you want for the model. Other key value pairs given in the options object will be moved under the attr key.

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

the real power in a model comes in binding. You can bind keys, or computed keys to functions or attributes. The bind function takes three arguments. The first is the attribute name or an array of attribute names whose changes you want to listen to. The second is a function which will be passed the value of each of the items you are listening to and the model. If you want to bind it between two models, we give you a helper function:

```
// married couple living together
var husband = new mvc.Model({'city':'San Francisco'});
var wife = new mvc.Model({'city':'San Francisco'});
husband.bind('city', wife.setBinder('city'));
```

The final parameter is the object to bind the function to. So you could do this:

```javascript
var task = new mvc.Model({'done':false,'important':false});
var element = document.getElementById('myTask');
task.bind(['done','important'], function(done, important) {
    this.checked = done;
    this.setProperty('important', important);
}, element);
```

if you want to listen to any change you can use bindAll and just pass in a function.

The bindAll and bind functions return an id that can be passed to unbind to remove the binding.

There are also other functions that can take parameters such as the boolean "silent" to suppress change events. The other functions available on a model are:
- toJson: used to return a json model that can be used by mvc.Sync or other objects. You should generally override this method with your own implementation
- setSync(mvc.Sync): will set the sync used by the object
- reset(silent): clears the attributes
- isNew: returns a boolean if an id has been set (rather than just a cid)
- setSchema(mvc.model.Schema): sets the schema
- has(string): whether the model has the key
- unset(string): deletes a key (sets to undefined)
- change: manually fire a change event - handy if you've been using silent for bulk operations
- prev(string): the previous value of an attribute, gets the raw data
- getChanges: tells you what values has changed since the last change event used internally by bind to figure out what to fire change events for
- revert: rolls back to the previous attributes
- fetch(callback, silent): updates the model using it's sync
- save: tells the sync to create/update


## mvc.model.Schema ##

A schema can be set for a model. The schema takes in an object or map of keys and functions. The functions take in a value, throw an error if the data is invalid and should return the value to be set in the model. In this way the schema can also act as a setter, doing all the formatting and checking. When a schema is passed in to a model, the model will use this to validate any values trying to be set, and won't add in data if a function throws an error. You can also pass in the following strings to check for the type of input: "number", "string", "array"

## mvc.Collection ##

A mvc.Collection extends mvc.Model and so has all of it's properties. Also a collection can contain an array of models that belong to it. A collection can keep these models in an order if given a comparator function which works the same as the javascript array.sort function - taking two models and returning -1, 0 or 1 and will also listen to changes and emit a change if any model it contains fires a change event.

The mvc.Collection can also take a modelType which works with the newModel method that takes an options map and will create a new model of the type passed in. So you can create new students is a class like this:

```javascript
var student = function(options){
    goog.base(this, options)
};
goog.inherits(student, mvc.Model);
var class = new mvc.Collection({
    'modelType': student,
    'name': 'clodure mvc 101'
});
class.addModel({'name':'Fred'});
// class now has a student called fred
```

A collection also offers these aditional methods:

- pluck([keys]): returns an array of json models with the keys and values of each model
- setComparator(Function): change the comparator function to keep the models in order
- getLength: number of models contained
- sort(silent): used internally to sort the models
- add(mvc.Model, index, silent): adds a model to the end unless an index is given
- remove(mvc.Model): removes the model
- getById(id): returns a model by it's id
- getModels(Function): returns an array of the models optionally filtered by a function that takes the model and the index and returns true if it should be returned in the filter otherwise false
- at(index): return the model at an index
- clear: clears all the models

## mvc.Store ##

This can be used as a factory and cache for models. Use the get to retrieve models by their ID and if they don't exist they will be created. This is good to make sure your models are unique. If no ID is passed then a new model will be created and you can get the model using it's CID until an ID is set for the model.

## mvc.Control ##

the closure library already provides goog.ui.Component which is a great controller. If you use Backbone.js you'll probably recognise it as the view. mvc.Control adds in two methods, delegateEvents and getEls. These are convenience functions. The getEls allows you to use simple string selectors to get a handle for the elements under the component and delegateEvents gives an easier interface for listening to events in the component. If you want to use a different class in the library that already extends goog.ui.Component you can stil use these functions by adding them to your classes prototype like so:

```javascript
goog.require('mvc.Control');

myClass.prototype.delegateEvents = mvc.Control.prototype.delegateEvents;
myClass.prototype.getEls = mvc.Control.prototype.getEls;
```

There is also a set of functions under mvc.Control.Fn that can be passed to mvc.Model.bind for frequently used setters (changing textContent, value and classes so far - feel free to extend it with more commonly used functions)

## mvc.Sync ##

This is an interface that should have a custom implementation. Two simple implementations have been given called mvc.AjaxSync and mvc.LocalSync. The purpose of sync is to be the glue between the model and the dataStore.
                                                           

## mvc.Router ##

mvc.Router uses goog.History and hash tokens to hold and manage the state of the application. You can define a route with a regular expression that will fire custom events when a certain route comes on the URL. A route can be defined with a route expression which can take : followed by an attribute, a * to pass the rest of the route and [] for an optional part of the url (which will be passed to the function). For instance:

```javascript
route = "/note=:id[/edit][?*]";
```
should take a function with four attribute:
```javascript
function(id,edit,query,queryVals)
```

so for /note=1234567890/edit?abc=123 will give:

```javascript
function(id,edit,query,queryVals) {
    console.log(id); // 1234567890
    console.log(edit); // /edit
    console.log(query); // ?abc=123
    console.log(queryVals); // abc=123
}
```

## mvc.Mediator ##

mvc.Mediator allows message passing between components. It's a singleton so you get it's reference using

```javascript
var mediator = mvc.Mediator.getInstance();
```

you can then register your object with the mediator and the messages that you may pass. This allows other modules that are listening for a specific message to run some initiation, or dispose when you unregister. You can listen to messages using the on method and stop using the off method. You can even test to see if anyone is listening for a message using the isListened method

### changelog ###

#### v0.9 ####

- reworked bind for performance
- mediator now has once method

#### v0.8 ####

- lots of fixes
- can reset models
- passes JSHint
- routes can have square brackets for optional components
- change function to fire change events on mvc.Model
- ajax sync now has urlifyString

#### v0.7 ####

- add in mvc.Mediator
- schema now throws errors and handles them
- fixes

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