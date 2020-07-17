

export class MageActor extends Actor{
	constructor(...args) {
		super(...args);
	}
	
	actorData = this.data.data;

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
		//this._sanitizeCharacterData( data );

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
		
		let traitValue = this.actorData.traits[key].value;
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
		let iconPath = "systems/mage/icons/traits/" + traitParts.name + ".png"

		let templateData = this._prepareSimpleTemplateData( totalDice, dialogData.difficulty, traitParts.name , iconPath);
		let template = `systems/mage/chat/simple-roll.html`;
		const html = await renderTemplate(template, templateData);
		let chatData = this._prepareChatData( html );
		
		return ChatMessage.create( chatData );
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

		this.data.data.weapons = weapons;
		this.data.data.spells = spells;
	}

	_triangularNumberFormula( base , costMultiple ){
		return ( ( +base * ( +base + 1 ) ) / 2 ) * +costMultiple;
	}

	_calculateTraits( data ){
		for( let [traitKey, trait] of Object.entries( data.traitParts ) ){
			data.traits[traitKey].value = +trait.base + +trait.temp + +trait.sustained + +trait.perm;
		}
	}

	_calculateSaves( data ){
		for( let [ saveKey, skillGroup] of Object.entries( data.skills ) ){
			
			let saveTotal = 0;
			if( saveKey =="cunning" ){ saveTotal = +data.traits.dex.value + +data.traits.per.value }
			if( saveKey =="grit "){ saveTotal = +data.traits.str.value + +data.traits.cor.value }
			if( saveKey =="will"){ saveTotal = +data.traits.cha.value + +data.traits.int.value }

			let skillTotal = 0
			for( let skill of Object.values( skillGroup ) ){
				skillTotal += +skill.value
			}

			data.defenses[saveKey].base = +saveTotal + Math.trunc(skillTotal / 5 );
			data.defenses[saveKey].value = data.defenses[saveKey].base + data.defenses[saveKey].bonus + +data.defenses[saveKey].equip + +data.defenses[saveKey].enchant;
		}
	}

	_calculateDerived( data ){
		// Calculate PAradox
		// data.paradox.max = +data.mystictraits.physical + +data.mystictraits.mental;
		// Calculate HP
	}

	_calculateArcana( data ){
		let traitBonus = 0;

		if( data.mystictraits.mental ){ traitBonus += +data.traits[data.mystictraits.mental].value; }
		if( data.mystictraits.physical ){ traitBonus += +data.traits[data.mystictraits.physical].value; }

		if( traitBonus > 0 ){
			traitBonus = Math.trunc( traitBonus / 2 );
		}

		for( let sphere of Object.values( data.arcana ) ){
			sphere.value = +traitBonus + +sphere.total;
		}
	}

	_calculateSkills( data ){
		for( let skillGroup of Object.values( data.skills) ){
			for( let skill of Object.values( skillGroup ) ){

				// When a skill doesn't have a trait, it's a -- line instead. Ugly, but better than making a new field.
				let traitValue = skill.trait == "--" ? 0 : data.traits[skill.trait].value
				skill.value = +traitValue + +skill.equip + +skill.enchant + +skill.total;
			}
		}
	}

	_calculateGlobalCosts( data ){
		data.cp.spent = data.cp.traits + data.cp.skills + data.cp.arcana;
		
	}

	_calculateTotalsAndCosts( data ){
		let sphereCumulative = 0;
		for( let sphere of Object.values( data.arcana ) ){
			sphere.total = +sphere.base + +sphere.super;
			sphere.cost = this._triangularNumberFormula( sphere.base , this.ARCANA_MULTIPLE );
			sphereCumulative += sphere.cost;
		}
		data.cp.arcana = sphereCumulative;

		let traitCumulative = 0;
		for( let trait of Object.values( data.traitParts ) ){
			trait.total = +trait.base + +trait.super;
			trait.cost = this._triangularNumberFormula( trait.base , this.TRAIT_MULTIPLE );
			traitCumulative += trait.cost;
		}
		data.cp.traits = traitCumulative;

		let skillCumulative = 0;
		for( let skillGroup of Object.values( data.skills) ){
			for( let skill of Object.values( skillGroup ) ){
				skill.total = +skill.base + +skill.super;
				skill.cost = this._triangularNumberFormula( skill.base , skill.tier );
				skillCumulative += skill.cost;
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