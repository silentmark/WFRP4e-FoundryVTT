export default function() {
    Hooks.on("updateSetting", (setting) => {
        // Centralized handling of group advantage updates
        // If group advantage is updated, update advantage of all combatants in the current combat
        // Then, make sure that change is reflected in the counter on the combat tracker (if the update was made by a different user)
        if (setting.key == "wfrp4e.groupAdvantageValues")
        {
            ui.notifications.notify(game.i18n.format("GroupAdvantageUpdated", {players : setting.value.players, enemies : setting.value.enemies}))
            
            $(".advantage-group input").each((index, input) => {
                let group = input.dataset.group;
                input.value = setting.value[group];
            });
        }
    })  
}