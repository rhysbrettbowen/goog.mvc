# goog.mvc #

a backbone.js like implementation using the google closure library

mapping:

## Backbone.model == goog.mvc.model ##

- uses an array of attributes to get around the [] vs . changes with advanced compilation
- uses change instead of bind to listen to change events on an attribute

## Backbone.view == goog.mvc.control ##

- the actual view should be the template - no template engine (recommend using closure templates)
- extends goog.ui.component so you get all it's goodness too.

