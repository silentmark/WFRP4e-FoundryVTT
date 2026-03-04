if ((args.sourceItem && args.sourceItem.isMelee) || (args.sourceItem && !args.sourceItem.name.includes("Broń Zasięgowa")))
{
    let choice = await foundry.applications.api.DialogV2.confirm({window : {title : this.effect.name}, content : `<p><strong>${this.effect.name}</strong>: Zadać obrażenia atakującemu?`})

    if (choice)
    {
        this.script.message(await args.attacker.applyBasicDamage(this.actor.system.characteristics.wp.bonus, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg : true}));
    }
}