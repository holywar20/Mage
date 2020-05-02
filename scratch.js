/*
- Drop Equipment

- Categorize Equipment
	character._prepareItems();

- Interact
	actor-inventory.html

*/

/* - Rolling a Macro
	html.find('.item .item-image').click(event => this._onItemRoll(event));
   * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
   * @private
   */
  _onItemRoll(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.getOwnedItem(itemId);

    // Roll spells through the actor
    if ( item.data.type === "spell" ) {
      return this.actor.useSpell(item, {configureDialog: !event.shiftKey});
    }

    // Otherwise roll the Item directly
    else return item.roll();
  }


// Rolling Dice 
	// dice.js
	// Set up a few 'standard' rolls'
	//let r = new Roll("2d20kh + @prof + @strMod", {prof: 2, strMod: 4});

// Applying damage & effects
	// chat.js