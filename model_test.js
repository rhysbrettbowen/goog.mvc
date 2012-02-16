goog.require('mvc.Model');

goog.require('goog.testing.jsunit');

var testSimpleModel = function() {
    var simpleModel = new mvc.Model({'a':'exists'});
    assertNotNullNorUndefined("New model created", simpleModel);
    assertEquals("Should be able to get 'a'", simpleModel.get('a'), 'exists');
    assertNull("Should return null", simpleModel.get('b'));
    assertEquals("Should be able to change 'a'", simpleModel.set('a', 'changed').get('a'), 'changed')
    assertEquals("Should be able to add new attribute 'b'", simpleModel.set('b', 'new').get('b'), 'new');
    assertNull("Should be able to remove attribute 'b'", simpleModel.unset('b').get('b'))
};
