

export class TraditionSheet extends ItemSheet{
	constructor(...args) {
		super(...args);
	}

	get template() {
		const path = "systems/Mage/templates/tradition.html";
		return path;
	}

	activateListeners( html ){
		super.activateListeners( html );
	}
}
