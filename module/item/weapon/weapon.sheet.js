export class WeaponSheet extends ItemSheet{
	constructor(...args) {
		super(...args);
	}

	mySheetHtml = null

	get template() {
		return "systems/mage/module/item/weapon/weapon.sheet.html"
	}

	activateListeners( html ) {
		super.activateListeners( html );

		this.mySheetHtml = html;
	}

}