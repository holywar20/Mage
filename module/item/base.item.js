export class BaseItem extends Item{
	constructor( ...args ){
		super(...args);

		//this.calculateStyles();
	}

	prepareData(){
		super.prepareData();

		this.calculateStyles();
	}

	//_updateObject( event, data){
	//	console.log( 'updating!' , event, data)
	//}

	/* Weapon methods */
	calculateStyles(){
		console.log('calculating styles')
		
		if( !this.data.data.styles ){ return {} }
		if( !this.data.type !== "weapon"){ return {} };
		
		let myStyles = this.data.data.styles; // Shallow copy. I need all the props for calculation

		for( let styleName in myStyles ){
			let hitSubtotal = 0;
			let dmgSubtotal = 0;
			
			if( this.actor ){
				hitSubtotal = this.actor.data.data.traits[myStyles[styleName].hitTrait].value;
				dmgSubtotal = this.actor.data.data.traits[myStyles[styleName].dmgTrait].value;
			}

			myStyles[styleName].dmgRoll = this.data.data.dmg + "+" + dmgSubtotal;
			myStyles[styleName].totalDice = hitSubtotal // TODO - potentially more complex data

			let dmgString = this.data.data.dmg;
			let [pre , suf] = dmgString.split( "d" );
			suf = ( +suf * +pre ) + +dmgSubtotal;
			pre = ( +pre ) + dmgSubtotal;
			
			myStyles[styleName].dmgInterval = `${pre} - ${suf}`;
		}

		console.log(myStyles);
		//return {};
	}

	rollWeapon( styleName ){
		if( !this.data.type === "weapon" );
	}

	calculateSpell(){
	
	}

	rollSpell(){
	
	}
}