import WFRP_Audio from "./audio-wfrp4e.js";
import WFRP_Utility from "./utility-wfrp4e.js";

export default class CombatHelpers {


    //static scripts = {
        //startCombat: [CombatHelpers.checkFearTerror],
        //endCombat: [CombatHelpers.clearCombatantAdvantage, CombatHelpers.endCombatChecks],
        //startTurn: [CombatHelpers.startTurnChecks],
        //endRound: [CombatHelpers.checkEndRoundConditions, CombatHelpers.fearReminders],
        // Functions used by endCombatChecks
        //endCombatScripts: [CombatHelpers.checkCorruption, CombatHelpers.checkInfection, CombatHelpers.checkDiseases]
    //}

    static async preUpdateCombat(combat, updateData, context) {
        const previousId = combat.combatant?.id;
        const path = "wfrp4e.previousCombatant";
        foundry.utils.setProperty(context, path, previousId);
    
        const prevPath = "wfrp4e.previousTR";
        const prevTR = { T: combat.turn, R: combat.round };
        foundry.utils.setProperty(context, prevPath, prevTR);
    
        const startedPath = "wfrp4e.started";
        const prevStarted = combat.started;
        foundry.utils.setProperty(context, startedPath, prevStarted);
    }

    static async updateCombatStart(combat, _, context) {
        const was = foundry.utils.getProperty(context, `wfrp4e.started`);
        const is = combat.started;
        if (was || !is) return;

        await CombatHelpers.checkFearTerror(combat);
    }

    static async updateCombat(combat, changes, context) {
        if(getProperty(context, "wfrp4e-pl-addons.shouldReroll")) return;

        let cTurn = combat.current.turn;
        let pTurn = foundry.utils.getProperty(context, `wfrp4e.previousTR.T`);
        let cRound = combat.current.round;
        let pRound = foundry.utils.getProperty(context, `wfrp4e.previousTR.R`);
    
        if (changes?.flags && changes?.flags['wfrp4e-pl-addons'] && changes.flags['wfrp4e-pl-addons'].reroll) {
            pRound -= 1;
            changes.turn = cTurn;
            changes.round = cRound;
        }

        // no change in turns nor rounds.
        if (changes.turn === undefined && changes.round === undefined) return;
        // combat not started or not active.
        if (!combat.started || !combat.isActive) return;
        // we went back.
        if (cRound < pRound || (cTurn < pTurn && cRound === pRound)) return;
    
        // retrieve combatants.
        const currentCombatant = combat.combatant;
        const previousId = foundry.utils.getProperty(context, `wfrp4e.previousCombatant`);
        const wasStarted = foundry.utils.getProperty(context, `wfrp4e.started`);
        const previousCombatant = wasStarted ? combat.combatants.get(previousId) : null;

        if (combat.round != 1 && combat.turns && combat.active) {
            if (cRound > 1 && combat.current.turn == 0) {
                await CombatHelpers.checkEndRoundConditions(combat);
                await CombatHelpers.fearReminders(combat);
            }
        }
        
        if (previousCombatant) {
            CombatHelpers.endTurnChecks(combat, previousCombatant);
        }
        if (currentCombatant) {
            CombatHelpers.startTurnChecks(combat, currentCombatant);
        }
    }

    static async startTurnChecks(combat, combatant) {
        if (!game.user.isUniqueGM)
            return

        if (combatant) {
            if (combatant.actor.hasSystemEffect("dualwielder"))
                await combatant.actor.removeSystemEffect("dualwielder");

            if (game.settings.get("wfrp4e", "statusOnTurnStart")) {
                let nameOverride =  combat.combatant.hidden ? "???" : combatant.name;
                combatant.actor.displayStatus(combat.round, nameOverride);
            }

            if (game.settings.get("wfrp4e", "focusOnTurnStart")) {
                canvas.tokens.get(combatant.token.id).control();
                canvas.tokens.cycleTokens(1, true);
            }

            let msgContent = ""
            let startTurnConditions = combatant.actor.actorEffects.filter(e => e.conditionTrigger == "startTurn")
            for (let cond of startTurnConditions) {
                if (game.wfrp4e.config.conditionScripts[cond.conditionId]) {
                    let conditionName = game.i18n.localize(game.wfrp4e.config.conditions[cond.conditionId])
                    if (Number.isNumeric(cond.flags.wfrp4e.value))
                        conditionName += ` ${cond.flags.wfrp4e.value}`
                    msgContent = `
                <h2>${conditionName}</h2>
                <a class="condition-script" data-combatant-id="${combatant.id}" data-cond-id="${cond.conditionId}">${game.i18n.format("CONDITION.Apply", { condition: conditionName })}</a>`
                    await ChatMessage.create({ content: msgContent, speaker: { alias: combatant.token.name } })
                }
            }

            await combatant.actor.runEffects("startTurn", combat)
        }
        WFRP_Audio.PlayContextAudio({ item: { type: 'round' }, action: "change" })
    }
    
