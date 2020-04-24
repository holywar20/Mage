export class WeaponSheet extends ItemSheet{
	constructor(...args) {
		const data = {...args};

		super(...args);
	}

	stylePrototype = { "skill" : "blunt" , "dmgType" : "bashing" , "dmgTrait" : "str" , "hitTrait" : "str" }
	implicitModPrototype = {"modType" : "allsaves" , "modValue" : "1" }

	ADD_STYLE_BUTTON_SELECTOR = 'button[add-style]';
	DELETE_STYLE_ATTRIBUTE = "delete-style";
	DELETE_STYLE_BUTTON_SELECTOR = 'button[delete-style]';

	ADD_MOD_BUTTON_SELECTOR = "button[add-mod]";
	DELETE_MOD_ATTRIBUTE = "delete-mod";
	DELETE_MOD_BUTTON_SELECTOR = "button[delete-mod]";

	mySheetHtml = null
	weapon = this.object;
	weaponData = this.object.data.data;

	/* Overrides */
	get template() {
		return "systems/mage/module/item/weapon/weapon.sheet.html"
	}
	
	activateListeners( html ) {
		super.activateListeners( html );

		this.mySheetHtml = html;

		this.mySheetHtml.find( this.ADD_MOD_BUTTON_SELECTOR ).click( this._addImplicitModEvent.bind( this ) );
		this.mySheetHtml.find( this.DELETE_MOD_BUTTON_SELECTOR ).click( this._deleteImplicitModEvent.bind( this ) );

		this.mySheetHtml.find( this.ADD_STYLE_BUTTON_SELECTOR ).click( this._addStyleEvent.bind( this ) );
		this.mySheetHtml.find( this.DELETE_STYLE_BUTTON_SELECTOR ).click( this._deleteStyleEvent.bind( this ) );
	}

	/*getData(){
		const data = super.getData();

		return data;
	}*/

	/*_updateObject(event, formData) {
		console.log( formData );
		/*let useArray = Object.entries(formData).filter( element => element[0].startsWith("data.use"));
		
		if( useArray ){
			let newData = []
			useArray.forEach( ( element ) =>{
				let [ keyParts , value ] = element;
				console.log(keyParts , value );
				let [ unused1, unused2 , index, prop ] = keyParts.split(".");
				
				if( !newData[index] )
					newData[index] = {};

				newData[index][prop] = value;
			});
			formData["data.use"] = newData;

			//super._updateObject(event, formData);
		}
		console.log( formData );*/
		
		//super._updateObject(event, formData);
	//}

	_addStyleEvent( event ){
		event.preventDefault();
		
		const newKey = this.randomKey();
		const newStyle = {}
		Object.assign( newStyle , this.stylePrototype )
		this.weaponData.styles[newKey] = newStyle;

		return this.item.update({ "styles" : this.weaponData.styles });
	}

	async _deleteStyleEvent( event ){
		event.preventDefault();
		await this._onSubmit( event );

		const targetKey = event.currentTarget.getAttribute( this.DELETE_STYLE_ATTRIBUTE);
		return this.item.update({ [`data.styles.-=${targetKey}`] : null });
	}

	_addImplicitModEvent ( self, clickEvent ){
		let newKey = self.randomKey();
		self.weaponData.implicitMods[newKey] = {}
		Object.assign( self.weaponData.implicitMods[newKey], self.implicitModPrototype );
		self.object.update({"implicitMods": this.weaponData.implicitMods })
	}

	_deleteImplicitModEvent( self, clickEvent ){
		let targetKey = clickEvent.currentTarget.getAttribute( this.DELETE_MOD_ATTRIBUTE);
		console.log(targetKey);
		
		delete this.weaponData.implicitMods[targetKey.toString()];
		
		console.log( this.weaponData.implicitMods[targetKey.toString()] );
		console.log( this.weaponData.implicitMods[2] );
		console.log( this.weaponData );

		this.object.update({"implicitMods" : this.weaponData.implicitMods });
	}

	/* TODO - Hoist this into some helpers */
	randomKey() {
		return Math.floor( Math.random() * 10000000 );  
	} 
}