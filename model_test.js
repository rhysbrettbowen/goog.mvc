goog.require('mvc.Model');

goog.require('goog.testing.jsunit');

var simpleModel;
var emptyModel;

var setUp = function() {
    simpleModel = new mvc.Model({'a':'exists'});
    emptyModel = new mvc.Model();
}

var testSimpleModel = function() {
    assertNotNullNorUndefined("New model created", simpleModel);
    assertEquals("Should be able to get 'a'", simpleModel.get('a'), 'exists');
    assertNull("Should return null", simpleModel.get('b'));
    assertEquals("Should be able to change 'a'", simpleModel.set('a', 'changed').get('a'), 'changed')
    assertEquals("Should be able to add new attribute 'b'", simpleModel.set('b', 'new').get('b'), 'new');
    assertUndefined("Should be able to remove attribute 'b'", simpleModel.unset('b').get('b'))
};

var testEmptyModel = function() {
    assertNotNull(emptyModel);
};
