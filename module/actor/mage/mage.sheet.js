
export class MageSheet extends ActorSheet {
	constructor( ...args ) {
		const data = {...args}

		super( data[0] , {
			height: 900,
			width: 950,
			resizable: false
		});
	}

	DIALOG_PROTOTYPE = {
		idx: "" , difficulty : 7 , baseDice : 0 ,bonusDice : 0 ,  rollTitle : "", playerTarget : "" ,  rollMode : "public" 
	};

	mySheetHtml = null
	actorData = this.actor.data.data;

	/* CSS selector string 'constants' to make finding and refering to things with Jquery less annoying. */
	TAB_NAME = 'tab-name';
	SKILL_TAB_BUTTONS = '.btn-skills-tab';
	TAB_BUTTONS = '.btn-main-tab';

	SKILL_INPUTS_SELECTOR = "input[skill-change]";
	SKILL_DRAG = "div[skill-drag]";
	SKILL_DRAG_NAME = "skill-drag";
	SKILL_DRAG_TYPE = "skill-drag-type";

	PARADOX_BUTTON = "";
	WOUND_BUTTON = "";
	UTILITY_DRAG = "div[utility-drag]";
	UTILITY_DRAG_NAME = "utility-drag";

	CUNNING_BUTTON_SELECTOR = "button[cunning-skill-name]";
	CUNNING_SKILL_NAME = 'cunning-skill-name';
	WILL_BUTTON_SELECTOR = "button[will-skill-name]";
	WILL_SKILL_NAME = 'will-skill-name'
	GRIT_BUTTON_SELECTOR = "button[grit-skill-name]";
	GRIT_SKILL_NAME = 'grit-skill-name';

	ARCANA_BUTTON_SELECTOR = 'button[arcana-name]';
	ARCANA_NAME = 'arcana-name';
	ARCANA_DRAG = 'div[arcana-drag]';
	ARCANA_DRAG_NAME = 'arcana-drag';

	TRAIT_BUTTON_SELECTOR = 'button[trait-name]';
	TRAIT_NAME = 'trait-name';
	TRAIT_DRAG = 'div[trait-drag]';
	TRAIT_DRAG_NAME = 'trait-drag';

	SAVE_BUTTON_SELECTOR = 'button[save-name]';
	SAVE_NAME = 'save-name';
	SAVE_DRAG = 'div[save-drag]';
	SAVE_DRAG_NAME = 'save-drag';

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
	SPELL_DRAG = "div[spell-drag]"

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
	WEAPON_DRAG = "div[weapon-drag]"

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
		this.mySheetHtml.find( this.WEAPON_ROLL ).click(this._onWeaponRollClick.bind( this ) );
		

		/* Dragging out of sheet */
		// Any 'item' that is draggable, use core mechanism.
		let weaponHandler = event => this._onDragStart( event );
		this.mySheetHtml.find( this.WEAPON_DRAG ).each( ( i , element ) => {
			element.setAttribute("draggable", true);
			element.addEventListener( "dragstart", weaponHandler, false);
		});

		let spellHandler = event => this._onDragStart( event );
		this.mySheetHtml.find( this.SPELL_DRAG ).each( (i, element) =>{
			element.setAttribute("draggable" , true );
			element.addEventListener("dragstart" , spellHandler, false );
		});
		

		// Everything else needs to be custom.
		let skillHandler = event => this._onDragSkillStart( event );
		this.mySheetHtml.find( this.SKILL_DRAG ).each( ( i, element ) => {
			element.setAttribute("draggable" , true );
			element.addEventListener("dragstart" , skillHandler, false );
		});

		let saveHandler = event => this._onDragSaveStart( event );
		this.mySheetHtml.find( this.SAVE_DRAG ).each( (i, element) =>{
			element.setAttribute("draggable" , true );
			element.addEventListener("dragstart" , saveHandler, false );
		});

		let traitHandler = event => this._onDragTraitStart( event );
		this.mySheetHtml.find( this.TRAIT_DRAG ).each( (i, element) =>{
			element.setAttribute("draggable" , true );
			element.addEventListener("dragstart" , traitHandler, false );
		});

		let utilityHandler = event => this._onDragUtilityStart( event );
		this.mySheetHtml.find( this.UTILITY_DRAG ).each( (i, element) =>{
			element.setAttribute("draggable" , true );
			element.addEventListener("dragstart" , utilityHandler, false );
		});

