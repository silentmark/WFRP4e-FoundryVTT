if (args.sourceItem?.system.properties?.qualities.hack && !args.hackReminder)
{
  args.hackReminder = true;
  if (args.opposedTest)
  {
  args.opposedTest.result.other.push(`<strong>${this.effect.name}</strong>: "niszczenie pancerza" powoduje dodatkowe obrażenia ${this.item.Advances}`)
  }
}