export const WEAPON_UTILITY = {
	calculateStyles( dmg , myStyles , actor = null ){
		
		for( let id in myStyles ){
			let hitSubtotal = 0;
			let dmgSubtotal = 0;
			
			if( this.actor ){
				if( myStyles[id].hitTrait ){
					hitSubtotal = actor.traits[myStyles[id].hitTrait].value;
				}
				
				if( myStyles[id].dmgTrait ){
					dmgSubtotal = actor.traits[myStyles[id].dmgTrait].value;
				}
			}

			myStyles[id].dmgRoll = dmg + "+" + dmgSubtotal;
			myStyles[id].totalDice = hitSubtotal // TODO - potentially more complex data

			let dmgString = dmg;
			// TODO - add a check for 'xxdxx and discard the rest';
			let [pre , suf] = dmgString.split( "d" );
			suf = ( +suf * +pre ) + +dmgSubtotal;
			pre = ( +pre ) + dmgSubtotal;
			
			myStyles[id].dmgInterval = `${pre} - ${suf}`;
		}

		return myStyles;
	},

	makeNewStyle(){
		return { 
			"skill" : null , 
			"dmgType" : null , 
			"dmgTrait" : null , 
			"hitTrait" : null , 
			"total" : 0 , 
			"dmgRoll" : 0 , 
			"dmgInterval" : 0
		}
	}
}