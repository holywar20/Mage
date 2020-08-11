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
	
	calculateStyles( weapon , actor = null ){
		let myStyles = weapon.data.data.styles;

		for( let id in myStyles ){
			let hitSubtotal = weapon.data.data.diceBonus;
			let dmgSubtotal = 0;

			if( actor ){
				if( myStyles[id].hitTrait ){
					hitSubtotal = +hitSubtotal + +actor.data.data.traits[myStyles[id].hitTrait].value;
				}

				if( myStyles[id].skill ){
					let mySkill = actor.findSkill(myStyles[id].skill );

					if( mySkill ){
						hitSubtotal += +mySkill.value;
					}
				}
				
				if( myStyles[id].dmgTrait ){
					dmgSubtotal = actor.data.data.traits[myStyles[id].dmgTrait].value;
				}
			}

			// Calculate Two Handed Damage
			if( weapon.data.data.hands == 2 ){
				let twoHandedSkill = actor.data.data.skills.grit['two-handed'].value;
				let twoHandedDamage = 0;
				if( twoHandedSkill > dmgSubtotal ){
					twoHandedDamage = +dmgSubtotal
				} else {
					twoHandedDamage = +twoHandedSkill;
				}

				dmgSubtotal = +dmgSubtotal + +twoHandedDamage;
			}

			myStyles[id].dmgBonus = dmgSubtotal;
			myStyles[id].dmgRoll = weapon.data.data.dmg + "+" + dmgSubtotal;
			myStyles[id].total = hitSubtotal; // TODO - potentially more complex data

			let dmgString = weapon.data.data.dmg;
			// TODO - add a check for 'xxdxx and discard the rest';
			let [pre , suf] = dmgString.split( "d" );
			suf = ( +suf * +pre ) + +dmgSubtotal;
			pre = ( +pre ) + +dmgSubtotal;
			
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