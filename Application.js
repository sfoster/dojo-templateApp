dojo.provide("tapp.Application");

dojo.require("tapp._ComponentManagerMixin");

(function(d){

	d.declare("tapp.Application", [tapp._ComponentManagerMixin], {
		// summary: 
		// 		Page-level controller class, implements the following lifecycle (phases): 

		setUpSequence: ["bootstrap", "initialize", "initComponents"],
		runSequence:  ["postCreate", "startup"],
		tearDownSequence: ["destroy"],
		
		baseComponents: null, 
		extraComponents: null,
		
		config: null,
		
		constructor: function(params){
			//this.setUpSequence = this.runSequence = this.tearDownSequence = null;
			d.mixin(this, params || {});

			console.log("params mixed in");

		},
		postscript: function() {
			// copy the prototype's array properties as our own
			this.setUpSequence = [].concat(this.setUpSequence);
			this.runSequence = [].concat(this.runSequence);
			this.tearDownSequence = [].concat(this.tearDownSequence);
			
			console.log("tapp.postscript, running setUp");
			this.setUp();
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

		setUp: function() {
			// summary: setup phase
			// 		bootstrap: 		load dependencies, load/snarf config, create components
			// 		init: 			init self and components
			// 		postInitialize:	hook for post-initialization tasks
			console.log("setUp: ", this.setUpSequence.join(", "));

			// run setUp as a synchronous sequence: 
			var fn, 
				methods = this.setUpSequence;
			while((fn = methods.shift())) {
				console.log("setUp sequence: " + fn);
				if(typeof fn == "string") {
					fn = dojo.hitch(this, fn);
				}
				fn();
			}
		},
		
		_configure: function(config) {
			this.config = config ? config : this.config || {};
		},
		
		bootstrap: function() {
			this._configure();
			console.log("bootstrap, config: ", this.config);
		},
		initialize: function() {
			// stub, initialize self
		},

		run: function() {
			var sequence = this._createSequence(this.runSequence);
			return sequence.start();
		},

		postCreate: function(){
			// stub
		},
		startup: function(){
			// stub
		},

		// 	teardown phase
		tearDown: function() {
			var sequence = this._createSequence(this.tearDownSequence);
			return sequence.start();
		},
		
		destroy: function(){
			// stub
		}

	});
		
})(dojo);
