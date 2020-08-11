import { WEAPON_UTILITY } from "../weapon/weapon.utility.js";
export class WeaponSheet extends ItemSheet{
	constructor(...args) {
		let [item , options] = [...args];

		super( item , {
			editable : true,
			width : 490,
			height: 600 ,
			resizable: true
		});
	}

	implicitModPrototype = {"modType" : null , "modValue" : 1 , "modSource" : 0 }
	extraRollPrototype = { "rollSource" : null , "rollString"  : null }

	ADD_STYLE_BUTTON_SELECTOR = 'button[add-style]';
	DELETE_STYLE_ATTRIBUTE = "delete-style";
	DELETE_STYLE_BUTTON_SELECTOR = 'button[delete-style]';

	ADD_MOD_BUTTON_SELECTOR = "button[add-mod]";
	DELETE_MOD_ATTRIBUTE = "delete-mod";
	DELETE_MOD_BUTTON_SELECTOR = "button[delete-mod]";

	ADD_EXTRA_ROLL_BUTTON_SELECTOR = "button[add-roll]";
	DELETE_EXTRA_ROLL_ATTRIBUTE = "delete-roll";
	DELETE_EXTRA_ROLL_BUTTON_SELECTOR = "button[delete-roll]";

	TEST_ROLL_BUTTON = "button[test-roll]";

	TOGGLE_EQUIPPED = "button[set-equipped]";
	TOGGLE_CARRIED = "button[set-carried]";
	TOGGLE_DUALS = "button[set-duals]";

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

		this.mySheetHtml.find( this.ADD_EXTRA_ROLL_BUTTON_SELECTOR ).click( this._addRollEvent.bind( this ) );
		this.mySheetHtml.find( this.DELETE_EXTRA_ROLL_BUTTON_SELECTOR ).click( this._deleteRollEvent.bind( this ) );

		this.mySheetHtml.find( this.TEST_ROLL_BUTTON ).click( this._testRollWeapon.bind( this ) );

		this.mySheetHtml.find( this.TOGGLE_EQUIPPED ).click( this._toggleEquipped.bind( this ) );
		this.mySheetHtml.find( this.TOGGLE_CARRIED ).click( this._toggleCarried.bind( this ) );
		this.mySheetHtml.find( this.TOGGLE_DUALS ).click( this._toggleDuals.bind( this ) );
	}

	/*getData(){
		const data = super.getData();

		return data;
	}*/

	async _toggleDuals( event ){
		let duals = null;
		
		console.log( 'duals');
		if( this.object.data.data.duals ){
			duals = 0;
		} else {
			duals = 1;
		}

		return this.item.update({"data.duals" : duals });
	}

	async _toggleEquipped( event ){
		event.preventDefault();

		let equipped = null;
		if( this.object.data.data.equipped ){
			equipped = 0;
		} else {
			equipped = 1;
		}

		return this.item.update({"data.equipped" : equipped });
	}

	async _toggleCarried( event ){
		event.preventDefault();
		
		let carried = null;
		if( this.object.data.data.carried ){
			carried = 0;
		} else {
			carried = 1;
		}
		
		return this.item.update({"data.carried" : carried});
	}

	_testRollWeapon( event ){
		this.weapon.rollRedirect();
	}

	_addRollEvent( event ){
		event.preventDefault();
		const newKey = this.randomKey();
		const newRoll = {};
		Object.assign( newRoll, this.extraRollPrototype );

		this.weaponData.extraRolls[newKey] = newRoll;

		return this.item.update({"extraRolls" : this.weaponData.extraRolls })
	}

	async _deleteRollEvent( event ){
		event.preventDefault();
		await this._onSubmit( event );

		const targetKey = event.currentTarget.getAttribute( this.DELETE_EXTRA_ROLL_ATTRIBUTE);
		return this.item.update({ [`data.extraRolls.-=${targetKey}`] : null });
	}

	_addStyleEvent( event ){
		event.preventDefault();
		
		const newKey = this.randomKey();
		const newStyle = WEAPON_UTILITY.makeNewStyle();

		this.weaponData.styles[newKey] = newStyle;

		return this.item.update({ "styles" : this.weaponData.styles });
	}

	async _deleteStyleEvent( event ){
		event.preventDefault();
		await this._onSubmit( event );

		const targetKey = event.currentTarget.getAttribute( this.DELETE_STYLE_ATTRIBUTE);
		return this.item.update({ [`data.styles.-=${targetKey}`] : null });
	}

	_addImplicitModEvent ( event ){
		event.preventDefault();

		let newKey = this.randomKey();
		this.weaponData.implicitMods[newKey] = {}
		Object.assign( this.weaponData.implicitMods[newKey], this.implicitModPrototype );
		
		return this.item.update({"implicitMods": this.weaponData.implicitMods })
	}

	async _deleteImplicitModEvent( event ){
		event.preventDefault();
		await this._onSubmit( event );

		const targetKey = event.currentTarget.getAttribute( this.DELETE_MOD_ATTRIBUTE )
		return this.item.update({ [`data.implicitMods.-=${targetKey}`] : null });
	}

	/* TODO - Hoist this into some helpers */
	randomKey() {
		return Math.floor( Math.random() * 10000000 );  
	} 
}