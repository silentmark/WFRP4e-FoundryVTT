let species = await ValueDialog.create({text : "Wybierz gatunek (w formie pojedynczej)", title : this.effect.name})

this.effect.updateSource({name : this.effect.setSpecifier(species)});