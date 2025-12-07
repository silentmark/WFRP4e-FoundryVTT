if (this.actor.system.status.advantage.value >= 2)
{
    await this.actor.modifyAdvantage(-2);
    this.script.notification("Zmniejszono przewagi")
}
else 
{
    return this.script.notification("Niewystarczająca liczba przewag!", "error")
}

let test = await this.actor.setupTrait(this.item)
await test.roll();