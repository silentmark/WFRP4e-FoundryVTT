export default function() {
    Hooks.on("updateActor", async (actor) => {
        await actor.runEffects("update", {});
        await actor.checkSize();
    })

    Hooks.on("createActor", async (actor) =>{
        await actor.runEffects("update", {});
        await actor.checkSize();
    })
}