    static async endTurnChecks(combat, combatant) {
        if (!game.user.isUniqueGM)
            return

        if (combatant) {
            let msgContent = ""
            let endTurnConditions = combatant.actor.actorEffects.filter(e => e.conditionTrigger == "endTurn")
            for (let cond of endTurnConditions) {
                if (game.wfrp4e.config.conditionScripts[cond.conditionId]) {
                    let conditionName = game.i18n.localize(game.wfrp4e.config.conditions[cond.conditionId])
                    if (Number.isNumeric(cond.flags.wfrp4e.value))
                        conditionName += ` ${cond.flags.wfrp4e.value}`
                    msgContent = `
                <h2>${conditionName}</h2>
                <a class="condition-script" data-combatant-id="${combatant.id}" data-cond-id="${cond.conditionId}">${game.i18n.format("CONDITION.Apply", { condition: conditionName })}</a>`
                    await ChatMessage.create({ content: msgContent, speaker: { alias: combatant.token.name } })
                }
            }
            await combatant.actor.runEffects("endTurn", combat)
        }
    }

    static async endCombat(combat) {
        await CombatHelpers.clearCombatantAdvantage(combat);
        if (!game.user.isUniqueGM)
            return

        let content = ""
        let scriptResult = "";
        scriptResult = await CombatHelpers.checkCorruption(combat);
        if(scriptResult) {            
            content += scriptResult + "<br><br>";
        }
        scriptResult = await CombatHelpers.checkDiseases(combat);
        if(scriptResult) {            
            content += scriptResult + "<br><br>";
        }
        scriptResult = await CombatHelpers.checkDiseases(combat);
        if(scriptResult) {            
            content += scriptResult + "<br><br>";
        }
        if (content) {
            content = `<h2>${game.i18n.localize("CHAT.EndCombat")}</h3>` + content;
            ChatMessage.create({ content, whisper: ChatMessage.getWhisperRecipients("GM") })
        }
    }

    static async checkFearTerror(combat) {
        if (!game.user.isUniqueGM)
            return

        let fearCounters = []
        let terrorCounters = [];
        for (let turn of combat.turns) {
            try {

            let fear = turn.actor.has(game.i18n.localize("CHAT.Fear"))
            if (fear)
                fearCounters.push({ name: turn.name, value: `@Fear[${fear.specification.value},${turn.name}]` })

            let terror = turn.actor.has(game.i18n.localize("CHAT.Terror"))
            if (terror)
                terrorCounters.push({ name: turn.name, value: `@Terror[${terror.specification.value},${turn.name}]` })

            }
            catch (e) {
                console.log(e)
            }
        }
        let msg = ""
        if (fearCounters.length || terrorCounters.length) {
            if (fearCounters.length)
                msg += `<h2>${game.i18n.localize("CHAT.Fear")}</h2>${fearCounters.map(f => `<b>${f.name}</b> - ${f.value}`).join("<br>")}`
            if (terrorCounters.length)
                msg += `<h2>${game.i18n.localize("CHAT.Terror")}</h2>${terrorCounters.map(t => `<b>${t.name}</b> - ${t.value}`).join("<br>")}`

        }

        msg += CombatHelpers.checkSizeFearTerror(combat)

        if (msg)
            await ChatMessage.create({ content: msg })
    }

