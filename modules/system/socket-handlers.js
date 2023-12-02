import ActorWfrp4e from "../actor/actor-wfrp4e.js";
import EffectWfrp4e from "./effect-wfrp4e.js";

export default class SocketHandlers  {

    static call(type, payload, userId)
    {
        game.socket.emit("system.wfrp4e", {type, payload, userId});
    }

    static register()
    {
        game.socket.on("system.wfrp4e", async data => 
        {
            if (data.userId == "GM" && game.user.id != game.users.contents.filter(u => u.active).find(u => u.isGM).id) return;
            if (data.userId != game.user.id && data.userId != "ALL") return;

            let result = await this[data.type]({...data.payload}, data.userId);
            if (!data.payload.socketMessageId) return;

            if (!result) {
                result = "success";
            }
            data.payload.socketResult = result;
            SocketHandlers.executeOnGM("updateSocketMessageResult", data.payload);
        });
    }
    
    static executeOnGM(type, payload) {
        if (game.user.isGM) {
            this[type](payload);
        } else {
            SocketHandlers.call(type, payload, "GM");
        }
    }

    static updateSocketMessageResult(payload) {
        let message = game.messages.get(payload.socketMessageId);
        if (message && payload.socketResult) {
            message.setFlag("wfrp4e", "socketResult", payload.socketResult);
        }
    }

    static morrslieb(payload){
        canvas.draw();
    }

    static async target(payload){
        let scene = game.scenes.get(payload.scene)
        let token = scene.tokens.get(payload.target)
        await token.actor.update({ "flags.oppose": payload.opposeFlag });
    }

    static async updateMsg(payload){
        const msg = game.messages.get(payload.id);
        await msg.update(payload.updateData);
        return "success"
    }

    static async deleteMsg(payload) {
        const msg = game.messages.get(payload.id);
        if (msg) {
            await msg.delete();
        }
    }

    static async applyEffect({effectUuids, effectData, actorUuid, messageId})
{
        let result = await fromUuidSync(actorUuid)?.applyEffect({effectUuids, effectData, messageId});
        return result;
    }

    static async changeGroupAdvantage(payload) {
        let advantage = game.settings.get("wfrp4e", "groupAdvantageValues")
        advantage.players = payload.players        
        await game.settings.set("wfrp4e", "groupAdvantageValues", advantage);
    }

    static async createActor(payload) {
        let id = payload.id
        let actorData = payload.data

        // Give ownership to requesting actor
        actorData.ownership = {
            default: 0,
            [id] : 3
        }
        let actor = await Actor.implementation.create(actorData)
        let items = payload.items
        await actor.createEmbeddedDocuments("Item", items)
        return actor.id;        
    }

    static async setupSocket(payload) {
        let actorId = payload.actorId; 
        let type = payload.type;
        let options = payload.options || {};
        let messageId = payload.messageId;
        let actor = game.actors.get(actorId);
        let owner = game.wfrp4e.utility.getActiveDocumentOwner(actor);

        let test;
        if (owner.id == game.user.id) {
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
                let characteristicId = payload.characteristicId;
                test = await actor.setupCharacteristic(characteristicId, options);
            } else if (type == "setupSkill") {
                let skillName = payload.skillName;
                test = await actor.setupSkill(skillName, options);
            } else if (type == "setupWeapon") {
                let weapon = payload.weapon;
                test = await actor.setupWeapon(weapon, options);
            } else if (type == "setupCast") {
                let spell = payload.spell;
                test = await actor.setupCast(spell, options);
            } else if (type == "setupChannell") {
                let spell = payload.spell;
                test = await actor.setupChannell(spell, options);
            } else if (type == "setupPrayer") {
                let prayer = payload.prayer;
                test = await actor.setupPrayer(prayer, options);
            } else if (type == "setupTrait") {
                let trait = payload.trait;
                test = await actor.setupTrait(trait, options);
            }
            if (owner.isGM && test) {
                await test.roll();
            }
            let message = game.messages.get(messageId);
            if (test) {
                await message.update({"flags.data.test": test});
            } else {
                await message.delete();
            }
        }
    }

    /**
     * Not used by sockets directly, but is called when a socket handler should be executed by
     * the specific user which owns a document. Usually used to invoke tests from other users
     * for their assigned Actor. 
     * 
     * @param {Document} document Document on which to test if the user is owner or not
     * @param {String} type Type of socket handler
     * @param {Object} payload Data for socket handler, should generally include document UUID 
     * @returns 
     */
    static executeOnOwner(document, type, payload) {
        let ownerUser = game.wfrp4e.utility.getActiveDocumentOwner(document);
        if (game.user.id == ownerUser.id) {
            this[type](payload);
        }
        ui.notifications.notify(game.i18n.format("SOCKET.SendingSocketRequest", { name: ownerUser.name }));
        SocketHandlers.call(type, payload, ownerUser.id);
    }

    static async executeOnUserAndWait(userId, type, payload) {
        let result;
        if (game.user.id == userId || (userId == "GM" && game.user.isGM)) {
            result = await this[type](payload);
        } else {
            ui.notifications.notify(game.i18n.format("SOCKET.SendingSocketRequest", { name: userId }));
            let msg = await SocketHandlers.createSocketRequestMessage(owner, content);
            payload.socketMessageId = msg.id;
            SocketHandlers.call(type, payload, userId);
            do {
                await WFRP_Utility.sleep(250);
                msg = game.messages.get(msg.id);
                result = msg?.getFlag("wfrp4e", "socketResult");
            } while (msg && !result);
            if (msg && game.user.isGM) {
                message.delete();
            } else {
                SocketHandlers.executeOnGM("deleteMsg", { "id": message.id });
            }
        }
        return result;
    }

    static async executeOnOwnerAndWait(document, type, payload) {
        let ownerUser = game.wfrp4e.utility.getActiveDocumentOwner(document);
        return await SocketHandlers.executeOnUserAndWait(ownerUser.id, type, payload);
    }


    static async createSocketRequestMessage(owner, content) {
        let chatData = {
          content: `<p class='requestmessage'><b><u>${owner.name}</u></b>: ${content}</p?`,
          whisper: ChatMessage.getWhisperRecipients("GM")
        }
        if (game.user.isGM) {
          chatData.user = owner;
        }
        let msg = await ChatMessage.create(chatData);
        return msg;
    }
}