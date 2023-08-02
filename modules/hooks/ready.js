import WFRP_Utility from "../system/utility-wfrp4e.js";
import FoundryOverrides from "../system/overrides.js";
import SocketHandlers from "../system/socket-handlers.js";
import MooHouseRules from "../system/moo-house.js"
import OpposedWFRP from "../system/opposed-wfrp4e.js";
import OpposedTest from "../system/opposed-test.js";

export default function () {
  /**
   * Ready hook loads tables, and override's foundry's entity link functions to provide extension to pseudo entities
   */
  Hooks.on("ready", async () => {

    globalThis.CONFIG.compatibility.mode = 0;

    Object.defineProperty(game.user, "isUniqueGM", {
      get: function () { return game.user.id == game.users.find(u => u.active && u.isGM)?.id }
    })


    if (game.settings.get('wfrp4e', 'customCursor')) {
      WFRP_Utility.log('Using custom cursor', true)
      if (await srcExists("systems/wfrp4e/ui/cursors/pointer.png")) {
        let link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet')
        link.type = 'text/css'
        link.href = '/systems/wfrp4e/css/cursor.css'

        document.head.appendChild(link);
      }
      else {
        WFRP_Utility.log('No custom cursor found', true)
      }
    }

    // Automatically disable Auto Fill Advantage if group advantage is enabled
    if (game.settings.get("wfrp4e", "useGroupAdvantage", true) && 
      game.user.isGM && 
      game.settings.get("wfrp4e", "autoFillAdvantage", true))
    {
      ui.notifications.notify(game.i18n.localize("AutoFillAdvantageDisabled"), {permanent : true})
      game.settings.set("wfrp4e", "autoFillAdvantage", false)
    }

    game.socket.on("system.wfrp4e", data => {
      SocketHandlers[data.type](data)
    })


    const body = $("body");
    body.on("dragstart", "a.condition-chat", WFRP_Utility._onDragConditionLink)

    const MIGRATION_VERSION = 7;
    let needMigration = isNewerVersion(MIGRATION_VERSION, game.settings.get("wfrp4e", "systemMigrationVersion"))
    if (needMigration && game.user.isGM) {
      game.wfrp4e.migration.migrateWorld()
    }
    game.settings.set("wfrp4e", "systemMigrationVersion", MIGRATION_VERSION)

    // Some entities require other entities to be loaded to prepare correctly (vehicles and mounts)
    for (let e of game.wfrp4e.postReadyPrepare)
      e.prepareData();

    FoundryOverrides();
    MooHouseRules();
    canvas.tokens.placeables.forEach(t => t.drawEffects())

    game.wfrp4e.tags.createTags()
  })
}
