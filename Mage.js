import { registerSettings } from './module/settings.js';
import { preloadTemplates } from './module/preloadTemplates.js';

/* Import Actors + Actor sheets */
import { MageActor } from './module/actor/mage/mage.actor.js';
import { MageSheet } from './module/actor/mage/mage.sheet.js';

/* Import Items + Item Sheets */
import { TraditionSheet } from './module/item/tradition/tradition.sheet.js';
import { WeaponSheet } from './module/item/weapon/weapon.sheet.js';
import { SpellSheet } from './module/item/spell/spell.sheet.js';
import { BaseItem } from './module/item/base.item.js';

import { Loader } from './helpers/loaders.js';

/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once('init', async function() {

	/* First match in global methods for calling macros*/
	game.mage = {
		rollWeaponMacro , rollArcanaMacro, rollSaveMacro , rollTraitMacro , rollSpellMacro , rollSkillMacro, rollUtilityMacro
	};
	
	CONFIG.Actor.entityClass = MageActor;
	CONFIG.Item.entityClass = BaseItem;

	Actors.unregisterSheet("core" , ActorSheet );
	Actors.registerSheet( "mage" ,  MageSheet, { 
		types: ["mage"], 
		makeDefault: true 
	});

	Items.unregisterSheet("core" , ItemSheet )
	Items.registerSheet("mage" , TraditionSheet, {
		types: ["tradition"]
	});
	Items.registerSheet("mage" , WeaponSheet ,{
		types: ["weapon"]
	});
	Items.registerSheet("mage" , SpellSheet ,{
		types: ["spell"]
	});

	/* Create a mage namespace within the game global.
		These are mostly meant to be globally executable commands */



	// Register custom system settings
	registerSettings();
	
	// Preload Handlebars templates
	// await preloadTemplates();
	
});

