import { WEAPON_UTILITY } from "../item/weapon/weapon.utility.js";

export class BaseItem extends Item{
	constructor( ...args ){
		super(...args);

		//this.calculateStyles();
	}

	prepareData(){
		super.prepareData();

		this.itemCalculations();
	}

	//_updateObject( event, data){
	//	console.log( 'updating!' , event, data)
	//}

	/* Weapon methods */
	itemCalculations(){
		
		let myActor = null
		if( this.options.actor) 
			myActor = this.options.actor;

		if( this.data.type === "weapon" ){
			this.data.data.styles = WEAPON_UTILITY.calculateStyles( this.data.data.dmg, this.data.data.styles , myActor );
		}
	}

	rollRedirect(){
		if( this.data.type === "weapon" ){ this._rollWeaponDialog(); }
		//if( this.data.type === "spell" ){ this._rollWeaponDialog(); }
	}

	async _rollWeaponDialog(){
		const template = "systems/mage/dialogs/weapon-roll-dialog.html";
		let dialogInitialData = {
			idx: "" , 
			difficulty : 7 , 
			bonusDice : 0 , 
			rollTitle : "", 
			playerTarget : "" ,  
			rollMode : "public"
		}

		const html = await renderTemplate( template, dialogInitialData );
		const styles = this.data.data.styles;

		let buttons = {}
		let newData = null;

		for (const id in styles) {
			const s = styles[id]; // Short hand to make the code less ugly
			let dice = s.total ? s.total : 1;

			buttons[id] = {
				label : `${s.skill}: ${dice}x Dice ${s.dmgInterval} ${s.dmgType} dmg`,
				callback : ( dialogUpdateData ) => {
					newData = this._extractDataFromDialog( dialogInitialData, dialogUpdateData );
					newData.rollTitle = `${this.name} ( ${s.skill} )`;
					this.rollWeaponRoll( newData , s );
				}
			}
		}

		new Dialog({
			title : `Attack with ${this.data.name}` , content : html , buttons : buttons,
		}).render( true );
	}

	async rollWeaponRoll( dialogData , style ){
		let totalDice = +style.total + +dialogData.bonusDice;
		
		let templateData = this._prepareWeaponRollTemplateData( totalDice , dialogData.difficulty , dialogData.rollTitle, style );
		let template = "systems/mage/chat/weapon-roll.html";

		templateData.style = style;

		console.log( templateData );

		const html = await renderTemplate( template, templateData );
		let chatData = this._prepareChatData( html );

		return ChatMessage.create( chatData );
	}

	_prepareWeaponRollTemplateData( dice, difficulty, rollName , style ){
		if( dice < 1 ){ dice = 1 }

		let toHitString = `${dice}d10x=10cs>=${difficulty}`;
		let toHitRoll = new Roll(toHitString);
		toHitRoll.roll();

		let dmgString = `${style.dmgRoll}`;
		
		if( toHitRoll._total >= 5 ){ dmgString = dmgString  ` + ${this.data.data.dmg}`; }
		if( toHitRoll._total >= 10 ){ dmgString = dmgString ` + ${style.dmgBonus}`; }
		if( toHitRoll._total >= 15 ){ dmgString = dmgString ` + ${style.dmgRoll}`; }

		let dmgRoll = new Roll( dmgString );
		dmgRoll.roll();
		
		let notes = WEAPON_UTILITY.makeWeaponRollNotes( this.data.data.extraRolls, this.data.data.rollNotes );

		let templateData = {
			rollString : toHitString, 
			rollResult : toHitRoll._total,
			roll : toHitRoll,
			totalDice : dice,
			rollName : rollName,
			iconPath : this.data.img,

			dmgRoll : dmgRoll,
			dmgRollString : dmgString,
			rollNotes : notes
		}

		return templateData;
	}

	async _rollSpellDialog(){

	}

	_prepareChatData( chatMessageHtml ){
		let token = null;
		let actor = null;
		if( this.options.actor ){
			token = this.options.actor.token;
			actor = this.options.actor._id;
		}
		
		const chatData = {
			user : game.user._id,
			content : chatMessageHtml,
			speaker : {
				actor: actor,
				token: token
			}
		}
		
		return chatData;
	}

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