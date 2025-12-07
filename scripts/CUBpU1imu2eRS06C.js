if (args.opposedTest.attackerTest.weapon?.system.properties?.qualities.hack && !args.hackReminder)
{
  args.hackReminder = true;
  args.opposedTest.result.other.push(`<strong>${this.effect.name}</strong>: "niszczenie pancerza" powoduje dodatkowe obrażenia ${this.item.Advances}`)
}