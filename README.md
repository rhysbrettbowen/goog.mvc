# goog.mvc #

a backbone.js like implementation using the google closure library

it differs in that the model holds attr objects which are passed with a change on the object. A controller can then look at the names in these models to match up bindings. This means that we don't have to rely on block notation being the same as dot notation so should compile with closure compiler on advanced mode
