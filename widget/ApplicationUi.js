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
	
	// templateString: String
	// 		An optionally-parameterized html template string
	templateString: "<div></div>",

	// templateKey: String
	// 		A dot-path which should resolve to a dojo.cache-ed templateString
	templateKey: "",

	buildRendering: function(){
		// summary: 
		// 		Extended to add support for a templateKey property
		
		console.log(this.declaredClass + " buildRendering");
		var tmplKey = this.templateKey;
		if(tmplKey && typeof this.templateKey == "string"){
			var tmplString = dojo.getObject(this.templateKey);
			if(tmplString) {
				 this.templateString = tmplString;
			} else {
				throw new Error(this.declaredClass + " resolving templateKey '"+this.templateKey+"' returned an empty string");
			}
		}

		console.log(this.declaredClass + " buildRendering, templateString: " + this.templateString);
		// console.log(this.declaredClass + " / templateString: ", (""+this.templateString).substring(0, 255));
		console.log(this.declaredClass + " /buildRendering..");

		this.inherited(arguments);
		console.log(this.declaredClass + " /buildRendering");
	},

	postCreate: function() {
		console.log(this.declaredClass + " postCreate");

		// move markup content into the new content container
		if(this.centerPane && this.containerNode.childNodes.length) {
			this.centerPane.set("content", this.containerNode.childNodes);
			dojo.destroy(this.containerNode);
			this.containerNode = this.centerPane.containerNode;
		}
		console.log(this.declaredClass + " /postCreate");
	},
	startup: function() {
		console.log(this.declaredClass + " startup");
		if(this._started) {
			console.log(this.declaredClass + " already started");
			return; 
		}
		console.log("finding app at: " + dojo.config.kernelConfig.id);
		var app = dojo.global[dojo.config.kernelConfig.id];
		if(!this.parent || app !== this.parent) {
			console.log("registering " + this.id + " with ComponentManager parent: " + dojo.config.kernelConfig.id);
			console.log("app is: ", typeof dojo.global[dojo.config.kernelConfig.id]);
			app.registerComponent(this);
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