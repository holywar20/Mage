
export class MageSheet extends ActorSheet {
	constructor(...args ) {
		super(...args);
	}

	mySheetHtml = null

	/* CSS selector string 'constants' to make finding and refering to things with Jquery less annoying. */
	TAB_NAME = 'tab-name';
	SKILL_TAB_BUTTONS = '.btn-skills-tab';
	TAB_BUTTONS = '.btn-main-tab';

	SKILL_BUTTONS = '.btn-skills';
	SKILL_NAME = 'skill-name'

	ARCANA_BUTTONS = '.btn-arcana';
	ARCANA_NAME = 'arcana-name';

	TRAIT_BUTTONS = '.btn-traits';
	TRAIT_NAME = 'trait-name'

	SAVE_BUTTONS = '.btn-traits';
	SAVE_NAME = 'save-name';

	SELECTED = "selected";
	/* Constants which should apply to all sheets */
	test = "Test!";

	/* Overrides */
	get template() {
		return "systems/Mage/templates/mage.html"
	}

	activateListeners( html ) {
		super.activateListeners( html );

		this.mySheetHtml = html;
		this.mySheetHtml.find( this.TAB_BUTTONS ).click( this._changeMainTab.bind( event ) );
		this.mySheetHtml.find( this.SKILL_TAB_BUTTONS ).click( this._changeSkillTab.bind( event ) );


		this.mySheetHtml.find( this.SKILL_BUTTONS ).click( this._skillButtonClick.bind( event) );
		this.mySheetHtml.find( this.ARCANA_BUTTONS ).click( this._arcanaButtonClick.bind( event) );
		this.mySheetHtml.find( this.TRAIT_BUTTONS ).click( this._traitButtonClick.bind( event ) );
		this.mySheetHtml.find( this.SAVE_BUTTONS ).click( this._saveButtonClick.bind( event ) );
	}

	/* Setup methods */
	_populateDropDown(){
		
	}


	/* Private methods. ( Not really private, because JS doesn't do that ) */
	_changeMainTab = ( event ) => {
		let buttons = this.mySheetHtml.find( this.TAB_BUTTONS );
		/*buttons.forEach( ( ele ) => {
			ele.removeClass("selected");
		});*/

		let tabName = event.currentTarget.getAttribute( this.TAB_NAME );
		this.actor.update({"data.currentTab" : tabName });
	}

	_changeSkillTab = ( event ) => {
		let tabName = event.currentTarget.getAttribute( this.TAB_NAME );
		this.actor.update({"data.currentSkillTab" : tabName });
	}

	_saveButtonClick = ( event ) => {
		let buttonRollName = event.currentTarget.getAttribute( this.SAVE_NAME );

		new Dialog({
			title: `${buttonRollName} Check`,
			content: `<p>What type of check?</p>`,
			buttons: {
				test: {
					label: "Ability Test",
					callback: () => { console.log("Ability!")}
				},
				save: {
					label: "Saving Throw",
					callback: () => { console.log("Save!") }
				}
			}
		}).render(true);
	}

	_skillButtonClick = ( event ) => {
		let buttonRollName = event.currentTarget.getAttribute( this.SKILL_NAME );

		new Dialog({
			title: `${buttonRollName} Check`,
			content: `<p>What type of check?</p>`,
			buttons: {
				test: {
					label: "Ability Test",
					callback: () => { console.log("Ability!")}
				},
				save: {
					label: "Saving Throw",
					callback: () => { console.log("Save!") }
				}
			}
		}).render(true);
	}

	_arcanaButtonClick = ( event ) =>{
		let buttonRollName = event.currentTarget.getAttribute( this.ARCANA_NAME );

		new Dialog({
			title: `${buttonRollName} Check`,
			content: `<p>What type of check?</p>`,
			buttons: {
				test: {
					label: "Ability Test",
					callback: () => { console.log("Ability!")}
				},
				save: {
					label: "Saving Throw",
					callback: () => { console.log("Save!") }
				}
			}
		}).render(true);
	}

	_traitButtonClick = ( event ) => {
		let buttonRollName = event.currentTarget.getAttribute( this.TRAIT_NAME );
		

		new Dialog({
			title: `${buttonRollName} Check`,
			content: `<p>What type of check?</p>`,
			buttons: {
				test: {
					label: "Ability Test",
					callback: () => { console.log("Ability!")}
				},
				save: {
					label: "Saving Throw",
					callback: () => { console.log("Save!") }
				}
			}
		}).render(true);
	}


}