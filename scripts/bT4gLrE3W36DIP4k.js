if (args.applyAP && args.modifiers.ap.metal && args.alreadyPenetrating) 
  {
      args.modifiers.ap.ignored += 1
      args.modifiers.ap.details.push("<strong>" + this.effect.name + "</strong>: Zignoruj +1 Punkt Pancerza z metalu");
      args.modifiers.ap.metal--;
  }