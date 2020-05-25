import { registerSettings } from './module/settings.js';
import { preloadTemplates } from './module/preloadTemplates.js';

/* Import Actors + Actor sheets */
import { MageActor } from './module/actor/mage/mage.actor.js';
import { MageSheet } from './module/actor/mage/mage.sheet.js';


/* Import Items + Item Sheets */
import { BaseItem } from './module/item/base.item.js';
import { TraditionSheet } from './module/item/tradition/tradition.sheet.js';
import { WeaponSheet } from './module/item/weapon/weapon.sheet.js';
import { SpellSheet } from './module/item/spell/spell.sheet.js';

import { Loader } from './helpers/loaders.js';

Hooks.once('init', async function(){
	registerSettings();
	// await preloadTemplates(); Add templates to preload. There shouldn't be that many.
});

/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once('init', async function() {

	/* First set my default, base level configs */
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

  Handlebars.registerHelper('capitalize' , function( string , opts ){
    
  });
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function() {
	
	var loader = new Loader();
	//loader.loadCompendium( 'mage' , 'tradition' );
  //loader.loadCompendium( 'mage' , 'weapon' );
});

/*
function rollItemMacro( name ){
  const speaker = ChatMessage.getSpeaker();

  console.log( name );
  console.log( speaker );
}*/

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

/* Drawing stuff 
function drawingTest() {
  const drawingsData = [];
  for (let i = 0; i < 200; i++) {
    drawingsData.push({
      type: CONST.DRAWING_TYPES.RECTANGLE,
      author: game.user._id,
      x: i,
      y: i,
      width: 10,
      height: 10,
      fillType: CONST.DRAWING_FILL_TYPES.SOLID,
      fillColor: game.user.color,
      fillAlpha: 0.15,
      flags: { testBox: true },
    });
  }
  canvas.scene
    .createManyEmbeddedEntities("Drawing", drawingsData)
    .then((drawings) => {
      let ids = [];
      drawings.forEach((drawingObject) => {
        ids.push(drawingObject._id);
      });
      canvas.scene
        .deleteManyEmbeddedEntities("Drawing", ids)
        .then(() => {
          console.log("success");
        })
        .catch(() => {
          console.log("error");
        });
    });
}*/