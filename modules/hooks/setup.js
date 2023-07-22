

export default function () {
    Hooks.on("setup", () => {
        // Localize strings in the  game.wfrp4e.config.object
        for (let obj of game.wfrp4e.config.toTranslate) {
                for (let el in game.wfrp4e.config[obj]) {
                    if (typeof game.wfrp4e.config[obj][el] === "string") {
                        game.wfrp4e.config[obj][el] = game.i18n.localize(game.wfrp4e.config[obj][el])
                    }
                }
        }

        game.wfrp4e.config.groupAdvantageActions = game.wfrp4e.config.groupAdvantageActions.concat([
            {
                cost: 1,
                name: "Powalenie",
                description: "W starciu z bardziej wyszkolonym przeciwnikiem czasami brutalna siła może odnieść sukces tam, gdzie inne podejścia zawodzą.",
                effect: "<strong>Akcja Specjalna</strong>: Aby Powalić przeciwnika, wykonaj Przeciwstawny Test Siły ze swoim Przeciwnikiem (zarówno Ty, jak i Twój przeciwnik przetestujcie swój Atrybut Siły). Kto zdobędzie wyższe PS, wygrywa. Jeśli wygrasz Test, twój przeciwnik zyskuje stan @Stan[Leżenie] i zyskuje +1 Przewagę. Jeśli przegrasz, Twój przeciwnik zyskuje +1 Przewagi, a Twoja Akcja się kończy.",
                test: {
                    type: "characteristic",
                    value: "s"
                }
            },
            {
                cost: 1,
                name: "Podstęp",
                description: "Poświęcasz chwilę, by rzucić przeciwnikowi brud w oczy lub podpalić go odrobiną płonącego oleju. Ten manewr jest ryzykowny i niewielu wrogów daje się oszukać w ten sam sposób więcej niż raz.",
                effect: "<strong>Akcja specjalna</strong>: Aby oszukać przeciwnika, wykonaj Przeciwstawny Test Zwinności (zarówno ty, jak i przeciwnik przetestujcie swój atrybut Zwinności). Kto zdobędzie więcej PS, wygrywa. Jeśli wygrasz Test, zyskujesz +1 Przewagi. Jeśli MG uzna, że okoliczności do tego pasują, możesz również zmusić przeciwnika do wybrania stanu @Condition[Podpalenie], @Condition[Oślepienie] lub @Condition[Splątanie]. Jeśli przegrasz Test, twój przeciwnik zyskuje +1 Przewagi, a Twoja Akcja się kończy. MG może odrzucić którykolwiek z tych Warunków, jeśli nie masz odpowiedniego przedmiotu do ręki lub nałożyłeś ten sam Stan na przeciwnika wcześniej.",
                test: {
                    type: "characteristic",
                    value: "ag"
                }
            },
            {
                cost: 2,
                name: "Dodatkowy wysiłek",
                description: "In desperate circumstances you can use the momentum you have gained to increase your chance of success.",
                effect: "<strong>Free Action</strong>: You gain a +10% bonus to any Test before you make it. You may spend extra Advantage to add an additional +10% bonus per Advantage spent. For example, you could spend 3 Advantage for a +20% bonus, or 4 Advantage for a +30%bonus. This Test never generates Advantage for the character performing it.",
            },
            {
                cost: 2,
                name: "Uciekaj przed zagrożeniem",
                description: "Wykorzystujesz chwilowy zastój lub rozproszenie uwagi, aby oderwać się od walki.",
                effect: "<strong>Ruch</strong>: Możesz oddalić się od przeciwników bez kary. Zastępuje to reguły @UUID[Compendium.wfrp4e-core.journal-entries.NS3YGlJQxwTggjRX.JournalEntryPage.bdfiyhEYtKs7irqc#disengaging]{Opuszczenie Starcia}.",
            },
            {
                cost: 4,
                name: "Dodatkowa Akcja ",
                description: "Wykorzystujesz okazję, aby osiągnąć coś niezwykłego.",
                effect: "<strong>Darmowa Akcja</strong>: Wykonujesz dodatkową Akcję. Ta Akcja nigdy nie generuje Przewagi dla postaci, która ją wykonuje. Możesz wydać Przewagę, aby wykonać Dodatkową Akcję tylko raz na turę.",
            }
        ])
    })
}