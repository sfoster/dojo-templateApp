dojo.provide("tapp.Application");

(function(d){

	d.declare("tapp.Application", null, {
		// summary: 
		// 		Page-level controller class, implements the following lifecycle (phases): 

		constructor: function(params){
			d.mixin(this, params);
			this.setUp();
		},
		_createSequence: function() {
			// summary: 
			// 		Create a sequence of method calls that will execute in order, 
			// 		with each being optionally asynchronous
			var sequence = d.map(
				Array.prototype.slice.apply(arguments), function(method) {
					return d.hitch(this, method);
				}, this);

			sequence.start = sequence.next = function() {
				var fn = this.shift();
				if(fn) {
					return d.when(fn(), d.hitch(this, "next"));
				}
			};
			return sequence;
		},

		setUp: function() {
			// summary: setup phase
			// 		bootstrap: 		load dependencies, load/snarf config, create components
			// 		init: 			init self and components
			// 		postInitialize:	hook for post-initialization tasks

			var sequence = this._createSequence(
				"bootstrap",
				"initialize",
				"postInitialize"
			);
			return sequence.start();
		},
		
		_configure: function(config) {
			d.mixin(config || {});
		},
		
		bootstrap: function() {
			this._configure( tapp.config );
		},
		initialize: function() {
			// stub
		},
		postInitialize: function() {
			// stub
		},

		run: function() {
			var sequence = this._createSequence(
				"postCreate",
				"startup"
			);
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
			var sequence = this._createSequence(
				"destroy"
			);
			return sequence.start();
		},
		
		destroy: function(){
			// stub
		}

	});
		
})(dojo);
