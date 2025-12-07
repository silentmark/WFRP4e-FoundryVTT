if (this.item.equipped.value && args.totalWoundLoss > 10) {
  args.totalWoundLoss = Math.min(10, args.totalWoundLoss)
  args.extraMessages.push(`<strong>${this.effect.name}</strong>: obrażenia ograniczone do 10`)  
}