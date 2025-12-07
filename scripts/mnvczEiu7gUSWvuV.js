if (args.test.options.flags.skewering)
{
  args.test.result.tables.critical = {
    label : "Rana Krytyczna (jeśli atak się powiedzie)",
      class : "critical-roll",
        modifier : args.test.result.critModifier || 0,
        key: `crit${args.test.result.hitloc.result}`
    
  }
}