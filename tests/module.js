dojo.provide("tapp.tests.module");
try{
	doh.registerUrl("Application", dojo.moduleUrl("tapp", "tests/test_Application.html"), 99999999);
}catch(e){
	doh.debug(e);
}
