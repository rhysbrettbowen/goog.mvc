goog.require('mvc.Control');
                                    
goog.require('goog.dom');
goog.require('goog.testing.jsunit');

var simpleControl;

var setUp = function() {
    simpleControl = new mvc.Control();
}

var testSimpleControl = function() {
    simpleControl.init = goog.nullFunction;
    simpleControl.render(goog.dom.getElement("control"));
    assertEquals("should come back with one element", simpleControl.getEls(".class2").length, 1);
    assertEquals("should come back with 2 elements", simpleControl.getEls(".class1").length, 2);
};
