dojo.provide("tapp.ErrorReporter");

dojo.require("tapp._ComponentMixin");
dojo.require("dojox.analytics._base");

dojo.declare("tapp.ErrorReporter", [tapp._ComponentMixin], {
	type: "",
	constructor: function(args){
		dojo.mixin(this, args || {});
		
		if(!this.type) {
			throw new Error("Attempt to instantiate " + this.declaredClass + " without an .type property");
		}
		
		this.addData = dojo.hitch(dojox.analytics, "addData", this.type);

		this.subscribeInternalEvent("onError", this, function(err){
			this.addData(err.toString());
		});
	}
});