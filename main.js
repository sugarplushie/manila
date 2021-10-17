manila = require('./manila.js')
memory = {}

prefix = '#'

options = {
  operators: [], // empty array for anyone
  isOp: false,  // Allows stylish and pretty output, instead of normal messages (/tellraw), however, requires OP permission
  loud: true, // answer in global chat (if false, the bot will whisper)
}

bot = manila.createBot(
    {
      username: process.argv[2],
      host: 'localhost',
      port: 42521,
    }
)

function goto(args) {
  var position = {}

  position.x = args[1]
  position.y = args[2]
  position.z = args[3]

  if (position.x[0] == '~') {
    str = position.x
    offset = parseInt(str.replace('~', ''))
    position.x = parseInt(bot.entity.position.x.toString().split('.')[0])
    if (str.length > 1) {
        position.x += offset
    }
    position.x = position.x.toString()
  }

  if (position.y[0] == '~') {
    str = position.y
    offset = parseInt(str.replace('~', ''))
    position.y = parseInt(bot.entity.position.y.toString().split('.')[0])
    if (str.length > 1) {
        position.y += offset
    }
    position.y = position.y.toString()
  }

  if (position.z[0] == '~') {
    str = position.z
    offset = parseInt(str.replace('~', ''))
    position.z = parseInt(bot.entity.position.z.toString().split('.')[0])
    if (str.length > 1) {
        position.z += offset
    }
    position.z = position.z.toString()
  }

  position.x = parseInt(position.x)
  position.y = parseInt(position.y)
  position.z = parseInt(position.z)

  if (position.x.toString() != 'NaN' && position.y.toString() != 'NaN' && position.z.toString() != 'NaN') {
    bot.moveTo(position)
    return 'Moving to ' + position.x.toString() + ' / ' + position.y.toString() + ' / ' + position.z.toString() + '.';
  }
  else {
    return false;
  }
}

String.prototype.format = function () {
  var i = 0
  return this.replace(/{}/g, function () {
    return typeof memory[i] != 'undefined' ? memory[i++] : '';
  });
};

