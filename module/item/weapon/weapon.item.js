export class Weapon extends BaseItem{
	constructor(...args){
		super(...args);

		console.log("weapon initing");
	}

	async remove(){
		console.log("Removing!");

		return this.update({ [`data.styles.1599119`] : null})
	}
	
}