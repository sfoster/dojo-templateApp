dojo.provide("tapp._ComponentManagerMixin");

// a generic mixin providing component-management capability to the mixed-in class
// based on dmachi's dojoc.dmachi.virtual.ComponentManager

dojo.declare("tapp._ComponentManagerMixin", null, {
	components: null,
	initComponents: function(){
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
		
		console.log("initComponents, components: ", components);
		dojo.forEach(components, function(c){
			var ctor = dojo.getObject(c[0]);
			var params = dojo.mixin({},{parent: this}, c[1]);
			var node= c[2];

			console.log("initComponents, using ctor %s, params: %o, node: %o", c[0], params, node);

			if (!ctor){
				console.error("Ctor not found: ", c[0]);
			}
			// TODO: check buildRendering and buildRenderingDeferred are the right impl. here
			// as setUp and run phases can be async, we can just return a promise from here?
			// if (node){
			// 	this.buildRenderingDeferred.addCallback(this, function(){
			// 	}, node);
			// }else{
				console.log("Creating component");
				var comp = this.createComponent(ctor, params, node||undefined);
				console.log("/Creating component: ", comp);

				console.log("Registering component");
				c=this.registerComponent(comp);
				console.log("/Registering component");
				// c=this.registerComponent(this.createComponent(ctor, params),ctor,params);
			// }

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

		// components can have only one parent: me
		if(!comp.parent || comp.parent !== this) {
			comp.parent = this;
		}

		this.connectEventBubble(comp);
		return comp;
	},

	getComponent: function(id) {
		return this._components[id];
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
		console.log("createComponent w. ", params,node || undefined);
		var inst = new component(params,node || undefined);
		console.log("/createComponent");
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
	},

	publishInternalEvent: function(evt, args ){
		var name = "/" + this.id + "/" + evt;
		//console.log(this.id, "Publishing Internal Event: ", name, args);
		return dojo.publish(name, args);
	},
	
	subscribeInternalEvent: function(evt, scope, cb){
		var name = "/" + this.id + "/" + evt;
		//console.log(this.id, "Subscribe: ", name);
		return dojo.subscribe(name, this, cb);
	},
	
});