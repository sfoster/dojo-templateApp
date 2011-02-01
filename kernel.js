//Look at the config and launch the kernel
(function(){
	console.log("kernel loading");
	var config = dojo.config.kernelConfig,
		id = config.id ? config.id : (config.id = "kernel"),
		parseOnLoad = dojo.config.parseOnLoad;

	//declare the new kernel class
	//we use declare for what is basically a singleton
	// in order to leverage declare's familiar "constructor"/"postscript" and "inherited" features
	dojo.ready(function(){
		// define and instantiate it!
		console.log("creating global app instance: " + id, " with: ", config.mixins);
		console.log("mixins: ", config.mixins);
		var mixins =  dojo.map(config.mixins, function(module){
			return dojo.getObject(module);
		});
		// console.log("mixins: ", mixins);
		var app = dojo.global[id] = new dojo.declare(mixins)({
			extraComponents: config.extraComponents,
			parseOnLoad: parseOnLoad
		});
		app.startup();
		
	});
	// don't parse, leave that step to our kernel
	dojo.config.parseOnLoad = false;
})();