/* ------------------------------------ */
/* Setup system							*/
/* ------------------------------------ */
Hooks.once('setup', function() {
	/* A custom helper, that compares to values for equality */
	Handlebars.registerHelper('if_equal', function(a, b, opts) {
		if (a == b) {
			return opts.fn(this)
		} else {
			return opts.inverse(this)
		}
	});

	Handlebars.registerHelper('if_greater', function( a , b , opts){
		if( a >= b ){
			return opts.fn(this)
		} else {
			return opts.inverse(this)
		}
	});

	Handlebars.registerHelper('if_less', function( a , b , opts){
		if( a <= b ){
			return opts.fn(this)
		} else {
			return opts.inverse(this)
		}
	});

	Handlebars.registerHelper('capitalize' , function( string , opts ){
		if( string ){
			return string[0].toUpperCase() +  string.slice(1);
		} else {
			return "";
		}
	});

	Handlebars.registerHelper('roll_success' , function ( success , opts ){
		let type = "Miss!"
		switch( true ){
			case ( success > 15 ):
				type = "Legendary!"; break;
			case( success >= 10 ):
				type = "Heroic!"; break;
			case( success >= 5 ):
				type = "Epic!"; break;
			case( success >= 1 ):
				type = "Hit!";
		}

		return type;
	});

	Handlebars.registerHelper( 'get_die_css_classes' , function( faces, roll, opts ) {
		let classArray = [];
		
		switch( true ){
			case( faces == '20'):
				classArray.push( 'd20Roll' ); break;
			case( faces == '12'):
				classArray.push( 'd12Roll'); break;
			case( faces == '10'):
				classArray.push( 'd10Roll'); break;
			case( faces == '8'):
				classArray.push( 'd8Roll'); break;
			case( faces == '6'):
				classArray.push( 'd6Roll'); break;
			case( faces == '4'):
				classArray.push( 'd4Roll'); break;
			case( true ):
				classArray.push('d20Roll'); break; // D20 is default background for random dice.
		}

		switch( true ){
			case( faces == roll ):
				classArray.push('roll-crit-hit'); break;
			case( faces == 1 ):
				classArray.push('roll-crit-miss'); break;
		}

		let classes = classArray.join(' ');
		return classes;
	});

	Handlebars.registerHelper( 'get_dmg_css_classes' , function ( dmgtype , options ){
	
	});

	Handlebars.registerHelper('is_between', function( test , val1, val2 , opts ){
		if( test >= val1 && test <= val2 ){
			return opts.fn( this );
		} else {
			return opts.inverse( this );
		}
	});
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function() {
	
	var loader = new Loader();
	//loader.loadCompendium( 'mage' , 'tradition' );
	//loader.loadCompendium( 'mage' , 'weapon' );

	Hooks.on("hotbarDrop" , ( bar, data, slot ) => { 
		console.log( data );
		switch( data.type ){
			case "Skill" : createSkillMacro( data, slot ); break;
			case "Trait" : createTraitMacro( data, slot); break;
			case "Arcana" : createArcanaMacro( data, slot ); break;
			case "Utility" : createUtilityMacro( data, slot ); break;
			case "Save" : createSaveMacro( data, slot); break;

			case "Item":
				if( data.data.type == "weapon" ) createWeaponMacro( data, slot );
				if( data.data.type == "spell" ) createSpellMacro( data, slot ); 
			break;
		}
	});
});

async function createSkillMacro( macroRequest , slot ){
	const command = `game.mage.rollSkillMacro( '${macroRequest.key}' , '${macroRequest.actorId}' , '${macroRequest.skillType}')`;

	let macro = await Macro.create({
		name: macroRequest.data.name,
		type: "script",
		img: `systems/mage/icons/skill-list/${macroRequest.data.name}.png`,
		command: command
	});
	game.user.assignHotbarMacro( macro, slot );
}

function rollSkillMacro( key, actorId , skillType ){
	let actor = game.actors.get( actorId );
	actor.rollSkillDialog( key , skillType );
}

async function createWeaponMacro( macroRequest , slot ){	
	const item = macroRequest.data;
	
	const command = `game.mage.rollWeaponMacro("${item._id}" , "${macroRequest.actorId}")`;

	console.log( item , item._id );

	let macro = await Macro.create({
		name: item.name,
		type: "script",
		img: item.img,
		command: command,
		flags: { "mage.itemMacro": true }
	});

	game.user.assignHotbarMacro( macro, slot );
}

function rollWeaponMacro( itemId , actorId ){
	let actor = game.actors.get( actorId );
	if( actor ){
		let weapon = actor.getOwnedItem( itemId );
		if( weapon ){
			weapon.rollRedirect();
		}
	}
}

async function createSpellMacro( macroRequest, slot ){
	console.log("creating a spell : ", macroRequest )
}

function rollSpellMacro(){
	const speaker = ChatMessage.getSpeaker();

	console.log("Rolling a spell");
}

async function createArcanaMacro( macroRequest, slot ){
	const command = `game.mage.rollArcanaMacro( '${macroRequest.key}' , '${macroRequest.actorId}' )`;

	let macro = await Macro.create({
		name: macroRequest.data.name,
		type: "script",
		img: `systems/mage/icons/arcana/${macroRequest.data.name}.png`,
		command: command
	});
	game.user.assignHotbarMacro( macro, slot );
}

function rollArcanaMacro( key, actorId ){
	let actor = game.actors.get( actorId );
	actor.rollArcanaDialog( key );
}

async function createTraitMacro( macroRequest, slot ){
	const command = `game.mage.rollTraitMacro( '${macroRequest.key}' , '${macroRequest.actorId}' )`;

	let macro = await Macro.create({
		name: macroRequest.data.name,
		type: "script",
		img: `systems/mage/icons/traits/${macroRequest.data.name}.png`,
		command: command
	});
	game.user.assignHotbarMacro( macro, slot );
}

function rollTraitMacro( key, actorId ){
	let actor = game.actors.get( actorId );
	actor.rollAttributeDialog( key );
}

async function createSaveMacro( macroRequest, slot ){
	const command = `game.mage.rollSaveMacro( '${macroRequest.key}' , '${macroRequest.actorId}' )`;

	let macro = await Macro.create({
		name: macroRequest.data.name,
		type: "script",
		img: `systems/mage/icons/other/${macroRequest.data.name}.png`,
		command: command
	});
	game.user.assignHotbarMacro( macro, slot );
}

function rollSaveMacro( key, actorId ){
	let actor = game.actors.get( actorId );	
	actor.rollSaveDialog( key );
}

async function createUtilityMacro( macroRequest, slot ){
	const speaker = ChatMessage.getSpeaker();

	console.log("Creating a utility macro" , macroRequest, slot );
}

function rollUtilityMacro( macroRequest , slot ){
	
}