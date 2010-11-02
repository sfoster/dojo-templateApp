dojo.provide("tapp._ComponentManagerMixin");

// a generic mixin providing component-management capability to the mixed-in class
// based on dmachi's dojoc.dmachi.virtual.ComponentManager

dojo.declare("tapp._ComponentManagerMixin", null, {
	components: null,
	initComponents: function(){
		//console.log("InitComponents() - ", this.components.length, " components");
		this._components = {};
		this._componentConstructors = {};
		
		// combine any extraComponents w. the baseComponents list
		var c, 
			uniqComponents = {}, 
			empty = {},
			components = this.components = [], 
			allComponents = [].concat(this.baseComponents).concat(this.extraComponents);
		
		while((c = allComponents.shift())) {
			uniqComponents[c[0]] = c;
		}
		
		for(var name in uniqComponents) {
			if(name in empty) {
				continue;
			}
			components.push(uniqComponents[name]);
		}
		
		dojo.forEach(components, function(c){
			var ctor = dojo.getObject(c[0]);
			var params = dojo.mixin({},{parent: this, structure: this.structure, store: this.store}, c[1]);
			var node= c[2];

			if (!ctor){console.error("Ctor not found: ", c[0]);}
			// TODO: check buildRendering and buildRenderingDeferred are the right impl. here
			// as setUp and run phases can be async, we can just return a promise from here?
			if (node && this.buildRenderingDeferred){
				this.buildRenderingDeferred.addCallback(this, function(){
					c=this.registerComponent(this.createComponent(ctor, params, this[node]||undefined));
				}, node);
			}else{
				c=this.registerComponent(this.createComponent(ctor, params),ctor,params);
			}

		},this);
	},

	registerComponent: function(comp, ctor, params){
		if(!comp){
			console.error("Cannot register component", comp);
			return;
		}
		this._components[comp.id] = comp;

		if (this["_register" + comp.componentType]){
			this["_register" + comp.componentType](comp, [ctor, params]);
		}

		this.connectEventBubble(comp);

		return comp;
	},

	connectEventBubble: function(component){
		for (var i in component){
			if (i.match(/^on[A-Z]/)){
				var evtName = i.substring(2);
				//console.log("Found Event in component: ", component.id,i, evtName);
				//console.log("Checking for ", "on" + component.componentType + evtName);
				var pName = "on" + component.componentType + evtName;
				if (!this[pName]){
					this[pName]=function(){};
				}

				this.subscribeInternalEvent(pName, this, pName);
			}
		}
	},

	eventBubble: function(){
		console.log("eventToBubble: ", arguments);
	},

	createComponent: function(component, params,node ){
		//create an instance of one of our components
		//console.log("CreateComponent: ", component, params, node);
		if (typeof component == 'string') {
			//component=dojo.getObject(component);
			var c = this._componentConstructors[component];
			if (c) {
				component = c[0];

				//remixin structure here incase it has changed along with any additional 
				//overriding params passed with the createComponent call
				params = dojo.mixin({},c[1],{structure: this.structure, store: this.store},params);
				//params = dojo.mixin({},c[1],params);
			}else{
				component = dojo.getObject(component);
			}
		}
		if(!component){return;}

		//instantiate the component, with the node above if found
		//console.log("create component with params: ", params);
		var inst = new component(params,node || undefined);
		return inst; //new component instance
	},
	destroyComponents: function(){
		dojo.forEach(this._components, function(c){
			if (c.destroy){ c.destroy(); }
		});
	},

	destroy: function(){
		this.destroyComponents();
		this.inherited(arguments);
	}
});