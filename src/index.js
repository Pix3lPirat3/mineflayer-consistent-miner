module.exports = function plugin(bot) {

    let listener = function() {
        // There is an entity at our cursor (blocking the cursor) - stop breaking
        if(bot.entityAtCursor()) {
            if(bot.targetDigBlock) bot.stopDigging();
            return;
        }

        let blockAtCursor = bot.blockAtCursor();

        // The block at the cursor has changed, stop digging
        if(blockAtCursor && bot.targetDigBlock && !blockAtCursor.position.equals(bot.targetDigBlock.position)) return bot.stopDigging();

        // The tool in our hand has changed/broken
        if(bot.heldItem !== bot.consistentMiner.heldItem) {
            bot.consistentMiner.heldItem = bot.heldItem;
            // The bot was digging, stop digging
            if(bot.targetDigBlock) return bot.stopDigging();
        }

        // The bot is already digging 
        if(bot.targetDigBlock) return;
        bot.dig(bot.blockAtCursor(), bot.consistentMiner.opts.forceLook, bot.consistentMiner.opts.digFace).catch(e => console.log('digging aborted'));

    }

    bot.consistentMiner = {
        opts: {
            forceLook: 'ignore',
            digFace: 'raycast'
        },
        heldItem: null,
        running: false,
        start: function() {
            if(this.running) return console.log('The consistentMiner is already running, the listener cannot be registered twice.');
            this.running = true; 
            bot.on('physicsTick', listener);
        },
        stop: function() {
            this.running = false;
            bot.off('physicsTick', listener);
        }
    }

    bot.consistentMiner.start()

}