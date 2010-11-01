dojo.provide("app.tests.module");
try{
	doh.registerUrl("Application", dojo.moduleUrl("app", "tests/test_Application.html"), 99999999);
}catch(e){
	doh.debug(e);
}
