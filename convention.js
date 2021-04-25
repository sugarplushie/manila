let bot

function load(botclass) {
    bot = botclass

    bot.on('physicTick', miningTick)

    bot.hasFood = hasFood
    bot.eat = eat
    bot.getPlayer = getPlayer
    bot.mountNearest = mountNearest
    bot.locateBlock = locateBlock
    bot.mineBlock = mineBlock
    bot.mineBlockAt = mineBlockAt
    bot.stopMining = stopMining
}

// Eating
function hasFood() {
    /*
    Returns either there is or not
    available food in the inventory
    */
    const mcData = require('minecraft-data')(bot.version)
    var data = mcData.foodsArray
    var names = data.map((item) => item.name)

    var found_food = bot.inventory
        .items()
        .filter((item) => names.includes(item.name))

    if (found_food.length === 0 || !found_food) {
        return false
    }
    return true
}

function eat() { // Based on mineflayer-auto-eat
    /*
    Searches for any food items in the inventory
    to select it, then eat
    
    Does not cherrypick atm (also i gotta make it do)

    Returns either it found food in the inventory
    or not (bool)
    */
    const mcData = require('minecraft-data')(bot.version)
    var data = mcData.foodsArray
    var names = data.map((item) => item.name)

    var found_food = bot.inventory
        .items()
        .filter((item) => names.includes(item.name))

    if (found_food.length === 0 || !found_food) {
        return false
    }

    var available_food = []

    bot.inventory.items().forEach((element) => {
        if (names.includes(element.name)) available_food.push(element)
    })

    if (available_food.length > 0) {
        if (available_food[0]) {
            /*
            Passing food item to main hand
            and activating the item from 
            main hand (which is food)
            */
            bot.equip(available_food[0], 'hand')
            bot.activateItem(false)
            return true
        }
    }

    return false
}

function getPlayer(username) {
    /*
    Returns the player object for the
    given username, or null if it
    can't find the player
    */
    player = bot.players[username]
    if (player) return player
    return null
}

function locateBlock(name) {
    /*
    Returns position for the nearest
    block of that kind
    */
    blocks = bot.findBlockSync({
        point: bot.entity.position,
        matching: name,
        maxDistance: 128,
        count: 1
    })
    if (blocks.length > 0) return blocks[0].position
    return null
}

var mining = false
var miningCount = 0
var miningName = null

function miningTick() {
    if (mining && !bot.targetDigBlock && bot.entity.position.distanceTo(mining) < 2) {
        bot.lookAt(mining)
        bot.stopMoving()
        target = bot.blockAt(mining)
        function finishedMining(err) {
            if (err) {
                //bot.stopDigging()
                //console.log(err.stack)
            }
            //bot.stopDigging()
            mining = false
            miningCount -= 1
            if (miningCount == 0) bot.chat(`Finished mining ${miningName}`)
            //mineBlockAt()
        }
        bot.substate = 'digging'
        bot.tool.equipForBlock(target, {}, () => { bot.dig(target, finishedMining) })
    }
    else if (!mining && miningName && miningCount > 0) {
        position = bot.locateBlock(miningName)
        if (position) {
            bot.mineBlockAt(position)
        }
        else {
            miningName = null
        }
    }
}

function mineBlockAt(position) {
    mining = position
    bot.moveTo(position)
    bot.substate = 'moving'
}

function mineBlock(name, count = 1) {
    bot.state = 'mining'
    miningCount = count
    miningName = name
}

function stopMining() {
    mining = false
    miningCount = 0
    miningName = null
    bot.stopMoving()
    bot.stopDigging()
    if (bot.state === 'mining') {
        bot.state = 'idle'
        bot.substate = 'none'
    }
}

// Vehicle
// TODO: Vehicle movement

function mountNearest() {
    /*
    Mounts the nearest vehicle
    */

    mountable = ['boat', 'minecart', 'horse', 'donkey']

    const filter = e => e.name && mountable.includes(e.name)
    const entity = bot.nearestEntity(filter)

    if (entity) {
        bot.mount(entity)
        return true
    }
    return false
}

module.exports = {
    load: load,
}