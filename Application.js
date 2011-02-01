dojo.provide("tapp.Application");

dojo.require("tapp._ComponentManagerMixin");
dojo.require("dojox.lang.functional.object");
dojo.require("dojox.lang.utils");

(function(d){

	d.declare("tapp.Application", [tapp._ComponentManagerMixin], {
		// summary: 
		// 		Page-level controller class, implements the following lifecycle (phases): 

		baseComponents: [], 
		extraComponents: null,
		
		config: null,
		
		constructor: function(params){
			console.log("params: ", params);
			d.mixin(this, params || {});

			console.log("params mixed in");

		},
		postscript: function() {
			console.log("tapp.postscript, running setUp");
			this.initialize();
			this.initComponents();
		},
		_createSequence: function(methods) {
			// summary: 
			// 		Create a sequence of method calls that will execute in order, 
			// 		with each being optionally asynchronous
			// 		Methods can manipulate the sequence at runtime 
			// 		e.g. to unshift or push more functions onto the queue
			var sequence = {}, self = this;
			sequence.start = sequence.next = function() {
				var fn = methods.shift();
				if(fn) {
					if(typeof fn == "string") {
						fn = dojo.hitch(self, fn);
					}
					return d.when( fn(), d.hitch(this, "next") );
				} else {
				}
			};
			return sequence;
		},

		_configure: function(config) {
			// summary: 
			// 		Assemble config for the app and components
			var utils = dojox.lang.utils;

			// merge over any instance config properties on top of module config
			config = dojo.mixin({}, tapp.config, config || {});

			// look for config params in djConfig.kernelConfig
			// if the host page is server-generated, that would be a place to configure also
			if(dojo.config.kernelConfig) {
				utils.updateWithObject(config, dojo.config.kernelConfig, true);
			}

			// merge in params from our querystring
			var queryArgs = dojo.queryToObject(location.search.substring(1));
			// we support dot-paths e.g. ?user.name=foo
			for(var paramName in queryArgs) {
				if(paramName.indexOf(".") > 0) {
					dojo.setObject(paramName, queryArgs[paramName], queryArgs);
					delete queryArgs[paramName];
				}
			}
			utils.updateWithObject(config, queryArgs, true);

			this.config = config;
		},
		
		initialize: function() {
			// stub, initialize self
			console.log(this.declaredClass + " initialize");
			this._configure(this.config || {});
			this.publishInternalEvent("initialize", [this]);
		},

		startup: function(){
			if(this.parseOnLoad){
				dojo.parser.parse();
			}
			// stub
		},

		destroy: function(){
			// stub
		}

	});
		
})(dojo);
