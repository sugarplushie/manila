# Manila ๐ผ

A lovely, loyal Minecraft bot, originated from one of my (Minecraft) pets!

Inspired by Baritone.

# Features โจ

- ๐ Cool-looking output messages

- ๐ค Operator rank system

- ๐ Pathfinding

- ๐ก๏ธ Combat and PVP

- โ๏ธ Block mining

- ๐ Inventory management

- ๐ Automatic food management

- ๐ก๏ธ Automatic armor management

- ๐ง Utility commands

# Preview ๐งถ

![](https://i.imgur.com/7w2smT0.png)

![](https://i.imgur.com/4z9V383.png)

# Commands ๐ค

As of now, only a few simple commands were implemented.

Commands can be called by the game chat, either in normal chat or whispers. Commands will only be accepted if starting with the bot's prefix, which is `#` by default.

For a sweet, nice command output, the bot would need to have OP permissions in the server, as it is only possible with the `/tellraw` command. If the bot does have such permissions, please run `#option isOp 1` to enable the nicer output!

| Alias    | Parameters                   | Description                                      |
|----------|------------------------------|--------------------------------------------------|
| option   | [option] [0/1]               | Toggles some of the bot's configuration values.  |
| operator | [list/add/remove] [username] | Manages bot operators.                           |
| eat      |                              | Eats food in the inventory.                      |
| status   |                              | Shows state, including health points and hunger. |
| stop     |                              | Stops any current action and clears targets.     |
| goto     | [x] [y] [z]                  | Moves to the specified location.                 |
| mine     | [block type] [ammount]       | Mines a block.                                   |
| target   | [username/entity name]       | Targets an entity or entity type (for combat).   |
| drop     | [item name]                  | Drops one slot of the specified item.            |
| equip    |                              | Equips shield, and/or weapon.                    |
| mount    |                              | Mounts the nearest vehicle.                      |
| dismount |                              | Dismounts the current vehicle.                   |

## Option command

Currently, there are only two toggleable options:

- **isOp**: determines whether the bot can use OP commands. At the moment, this will only affect the bot's message output, which can be a pretty, colored /tellraw with the option enabled.

- **loud**: whether the bot should speak only to the command summoner (0), or publicly.

# Contributing ๐

Feel absolutely free to issue any problems, suggestions or any kind of feedback! I would love to hear your opinions and thoughts!

You can also contribute by sending a pull request with additions or improvements.
