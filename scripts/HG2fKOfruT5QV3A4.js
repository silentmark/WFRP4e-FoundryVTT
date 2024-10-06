let lore = await ValueDialog.create({text : "Choose Lore", title : "Lore"}, "", {"fire" : "Fire", "death" : "Death", "metal" : "Metal", "shadow" : "Shadow"});

let filters = [
    {
        property : "type",
        value : "spell"
    },
    {
        property : "system.lore.value",
        value : "petty"
    }
]

let petty = await game.wfrp4e.apps.ItemDialog.createFromFilters(filters, 3, "Choose 3 Petty Spells")


filters = [
    {
        property : "type",
        value : "spell"
    },
    {
        property : "system.lore.value",
        value : [""]
    }
]

let arcane = await game.wfrp4e.apps.ItemDialog.createFromFilters(filters, 6, "Choose 6 Arcane Spells")

let items = petty.map(i => i.toObject()).concat(arcane.map(i => {
    let spell = i.toObject();
    spell.img = `modules/wfrp4e-core/icons/spells/${lore}.png`
    spell.system.lore.value = lore;
    return spell;
}));

this.actor.createEmbeddedDocuments("Item", items);