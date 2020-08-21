

export class MageActor extends Actor{
	constructor(...args) {
		super(...args);
	}
	
	actorData = this.data.data;

	PARADOX_THRESHOLDS = {
		MINOR_BOON : -5 ,
		TRIVAL_BOON : 1,
		NO_EFFECT : 0,
		MINOR : 5,
		MAJOR : 10 ,
		CATASTROPHIC : 15
	}

	ARCANA_MULTIPLE = 3;
	ARCANA_SUPER = [ -5 , 5];
	ARCANA_BASE = [ 0 , 5];

	TRAIT_MULTIPLE = 4;
	TRAIT_SUPER = [-5 , 5];
	TRAIT_BASE = [0 , 5];

	SKILL_SUPER = [-5 , 5];
	SKILL_BASE = [0, 5];

	DIALOG_PROTOTYPE = {
		idx: "" , difficulty : 7 , baseDice : 0 ,bonusDice : 0 ,  rollTitle : "", playerTarget : "" ,  rollMode : "public" 
	};

	prepareData(){
		super.prepareData();
		const data = this.data.data;
		/* Make sure player data isn't stupid */
		// this._sanitizeCharacterData( data ); TODO - data sanitization not working for ... reasons.

		this._fixData( data );

		/* Calculate costs & total values first. */
		this._calculateTotalsAndCosts( data );
		
		// Build mods array
		//this._calculateMods();

		/* Do character global character point math */
		this._calculateGlobalCosts( data );

		this._calculateTraits( data );
		this._calculateArcana( data );
		this._calculateSkills( data );

		this._calculateDerived( data );
		this._calculateSaves( data );

		this._prepareItems();
	}

	drawNewHand(){
		
		if( this.actorData.memorized != 20 ){
			let chatData = this._prepareChatData( `${this.data.name} cannot draw a card until they have memorized exactly 20 spells.` );
			ChatMessage.create( chatData );
			return null;
		}

		// Clear the macro bar of all cards.
		for( let x = 1; x <= 5; x++ ){
			ui.customHotbar.populator.chbUnsetMacro( x );
		}

		// Now clean out the dictionary
		this.actorData.drawnCards.forEach( ( ele ) => {
			game.macros.remove( ele );
		});
		this.actorData.drawnCards = [];

		// Select a specific card to draw.
		let allRolls = new Roll('5d20');
		allRolls.roll();
		let results = allRolls._dice[0].rolls;

		// Then for each result, draw a hand.
		let assignToSlot = 1;
		results.forEach( ( result ) =>{ 
			this.drawNewCard( result.roll , assignToSlot , true );
			assignToSlot++;
		});

		let chatData = this._prepareChatData( `${this.data.name} has drawn a new hand.` );
		ChatMessage.create( chatData );
		ui.customHotbar.render();
	}

	async narratorDraw(){
		// Not sure how to do this yet. Might test a new display panel;
	}

	async drawNewCard( cardNum = 0 , slot = null , isNewHand= false){
		if( this.actorData.memorized != 20 ){
			let chatData = this._prepareChatData( `${this.data.name} cannot draw a card until they have memorized exactly 20 spells.` );
			ChatMessage.create( chatData );
			return null;
		}

		if( !cardNum ){
			let roll = new Roll('1d20');
			roll.roll();
			cardNum = roll._result;
		}

		let count = 0;
		let selectedSpell = null;
		for( const id in this.actorData.deck ){
			count = count + +this.actorData.deck[id].data.memorized.number;

			if( count < cardNum ){
				continue;
			} else {
				selectedSpell = this.actorData.deck[id];
				break;
			}
		}

		if( slot == null ){
			// First, verify that we have an empty slot available
			for( const index in ui.customHotbar.macros ){
				if( index > 4 )
					break; // Only do up to the 5th card in the bar. 

				if( ui.customHotbar.macros[index].macro ){
					continue; // Macro exists, move on.
				} else {
					slot = index;// Macro space is open, so put new macro there. 
					break;
				}
			}

			if( slot == null ){ // free slot isn't found, so randomize that shit.
				slot = Math.floor( Math.random() * 5 );
			}
		}

		let macro = await Macro.create({
			name : selectedSpell.name,
			type : "script", 
			img : selectedSpell.img,
			command : `game.mage.rollSpellMacro( "${selectedSpell._id}" , "${ this.data._id }" )`,
			flags: { "mage.itemMacro": true }
		});

		if( isNewHand ){
			this.actorData.drawnCards.push( macro.id );
			ui.customHotbar.populator.chbSetMacro( macro.id , slot );
		} else {
			let chatData = this._prepareChatData( `${this.data.name} has drawn a new card.` );
			slot = +slot + 1; // fix for an index by one error for new cards
			ChatMessage.create( chatData );

			this.actorData.drawnCards.push( macro.id );
			ui.customHotbar.populator.chbSetMacro( macro.id , slot );
			
			ui.customHotbar.render(); // Only force rerender if just drawing a single card.
		}

		Hooks.callAll("customHotbarAssignComplete");
	}

