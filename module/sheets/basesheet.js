



export class BaseSheet extends ActorSheet {
	constructor(...args) {
		super(...args);
	}

	mySheetHtml = null

	/* CSS selector string 'constants' to make finding and refering to things with Jquery less annoying. */
	TAB_BUTTONS = '.btn-main-tab';
	TRAIT_BUTTONS = '.btn-traits';

	/* Overrides */
	get template() {
		return "systems/Mage/templates/mage.html"
	}

	activateListeners(html) {
		super.activateListeners( html );

		this.mySheetHtml = html;
		this.mySheetHtml.find( this.TAB_BUTTONS ).click( this._changeMainTab.bind( event ) );
		this.mySheetHtml.find( this.TRAIT_BUTTONS ).click( this._traitButtonRoll.bind( event ) );
	}

	/* Private methods. ( Not really private, because JS doesn't do that ) */
	_changeMainTab = ( event ) => {
		let tabName = event.currentTarget.getAttribute('tab-name');
		this.actor.update({"data.currentTab" : tabName });
	}

	_traitButtonRoll = ( event ) => {
		let buttonRollName = event.currentTarget.getAttribute('trait-name');
		console.log( buttonRollName );
	}
}