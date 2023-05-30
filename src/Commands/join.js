const { SlashCommandBuilder } = require("@discordjs/builders");
const { joinVoiceChannel, getVoiceConnection} = require('@discordjs/voice');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription("Join to your channel!"),
    execute: async (interaction, client) => {
        const activeConnect = getVoiceConnection(interaction.guild.id)
        if(!activeConnect || activeConnect.joinConfig.channelId !== interaction.member.voice.channelId)
        {
            joinVoiceChannel(
                {
                    channelId: interaction.member.voice.channelId,
                    guildId: interaction.member.voice.guild.id,
                    adapterCreator: interaction.member.voice.guild.voiceAdapterCreator
                }
            )
            return interaction.reply("I am ready!")   
        }
        else
        {
            return interaction.reply('I am here!!!')
        }
    },
};
