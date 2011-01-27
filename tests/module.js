dojo.provide("tapp.tests.module");
try{
	// doh.registerUrl("App2UI", dojo.moduleUrl("tapp", "tests/test_App2ApplicationUi.html"), 99999999);
	dojo.require("tapp.tests.Application");
	dojo.require("tapp.tests.Error");
}catch(e){
	doh.debug(e);
}
