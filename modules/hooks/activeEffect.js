import AreaHelpers from "../system/area-helpers.js";

export default function() {
    Hooks.on("createActiveEffect", async (effect, data, user) => {
        if(game.user.isUniqueGM && effect.flags?.wfrp4e?.applicationData?.type) {
            if (game.canvas?.scene &&
                ((effect.flags.wfrp4e.applicationData.type == "aura" && effect.flags.wfrp4e.applicationData.targetedAura != "self") || 
                effect.flags.wfrp4e.applicationData.type == "area")) {
                AreaHelpers.checkAreas(game.canvas.scene);
            }
        }
    });
}