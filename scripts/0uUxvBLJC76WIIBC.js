let species = await ValueDialog.create({text : "Wpisz nazwę gatunku (w formie pojedynczej)", title : this.effect.name})

this.effect.updateSource({name : this.effect.setSpecifier(species)});