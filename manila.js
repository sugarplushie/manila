const mineflayer = require('mineflayer')
const toolPlugin = require('mineflayer-tool').plugin
const armorManager = require('mineflayer-armor-manager')

let bot

const movement = require('./movement')
const combat = require('./combat')
const convention = require('./convention')
const blockfinder = require('./blockfinder')

function createBot(options) {
    // Logging in
    bot = mineflayer.createBot(options)

    bot.state = 'idle'    // idle, combat, moving
    bot.substate = 'none'

    // Loading plugins
    bot.loadPlugin(armorManager)
    bot.loadPlugin(toolPlugin)

    // Applying listeners
    bot.on('physicTick', onTick)

    // Loading bot components
    movement.load(bot)
    combat.load(bot)
    convention.load(bot)
    blockfinder.load(bot)

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