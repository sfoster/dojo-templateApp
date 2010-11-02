<!DOCTYPE html>
<html>
<head>
	
	<title>Application Test</title>
	
	<!-- a default theme file (not strictly necessary here)-->
	<link rel="stylesheet" id="themeStyles" href="../../dijit/themes/claro/claro.css">

	<style type="text/css">
		@import "../../dojo/resources/dojo.css";
		@import "../../dijit/tests/css/dijitTests.css"; 
	</style>

	<!-- required: dojo.js -->
	<script type="text/javascript">
		djConfig = {
			isDebug: true,
			modulePaths: { "tapp": "../dojo-templateApp" }
		}
	</script>
	<script type="text/javascript" src="../../dojo/dojo.js"></script>

	<!-- debugging include -->
	<script type="text/javascript" src="../Application.js"></script>
	<script type="text/javascript">
		dojo.require("tapp.Application");

        dojo.require("doh.runner");
		dojo.require("tapp.tests.Fixture");

		dojo.ready(function(){
			// a fixture class to keep the tests DRY
			var TF = dojo.declare(tapp.tests.Fixture, {
				setUp: function() {
					this.instance = new tapp.Application({
						id: this.name + "_app",
						name: "Test"
					});
				},
				tearDown: function() {
					this.instance.destroy();
					this.instance = null;
				}
			});

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
						var callsMap = this.methodCalls = {};
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
						var app = this.instance;
						app.run();
						app.tearDown();
						
						var ok = true;
						for(var m in this.methodCalls) {
							t.assertTrue(this.methodCalls[m],  m + " method was called");
							ok &= this.methodCalls[m];
						}
						t.assertTrue(ok, "All setUp lifecycle methods were called");
					}, 
					tearDown: function() {
						var handles = this.handles, hdl;
						dojo.f
						while(handles.length) {
							dojo.disconnect(handles.shift());
						}
						this.inherited("tearDown", arguments);
					}
				})
			]);
			doh.run();

		});
	</script>
</head>
<body class="claro">

	<h1 class="testTitle">Application test</h1>

	<p>The tapp.Application tests demonstrate:</p>
	<ul>
		<li>The class loads and gets interpreted ok</li>
		<li>Application configuration and bootstrap works as intended</li>
		<li>The basic lifecyle and associated mechanisms work</li>
		<li>Teardown can be triggered, happens and has the expected result</li>
	</ul>
	
</body>
</html>