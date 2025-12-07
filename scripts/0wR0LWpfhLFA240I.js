let value = await ValueDialog.create({
  title : this.script.label, 
  text: "Notatki zwycięstwa w dzienniku doświadczenia"
});
value 
  ? this.actor.system.awardExp(50, value) 
  : this.actor.system.awardExp(50, this.script.label)