	async rollSaveDialog( key ){
		let saveData = this.actorData.defenses[key];

		let dialogInitialData = {...this.DIALOG_PROTOTYPE}
		dialogInitialData.rollTitle = saveData.name + " Save"; 
		dialogInitialData.baseDice = saveData.value;
		
		let template = "systems/mage/dialogs/basic-roll-dialog.html";
		const html = await renderTemplate( template, dialogInitialData );

		new Dialog({
			title: `${saveData.name} Save` ,
			content : html ,
			default : "Roll",
			buttons : {
				Roll : {
					label: `Roll ${saveData.name} ( ${saveData.value} )`,
					callback : ( dialogUpdateData ) => {
						let newData = this._extractDataFromDialog( dialogInitialData, dialogUpdateData );
						this.rollSave( newData, saveData );
					}
				}
			}
		}).render( true );
	}

	/* Method for short term data fixes so old actors don't break. */
	_fixData( data ){
		data.hp.current = 10;
		data.hp.max = 10;
		data.paradox.current = 5;
		data.paradox.max = 3;
		data.carry.current = 3;
		data.carry.max = 3;
		data.concentration.current = 0;
		data.concentration.max = 3;
		data.actionPoints.current = 0;
		data.actionPoints.max = 3;
		data.movement.current = 6;
		data.movement.max = 6;
	}


	async rollSave( dialogData , save ){
		let totalDice = +dialogData.baseDice + +dialogData.bonusDice;
		let iconPath = "systems/mage/icons/other/" + save.name + ".png";

		let templateData = this._prepareSimpleTemplateData( totalDice, dialogData.difficulty, save.name , iconPath);
		let template = `systems/mage/chat/simple-roll.html`;
		const html = await renderTemplate(template, templateData);
		let chatData = this._prepareChatData( html );

		return ChatMessage.create( chatData );
	}

	async rollSkillDialog( key , skillType ){
		let skillData = this.actorData.skills[skillType][key];
		let dialogInitialData = {...this.DIALOG_PROTOTYPE}
		dialogInitialData.rollTitle = skillData.name + " Roll";
		dialogInitialData.baseDice = skillData.value;

		let template = "systems/mage/dialogs/basic-roll-dialog.html";
		const html = await renderTemplate( template, dialogInitialData );

		new Dialog({
			title: `${skillData.name}`, 
			content : html,
			default : "Roll",
			buttons : {
				Roll : {
					label : `Roll ${skillData.name} ( ${skillData.value} )`,
					callback: ( dialogUpdateData ) => {
						let newData = this._extractDataFromDialog( dialogInitialData, dialogUpdateData );
						this.rollSkill( newData, skillData );
					}
				}
			}
		}).render( true );
	}

	async rollSkill( dialogData , skill){
		
		let totalDice = +dialogData.baseDice + +dialogData.bonusDice;
		let iconPath = "systems/mage/icons/skill-list/" + skill.name + ".png";

		let templateData = this._prepareSimpleTemplateData( totalDice, dialogData.difficulty, skill.name , iconPath);
		let template = `systems/mage/chat/simple-roll.html`;
		const html = await renderTemplate(template, templateData);
		let chatData = this._prepareChatData( html );

		return ChatMessage.create( chatData );
	}

	async rollArcanaDialog( key  ){
		let arcanaData = this.actorData.arcana[key];
		let dialogInitialData = {...this.DIALOG_PROTOTYPE}

		dialogInitialData.rollTitle = arcanaData.name + " Roll";
		dialogInitialData.baseDice = arcanaData.value;

		let template = "systems/mage/dialogs/basic-roll-dialog.html";
		const html = await renderTemplate( template, dialogInitialData );

		new Dialog({
			title: `${arcanaData.name}`,
			content : html,
			default : "Roll",
			buttons : {
				Roll : {
					label : `Roll ${arcanaData.name} (${arcanaData.value} )`,
					callback: ( dialogUpdateData ) => {
						let newData = this._extractDataFromDialog( dialogInitialData, dialogUpdateData );
						this.rollArcana( newData, arcanaData );
					}
				}
			}
		}).render( true );
	}

