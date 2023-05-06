import ActorWfrp4e from "../actor/actor-wfrp4e.js";
import EffectWfrp4e from "./effect-wfrp4e.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";

export default class SocketHandlers  {
    static morrslieb(data){
        canvas.draw();
    }
    static target(data){
        if (!game.user.isUniqueGM)
            return
        let scene = game.scenes.get(data.payload.scene)
        let token = scene.tokens.get(data.payload.target)
        token.actor.update(
          {
            "flags.oppose": data.payload.opposeFlag
          })
    }
    static updateMsg(data){
        if (!game.user.isUniqueGM)
            return
        game.messages.get(data.payload.id).update(data.payload.updateData)
    }
    static deleteMsg(data){
        if (!game.user.isUniqueGM)
            return
        game.messages.get(data.payload.id).delete()
    }
    static applyEffects(data){
        if (!game.user.isUniqueGM)
            return
        game.wfrp4e.utility.applyEffectToTarget(data.payload.effect, data.payload.targets.map(t => new TokenDocument(t, {parent: game.scenes.get(data.payload.scene)})))
    }
    static async applyOneTimeEffect(data){
        if (game.user.id != data.payload.userId)
            return
        
        let notification = "Received Apply Effect"
        if (data.payload.effect.flags?.wfrp4e?.hide !== true) 
          notification +=  ` for ${data.payload.effect.label}`
        ui.notifications.notify(notification)

        let actor = new ActorWfrp4e(data.payload.actorData)
        let effect = new EffectWfrp4e(data.payload.effect)
        
        await game.wfrp4e.utility.runSingleEffect(effect, actor, null, {actor});
    }
    static changeGroupAdvantage(data){
        if (!game.user.isGM || !game.settings.get("wfrp4e", "useGroupAdvantage")) 
            return

        let advantage = game.settings.get("wfrp4e", "groupAdvantageValues")

        advantage.players = data.payload.players

        // Don't let players update enemy advantage
        
        game.settings.set("wfrp4e", "groupAdvantageValues", advantage)
    }

    static async createActor(data) 
    {
        if (game.user.isUniqueGM)
        {
            let id = data.payload.id
            let actorData = data.payload.data

            // Give ownership to requesting actor
            actorData.ownership = {
                default: 0,
                [id] : 3
            }
            let actor = await Actor.implementation.create(actorData)
            let items = data.payload.items
            actor.createEmbeddedDocuments("Item", items)
        }
    }

    static async setupSocket(data) {
        let actorId = data.payload.actorId; 
        let type = data.payload.type;
        let options = data.payload.options || {};
        let messageId = data.payload.messageId;
        let actor = game.actors.get(actorId);
        let owner = game.wfrp4e.utility.getActorOwner(actor);

        let test;
        if (owner.id == game.user.id) {
            if (owner.isGM) {
                data.payload.options.bypass = true;
            }
            if (canvas.scene) { 
                if (options.gmTargets) {
                    game.user.updateTokenTargets(options.gmTargets);
                    game.user.broadcastActivity({targets: options.gmTargets});
                } else {
                    game.user.updateTokenTargets([]);
                    game.user.broadcastActivity({targets: []});
                }
            }
            if (type == "setupCharacteristic") {
                let characteristicId = data.payload.characteristicId;
                test = await actor.setupCharacteristic(characteristicId, options);
            } else if (type == "setupSkill") {
                let skillName = data.payload.skillName;
                test = await actor.setupSkill(skillName, options);
            } else if (type == "setupWeapon") {
                let weapon = data.payload.weapon;
                test = await actor.setupWeapon(weapon, options);
            } else if (type == "setupCast") {
                let spell = data.payload.spell;
                test = await actor.setupCast(spell, options);
            } else if (type == "setupChannell") {
                let spell = data.payload.spell;
                test = await actor.setupChannell(spell, options);
            } else if (type == "setupPrayer") {
                let prayer = data.payload.prayer;
                test = await actor.setupPrayer(prayer, options);
            } else if (type == "setupTrait") {
                let trait = data.payload.trait;
                test = await actor.setupTrait(trait, options);
            }
            if (owner.isGM) {
                await test.roll();
            }
            let message = game.messages.get(messageId);        
            await message.update({"flags.data.test": test});
        }
    }

}
