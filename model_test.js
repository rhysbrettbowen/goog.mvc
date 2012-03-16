goog.require('mvc.Model');

goog.require('goog.testing.jsunit');

var simpleModel;
var emptyModel;

var setUp = function() {
    simpleModel = new mvc.Model({attr:
        {'a':'exists'}});
    emptyModel = new mvc.Model();
};

var testSimpleModel = function() {
    assertNotNullNorUndefined("New model created", simpleModel);
    assertEquals("Should be able to get 'a'", simpleModel.get('a'), 'exists');
    assertNull("Should return null", simpleModel.get('b'));
    assertEquals("Should be able to change 'a'", simpleModel.set('a', 'changed').get('a'), 'changed');
    assertEquals("Should be able to add new attribute 'b'", simpleModel.set('b', 'new').get('b'), 'new');
    assertUndefined("Should be able to remove attribute 'b'", simpleModel.unset('b').get('b'));
};

var testEmptyModel = function() {
    assertNotNull(emptyModel);
};

var testAlias = function() {
    simpleModel.set('date', {day:1,month:1});
    simpleModel.alias('1jan2010', 'date');
    assertEquals(simpleModel.get('1jan2010'), simpleModel.get('date'));
};

var testFormat = function() {
    simpleModel.set('date', {day:1,month:1});
    simpleModel.format('date', function(date) {
        return date.day+"/"+date.month;
    });
    assertEquals(simpleModel.get('date'), "1/1");
};

var testMeta = function() {
    simpleModel.set('day',1);
    simpleModel.set('month',1);
    simpleModel.meta('jan1', ['day', 'month'], function(day, month) {
        return day+"/"+month;
    });
    assertEquals(simpleModel.get('jan1'),"1/1");    
};
