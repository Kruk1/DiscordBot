const { SlashCommandBuilder } = require("@discordjs/builders");
let { queue } = require("..");
const { createAudioPlayer, getVoiceConnection, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice')
const ytdl = require('ytdl-core')


module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip song!"),
  execute: async (interaction, client) => {
        let activeConnect = getVoiceConnection(interaction.guild.id)
        if(!activeConnect)
        {
            return interaction.reply('I am on another voice channel!')
        }

        if(queue.length > 0)
        {
            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            })
            activeConnect.subscribe(player)
            const resource = createAudioResource(ytdl(queue[0].url, {
                filter: "audioonly",
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            }))
            player.play(resource)
            interaction.reply('Skipped!')
            interaction.channel.send(`Playing: ${queue[0].title}`)
            queue.shift()
    
            player.on(AudioPlayerStatus.Idle, () => 
            {
                if(queue.length > 0)
                {
                    const resource = createAudioResource(ytdl(queue[0].url, {
                        filter: "audioonly",
                        quality: 'highestaudio',
                        highWaterMark: 1 << 25
                    }))
                    player.play(resource)
                    interaction.channel.send(`Playing: ${queue[0].title}`)
                    queue.shift()
                }
                else
                {
                    player.stop()
                    existPlayer = false
                }
            })
        }
        else
        {
            return interaction.reply('No songs in queue!')
        }
    },
};
