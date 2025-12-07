if (args.test.weapon.properties.qualities?.blast) {
  args.test.weapon.properties.qualities.blast.value ++;
  if (args.test.options.shortfuse) {
    args.test.result.other.push (`<strong>${this.effect.name}:</strong> Wartość Wybuchu zwiększona o 1.`);
  }
  args.test.options.shortfuse = true
}