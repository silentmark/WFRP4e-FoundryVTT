if (["smok"].includes(args.opposedTest.defender.details.species.value.toLowerCase()))
    {
      args.modifiers.other.push({label : this.effect.name, details : "Podwójne obrażenia przeciwko smokom", value : args.totalWoundLoss});
      args.totalWoundLoss *=2;
    }