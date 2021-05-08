let bot

function load(botclass) {
    bot = botclass

    bot.addTarget = addTarget
    bot.clearTargets = clearTargets
    bot.equipForCombat = equipForCombat
    bot.hasShield = hasShield
    bot.checkForTargets = checkForTargets
}


// Combat
var targets = [] // the bot will attack any entites
// that relate to target strings, looking up their
// usernames, types and entity names
var attackTick = 0 // Timing
var eatTick = 0    // anti-annoying-spam-food-noise

function addTarget(filter) {
    targets.push(filter)
}

function clearTargets() {
    targets = []
    bot.setControlState('forward', false)
    bot.setControlState('sprint', false)
    bot.setControlState('jump', false)
}

function equipForCombat(priorizeAxe = false) {
    if (priorizeAxe) {
        const weapon = bot.inventory.items().find(item => item.name.includes('axe'))
        if (weapon) {
            bot.equip(weapon, 'hand')
            return
        }
    }
    const weapon = bot.inventory.items().find(item => item.name.includes('sword'))
    if (weapon) {
        bot.equip(weapon, 'hand')
    }
    bot.armorManager.equipAll()
}

/// Weapon management (from mineflayer-pvp)
function hasShield() {
    if (bot.supportFeature('doesntHaveOffHandSlot'))
        return false;
    const slot = bot.inventory.slots[bot.getEquipmentDestSlot('off-hand')];
    if (!slot)
        return false;
    return slot.name.includes('shield');
}

const { check } = require("uuid-1345")
const attackSpeeds = require("./AttackSpeeds.json")

function getAttackSpeed(weaponName) {
    if (!weaponName)
        return attackSpeeds.other;
    return attackSpeeds[weaponName] || attackSpeeds.other;
}

function getCooldown(weaponName) {
    const speed = getAttackSpeed(weaponName);
    return Math.floor(1 / speed * 20);
}

var isShieldActive = false

// Pew pew

var attackHits = 0
var mvTick = 0

function checkForTargets() {
    const filter = e => targets.includes(e.username) || targets.includes(e.name)

    const entity = bot.nearestEntity(filter)
    const minimumDistance = 5.5

    if (entity) {
        attackTick += 1
        mvTick += 1
        if (mvTick > 10) {
            mvTick = 0
            bot.moveTo(entity.position)
        }
        /*
        If it finds a valid target
        it will enter combat bot.state
        */
        bot.state = 'combat'

        if (bot.health > 15 || bot.food > 19 || !bot.hasFood()) {
            /*
            Perform combat as long as the bot
            either is in good stat conditions
            or does not have any food to
            metigate the stats
            
            Gets cooldown in ticks for the
            current weapon and uses it to
            time the attacks properly

            ticksPerAttack is also used to
            time crits
            */
            let ticksPerAttack
            const mainHand = bot.inventory.slots[bot.getEquipmentDestSlot('hand')]
            if (mainHand) {
                ticksPerAttack = getCooldown(bot.inventory.slots[bot.getEquipmentDestSlot('hand')].name)
            }
            else {
                ticksPerAttack = 5
            }

            bot.lookAt(entity.position)
            bot.substate = 'moving'

            /*
            attackHits is used to eventually change
            main weapon to axe, useful when fighting
            targets that posses shields.

            Also, if the target is far, the bot will
            also equip an axe, as it has enough time
            to charge it.

            After using the axe, the weapon is changed
            to a sword, that has more damage per
            second.
            */
            if (attackHits > 3) {
                equipForCombat(true)
                attackHits = 0
            }
            if (entity.position.distanceTo(bot.entity.position) > minimumDistance + 5) {
                equipForCombat(true)
                bot.setControlState('jump', true)
            }
            else {
                bot.setControlState('jump', false)
            }
            bot.setControlState('sprint', true)
            if (entity.position.distanceTo(bot.entity.position) < minimumDistance) {
                bot.setControlState('back', true)
            }

            /*
            Jumps in the (arguably) perfect time to
            get a critical hit in the next 10 ticks
            */
            if (attackTick > ticksPerAttack - 10 && entity.position.distanceTo(bot.entity.position) < minimumDistance) {
                bot.setControlState('jump', false)
                bot.setControlState('forward', true)
                bot.substate = 'attacking'
            }

            /*
            Perform the attack at the proper tick
            for current weapon cooldown
            */
            if (attackTick > ticksPerAttack && entity.position.distanceTo(bot.entity.position) < minimumDistance) {
                //bot.stopDigging()
                attackTick = 0      // Reseting ticks
                bot.setControlState('sprint', false)
                bot.attack(entity)
                equipForCombat()    // Equips sword
                attackHits += 1

                bot.substate = 'idle'
            }
            else {
                // Shield management
                if (hasShield() && attackTick < (ticksPerAttack / 1.1) && entity.position.distanceTo(bot.entity.position) < minimumDistance + 3) {
                    if (!isShieldActive) {
                        isShieldActive = true
                        bot.activateItem(true)
                        bot.substate = 'defending'
                    }
                }
                else if (isShieldActive) {
                    isShieldActive = false
                    bot.deactivateItem(true);
                    if (bot.substate === 'defending')
                        bot.substate = 'idle'
                    if (attackTick < ticksPerAttack) {
                        bot.setControlState('forward', false)
                        bot.setControlState('back', true)
                    }
                }
            }
        }
        else {
            attackTick = 0
            if (eatTick > 30) {
                if (isShieldActive) {
                    isShieldActive = false
                    bot.deactivateItem(true);
                }
                if (bot.health < 15 && bot.food < 20) {
                    bot.setControlState('forward', true)
                    bot.setControlState('jump', true)
                    bot.setControlState('sprint', true)
                    bot.substate = 'eating'
                    bot.eat()
                    eatTick = 0
                }
            }
        }
    } else {
        if (bot.state === 'combat') {
          bot.state = 'idle'
          bot.substate = 'none'

          if (isShieldActive) {
              isShieldActive = false
              bot.deactivateItem(true);
          }
      }
    }
    eatTick += 1
}

module.exports = {
    load: load,
}
