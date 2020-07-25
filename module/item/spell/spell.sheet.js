
export class SpellSheet extends ItemSheet{
	constructor(...args) {
		let [item , options] = [...args];
		super( item , {
			editable : true,
			width : 480,
			height: 560 ,
			resizable: true
		});
	}

	effectPrototype = { "type" : "damage"  , "subtype" : "thermal" , "num" : 0 }
	schoolPrototype = { "type" : "entropy" , "num" : 1 }

	mySheetHtml = null;

	ADD_EFFECT_BUTTON_SELECTOR = 'button[add-effect]';
	DELETE_EFFECT_ATTRIBUTE = 'delete-effect';
	DELETE_EFFECT_BUTTON_SELECTOR = 'button[delete-effect]';

	ADD_SPHERE_BUTTON_SELECTOR ='button[add-sphere]';
	DELETE_SPHERE_ATTRIBUTE = 'delete-sphere';
	DELETE_SPHERE_BUTTON_SELECTOR = 'button[delete-sphere]'

	mySheetHtml = null;
	spell = this.object;
	spellData = this.object.data.data;

	get template() {
		return "systems/mage/module/item/spell/spell.sheet.html"
	}
	
	activateListeners( html ){
		super.activateListeners( html );

		this.mySheetHtml = html;

		this.mySheetHtml.find( this.ADD_EFFECT_BUTTON_SELECTOR ).click( this._addEffectEvent.bind(this) );
		this.mySheetHtml.find( this.DELETE_EFFECT_BUTTON_SELECTOR ).click( this._deleteEffectEvent.bind(this) );

		this.mySheetHtml.find( this.ADD_SPHERE_BUTTON_SELECTOR ).click( this._addSphereEvent.bind(this) );
		this.mySheetHtml.find( this.DELETE_SPHERE_BUTTON_SELECTOR ).click( this._deleteSphereEvent.bind(this) );
	}

	_addEffectEvent( event ){
		event.preventDefault();

		const newKey = this.randomKey();
		const newEffect = {};

		Object.assign( newEffect , this.effectPrototype );
		this.spellData.effects[newKey] = newEffect;

		return this.item.update({"effects" : this.spellData.effects })
	}

	async _deleteEffectEvent( event ){
		event.preventDefault();
		await this._onSubmit( event );

		const targetKey = event.currentTarget.getAttribute( this.DELETE_EFFECT_ATTRIBUTE );
		return this.item.update({ [`data.effects.-=${targetKey}`] : null });
	}

	_addSphereEvent( event ){
		event.preventDefault();

		const newKey = this.randomKey();
		const newSphere = {};

		Object.assign( newSphere , this.schoolPrototype );
		this.spellData.spheres[newKey] = newSphere;

		return this.item.update({"spheres" : this.spellData.spheres });
	}

	async _deleteSphereEvent( event ){
		console.log('deleting!');
		
		event.preventDefault();
		await this._onSubmit( event );

		const targetKey = event.currentTarget.getAttribute( this.DELETE_SPHERE_ATTRIBUTE );
		return this.item.update({ [`data.spheres.-=${targetKey}`] : null });
	}

	randomKey() {
		return Math.floor( Math.random() * 10000000 );  
	} 
}