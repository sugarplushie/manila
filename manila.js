const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin
const armorManager = require('mineflayer-armor-manager')

let bot

const movement = require('./movement')
const combat = require('./combat')
const convention = require('./convention')

function createBot(options) {
    // Logging in
    bot = mineflayer.createBot(options)

    bot.state = 'idle'    // idle, combat, moving
    bot.substate = 'none'

    // Loading plugins
    bot.loadPlugin(armorManager)
    bot.loadPlugin(pvp)

    // Applying listeners
    bot.on('physicTick', onTick)

    // Loading bot components
    movement.load(bot)
    combat.load(bot)
    convention.load(bot)

    return bot
}

// Events
function onTick() {
    bot.checkForTargets()
}

// Exporting modules
module.exports = {
    createBot: createBot,
}