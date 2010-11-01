dojo.provide("app.tests.Fixture");

dojo.declare("app.tests.Fixture", null, {
	name: "",
	timeout: 2000, // 2 seconds.

	setUp: function(props) {
		console.log("TestFixture: " + this.name);
	},
	constructor: function(name, props) {
		if(!props) {
			props = name || {};
		}
		if(typeof props == "function") {
			var fn = props;
			props = {
				runTest: fn
			};
		}
		if(!props.name) {
			props.name = name || "test_" + (app.tests.Fixture._count++);
		}
		dojo.mixin(this, props);
	},
	tearDown: function() {}
});
app.tests.Fixture._count = 0;
