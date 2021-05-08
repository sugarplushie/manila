lodash = require('lodash')

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

function eat() {
    /*
    From github.com/LINKdiscordd/mineflayer-auto-eat

    MIT License

    Copyright (c) 2020 Link

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    Returns either it found food in the inventory
    or not (bool)
    */
    const mcData = require('minecraft-data')(bot.version)
    var data = mcData.foodsArray

    var names = data.map((item) => item.name)
    var foodps = data.map((item) => item.foodPoints)

    var found_food = bot.inventory
        .items()
        .filter((item) => names.includes(item.name))

    if (found_food.length === 0 || !found_food) {
        return false
    }

    var available_food = []

    bot.inventory.items().forEach((element) => {
        if (names.includes(element.name)) {
            element.foodPoints = foodps[names.indexOf(element.name)] // item does not contain foodPoints by default
            available_food.push(element)
        }
    })

    var best_food
		best_food = lodash.maxBy(available_food, 'foodPoints')

    if (best_food) {
        /*
        Passing food item to main hand
        and activating the item from
        main hand (which is food)
        */
        bot.substate = 'eating'
        //console.log(best_food)
        //console.log(available_food)
        bot.equip(best_food, 'hand', function () {
            bot.consume(function () {
              bot.substate = 'none'
            })
        })
        return true
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
    if (blocks.length > 0) {
        return blocks[0].position
    }
    return null
}

var mining = false
var miningCount = 0
var miningName = null

function miningTick() {
    if (mining) bot.lookAt(mining)
    if (mining && !bot.targetDigBlock && bot.canDigBlock(bot.blockAt(mining))) {
        function finishedMining(err) {
            bot.stopMoving()
            mining = false
            miningCount -= 1
        }

        target = bot.blockAt(mining)
        bot.tool.equipForBlock(target, {}, () => {
            bot.substate = 'digging'
            bot.dig(target, finishedMining)
        })
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
