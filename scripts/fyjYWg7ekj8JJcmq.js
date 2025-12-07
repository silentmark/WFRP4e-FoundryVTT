if (args.test.result.misfire || args.test.result.fumble)
{
  args.test.result.other.push(`<strong>${this.effect.name}</strong>: może być użyty, aby zanegować Pech/Niewypał.`);
}