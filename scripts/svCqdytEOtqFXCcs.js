let characteristics = {
    "ws" : 0,
    "bs" : 0,
    "s" : 0,
    "t" : 10,
    "i" : 15,
    "ag" : 0,
    "dex" : 10,
    "int" : 20,
    "wp" : 20,
    "fel" : 10
}
let skills = ["Splatanie Magii", "Opanowanie", "Uniki", "Występy (Opowieści)", "Intuicja", "Język (Magiczny)", "Wiedza (Magia)", "Percepcja"]
let skillAdvancements = [5, 15, 10, 10, 15, 10, 10, 20]

let talents = ["Magia Tajemna", "Magia Prosta", "Percepcja Magiczna"]
let trappings = ["Broń Ręczna", "Szaty", "Kij"]
let specialItems = [ 
    {name: "Magiczny Przedmiot", type: "trapping", trappingType: "misc" }, 
]    
let items = [];

let updateObj = this.actor.toObject();

for (let ch in characteristics)
{
    updateObj.system.characteristics[ch].modifier += characteristics[ch];
}

for (let item of specialItems) {
    let newItem
    if (item.type == "weapon") {
        newItem = new ItemWFRP4e({ name: item.name, type: item.type, system: { equipped: true, damage: {value: item.damage}}  })
    } else if (item.type == "trapping") {
        newItem = new ItemWFRP4e({ img: "systems/wfrp4e/icons/blank.png", name: item.name, type: item.type, system: { worn: true, trappingType: { value: item.trappingType}  } } )
    } else {
        newItem = new ItemWFRP4e({ img: "systems/wfrp4e/icons/blank.png", name: item.name, type: item.type  })
    }
    items.push(newItem.toObject())
}

for (let index = 0; index < skills.length; index++)
{
    let skill = skills[index]
    let skillItem;
    skillItem = updateObj.items.find(i => i.name == skill && i.type == "skill")
    if (skillItem)
        skillItem.system.advances.value += skillAdvancements[index]
    else 
    {
        skillItem = await game.wfrp4e.utility.findSkill(skill)
        skillItem = skillItem.toObject();
        skillItem.system.advances.value = skillAdvancements[index];
        items.push(skillItem);
    }
}

for (let talent of talents)
{
    let talentItem = await game.wfrp4e.utility.findTalent(talent)
    if (talentItem)
    {
        items.push(talentItem.toObject());
    }
    else 
    {
        ui.notifications.warn(`Could not find ${talent}`, {permanent : true})
    }
}

for (let trapping of trappings) 
{
    let trappingItem = await game.wfrp4e.utility.findItem(trapping)
    if (trappingItem)
    {
        trappingItem = trappingItem.toObject()

        trappingItem.system.equipped.value = true;

        items.push(trappingItem);
    }
    else 
    {
        ui.notifications.warn(`Could not find ${trapping}`, {permanent : true})
    }
}

let ride = await foundry.applications.api.DialogV2.confirm({window : {title : "Umiejętność"}, content : "Czy dodać rumaka Chaosu oraz +20 Jeździectwo (Konie)?"})

if (ride)
{
    let skill = await game.wfrp4e.utility.findSkill("Jeździectwo (Konie)")
    skill = skill.toObject();
    skill.system.advances.value = 20;
    items = items.concat({name : "Rumak Chaosu", type: "trapping", "system.trappingType.value" : "misc"}, skill)
}


updateObj.name = updateObj.name += " " + this.effect.name

await this.actor.update(updateObj)
this.actor.createEmbeddedDocuments("Item", items);
