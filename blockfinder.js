/*
This code is mostly taken from
mineflayer-blockfinder, it was
modified and just contains what
I will actually need to use

It checks for block names instead
of ID's, which is insanely slower.
Just a temp solution, I should
get the ID for the block somehow
and then still use this ID
*/

let bot

function load(botclass) {
    bot = botclass

    bot.findBlockSync = findBlockSync
}

var assert = require('assert');
var abs = Math.abs;
var vec3 = require('vec3');

function OctahedronIterator(center) {
    this.center = center.floored();
    this.apothem = 1;
    this.x = -1;
    this.y = -1;
    this.z = -1;
    this.L = this.apothem;
    this.R = this.L + 1;
}

OctahedronIterator.prototype.next = function () {
    this.R -= 1;
    if (this.R < 0) {
        this.L -= 1;
        if (this.L < 0) {
            this.z += 2;
            if (this.z > 1) {
                this.y += 2;
                if (this.y > 1) {
                    this.x += 2;
                    if (this.x > 1) {
                        this.apothem += 1;
                        this.x = -1;
                    }
                    this.y = -1;
                }
                this.z = -1;
            }
            this.L = this.apothem;
        }
        this.R = this.L;
    }
    var X = this.x * this.R;
    var Y = this.y * (this.apothem - this.L);
    var Z = this.z * (this.apothem - abs(abs(X) + abs(Y)));
    var offset = vec3(X, Y, Z);
    var point = offset.plus(this.center);
    return point;
}

function findBlockSync(options) {
    options = optionsWithDefaults(options);

    var it = new OctahedronIterator(options.point);
    var result = [];

    while (result.length < options.count && it.apothem <= options.maxDistance) {
        var block = bot.blockAt(it.next());
        if (block && block.name == options.matching) result.push(block);
    }

    return result;
}

function optionsWithDefaults(options) {
    assert.notEqual(options.matching, null);
    assert.notEqual(options.point, null);
    return {
        point: options.point,
        matching: options.matching,
        count: options.count == null ? 1 : options.count,
        maxDistance: options.maxDistance == null ? 64 : options.maxDistance,
        predicate: predicateFromMatching(options.matching),
    };
}

function createBlockNameMatcher(blockName) {
    return function (block) {
        return block == null ? false : blockName === block.name;
    };
}

function predicateFromMatching(matching) {
    if (typeof (matching) === 'string') {
        return createBlockNameMatcher(matching)
    }
    else {
        // programmer error. crash loudly and proudly // Lol
        throw new Error("Block Finder: Unknown value for matching: " + matching);
    }
}

module.exports = {
    load: load,
}