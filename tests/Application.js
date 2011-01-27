dojo.provide("tapp.tests.Application");
dojo.require("tapp.Application");
dojo.require("tapp._ComponentMixin");

dojo.require("doh.runner");
dojo.require("tapp.tests.Fixture");

dojo.ready(function(){
	// a fixture class to keep the tests DRY
	var TF = dojo.declare(tapp.tests.Fixture, {
		setUp: function() {
			console.log(this.name + "fixture setUp, w. ctorArgs: ", this.ctorArgs);
			var args = dojo.delegate({
				id: this.name + "_app",
				name: "Test"
			}, this.ctorArgs || {});
			
			this.instance = new tapp.Application(args);
		},
		tearDown: function() {
			this.instance.destroy();
			this.instance = null;
		}
	});
	
	dojo.declare("tapp.tests.Application.TestComponent", [tapp._ComponentMixin], {
		testEventHeard: false,
		constructor: function(args) {
			dojo.mixin(this, args || {});
			
			dojo.getObject(this.declaredClass).count++;
			console.log("TestComponent ctor, exposing: ", this.exposedMethod);
			this.expose("exposedTestComponentMethod", "exposedMethod");
			
			this.subscribeInternalEvent("testEvent", this, "testEventListener")
		},
		exposedMethod: function(){
			return true;
		},
		testEventListener: function(){
			this.testEventHeard = true;
		}
	});
	tapp.tests.Application.TestComponent.count = 0;
	
	// globally-accessible map to allow checking fixture cleanup btween tests
	tapp.tests.Application.lifecycleMethodCalls = {}

	doh.register("Application smoketest", [
		function classExists(t){
			t.assertTrue(tapp.Application);
			t.assertEqual("function", typeof tapp.Application);
		},
		new TF("fixtureTest", function(t){
			var w = this.instance; 
			t.assertTrue(w, "tapp.Application instance is truthy");
			t.assertEqual("Test", w.name, "tapp.Application has correct name property value");
		})
	]);

	doh.register("Application methods", [
		new TF("instantiation", {
			setUp: function() {
				var initialized = false;
				var h = dojo.connect(tapp.Application.prototype, "initialize", this, function(){
					this.instanceInitialized = true;
				});
				this.inherited("setUp", arguments);
				dojo.disconnect(h);
			}, 
			runTest: function(t) {
				t.t(this.instanceInitialized, "initialize was called during instantiation");
			}
		}),
		new TF("config", {
			setUp: function() {
				// put a config object where our fixture's setUp will find it
				this.ctorArgs = { config: { prop: "value" } };
				this.inherited("setUp", arguments);
				console.log("after setup, this.instance: ", this.instance);
			},
			runTest: function(t){
				var app = this.instance;
				// confirm our config made it through to the instance
				t.assertTrue(app.config.prop);
			}
		})
	]);
	doh.register("Components", [
		new TF("component instantiation", {
			ctorArgs: { 
				id: "app_componentTest",
				baseComponents: [ ["tapp.tests.Application.TestComponent", { id: "componentTest" }] ]
			},
			runTest: function(t) {
				var app = this.instance;
				t.assertTrue(app, "Application instance is truthy");
				t.assertTrue(tapp.tests.Application.TestComponent.count, "TestComponent.count is truthy");
				t.assertTrue(app.getComponent("componentTest"), "getComponent with a known id returns a truthy value");
				t.assertEqual(app, app.getComponent("componentTest").getParent(), "component's parent is the app");
			}
		}),
		new TF("component exposed method", {
			ctorArgs: { 
				id: "app_componentExposedMethodTest",
				baseComponents: [ ["tapp.tests.Application.TestComponent", { id: "componentTest" }] ]
			},
			runTest: function(t) {
				var app = this.instance;
				t.assertEqual("function", typeof app.exposedTestComponentMethod, "Exposed component method is a property on the app");
				t.assertTrue(app.exposedTestComponentMethod(), "Exposed component method returns truthy value");
			}
		}),
		new TF("component subscribeInternalEvent", {
			ctorArgs: { 
				id: "app_subscribeInternalEventTest",
				baseComponents: [ ["tapp.tests.Application.TestComponent", { id: "componentTest" }] ]
			},
			runTest: function(t) {
				var app = this.instance, 
					component = app.getComponent("componentTest");
				t.assertFalse(component.testEventHeard, "Before publishing the event, the testEventHeard flag is falsy");
				app.publishInternalEvent("testEvent", []);
				t.assertTrue(component.testEventHeard, "The published event caused the testEventHeard flag to be set on the component");
			}
		})
	]);
});