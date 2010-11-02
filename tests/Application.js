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
		count: 0,
		constructor: function() {
			dojo.getObject(this.declaredClass).count++;
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
				dojo.forEach(["bootstrap", "initialize", "postInitialize", "postCreate", "startup", "destroy"], function(method){
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
		new TF("component", {
			config: { 
				id: "app_componentTest",
				baseComponents: [ ["tapp.tests.Application.TestComponent", {}] ]
			},
			runTest: function(t) {
				var app = this.instance;
				t.assertTrue(app, "Application instance is truthy");
				t.assertTrue(tapp.tests.Application.TestComponent.count, "TestComponent.count is truthy");
			}
		})
	]);
});