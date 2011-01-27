dojo.provide("tapp.Application");

dojo.require("tapp._ComponentManagerMixin");

(function(d){

	d.declare("tapp.Application", [tapp._ComponentManagerMixin], {
		// summary: 
		// 		Page-level controller class, implements the following lifecycle (phases): 

		baseComponents: null, 
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
			console.log(this.declaredClass + " _configure: " + dojo.toJson(config || {}));
			this.config = config ? config : this.config || {};
		},
		
		initialize: function() {
			// stub, initialize self
			console.log(this.declaredClass + " initialize");
			this._configure(this.config || {});
		},

		startup: function(){
			// stub
		},

		destroy: function(){
			// stub
		}

	});
		
})(dojo);
