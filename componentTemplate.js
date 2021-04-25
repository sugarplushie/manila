let bot

function load(botclass) {
    bot = botclass
    bot.exampleFunction = exampleFunction
}

function exampleFunction() {
    console.log('hallo')
}

module.exports = {
    load: load,
}