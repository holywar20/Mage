

export class BaseSheet extends ActorSheet {
	constructor(...args) {
		super(...args);
	}

	get template() {
		return "systems/Mage/templates/mage.html"
	}
}