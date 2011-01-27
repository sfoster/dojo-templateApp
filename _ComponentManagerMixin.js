dojo.provide("tapp._ComponentManagerMixin");

// a generic mixin providing component-management capability to the mixed-in class
// based on dmachi's dojoc.dmachi.virtual.ComponentManager

dojo.declare("tapp._ComponentManagerMixin", null, {
	components: null,
	
	_componentsInitialized: false,
	
	_unregisteredComponents: null,
	
	constructor: function() {
		this._unregisteredComponents = [];
	},
	
	initComponents: function(){

		var componentsMap = this._components = {};
		var constructorsMap  = this._componentConstructors = {};
		
		var empty = {},
			unRegistered = this._unregisteredComponents || [], 
			comp = null,
			components = this.components = [], 
			// combine any extraComponents w. the baseComponents list
			allComponents = [].concat(this.baseComponents || []).concat(this.extraComponents || []);
		
		dojo.forEach(allComponents, function(c){
			// ["ecollege.slp.CoreServices", { id: "services" }]
			var className = c[0], 
				param = c[1];

			if(className in constructorsMap) {
				// components must be unique - one of each Class
				return;
			}

			var ctor = dojo.getObject(className);
			if (!ctor){
				console.error("Ctor not found: ", c[0]);
			}

			var params = dojo.mixin({},{parent: this}, param);
			var node= c[2];

			// console.log("initComponents, using ctor %s, params: %o, node: %o", className, params, node);
			// console.log("Creating component: ", params.id);

			unRegistered.push(
				this.createComponent(ctor, params, node||undefined)
			);
			
		}, this);
		
		this._componentsInitialized = true;

		// register all pending components
		while((comp = unRegistered.shift())) {
			components.push( this.registerComponent(comp) );
		}
	},

	registerComponent: function(comp, ctor, params){
		if(!comp){
			console.error("Cannot register falsy component", comp);
			return null;
		}

		if(!this._componentsInitialized) {
			// if registerComponent gets called before initComponents, we stash for later registration
			console.log("defering registerComponent, with comp: ", comp.id);
			this._unregisteredComponents.push(comp);
			return;
		}

		// console.log("creating _components entry for: ", comp.id, this._components);
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
		if(!component){return null;}

		//instantiate the component, with the node above if found
		// console.log("createComponent w. ", params,node || undefined);
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
	},

	publishInternalEvent: function(evt, args ){
		var name = "/" + this.id + "/" + evt;
		// console.log(this.id, "Publishing Internal Event: ", name, args);
		return dojo.publish(name, args);
	},
	
	subscribeInternalEvent: function(evt, scope, cb){
		var name = "/" + this.id + "/" + evt;
		//console.log(this.id, "Subscribe: ", name);
		return dojo.subscribe(name, scope, cb);
	}
	
});