	async rollArcana( dialogData, arcana ){
		let totalDice = +dialogData.baseDice + +dialogData.bonusDice;
		let iconPath = "systems/mage/icons/arcana/" + arcana.name + ".png";

		let templateData = this._prepareSimpleTemplateData( totalDice, dialogData.difficulty , arcana.name, iconPath );
		let template = `systems/mage/chat/simple-roll.html`;
		const html = await renderTemplate( template, templateData );
		let chatData = this._prepareChatData( html );

		return ChatMessage.create( chatData );
	}

	async rollAttributeDialog( key ){
		let template = "systems/mage/dialogs/basic-roll-dialog.html";
		let dialogInitialData = {...this.DIALOG_PROTOTYPE}
		
		let traitValue = this.actorData.traitParts[key].value;
		let traitData = this.actorData.traitParts[key];

		dialogInitialData.rollTitle = `${traitData.name}`;
		dialogInitialData.baseDice = traitValue;
		dialogInitialData.idx = key;

		const html = await renderTemplate( template, dialogInitialData);

		new Dialog({
			title: `${traitData.name} Check`,
			content: html,
			default : "Roll",
			buttons: {
				Roll: {
					label: `Roll ${traitData.name} ( ${traitValue} )` ,
					callback: ( dialogUpdateData ) => { 
						let newData = this._extractDataFromDialog( dialogInitialData, dialogUpdateData );
						this.rollAttribute( newData );
					}
				}
			}
		}).render(true);
	}

	async rollAttribute( dialogData ){
		let traitParts = this.data.data.traitParts[dialogData.idx];
		let totalDice = +dialogData.baseDice + +dialogData.bonusDice
		let iconPath = "systems/mage/icons/traitParts/" + traitParts.name + ".png"

		let templateData = this._prepareSimpleTemplateData( totalDice, dialogData.difficulty, traitParts.name , iconPath);
		let template = `systems/mage/chat/simple-roll.html`;
		const html = await renderTemplate(template, templateData);
		let chatData = this._prepareChatData( html );
		
		return ChatMessage.create( chatData );
	}

	findSkill( skillName ){
		let mySkill = null;

		if( this.data.data.skills.grit[skillName] ){ mySkill = this.data.data.skills.grit[skillName] }
		if( this.data.data.skills.cunning[skillName] ){ mySkill = this.data.data.skills.cunning[skillName] }
		if( this.data.data.skills.will[skillName]){ mySkill = this.data.data.skills.will[skillName] }

		return mySkill
	}

	_prepareSimpleTemplateData( totalDice, difficulty, rollName , iconPath ){
		if( totalDice <  1){ totalDice = 1 };

		let rollString = `${totalDice}d10x=10cs>=${difficulty}`;
		let roll = new Roll(rollString);
		roll.roll();
		
		let templateData = {
			rollString : rollString, 
			rollResult : roll._total,
			roll : roll,
			totalDice : totalDice,
			rollName : rollName,
			iconPath : iconPath
		}

		return templateData;
	}

	_prepareChatData( chatMessageHtml ){
		const token = this.token;
		const actor = this._id;
		const name = this.name;
		
		const chatData = {
			user : game.user._id,
			content : chatMessageHtml,
			speaker : {
				actor: actor,
				token: token,
				alias : name
			}
		}
		
		return chatData;
	}

	_prepareItems(){

		// first lets make sure all updates are updated with any new values they should have.
		if( this.items ){
			this.items.forEach( ( item ) => {
				item.itemCalculations();
			});
		}

		/* Note we are ONLY copying the data into a data field for easy looping here */
		const inventory = {
			weapons : { label : "Weapons" , type: "weapon" ,  items: [] },
			spells : { label : "Spells" , type: "spell" , items: [] }
		}
		
		let [weapons , spells] = this.data.items.reduce( ( allArrays, item ) =>{
			if( item.type === "spell" ) allArrays[1].push( item );
			if( item.type === "weapon" ) {
				allArrays[0].push( item )
			};

			return allArrays;
		} , [[], []] );

		this.data.data.memorized = 0;
		this.data.data.deck = {}
		spells.forEach( ( spell ) => {
			if( spell.data.memorized.value ){
				this.data.data.memorized = this.data.data.memorized + +spell.data.memorized.number;
				this.data.data.deck[spell._id] = spell;
			}
		});

		this.data.data.remainingMemorized = 20 - this.data.data.memorized;

		this.data.data.weapons = weapons;
		this.data.data.spells = spells;
	}