    static checkSizeFearTerror(combat) {
        let sizeMap = {}
        let msg = ""
        for (let turn of combat.turns) {
            sizeMap[turn.name] = turn.actor.sizeNum
        }
        for (let actor in sizeMap) {
            let size = sizeMap[actor]
            let smallerBy = {
                1: [],
                2: [],
                3: [],
                4: [],
                5: [],
                6: []
            }

            for (let otherActor in sizeMap) {
                if (otherActor == actor)
                    continue
                try {
                    if (size > sizeMap[otherActor])
                        smallerBy[size - sizeMap[otherActor]].push(otherActor)
                }
                catch (e) {

                }
            }

            if (smallerBy[1].length)
                msg += game.i18n.format("CHAT.CausesFear", { fear: `@Fear[${1}, ${actor}]`, actor: actor, target: smallerBy[1].join(", ")});

            if (smallerBy[2].length)
                msg += game.i18n.format("CHAT.CausesFear", { fear: `@Terror[${2}, ${actor}]`, actor: actor, target: smallerBy[2].join(", ")});

            if (smallerBy[3].length)
                msg += game.i18n.format("CHAT.CausesFear", { fear: `@Terror[${3}, ${actor}]`, actor: actor, target: smallerBy[3].join(", ")});

            if (smallerBy[4].length)
                msg += game.i18n.format("CHAT.CausesFear", { fear: `@Terror[${4}, ${actor}]`, actor: actor, target: smallerBy[4].join(", ")});

            if (smallerBy[5].length)
                msg += game.i18n.format("CHAT.CausesFear", { fear: `@Terror[${5}, ${actor}]`, actor: actor, target: smallerBy[5].join(", ")});

            if (smallerBy[6].length)
                msg += game.i18n.format("CHAT.CausesFear", { fear: `@Terror[${6}, ${actor}]`, actor: actor, target: smallerBy[6].join(", ")});

            if (Object.values(smallerBy).some(list => list.length))
                msg += "<br>"
        }
        if (msg) msg = `<br><h2>${game.i18n.localize("Size")}</h2>${msg}`
        return msg
    }

    static async checkCorruption(combat) {
        if (!game.user.isUniqueGM)
            return

        let corruptionCounters = []

        for (let turn of combat.turns) {
            let corruption = turn.actor.has(game.i18n.localize("NAME.Corruption"))
            if (corruption) {
                let existing = corruptionCounters.find(c => c.type == corruption.specification.value)
                if (existing)
                    existing.counter++;
                else
                    corruptionCounters.push({ counter: 1, type: corruption.specification.value })
            }
        }

        let content = ""

        if (corruptionCounters.length) {
            content += `<h3><b>${game.i18n.localize("Corruption")}</b></h3>`
            for (let corruption of corruptionCounters) {
                content += `${corruption.counter} ${corruption.type}<br>`
            }
            content += game.i18n.localize("CHAT.CorruptionTest");
            content += `<br>@Corruption[Minor]<br>@Corruption[Moderate]<br>@Corruption[Major]`
        }
        return content
    }

    static async checkInfection(combat) {
        if (!game.user.isUniqueGM)
            return

        let minorInfections = combat.getFlag("wfrp4e", "minorInfections") || []
        let content = ""
        if (minorInfections.length) {
            content += `<h3><b>${game.i18n.localize("Minor Infections")}</b></h3>${game.i18n.localize("CHAT.InfectionReminder")}<br>`
            for (let actor of minorInfections) {
                content += `<br><b>${actor}</b>`
            }
        }
        return content
    }

    static async checkDiseases(combat) {
        if (!game.user.isUniqueGM)
            return

        let diseaseCounters = []

        for (let turn of combat.turns) {
            let disease = turn.actor.has(game.i18n.localize("NAME.Disease"))
            if (disease) {
                let existing = diseaseCounters.find(d => d.type == disease.specification.value)
                if (existing)
                    existing.counter++;
                else
                    diseaseCounters.push({ counter: 1, type: disease.specification.value })
            }
        }
        let content = ""

        if (diseaseCounters.length) {
            content += `<h3><b>${game.i18n.localize("Diseases")}</b></h3>`
            for (let disease of diseaseCounters)
                content += `${disease.counter} <a class="item-lookup" data-type="disease" data-open="sheet">${disease.type}</a><br>`

            content += game.i18n.localize("CHAT.DiseasesRules");
        }
        return content
    }

