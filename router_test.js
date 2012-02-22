goog.require('mvc.Router');



var router;

var setUp = function() {
    router = new mvc.Router();
}

var testNavigation = function() {
    router.navigate("testing");
    loc = document.location.toString();
    assertEquals(loc.replace(/.*#/,''), "testing");
};

var testRoute = function() {
    var reached = false;
    var a = function(){reached = true};
    router.route("test", a);
    router.navigate("test");
    waitForEvent(router.history_, goog.history.EventType.NAVIGATE,
        function() {
            assert(reached);
        });
};
