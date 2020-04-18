export class WeaponSheet extends ItemSheet{
	constructor(...args) {
		super(...args);
	}

	mySheetHtml = null

	get template() {
		return "systems/mage/templates/weapon.html"
	}

	activateListeners( html ) {
		super.activateListeners( html );

		this.mySheetHtml = html;
	}

}