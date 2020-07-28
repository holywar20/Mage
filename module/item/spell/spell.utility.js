export const SPELL_UTILITY = {
	calculateArcana( spellData , actor = null ){

		let currentArcanas = [];
		for( let id in spellData.spheres ){
			if( spellData.spheres[id].type )
				currentArcanas.push(spellData.spheres[id].type);
		}

		let currentGreatest = 0;
		currentArcanas.forEach( ( aType ) => {
			if( actor ){
				if( actor.data.data.arcana[aType].value ){
					if( actor.data.data.arcana[aType].value > currentGreatest ){
						currentGreatest = actor.data.data.arcana[aType].value;
					}
				}
			}
		});// Arcana is zero, unless the actor has at least an arcana of 1 in a particular sphere.

		return currentGreatest
	}
}