	_triangularNumberFormula( base , costMultiple ){
		return ( ( +base * ( +base + 1 ) ) / 2 ) * +costMultiple;
	}

	_calculateTraits( data ){
		for( let [traitKey, trait] of Object.entries( data.traitParts ) ){
			data.traitParts[traitKey].value = +trait.base + +trait.super;
			data.traitParts[traitKey].total = +data.traitParts[traitKey].value + +trait.perm;
		}
	}

	_calculateSaves( data ){
		for( let [ saveKey, skillGroup] of Object.entries( data.skills ) ){
			
			let saveTotal = 0;
			if( saveKey =="cunning" ){ saveTotal = +data.traitParts.dex.value + +data.traitParts.per.value }
			if( saveKey =="grit"){ saveTotal = +data.traitParts.str.value + +data.traitParts.cor.value }
			if( saveKey =="will"){ saveTotal = +data.traitParts.cha.value + +data.traitParts.int.value }

			let skillTotal = 0
			for( let skill of Object.values( skillGroup ) ){
				skillTotal += +skill.base
			}

			data.defenses[saveKey].base = +saveTotal + Math.trunc(skillTotal / 5 );
			data.defenses[saveKey].value = data.defenses[saveKey].base + +data.defenses[saveKey].bonus + +data.defenses[saveKey].equip + +data.defenses[saveKey].enchant;
		}
	}

	_calculateDerived( data ){
		let cpParadoxBonus = 0;
		let carryBonus = 0;
		let concentrationBonus = 0;
		let hpBonusMultiple = 0;

		if( data.cp.spent != 0 ){
			cpParadoxBonus = Math.round( data.cp.spent / 10 );
			carryBonus = Math.round( data.cp.spent / 50 );
			concentrationBonus = Math.round( data.cp.spent / 50 );
			
			if( data.cp.spent == 0 ){
				hpBonusMultiple = 0;
			} else {
				hpBonusMultiple = data.cp.spent / 100;
			}
		}

		console.log( data.traitParts.str.value , hpBonusMultiple , data.hp.bonus );
		data.hp.max = Math.round( 15 + ( (+data.traitParts.str.value * 2) + +data.skills.grit.endurance.value * 2 ) * (1 + +hpBonusMultiple) ) + +data.hp.bonus;

		// Get default values, because sometimes these might be null;
		let phys = 0;
		if( data.mystictraits.physical )
			phys = data.traitParts[data.mystictraits.physical].value;

		let men = 0;
		if( data.mystictraits.mental )
			men = data.traitParts[data.mystictraits.mental].value;

		data.carry.max = +data.skills.grit.carry.value + +data.traitParts.str.value + 3;
		data.concentration.max = +data.skills.grit.concentration.value + +data.traitParts.int.value + 3;
		data.paradox.max = +phys + +men + +cpParadoxBonus + 5;

		console.log( data.paradox );
		console.log( data.hp );
	}

	_calculateArcana( data ){
		let traitBonus = 0;

		if( data.mystictraits.mental ){ traitBonus += +data.traitParts[data.mystictraits.mental].value; }
		if( data.mystictraits.physical ){ traitBonus += +data.traitParts[data.mystictraits.physical].value; }

		for( let sphere of Object.values( data.arcana ) ){
			let potentialValue  = +traitBonus + +sphere.total - 5;
			
			if( potentialValue <= 0 ){
				potentialValue = 1; // Value for a valid sphere should always be at least 1 Arcana.
			}

			if( sphere.base == 0 ){ // You have arcana zero in any sphere that doesn't at least have a level of 1.
				potentialValue = 0;
			}

			sphere.value = potentialValue;
		}
	}

	_calculateSkills( data ){
		for( let skillGroup of Object.values( data.skills) ){
			for( let skill of Object.values( skillGroup ) ){

				// When a skill doesn't have a trait, it's a '-- ' instead. Ugly, but better than making a new field.
				let traitNumber = skill.trait == "--" ? 0 : data.traitParts[skill.trait].total
				skill.value = +skill.base + +skill.super;
				skill.traitValue = +skill.value + +traitNumber;
				skill.total = +skill.equip + +skill.enchant + +skill.traitValue;
			}
		}
	}

