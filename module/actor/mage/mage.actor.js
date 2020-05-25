

export class MageActor extends Actor{
	constructor(...args) {
		super(...args);
	}
	
	ARCANA_MULTIPLE = 3;
	ARCANA_SUPER = [ -5 , 5];
	ARCANA_BASE = [ 0 , 5];

	TRAIT_MULTIPLE = 4;
	TRAIT_SUPER = [-5 , 5];
	TRAIT_BASE = [0 , 5];

	SKILL_SUPER = [-5 , 5];
	SKILL_BASE = [0, 5];

	prepareData(){
		super.prepareData();
		const data = this.data.data;
		/* Make sure player data isn't stupid */
		//this._sanitizeCharacterData( data );

		/* Calculate costs & total values first. */
		this._calculateTotalsAndCosts( data );
		
		// Build mods array
		//this._calculateMods();

		/* Do character global character point math */
		this._calculateGlobalCosts( data );

		this._calculateTraits( data );
		this._calculateArcana( data );
		this._calculateSkills( data );

		this._prepareItems( this.data.items );

		this._calculateDerived( data );
	}

	_prepareItems( itemList ){
		const inventory = {
			weapons : { label : "Weapons" , type: "weapon" ,  items: [] },
			spells : { label : "Spells" , type: "spell" , items: [] }
		}
		
		let [weapons , spells] = itemList.reduce( ( allArrays, item ) =>{
			if( item.type === "spell" ) allArrays[1].push( item );
			if( item.type === "weapon" ) allArrays[0].push( item );

			return allArrays;
		} , [[], []] );

		weapons.forEach( ( weapon ) => {
			console.log( weapon );
		});


		this.data.data.weapons = weapons;
		this.data.data.spells = spells;
	}

	_triangularNumberFormula( base , costMultiple ){
		return ( ( +base * ( +base + 1 ) ) / 2 ) * +costMultiple;
	}

	_calculateTraits( data ){
		for( let [traitKey, trait] of Object.entries( data.traitParts ) ){
			data.traits[traitKey].value = +trait.base + +trait.temp + +trait.sustained + +trait.perm;
		}
	}

	_calculateSaves( data ){
		for( let [ saveKey, skillGroup] of Object.entries( data.skills ) ){
			
			let saveTotal = 0;
			if( saveKey =="cunning" ){ saveTotal = +data.trait.dex.value + +data.trait.per.value }
			if( saveKey =="grit "){ saveTotal = +data.trait.str.value + +data.trait.cor.value }
			if( saveKey =="will"){ saveTotal = +data.trait.cha.value + +data.trait.int.value }

			let skillTotal = 0
			for( let skill of Object.values( skillGroup ) ){
				skillTotal += +skill.value
			}
			data.defenses[saveKey].base = +saveTotal + Math.trunc(skillTotal / 5 );
			data.defenses[saveKey].value = data.defenses[saveKey].base + data.defenses[saveKey].bonus;
		}
	}

	_calculateDerived( data ){
		// Calculate PAradox
		// data.paradox.max = +data.mystictraits.physical + +data.mystictraits.mental;

		
	}

	_calculateArcana( data ){
		let traitBonus = 0;

		if( data.mystictraits.mental ){ traitBonus += +data.traits[data.mystictraits.mental].value; }
		if( data.mystictraits.physical ){ traitBonus += +data.traits[data.mystictraits.physical].value; }

		if( traitBonus > 0 ){
			traitBonus = Math.trunc( traitBonus / 2 );
		}

		for( let sphere of Object.values( data.arcana ) ){
			sphere.value = +traitBonus + +sphere.total;
		}
	}

	_calculateSkills( data ){
		for( let skillGroup of Object.values( data.skills) ){
			for( let skill of Object.values( skillGroup ) ){

				// When a skill doesn't have a trait, it's a -- line instead. Ugly, but better than making a new field.
				let traitValue = skill.trait == "--" ? 0 : data.traits[skill.trait].value
				skill.value = +traitValue + +skill.equip + +skill.enchant + +skill.total;
			}
		}
	}

	_calculateGlobalCosts( data ){
		data.cp.spent = data.cp.traits + data.cp.skills + data.cp.arcana;
		
	}

	_calculateTotalsAndCosts( data ){
		let sphereCumulative = 0;
		for( let sphere of Object.values( data.arcana ) ){
			sphere.total = +sphere.base + +sphere.super;
			sphere.cost = this._triangularNumberFormula( sphere.base , this.ARCANA_MULTIPLE );
			sphereCumulative += sphere.cost;
		}
		data.cp.arcana = sphereCumulative;

		let traitCumulative = 0;
		for( let trait of Object.values( data.traitParts ) ){
			trait.total = +trait.base + +trait.super;
			trait.cost = this._triangularNumberFormula( trait.base , this.TRAIT_MULTIPLE );
			traitCumulative += trait.cost;
		}
		data.cp.traits = traitCumulative;

		let skillCumulative = 0;
		for( let skillGroup of Object.values( data.skills) ){
			for( let skill of Object.values( skillGroup ) ){
				skill.total = +skill.base + +skill.super;
				skill.cost = this._triangularNumberFormula( skill.base , skill.tier );
				skillCumulative += skill.cost;
			}
		}
		data.cp.skills = skillCumulative;
	}

	_sanitizeCharacterData( data ){
		for( let sphere of Object.values( data.arcana) ){
			sphere.base > this.ARCANA_BASE[1] ? sphere.base = this.ARCANA_BASE[1] : false;
			sphere.base < this.ARCANA_BASE[0] ? sphere.base = this.ARCANA_BASE[0] : false;
			sphere.super > this.ARCANA_SUPER[1] ? sphere.super = this.ARCANA_SUPER[1] : false;
			sphere.super < this.ARCANA_SUPER[0] ? sphere.super = this.ARCANA_SUPER[0] : false;
		}

		for( let trait of Object.values( data.traitParts ) ){
			trait.base > this.TRAIT_BASE[1] ? trait.base = this.TRAIT_BASE[1] : false;
			trait.base < this.TRAIT_BASE[0] ? trait.base = this.TRAIT_BASE[0] : false;
			trait.super > this.TRAIT_SUPER[1] ? trait.super = this.TRAIT_SUPER[1] : false;
			trait.super < this.TRAIT_SUPER[0] ? trait.super = this.TRAIT_SUPER[0] : false; 
		}

		for( let skillGroup of Object.values( data.skills) ){
			for( let skill of Object.values( skillGroup ) ){
				skill.base > this.SKILL_BASE[1] ? skill.base = this.SKILL_BASE[1] : false;
				skill.base < this.SKILL_BASE[0] ? skill.base = this.SKILL_BASE[0] : false;
				skill.super > this.SKILL_SUPER[1] ? skill.super = this.SKILL_SUPER[1] : false;
				skill.super < this.SKILL_SUPER[0] ? skill.super = this.SKILL_SUPER[0] : false; 
			}
		}
	}
}