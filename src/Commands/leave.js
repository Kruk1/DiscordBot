const { SlashCommandBuilder } = require("@discordjs/builders");
const { getVoiceConnection} = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Leave a voice channel in the guild!"),
    execute: async (interaction, client) => {
        const activeConnect = getVoiceConnection(interaction.guild.id)
        if(activeConnect)
        {
            activeConnect.destroy()
            return interaction.reply('Bye!')
        }
        else
        {
            return interaction.reply('I am not on a voice channel!')
        }
    },
};
