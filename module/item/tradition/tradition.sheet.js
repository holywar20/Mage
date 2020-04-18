

export class TraditionSheet extends ItemSheet{
	constructor(...args) {
		super(...args);
	}

	get template() {
		const path = "systems/mage/module/item/tradition/tradition.sheet.html";
		return path;
	}

	activateListeners( html ){
		super.activateListeners( html );
	}
}
