

export class Loader{
	
	paths = { 
		tradition : "./systems/Mage/packs/traditions/traditions.json",
		weapon : "./systems/Mage/packs/weapons/weapons.json"
	}

	async loadSpellTSVData(){
		var rawFile = new XMLHttpRequest();
		let packs = {
			'space' : await this.getPack('mage' , "space"),
			'entropy' : await this.getPack('mage' , "entropy"),
			'life' : await this.getPack('mage' , "life"),
			'time': await this.getPack('mage' , "time"),
			'matter' : await this.getPack('mage' , "matter"),
			'spirit' : await this.getPack('mage' , "spirit"),
			'force' : await this.getPack('mage' , "force"),
			'prime' : await this.getPack('mage' , "prime"),
			'mind' : await this.getPack('mage' , "mind"),
		}

		
		fetch('systems/mage/packs/spells/Rawspelldata.tsv')
			.then( response => response.text() )
			.then( data => {
				let allLineArray = data.split(/\r\n|\n/);
				let spellData = {
					'space' : [] , 'entropy' : [] , 'life' : [] , 
					'time': [] , 'matter' : [] , 'spirit' : [] ,
					'force' : [] , 'prime' : [] , 'mind' : []
				};

				// First normalize the data. 
				let headerArray = [];
				allLineArray.forEach( ( line , idx ) => {
					if( idx == 0 ){
						headerArray = line.split("\t");
					} else {
						let thisLine = line.split("\t");
						let thisLineFlatData = {}

						headerArray.forEach( ( key , innerIdx ) =>{
							thisLineFlatData[key] = thisLine[innerIdx];
						});

						let school = thisLineFlatData.spheres;
						spellData[school].push( thisLineFlatData );
					}
				});

				// Now we pop the data into proper JSON data that matches the template
				for( const sphere in spellData ){
					spellData[sphere].forEach( ( spell , idx ) => {
						
						if( trackthis ){
							console.log( spell );
						}

						spellData[sphere][idx] = {
							"type" : "spell",
							"name": spell.name ,
							"img" : spell.img,
							"data": {
								"paradox" : spell.paradox,
								"rollNotes" : spell.rollNotes,
								"defense" : spell.defense ,
								"spellType" : spell.spellType,
								"vulgarity" : spell.vulgarity,
								"range" :{
									"num" : spell['range.num'], "type" : spell['range.type'] 
								},
								"targets" : {
									"num" : spell['targets.num'], "type" : spell['targets.type'], "num2" : spell['targets.num2']
								},
								"duration" :{
									"num" : spell['duration.num'] , "type" : spell['duration.type'],
								},
								"spheres" : {
									"initial": {
										"type" : spell.spheres,
										"num" : spell.level 
									}
								},
								"rollArcana" : spell.rollArcana
							}
						}
					});
				}


				for( const sphere in spellData ){
					// Get the pack, and clear it out completely.
					const myPack = packs[sphere];
					let testing = 0;
					this.clearCompendium( myPack );

					spellData[sphere].forEach( ( sData , idx ) =>{
						const item = new Item( sData );
						
						if( !testing ){
							testing = 1;
						}

						if( !item ){
							console.log("Couldn't Import", item , sData );
						} else {
							myPack.importEntity( item );
						}
						
					});
				}

		});
	}

	async loadCompendium( system, name ){
		const pack = await this.getPack( system , name );

		let cleared = await this.clearCompendium( pack );
		const content = await this.getJson( name );

		var testing = 0;

		if( pack && content && cleared ) {
			let itemArray = [];
			
			content.forEach( ( ele ) =>{
				ele.type = name;
				const item = new Item( ele );
				if( !testing ){
					testing = 1;
				}
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
			pack.deleteEntity( dbItem._id );
		});

		return true;
	}

	async getPack( system, name ){
		let packname = `${system}.${name}`;
		const pack = await game.packs.find( ( p ) => { 
			return p.collection == packname; 
		});

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
