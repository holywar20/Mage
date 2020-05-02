
export class MageSheet extends ActorSheet {
	constructor( ...args ) {
		const data = {...args}

		super( data[0] , {
			height: 900,
			width: 950,
			resizable: false
		});
	}

	mySheetHtml = null
	actorData = this.actor.data.data;

	/* CSS selector string 'constants' to make finding and refering to things with Jquery less annoying. */
	TAB_NAME = 'tab-name';
	SKILL_TAB_BUTTONS = '.btn-skills-tab';
	TAB_BUTTONS = '.btn-main-tab';

	SKILL_INPUTS_SELECTOR = "input[skill-change]"

	CUNNING_BUTTON_SELECTOR = "button[cunning-skill-name]";
	CUNNING_SKILL_NAME = 'cunning-skill-name';
	
	WILL_BUTTON_SELECTOR = "button[will-skill-name]";
	WILL_SKILL_NAME = 'will-skill-name'
	
	GRIT_BUTTON_SELECTOR = "button[grit-skill-name]";
	GRIT_SKILL_NAME = 'grit-skill-name';

	ARCANA_BUTTON_SELECTOR = 'button[arcana-name]';
	ARCANA_NAME = 'arcana-name';

	TRAIT_BUTTON_SELECTOR = 'button[trait-name]';
	TRAIT_NAME = 'trait-name'

	SAVE_BUTTON_SELECTOR = 'button[save-name]';
	SAVE_NAME = 'save-name';

	TAB_BUTTON_SELECTOR = "button[selected]"



	/* Overrides */
	get template() {
		return "systems/mage/module/actor/mage/mage.sheet.html"
	}

	activateListeners( html ) {
		super.activateListeners( html );

		/* Tabs */
		this.mySheetHtml = html;
		this.mySheetHtml.find( this.TAB_BUTTONS ).click( this._changeMainTab.bind( event ) );
		this.mySheetHtml.find( this.SKILL_TAB_BUTTONS ).click( this._changeSkillTab.bind( event ) );

		/* Clickable Buttons */
		this.mySheetHtml.find( this.CUNNING_BUTTON_SELECTOR ).click( this._cunningButtonClick.bind( this) );
		this.mySheetHtml.find( this.WILL_BUTTON_SELECTOR ).click( this._willButtonClick.bind( this) );
		this.mySheetHtml.find( this.GRIT_BUTTON_SELECTOR ).click( this._gritButtonClick.bind( this) );

		this.mySheetHtml.find( this.ARCANA_BUTTON_SELECTOR ).click( this._arcanaButtonClick.bind( this ) );
		this.mySheetHtml.find( this.TRAIT_BUTTON_SELECTOR ).click( this._traitButtonClick.bind( this ) );
		this.mySheetHtml.find( this.SAVE_BUTTON_SELECTOR ).click( this._saveButtonClick.bind( this ) );
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

	async _saveButtonClick( event ){
		console.log( event );
		let buttonRollName = event.currentTarget.getAttribute( this.SAVE_NAME );
		console.log( this.actorData , buttonRollName );
		let saveValue = this.actorData.defenses[buttonRollName].value;

		if( saveValue < 1) { saveValue = 1; }

		let roll = new Roll(`${saveValue}d10>cs`);
		roll.roll();
		roll.render();
		roll.toMessage();
	}

	async _cunningButtonClick( event ){
		let buttonRollName = event.currentTarget.getAttribute( this.CUNNING_SKILL_NAME );
		let mySkill = this.actorData.skills.cunning[buttonRollName].value

		if( mySkill < 1 ) { mySkill = 1; }

		let roll = new Roll(`${mySkill}d10>cs`);
		roll.roll();
		roll.render();
		roll.toMessage();
	}

	async _willButtonClick( event ){
		let buttonRollName = event.currentTarget.getAttribute( this.WILL_SKILL_NAME );
		let mySkill = this.actorData.skills.will[buttonRollName].value;

		if( mySkill < 1 ) { mySkill = 1; }

		let roll = new Roll(`${mySkill}d10>cs`);
		roll.roll();
		roll.render();
		roll.toMessage();
	}

	async _gritButtonClick( event ){
		let buttonRollName = event.currentTarget.getAttribute( this.GRIT_SKILL_NAME );
		let mySkill = this.actorData.skills.grit[buttonRollName].value

		if( mySkill < 1 ) { mySkill = 1; }

		let roll = new Roll(`${mySkill}d10>cs`);
		roll.roll();
		roll.render();
		roll.toMessage();
	}

	async _arcanaButtonClick( event ){
		console.log( event )
		let buttonRollName = event.currentTarget.getAttribute( this.ARCANA_NAME );
		let myArcana = this.actorData.arcana[buttonRollName].value;

		if( myArcana < 1 ) { myArcana = 1; }

		let roll = new Roll(`${myArcana}d10>7cs`);
		roll.roll();
		roll.render();
		roll.toMessage();
	}

	async _traitButtonClick( event ){
		let buttonRollName = event.currentTarget.getAttribute( this.TRAIT_NAME );
		let myTrait = this.actorData.traits[buttonRollName].value;

		if( myTrait < 1 ) { myTrait = 1; }
		
		let roll = new Roll(`${myTrait}d10>7cs`);
		roll.roll();
		roll.render();
		roll.toMessage();
	}


	/*
		Item Dragging! 
		html.find('li.item').each((i, li) => {
		if ( li.classList.contains("inventory-header") ) return;
		li.setAttribute("draggable", true);
		li.addEventListener("dragstart", handler, false);
	});*/
/* new Dialog({
			title: `${buttonRollName} Check`,
			content: `<p>What type of arcana check?</p>`,
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
		}).render(true);*/
}