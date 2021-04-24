manila = require('./manila.js')

bot = manila.createBot(
    {
        username: 'Manila',
        host: 'serverIp',
    }
)

function onSpawn() {
    // ..
}

function onLogin() {
    // ...
}

function onTick() {
    // ...
}

bot.once('spawn', onLogin)
bot.on('spawn', onSpawn)
bot.on('physicTick', onTick)