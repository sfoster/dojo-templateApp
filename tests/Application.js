dojo.provide("tapp.tests.Application");
dojo.require("tapp.Application");
dojo.require("tapp._ComponentMixin");

dojo.require("doh.runner");
dojo.require("tapp.tests.Fixture");

dojo.ready(function(){
	// a fixture class to keep the tests DRY
	var TF = dojo.declare(tapp.tests.Fixture, {
		setUp: function() {
			this.instance = new tapp.Application( dojo.delegate({
				id: this.name + "_app",
				name: "Test"
			}, this.config || {}));
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

	doh.register("smoketest", [
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

	doh.register("Lifecycle", [
		new TF("sequences", {
			setUp: function() {
				var callsMap = tapp.tests.Application.lifecycleMethodCalls = {};
				var handles = this.handles = [];
				dojo.forEach(["bootstrap", "initialize", "initComponents", "postCreate", "startup", "destroy"], function(method){
					callsMap[method] = false;
					console.log("hooking into: ", method);
					handles.push(dojo.connect(tapp.Application.prototype, method, function(){
						console.log("call to Application lifecycle method: ", method);
						callsMap[method] = true;
					}));
				});
				this.inherited("setUp", arguments);
			},
			runTest: function(t){
				var app = this.instance, 
					callsMap = tapp.tests.Application.lifecycleMethodCalls;
				app.run();
				app.tearDown();
				
				var ok = true;
				for(var m in callsMap) {
					t.assertTrue(callsMap[m],  m + " method was called");
					ok &= callsMap[m];
				}
				t.assertTrue(ok, "All setUp lifecycle methods were called");
			}, 
			tearDown: function() {
				var handles = this.handles, hdl;
				
				while(handles.length) {
					dojo.disconnect(handles.shift());
				}
				tapp.tests.Application.lifecycleMethodCalls = {};

				this.inherited("tearDown", arguments);
			}
		}),
		new TF("tearDown fixture", function(t) {
			var app = this.instance, 
				callsMap = tapp.tests.Application.lifecycleMethodCalls;
			app.run();
			app.tearDown();
			
			for(var m in callsMap) {
				t.assertFalse(m in callsMap,  m + " disconnected");
			}
		}),
		new TF("configure", {
			config: { id: "app_configureTest" },
			runTest: function(t) {
				var app = this.instance;
				t.assertEqual("app_configureTest", app.id, "Application instance configured with correct id");
			}
		}),
		new TF("insert lifecyle step", function(t) {
			var app = this.instance, 
				postStartupCalled = false, 
				postCreateCalled = false;
				
			app.postStartup = function() {
				postStartupCalled = true;
			}
			app.runSequence.push("postStartup");

			dojo.connect(app, "postCreate", function() {
				postCreateCalled = true;
				t.assertFalse(postStartupCalled, "postStartup has not yet run");
			});

			app.run();

			t.assertTrue(postCreateCalled, "postCreate ran");
			t.assertTrue(postStartupCalled, "postStartup ran");

			app.tearDown();
		})
	]);
	doh.register("Components", [
		new TF("component instantiation", {
			config: { 
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
			config: { 
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
			config: { 
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