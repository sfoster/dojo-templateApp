dojo.provide("tapp.tests.Fixture");

dojo.declare("tapp.tests.Fixture", null, {
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
			props.name = name || "test_" + (tapp.tests.Fixture._count++);
		}
		dojo.mixin(this, props);
	},
	tearDown: function() {}
});
tapp.tests.Fixture._count = 0;
