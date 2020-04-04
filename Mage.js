import { registerSettings } from './module/settings.js';
import { preloadTemplates } from './module/preloadTemplates.js';

import { BaseActor } from './module/actor/baseactor.js';
import { MageSheet } from './module/sheets/magesheet.js';

import { BaseItem } from './module/item/baseitem.js';
import { TraditionSheet } from './module/sheets/traditionsheet.js';

import { Loader } from './helpers/loaders.js';

Hooks.once('init', async function(){
	registerSettings();
	await preloadTemplates();
});

/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once('init', async function() {

	/* First set my default, base level configs */
	CONFIG.Actor.entityClass = BaseActor;
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

	// Register custom system settings
	registerSettings();
	
	// Preload Handlebars templates
	await preloadTemplates();
	
});

/* ------------------------------------ */
/* Setup system							*/
/* ------------------------------------ */
Hooks.once('setup', function() {
	Handlebars.registerHelper('if_equal', function(a, b, opts) {
		if (a == b) {
			return opts.fn(this)
		} else {
			return opts.inverse(this)
		}
	});
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function() {
	
	var loader = new Loader();
	loader.loadCompendium( 'mage' , 'tradition');
});

// Code for making a macro based on an item drop

/* async function create5eMacro(data, slot) {
  if ( data.type !== "Item" ) return;
  if (!( "data" in data ) ) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.dnd5e.rollItemMacro("${item.name}");`;
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
  if ( !macro ) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: {"dnd5e.itemMacro": true}
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
} */