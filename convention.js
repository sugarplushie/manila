let bot

function load(botclass) {
    bot = botclass

    bot.hasFood = hasFood
    bot.eat = eat
    bot.getPlayer = getPlayer
    bot.mountNearest = mountNearest
    bot.locateBlock = locateBlock
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