		let arcanaHandler = event => this._onDragArcanaStart( event );
		this.mySheetHtml.find( this.ARCANA_DRAG ).each( (i, element) =>{
			element.setAttribute("draggable" , true );
			element.addEventListener("dragstart" , arcanaHandler, false );
		});
	}

	/* Drag events. Need to load stuff into 'data' transfer. This gets picked up  by hooks in 'Mage.js' */
	_onDragWeaponStart( event ){
		const element = event.currentTarget;
		const item = this.actor.getOwnedItem(li.dataset.itemId);
		event.dataTransfer.setData("text/plain", JSON.stringify({
			type: "Weapon", actorId: this.actor.id, data: item
		}));
	}
	
	_onDragSpellStart( event ){
		const element = event.currentTarget;
		const item = this.actor.getOwnedItem(li.dataset.itemId);
		event.dataTransfer.setData( "text/plain", JSON.stringify({
			type: "Spell", actorId: this.actor.id, data: item
		}));
	}

	_onDragSkillStart( event ){
		let skillName = event.currentTarget.getAttribute( this.SKILL_DRAG_NAME );
		let skillType = event.currentTarget.getAttribute( this.SKILL_DRAG_TYPE );
		let skill = this.actor.data.data.skills[skillType][skillName];
		
		let macroRequest = {
			type : "Skill" ,
			actorId : this.actor.id,
			key : skillName,
			skillType : skillType,
			data : skill
		}
		event.dataTransfer.setData( "text/plain", JSON.stringify( macroRequest ) );
	}

	_onDragSaveStart( event ){
		let save = event.currentTarget.getAttribute( this.SAVE_DRAG_NAME );
		let saveData = this.actor.data.data.defenses[save];
		this._prepareMacroAndSendRequest("Save" , save , saveData );
	}

	_onDragTraitStart( event ){
		let trait = event.currentTarget.getAttribute( this.TRAIT_DRAG_NAME );
		let traitData = this.actor.data.data.traitParts[trait]
		this._prepareMacroAndSendRequest("Trait" , trait , traitData );
	}

	_onDragUtilityStart( event ){
		const element = event.currentTarget;

		const macroRequest = {
			type : "Utility" ,
			actorId : this.actor.id,
			data : {
				utilityName : 'cunning'
			}
		}

		event.dataTransfer.setData( "text/plain", JSON.stringify( macroRequest) );
	}

	_onDragArcanaStart( event ){
		let arcana = event.currentTarget.getAttribute( this.ARCANA_DRAG_NAME );
		let arcanaData = this.actor.data.data.arcana[arcana];
		this._prepareMacroAndSendRequest("Arcana" , arcana , arcanaData );
	}

	async _onWeaponRollClick( event ){
		let weaponId = event.currentTarget.getAttribute( this.WEAPON_ROLL_NAME );
		let myWeapon = this.actor.getOwnedItem( weaponId );
		myWeapon.rollRedirect( this.actor );
	}

	_onWeaponAdd( event ){
		const itemData = {
			name: `New Weapon`,
			type: "weapon",
			data : {}
		}

		const result = this.actor.createOwnedItem( itemData );
	}

	_onWeaponDelete( event ){
		event.preventDefault();
		let weaponId = event.currentTarget.getAttribute( this.WEAPON_DELETE_NAME );
		this.actor.deleteOwnedItem( weaponId );
	}

	_onWeaponEdit( event ){
		event.preventDefault();
		let weaponId = event.currentTarget.getAttribute( this.WEAPON_EDIT_NAME );
		let weapon = this.actor.getOwnedItem( weaponId );
		weapon.sheet.render( true );
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
		this.actor.update({"data.inventoryExpanded" : newExpandedInventory });
	}

	async _saveButtonClick( event ){
		let buttonRollName = event.currentTarget.getAttribute( this.SAVE_NAME );
		this.actor.rollSaveDialog( buttonRollName )
	}

	async _cunningButtonClick( event ){
		let buttonRollName = event.currentTarget.getAttribute( this.CUNNING_SKILL_NAME );
		this.actor.rollSkillDialog( buttonRollName , "cunning" );
	}

	async _willButtonClick( event ){
		let buttonRollName = event.currentTarget.getAttribute( this.WILL_SKILL_NAME );
		this.actor.rollSkillDialog( buttonRollName , "will" );
	}

	async _gritButtonClick( event ){
		let buttonRollName = event.currentTarget.getAttribute( this.GRIT_SKILL_NAME );
		this.actor.rollSkillDialog( buttonRollName , "grit" );
	}

	async _arcanaButtonClick( event ){
		let buttonRollName = event.currentTarget.getAttribute( this.ARCANA_NAME );
		this.actor.rollArcanaDialog( buttonRollName );
	}

	async _traitButtonClick( event ){
		let buttonRollName = event.currentTarget.getAttribute( this.TRAIT_NAME );
		this.actor.rollAttributeDialog( buttonRollName );
	}

	_onSpellRoll( event ){
		event.preventDefault();
	}

	_onSpellAdd( event ){
		const itemData = {
			name: `New Spell`,
			type: "spell",
			data : {}
		}

		const result = this.actor.createOwnedItem( itemData );
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
	}

	// this accepts whatever object flops out of a dialog box. 
	_extractDataFromDialog( initialDialogData , data ){
		let htmlFormControlsCollection = data[0].children[0].elements;

		[...htmlFormControlsCollection].forEach( ( elem ) =>{
			let name = elem.name;
			let value = elem.value;

			initialDialogData[name] = value;
		});
		
		return initialDialogData;
	}

	_prepareMacroAndSendRequest( type , key, data ){
		let macroRequest = {
			type : type ,
			actorId : this.actor.id,
			key : key,
			data : data
		}

		event.dataTransfer.setData( "text/plain", JSON.stringify( macroRequest) );
	}
}