    static async checkEndRoundConditions(combat) {
        if (!game.user.isUniqueGM)
            return

        let removedConditions = []
        let msgContent = ""
        for (let turn of combat.turns) {
            if (turn.actor.status.wounds.value == 0) {
                if (turn.actor.status.roundsToPassOut.value < turn.actor.status.roundsToPassOut.max) {
                    turn.actor.status.roundsToPassOut.value++;
                    await turn.actor.update({ "system.status.roundsToPassOut.value": turn.actor.status.roundsToPassOut.value })
                    if (turn.actor.status.roundsToPassOut.value == turn.actor.status.roundsToPassOut.max) {
                        await turn.actor.addCondition("unconscious")
                    }
                }
            } else {
                turn.actor.status.roundsToPassOut.value = 0;
                await turn.actor.update({ "system.status.roundsToPassOut.value": 0 })
            }
        }

        for (let turn of combat.turns) {
            let endRoundConditions = turn.actor.actorEffects.filter(e => e.conditionTrigger == "endRound")
            for (let cond of endRoundConditions) {
                if (game.wfrp4e.config.conditionScripts[cond.conditionId]) {
                    let conditionName = game.i18n.localize(game.wfrp4e.config.conditions[cond.conditionId])
                    if (Number.isNumeric(cond.flags.wfrp4e.value))
                        conditionName += ` ${cond.flags.wfrp4e.value}`
                    msgContent = `
              <h2>${conditionName}</h2>
              <a class="condition-script" data-combatant-id="${turn.id}" data-cond-id="${cond.conditionId}">${game.i18n.format("CONDITION.Apply", { condition: conditionName })}</a>`
                    await ChatMessage.create({ content: msgContent, speaker: { alias: turn.token.name } });
                }
            }

            let conditions = turn.actor.actorEffects.filter(e => e.isCondition)
            for (let cond of conditions) {
                // I swear to god whoever thought it was a good idea for these conditions to reduce every *other* round...
                if (cond.conditionId == "deafened" || cond.conditionId == "blinded" && Number.isNumeric(cond.flags.wfrp4e.roundReceived)) {
                    if ((combat.round - 1) % 2 == cond.flags.wfrp4e.roundReceived % 2) {
                        await turn.actor.removeCondition(cond.conditionId)
                        removedConditions.push(
                            game.i18n.format("CHAT.RemovedConditions", {
                                condition: game.i18n.localize(game.wfrp4e.config.conditions[cond.conditionId]),
                                name: turn.actor.token?.name || turn.actor.prototypeToken.name
                            }))
                    }
                }
            }
            await turn.actor.runEffects("endRound", combat, {async: true})

        }
        if (removedConditions.length)
            await ChatMessage.create({ content: removedConditions.join("<br>") })
    }

    static async fearReminders(combat) {
        let chatData = { content: game.i18n.localize("CHAT.FearReminder") + "<br><br>", speaker: { alias: game.i18n.localize("CHAT.Fear") } }
        let fearedCombatants = combat.turns.filter(t => t.actor.hasCondition("fear"))
        if (!fearedCombatants.length)
            return

        fearedCombatants.forEach(c => {
            let fear = c.actor.hasCondition("fear")
            chatData.content += `<b>${c.name}</b>`
            if (fear.flags.wfrp4e.fearName)
                chatData.content += ` (${fear.flags.wfrp4e.fearName})`
            chatData.content += "<br>"
        })
        await ChatMessage.create(chatData)
    }

    static async clearCombatantAdvantage(combat) {
        if (!game.user.isUniqueGM)
            return

        if (game.settings.get("wfrp4e","useGroupAdvantage")) {
            await WFRP_Utility.updateGroupAdvantage({players : 0, enemies : 0})
        } 

        for (let turn of combat.turns) {
            if (!game.settings.get("wfrp4e","useGroupAdvantage")) {
                await turn.actor.update({ "system.status.advantage.value": 0 }, {skipGroupAdvantage: true})
            }
            await turn.actor.runEffects("endCombat", combat)
        }
    }
}