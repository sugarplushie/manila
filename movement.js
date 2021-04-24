const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const GoalFollow = goals.GoalFollow

let bot

function load(botclass) {
    bot = botclass
    bot.loadPlugin(pathfinder)

    bot.moveTo = moveTo
    bot.stopMoving = stopMoving
}

function moveTo(position) {
    /*
    Pathfinds and move to the given
    coordinates, breaking or placing
    blocks if needed.

    This action can be interrupted
    with stopMoving()
    */
    if (position) {
        const mcData = require('minecraft-data')(bot.version)
        const movements = new Movements(bot, mcData)

        bot.pathfinder.setMovements(movements)

        bot.pathfinder.setGoal(new goals.GoalBlock(position.x, position.y, position.z), false)
    }
}

function stopMoving() {
    /*
    Stops any current movement
    actions
    */
    const mcData = require('minecraft-data')(bot.version)
    const movements = new Movements(bot, mcData)

    bot.pathfinder.setMovements(movements)

    bot.pathfinder.setGoal(new goals.GoalBlock(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z), false)
}

module.exports = {
    load: load,
}