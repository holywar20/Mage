import { registerSettings } from './module/settings.js';
import { preloadTemplates } from './module/preloadTemplates.js';

import { BaseActor } from './module/actor/baseactor.js';
import { BaseSheet } from './module/sheets/basesheet.js'

Hooks.once('init', async function(){
	console.log("Mage is initiailzing")

	registerSettings();
	await preloadTemplates();
});

/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once('init', async function() {

	/* First set my default, base level configs */
	CONFIG.Actor.entityClass = BaseActor;
	CONFIG.Actor.sheetClass = BaseSheet;

	Actors.unregisterSheet("core" , ActorSheet );
	Actors.registerSheet( "mage" ,  BaseSheet, { 
		types: ["mage"], makeDefault: true 
	});


	// Register custom system settings
	registerSettings();
	
	// Preload Handlebars templates
	await preloadTemplates();

	// Register custom sheets (if any)
});

/* ------------------------------------ */
/* Setup system							*/
/* ------------------------------------ */
Hooks.once('setup', function() {
	// Do anything after initialization but before
	// ready
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function() {
	// Do anything once the system is ready
});