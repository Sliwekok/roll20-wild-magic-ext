export const Help = (() => {
    async function getHelp() {
        let message = `&{template:default} {{name=Dostepne komendy czatu}} {{help=Pokazuje tę wiadomość}} {{wild_magic=Losuje efekt z tablicy dzikiej magii (tylko GM widzi wynik)}} {{time=Pokazuje obecny czas świata}}`;

        return {message: message};
    }

    return {
        getHelp
    };
})();