function onChatMessage(username, message, rawMessage, jsonMsg) {
  try {username = jsonMsg.with[0].text} catch {}
  if (message[0] !== prefix) return
  if ((options.operators.length > 0 && !options.operators.includes(username))) {
    if (options.isOp) bot.chat(`/tellraw ${username} ["",{"text":"[-] ","color":"dark_red"},{"text":"You are not allowed to perform this action.","color":"red"}]`)
    else {
      if (options.loud) bot.chat('[-] You are not allowed to perform this action.')
      else bot.whisper(username, '[-] You are not allowed to perform this action.')
    }
    return
  }

  message = message.format().slice(1)
  const args = message.split(' ')

  function requireargs(n) {
    /*
    Used to simplify argument number thing,
    n is the number of args AFTER the
    calling argument (first argument)

    Automatically changes response to
    notify about the missing args
    */

    const argsAfterCalling = args.length - 1
    if (argsAfterCalling < n) {
      response = [2, 'Not enough args!']
      return false
    }
    else return true
  }

  var response = [0, 'OK.'] // [status, message] (-1: no message, 0: neutral, 1: success, 2: error)

  switch (args[0].toLowerCase()) {
    case 'option':
      if (requireargs(2) && options[args[1]] !== undefined && args[1] !== 'operators') {
        if (args[2] === '1') options[args[1]] = true
        else if (args[2] === '0') options[args[1]] = false
        response = [1, `${args[1]} is now set to ${options[args[1]].toString()}`]
      }
      else if (requireargs(1) && options[args[1]] !== undefined && args[1] !== 'operators') {
        response = [0, `${args[1]} is currently set to ${options[args[1]].toString()}`]
      }
      else response = [2, 'Please specify a valid option!']
      break;

    case 'operator':
      if (requireargs(1)) {
        switch (args[1].toLowerCase()) {
          case 'list':
            response = [0, `Current operators: ${options.operators.toString().split(',').join(', ')}.`]
            break;
          case 'add':
            if (requireargs(2)) {
              if (options.operators.indexOf(args[2]) === -1) {
                options.operators.push(args[2])
                response = [1, `Made ${args[2]} an operator.`]
              }
              else response = [2, `${args[2]} is already an operator.`]
            }
            break;
          case 'remove':
            if (requireargs(2)) {
              if (username === args[2]) {
                response = [2, "You can't demote yourself, darling!"]
                break;
              }
              const index = options.operators.indexOf(args[2])
              if (index !== -1) {
                if (index > options.operators.indexOf(username)) {
                  options.operators.splice(index, 1)
                  response = [1, `${args[2]} is no longer an operator.`]
                }
                else response = [2, `Operator ${args[2]} has a higher rank than you.`]
              }
              else response = [2, `${args[2]} is not a valid operator.`]
            }
            break;
          default:
            response = [2, 'Invalid parameters!']
        }
      }
      break;
    case 'eat':
      bot.eat()
      break;
    case 'status':
      response = [0, 'HP: ' + bot.health.toString().split('.')[0] + ' | Food: ' + bot.food.toString().split('.')[0] + ' | ' + bot.state + '(' + bot.substate + ')']
      break;

    case 'stop':
      bot.stopMoving()
      bot.stopMining()
      bot.clearTargets()
      break;

    case 'goto':
      if (requireargs(3)) {
        valid = goto(args)
        if (valid) response = [1, valid]
        else response = [2, 'Please insert valid coordinates!']
      }
      break;

    case 'mine':
      var count = 1
      if (requireargs(2)) count = parseInt(args[2])
      if (requireargs(1)) {
        bot.mineBlock(args[1], count)
        response = [1, 'Mining ' + args[1] + '.']
      }
      break;

    case 'target':
      if (requireargs(1)) {
        bot.addTarget(args[1])
        response = [1, 'Target added!']
      }
      break;

    case 'inventory':
      const invArray = bot.inventory.items().map(a => a.name)
      response = [0, 'Current invetory state: ' + invArray.toString().split(',').join(', ') + '.']
      break;

    case 'drop':
      if (requireargs(1)) {
        const item = bot.inventory.items().find(item => item.name.toLowerCase().includes(args[1]))
        if (item) {
          bot.tossStack(item)
          response = [1, `Dropping ${args[1].toLowerCase()}.`]
        }
        else {
          response = [2, 'Item not found.']
        }
      }
      break;

    case 'equip':
      response = [1, 'Equipping myself!']
      bot.equipForCombat()
      break;

    case 'mount':
      vehicle = bot.mountNearest()
      if (vehicle) response = [1, 'I have mounted the vehicle!']
      else response = [2, 'There is no nearby vehicle.']
      break;

    case 'dismount':
      bot.dismount()
      response = [1, 'Dismounting vehicle!']
      break;

    case 'locate':
      if (requireargs(1)) {
        var position = null
        const filter = e => e.username === args[1] || e.name === args[1]
        const entity = bot.nearestEntity(filter)
        if (entity) {
            position = entity.position
        }
        else {
            position = bot.locateBlock(args[1])
        }
        if (position) {
            position.x = parseInt(position.x.toString().split('.')[0])
            position.y = parseInt(position.y.toString().split('.')[0])
            position.z = parseInt(position.z.toString().split('.')[0])
            response = [1, 'Found at ' + position.x.toString() + ' / ' + position.y.toString() + ' / ' + position.z.toString() + '.']
        }
        else {
            response = [2, 'Could not locate entity/block.']
        }
      }
      break;
    
    case 'remember':
      if(requireargs(2))
      {
        memory[args[1]] = args[2];
        response = [1, 'Sucessfuly saved {args[1]} as {args[2]}!'.format()]
      }
      break;

    case 'valueof':
      if(requireargs(1))
      {
        response = [1, memory[args[1]]]
      }
      break;
      
    default:
      response = [2, 'This is not a valid command!']
      break;
  }
  if (options.isOp && response[0] !== -1) {
    if (options.loud) username = '@a'
    switch (response[0]) {
      case 0: // Neutral
        bot.chat(`/tellraw ${username} ["",{"text":"[*] ","color":"light_purple"},{"text":"${response[1]}"}]`)
        break;
      case 1: // Success
        bot.chat(`/tellraw ${username} ["",{"text":"[+] ","color":"green"},{"text":"${response[1]}","color":"aqua"}]`)
        break;
      case 2: // Failure
        bot.chat(`/tellraw ${username} ["",{"text":"[-] ","color":"dark_red"},{"text":"${response[1]}","color":"red"}]`)
        break;
    }
  } else if (response[0] !== -1) {
    if (options.loud) bot.chat(response[1])
    else bot.whisper(username, response[1])
  }
}

function onSpawn() {
  // ...
}

function onLogin() {
  (function eatingLoop() {
    if (bot.state !== 'combat') bot.eat()
    setTimeout(eatingLoop, 5000);
  })();
}

function onTick() {
  // ...
}

bot.once('spawn', onLogin)
bot.on('spawn', onSpawn)
bot.on('physicTick', onTick)
bot.on('chat', onChatMessage)
