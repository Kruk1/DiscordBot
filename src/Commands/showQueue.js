const { SlashCommandBuilder, EmbedBuilder, bold } = require("@discordjs/builders");
let { existPlayer, queue } = require("../index.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("show-queue")
    .setDescription("Show songs in queue!"),
  execute: async (interaction, client) => {
    if(queue.length === 0) return interaction.reply('Queue is empty!')
    let playlist = ''
    for(song of queue)
    {
        playlist += `${bold(queue.indexOf(song) + 1)}.  ${song.title}\n` 
    }
    const showQueueEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Song queue:')
        .setDescription(playlist)
    return interaction.channel.send({ embeds: [showQueueEmbed] })
  },
};
