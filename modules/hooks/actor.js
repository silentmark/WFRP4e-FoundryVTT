export default function() {


    Hooks.on("updateActor", async (actor) =>{
        if (game.user.isGM && new Date(actor._stats.modifiedTime).getSeconds() != new Date().getSeconds()) {
            await actor.runEffects("update", {})
            await actor.checkSize();
        }
    })

    Hooks.on("createActor", async (actor) =>{
        if (game.user.isGM && new Date(actor._stats.modifiedTime).getSeconds() != new Date().getSeconds()) {
            await actor.runEffects("update", {})
            await actor.checkSize();
        }
    })
}