	_calculateGlobalCosts( data ){
		/* first calculate creation offsets */
		
		console.log( data.creation );
		console.log( data.cp );
		

		data.creation.spentSkills = data.cp.skills;
		if( data.creation.spentSkills > data.creation.skills )
			data.creation.spentSkills = data.creation.skills;
		data.creation.unspentSkills = +data.creation.skills - +data.creation.spentSkills;

		data.creation.spentTraits = data.cp.traitParts;
		if( data.creation.spentTraits > data.creation.traits )
			data.creation.spentTraits = data.creation.traits;
		data.creation.unspentTraits = +data.creation.traits - +data.creation.spentTraits;

		data.creation.spentArcana = data.cp.arcana;
		if( data.creation.spentArcana > data.creation.arcana )
			data.creation.spentArcana = data.creation.arcana;
		data.creation.unspentArcana = +data.creation.arcana - +data.creation.spentArcana;

		data.cp.spent = ( +data.cp.traits - +data.creation.traits ) + ( +data.cp.skills - +data.creation.skills ) + ( +data.cp.arcana - +data.creation.arcana );
		if( data.cp.spent < 0 )
			data.cp.spent = 0;

		data.cp.total = +data.cp.journals + +data.cp.games + +data.cp.props + +data.cp.training;
		if( data.cp.spent > data.cp.total ){
			// ui.notifications.warn( this.data.name + " has spent more Character points than the he/she has!");
		}
			
	}

	_calculateTotalsAndCosts( data ){
		let sphereCumulative = 0;
		for( let sphere of Object.values( data.arcana ) ){
			sphere.total = +sphere.base + +sphere.super;
			sphere.cost = this._triangularNumberFormula( +sphere.base , 3 );
			sphereCumulative = +sphereCumulative + +sphere.cost;
		}
		data.cp.arcana = sphereCumulative;

		let traitCumulative = 0;
		for( let trait of Object.values( data.traitParts ) ){
			trait.total = +trait.base + +trait.super;
			trait.cost = this._triangularNumberFormula( +trait.base , 4 );
			traitCumulative = +traitCumulative +  +trait.cost;
		}
		data.cp.traitParts = traitCumulative;

		let skillCumulative = 0;
		for( let skillGroup of Object.values( data.skills) ){
			for( let skill of Object.values( skillGroup ) ){
				skill.total = +skill.base + +skill.super;
				skill.cost = this._triangularNumberFormula( +skill.base , +skill.tier );
				skillCumulative = +skillCumulative + +skill.cost;
			}
		}
		data.cp.skills = skillCumulative;
	}

	_sanitizeCharacterData( data ){
		for( let sphere of Object.values( data.arcana) ){
			sphere.base > this.ARCANA_BASE[1] ? sphere.base = this.ARCANA_BASE[1] : false;
			sphere.base < this.ARCANA_BASE[0] ? sphere.base = this.ARCANA_BASE[0] : false;
			sphere.super > this.ARCANA_SUPER[1] ? sphere.super = this.ARCANA_SUPER[1] : false;
			sphere.super < this.ARCANA_SUPER[0] ? sphere.super = this.ARCANA_SUPER[0] : false;
		}

		for( let trait of Object.values( data.traitParts ) ){
			trait.base > this.TRAIT_BASE[1] ? trait.base = this.TRAIT_BASE[1] : false;
			trait.base < this.TRAIT_BASE[0] ? trait.base = this.TRAIT_BASE[0] : false;
			trait.super > this.TRAIT_SUPER[1] ? trait.super = this.TRAIT_SUPER[1] : false;
			trait.super < this.TRAIT_SUPER[0] ? trait.super = this.TRAIT_SUPER[0] : false; 
		}

		for( let skillGroup of Object.values( data.skills) ){
			for( let skill of Object.values( skillGroup ) ){
				skill.base > this.SKILL_BASE[1] ? skill.base = this.SKILL_BASE[1] : false;
				skill.base < this.SKILL_BASE[0] ? skill.base = this.SKILL_BASE[0] : false;
				skill.super > this.SKILL_SUPER[1] ? skill.super = this.SKILL_SUPER[1] : false;
				skill.super < this.SKILL_SUPER[0] ? skill.super = this.SKILL_SUPER[0] : false; 
			}
		}
	}

	/* 
		kind of ugly, but this tricky bit of code extracts data from the finished dialog box. 
		Shouldn't matter what kind of data is in the dialog, it should get it all with proper properties.

		Note you pass in the initial data from the dialog as well. This is so you have populated defaults and
		to enforce the same convention across anything that consumes the dialog. 

		Careful editing this method, all dialogs and hence all rolls depend upon it.
	*/
	_extractDataFromDialog( initialDialogData , data ){
		let htmlFormControlsCollection = data[0].children[0].elements;

		[...htmlFormControlsCollection].forEach( ( elem ) =>{
			let name = elem.name;
			let value = elem.value;

			initialDialogData[name] = value;
		});
		
		return initialDialogData;
	}
}