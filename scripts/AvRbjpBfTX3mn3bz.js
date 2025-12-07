if (this.actor.effects.contents.filter(e => e.name === "Wzmocnienie mikstury").length === 0) {
  let effectData = this.item.effects.contents[0].convertToApplied();
  effectData.duration.seconds = 3600
  this.actor.applyEffect({effectData : [effectData]});
  this.script.notification("Ustaw czas trwania efektu Liquid Fortification na 1 godzinę.");
} 
else {
  let effect = this.actor.effects.contents.filter(e => e.name === "Wzmocnienie mikstury")[0];
  effect.update({duration: {seconds: 3600}});
  this.script.notification("Resetowano czas trwania efektu Wzmocnienie mikstury na 1 godzinę.");
}