export default function() {


    Hooks.on("updateActor", async (actor) =>{
        await actor.runEffects("update", {});
    })
}
