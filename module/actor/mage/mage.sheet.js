
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

	SPELL_ADD = "button[add-spell]";
	SPELL_DELETE = "button[delete-spell]";
	SPELL_DELETE_NAME = "delete-spell";
	SPELL_EDIT = "button[edit-spell]";
	SPELL_EDIT_NAME = "edit-spell";
	SPELL_ROLL = "button[roll-spell]";
	SPELL_ROLL_NAME = "roll-spell";
	SPELL_MEMORIZE = "button[memorize-spell]";
	SPELL_MEMORIZE_NAME = "memorize-spell";

	/* Inventory Expandables */
	INVENTORY_EXPANDABLE_BUTTON = "div[button-expandable]";
	INVENTORY_EXPANDABLE_BUTTON_DATA = "button-expandable"
	INVENTORY_EXPANDABLE_TARGET = "div[expandable-data]";
	INVENTORY_EXPANDABLE_DATA = "expandable-data";

	/* Inventory Management */
	WEAPON_ADD ="button[add-weapon]";
	WEAPON_DELETE = "button[delete-weapon]";
	WEAPON_DELETE_NAME = "delete-weapon";
	WEAPON_EDIT = "button[edit-weapon]";
	WEAPON_EDIT_NAME = "edit-weapon";
	WEAPON_ROLL = "button[roll-weapon]";
	WEAPON_ROLL_NAME = "roll-weapon";

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

		/* Spells  */
		this.mySheetHtml.find( this.SPELL_ADD ).click( this._onSpellAdd.bind( this ) );
		this.mySheetHtml.find( this.SPELL_EDIT ).click( this._onSpellEdit.bind( this ) );
		this.mySheetHtml.find( this.SPELL_DELETE ).click( this._onSpellDelete.bind( this ) );
		this.mySheetHtml.find( this.SPELL_ROLL ).click( this._onSpellRoll.bind( this ) );
		this.mySheetHtml.find( this.SPELL_MEMORIZE ).click( this._onSpellMemorize.bind( this ) );

		/* Item Inventory */
		this.mySheetHtml.find( this.INVENTORY_EXPANDABLE_BUTTON ).click( this._onInventoryExpand.bind(this) );

		this.mySheetHtml.find( this.WEAPON_ADD ).click(this._onWeaponAdd.bind( this ) );
		this.mySheetHtml.find( this.WEAPON_DELETE ).click(this._onWeaponDelete.bind( this ) );
		this.mySheetHtml.find( this.WEAPON_EDIT ).click(this._onWeaponEdit.bind( this ) );
		this.mySheetHtml.find( this.WEAPON_ROLL ).click(this._onWeaponRoll.bind( this ) );

	}

	/* Private methods. ( Not really private, because JS doesn't do that ) */
	_onWeaponAdd( event ){
		const itemData = {
			name: `New Weapon`,
			type: "weapon",
			data : {}
		}

		const result = this.actor.createOwnedItem( itemData );
		console.log( this.actor);
	}

	_onWeaponDelete( event ){
		event.preventDefault();
		let weaponId = event.currentTarget.getAttribute( this.WEAPON_DELETE_NAME );
		this.actor.deleteOwnedItem( weaponId );
	}

	_onWeaponEdit( event ){
		event.preventDefault();
		let weaponId = event.currentTarget.getAttribute( this._EDIT_NAME );
		let spell = this.actor.getOwnedItem( spellId );
		spell.sheet.render( true );
	}

	_onWeaponRoll( event ){
		console.log("roll");
	}

	_changeMainTab = ( event ) => {
		let buttons = this.mySheetHtml.find( this.TAB_BUTTONS );
		let tabName = event.currentTarget.getAttribute( this.TAB_NAME );

		buttons.each( ( idx ) => {
			let buttonName = buttons[idx].getAttribute( this.TAB_NAME );
			if( buttonName == tabName ){
				buttons[idx].classList.add("selected");
			} else {
				buttons[idx].classList.remove("selected");
			}
		});

		this.actor.update({"data.currentTab" : tabName });
	}

	_changeSkillTab = ( event ) => {
		let tabName = event.currentTarget.getAttribute( this.TAB_NAME );
		this.actor.update({"data.currentSkillTab" : tabName });
	}

	/* Bit complicated, but needed to do some hacky crap to get handlebars to update right. 
	* This will add / remove an open class ( to ensure the current view works ). Then it updates inventoryExpanded to ensure it remembers
	the current tab on page refresh */
	async _onInventoryExpand( event ){
		let buttonData = event.currentTarget.getAttribute( this.INVENTORY_EXPANDABLE_BUTTON_DATA );

		var expandables = this.mySheetHtml.find( this.INVENTORY_EXPANDABLE_TARGET );
		expandables.each( ( idx ) =>{
			let thisExpandableData = expandables[idx].getAttribute( this.INVENTORY_EXPANDABLE_DATA );
			if( thisExpandableData == buttonData ){
				expandables[idx].classList.add('open');
			} else {
				expandables[idx].classList.remove('open');
			}
		});

		var expandableHeaders = this.mySheetHtml.find( this.INVENTORY_EXPANDABLE_BUTTON );
		expandableHeaders.each( ( idx ) => {
			let headerData = expandableHeaders[idx].getAttribute( this.INVENTORY_EXPANDABLE_BUTTON_DATA );
			if( headerData == buttonData ){
				expandableHeaders[idx].classList.add('open');
			} else {
				expandableHeaders[idx].classList.remove('open');
			}
		});

		let newExpandedInventory = this.actor.data.data.inventoryExpanded;
		for( let type in newExpandedInventory ){
			newExpandedInventory[type] = false;
		}
		newExpandedInventory[buttonData] = true;
		console.log( newExpandedInventory );
		this.actor.update({"data.inventoryExpanded" : newExpandedInventory });
	}

	async _saveButtonClick( event ){
		let buttonRollName = event.currentTarget.getAttribute( this.SAVE_NAME );
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

	_onSpellRoll( event ){
		event.preventDefault();
		console.log("rolling!");
	}

	_onSpellAdd( event ){
		const itemData = {
			name: `New Spell`,
			type: "spell",
			data : {}
		}

		const result = this.actor.createOwnedItem( itemData );
		console.log( this.actor);
	}

	_onSpellEdit( event ){
		event.preventDefault();
		let spellId = event.currentTarget.getAttribute( this.SPELL_EDIT_NAME );
		let spell = this.actor.getOwnedItem( spellId );
		spell.sheet.render( true );
	}

	_onSpellDelete( event ){
		event.preventDefault();
		let spellId = event.currentTarget.getAttribute( this.SPELL_DELETE_NAME );
		this.actor.deleteOwnedItem( spellId );
	}
	
	_onSpellMemorize( event ){
		event.preventDefault();
		let spellId = event.currentTarget.getAttribute( this.SPELL_MEMORIZE_NAME );
		let spell = this.actor.getOwnedItem( spellId );
		spell.update({'data.memorized.value' : !spell.data.data.memorized.value });

		console.log( spell );
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