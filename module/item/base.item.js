import { WEAPON_UTILITY } from "../item/weapon/weapon.utility.js";

export class BaseItem extends Item{
	constructor( ...args ){
		super(...args);

		//this.calculateStyles();
	}

	prepareData(){
		super.prepareData();

		this.itemCalculations();
	}

	//_updateObject( event, data){
	//	console.log( 'updating!' , event, data)
	//}

	/* Weapon methods */
	itemCalculations(){
		
		console.log( 'item calculations' , this.data );
		if( this.data.type === "weapon" ){
			this.data.data.styles = WEAPON_UTILITY.calculateStyles( this.data.data.dmg, this.data.data.styles )
		}

		
		//return {};
	}

	rollRedirect( styleName ){
		if( this.data.type === "weapon" ){
			console.log("doing the rolls");
		}
	}
}