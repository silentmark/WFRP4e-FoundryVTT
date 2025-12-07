let runes = this.actor.itemTypes["wfrp4e-dwarfs.rune"]
if (runes.length === 0) return ui.notifications.error("Ta postać nie zna żadnych run.")

let rune = await ItemDialog.create(this.actor.itemTypes["wfrp4e-dwarfs.rune"], 1, {text: "Wybierz runę", title: this.effect.name})
rune[0].system.use({initialTooltip: "Bonus Kowadła Zagłady", fields: {modifier: 20}})