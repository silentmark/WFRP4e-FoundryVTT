let difficulty = ""
                            if (this.effect.name.includes("Moderate"))
                                difficulty = "easy"
                            else if (this.effect.name.includes("Severe"))
                                difficulty = "average"
                            else
                                difficulty = "veasy"
        
                            let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {context : {failure : this.actor.name + " umiera od Uwiądu"}, fields: {difficulty}, appendTitle : " - Uwiąd"})
                            await test.roll();
                            if (test.failed)
                            {
                                this.actor.addCondition("dead");
                            }