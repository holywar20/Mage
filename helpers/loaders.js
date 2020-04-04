

export class Loader{
	
	paths = { 
		tradition : "./systems/Mage/packs/traditions.json",
		spells : "./systems.Mage/packs/spells.json"
	}

	async loadCompendium( system, name ){
		const pack = await this.getPack( system , name );
		let cleared = await this.clearCompendium( pack );

		const content = await this.getJson( name );

		if( pack && content && cleared ) {
			let itemArray = [];
			
			content.forEach( ( ele ) =>{
				ele.type = name;
				const item = new Item( ele );
				itemArray.push( item );
			});

			itemArray.forEach( ( itemData ) => {
				pack.importEntity( itemData );
			});
		}
	}

	async clearCompendium( pack ){
		let index = await pack.getIndex()
		
		index.forEach( ( dbItem ) => {
			pack.deleteEntity( dbItem.id );
		});

		return true;
	}

	async getPack( system, name ){
		let packname = `${system}.${name}`;
		const pack = await game.packs.find( ( p ) => { 
			return p.collection == packname; 
		} );

		if( pack ) {
			return pack;
		} else {
			console.log(`Dev Error: pack doesn't exist : ${system}.${name}` )
		}
	}

	async getJson( name ){
		const response = await fetch( this.paths[name] );
		const content = await response.json()

		return content;
	}

		/*
		if( response ){
			return await response.json()
		} else {
			console.log( `Dev Error: File not found : ${path}` )
		}*/
}
