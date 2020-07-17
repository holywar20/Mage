export const WEAPON_UTILITY = {
	makeWeaponRollNotes( extraRolls , notes ){
		for( const x in extraRolls ){
			try{
				let thisRoll = new Roll( extraRolls[x].rollString );
				thisRoll.roll();

				let target = "{" + extraRolls[x].rollSource + "}";
				let rollText = "<span class='chat-value'>" + thisRoll._total + "</span>";
				notes = notes.replace( target , rollText );
			} catch {
				// TODO show an alert.
			}
		}
		
		return notes;
	},
	
	calculateStyles( dmg , myStyles , actor = null ){
		
		for( let id in myStyles ){
			let hitSubtotal = 0;
			let dmgSubtotal = 0;
			
			if( actor ){
				if( myStyles[id].hitTrait ){
					hitSubtotal = actor.data.data.traits[myStyles[id].hitTrait].value;
				}
				
				if( myStyles[id].dmgTrait ){
					dmgSubtotal = actor.data.data.traits[myStyles[id].dmgTrait].value;
				}
			}

			myStyles[id].dmgBonus = dmgSubtotal;
			myStyles[id].dmgRoll = dmg + "+" + dmgSubtotal;
			myStyles[id].total = hitSubtotal; // TODO - potentially more complex data

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
			"dmgBonus" : 0,
			"dmgRoll" : 0 , 
			"dmgInterval" : 0
		}
	}
}