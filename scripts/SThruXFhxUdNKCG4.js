const test = await this.actor.setupCharacteristic("int", {fields: {difficulty: "easy"}, skipTargets: true, appendTitle :  ` - ${this.effect.name}`});
await test.roll();

if (test.failed) {
   this.actor.addCondition('stunned');
}

this.script.notification(`${this.actor.name} nie zdał testu Inteligencji i otrzymał stan Oszołomienia!`);