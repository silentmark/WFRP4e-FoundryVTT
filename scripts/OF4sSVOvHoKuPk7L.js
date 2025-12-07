if (this.item.flags.burning) return
const runesOfBurning = this.item.effects.contents.filter(e => e.name == this.effect.name)
const ablaze = runesOfBurning.length
args.actor.addCondition("ablaze", ablaze)
args.extraMessages.push(
  "<strong>" + this.effect.name + "</strong>: "
  + ablaze + " Stanów @Condition[Podpalenie]")
this.item.flags.burning = true