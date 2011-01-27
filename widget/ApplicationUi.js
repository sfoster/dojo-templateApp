dojo.provide("tapp.widget.ApplicationUi");

dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.Dialog");
dojo.require("tapp._ComponentMixin");

dojo.declare(
		"tapp.widget.ApplicationUi", 
		[dijit.layout._LayoutWidget, dijit._Templated, tapp._ComponentMixin], {

	// summary: a top-level whole-UI widget
	//
	// example:
	// |	var widget = new tapp.widget.ApplicationUi({
	// |		templateKey: "app.config.template.UI"
	// |	});
	//	
	// example: 
	// |	<!-- markup: -->
	// |	<div dojoType="tapp.widget.ApplicationUi" templateKey="app.config.template.UI"></div>
	//

	// baseClass: String
	// 		The css class to use on the domNode and prefix for class names on other nodes
	"baseClass": "tappApplication",
	
	// widgetsInTemplate: Boolean
	// 		Will the template include dojoType'd elements needing instantiation?
	widgetsInTemplate: true,
	
	// templateKey: String
	// 		A dot-path which should resolve to a dojo.cache-ed templateString
	templateKey: "",

	buildRendering: function(){
		// summary: 
		// 		Extended to add support for a templateKey property
		
		console.log(this.declaredClass + " buildRendering");
	    if(this.templateKey) {
			console.log(this.declaredClass + " templateKey: ", this.templateKey);
			console.log(this.declaredClass + " templateString: ", dojo.getObject(this.templateKey));
			
			this.templateString = ""+dojo.getObject(this.templateKey); 
			if(!this.templateString) {
				throw new Error(this.declaredClass + " resolving templateKey '"+this.templateKey+"' returned an empty string");
			}
	    }
		console.log(this.declaredClass + " / templateKey: ", this.templateString);

		this.inherited(arguments);
		console.log(this.declaredClass + " /buildRendering");
	},

	postCreate: function() {
		this.subscribeInternalEvent("startup", this, "startup");
		// move markup content into the new content container
		if(this.centerPane && this.containerNode.childNodes.length) {
			this.centerPane.set("content", this.containerNode.childNodes);
			dojo.destroy(this.containerNode);
			this.containerNode = this.centerPane.containerNode;
		}
	},
	startup: function() {
		if(this._started) {
			console.log(this.declaredClass + " already started");
			return; 
		}
		console.log(this.declaredClass + " startup");
		this.inherited(arguments);
	},
	getChildren: function() {
		return dijit.findWidgets(this.layoutNode || this.domNode);
	},
	layout: function() {
		var children = dojo.map(this.getChildren(), function(child){
			return { 
				domNode: child.domNode, 
				layoutAlign: child.region == "center" ? "client" : child.region
			};
		});
		dijit.layout.layoutChildren(this.domNode, this._contentBox, children);
	}
	
});