dojo.provide("tapp._ComponentMixin");
dojo.require("dijit._Contained");

dojo.declare("tapp._ComponentMixin", [dijit._Contained], {
	componentType: "BaseComponent",

	getParent: function(){
		// summary:
		//              Returns the parent widget of this widget, assuming the parent
		//              specifies isContainer
		return this.parent;
	},

	expose: function(name, f){
		//console.log("Exposing API Method on Table: ", name, f);
		var p = this.getParent();

		if (!p[name]) {
			p[name] = dojo.hitch(this, f);
		}
	},

	subscribeInternalEvent: function(evt, scope, cb){
		var name = "/" + this.getParent().id + "/" + evt;
		//console.log(this.id, "Subscribe: ", name);
		return dojo.subscribe(name, this, cb);
	},

	publishInternalEvent: function(evt, args ){
		var name = "/" + this.getParent().id + "/" + evt;
		//console.log(this.id, "Publishing Internal Event: ", name, args);
		return dojo.publish(name, args);
	}
});
