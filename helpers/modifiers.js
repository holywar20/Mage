export const VALID_MODS = {
	"allSaves" : { "max" : 2 , "min" : -2 , "default" : 0 },
	"reach"    : { "max" : 2 , "min" : 0 , "default" : 0 },
	"damage"   : { "max" : null , "min" : null , "default" : 0 }
}

export class Modifiers{
	
	applyMods( actor ){
		for( let mod in VALID_MODS ){

		}
	}

	allSaves( actor = null, item = null ){
	
	}
}