
export class SpellSheet extends ItemSheet{
	constructor(...args) {
		let [item , options] = [...args];
		super( item , {
			editable : true,
			width : 400,
			height: 600 ,
			resizable: true
		});
	}

	get template() {
		return "systems/mage/module/item/spell/spell.sheet.html"
	}
	

	activateListeners( html ){
		super.activateListeners( html );
	}
}