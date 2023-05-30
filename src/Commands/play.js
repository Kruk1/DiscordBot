const { SlashCommandBuilder } = require("@discordjs/builders")
let { existPlayer, queue } = require("../index.js")
const googleApi = process.env.GOOGLE_API
const { createAudioPlayer, joinVoiceChannel, getVoiceConnection, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice')
const YouTube = require("discord-youtube-api")
const youtube = new YouTube(googleApi)
const ytdl = require('ytdl-core')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play your music!")    
        .addStringOption(option => 
            {
                return option.setName('music')
                .setDescription('Give me your music title or link!')
                .setRequired(true)
            }),
    execute: async (interaction, client) => {
        let activeConnect = getVoiceConnection(interaction.guild.id)
        if(!activeConnect || activeConnect.joinConfig.channelId !== interaction.member.voice.channelId)
        {
            activeConnect = joinVoiceChannel(
                {
                    channelId: interaction.member.voice.channelId,
                    guildId: interaction.member.voice.guild.id,
                    adapterCreator: interaction.member.voice.guild.voiceAdapterCreator
                }
            )
        }

        if(!existPlayer)
        {
            existPlayer = true
            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            })
            activeConnect.subscribe(player)
            const music = await youtube.searchVideos(interaction.options.getString('music'))
            const resource = createAudioResource(ytdl(music.url, {
                filter: "audioonly",
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            }))
            player.play(resource)
            interaction.reply(`Playing: ${music.title}`)

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
            const music = await youtube.searchVideos(interaction.options.getString('music'))
            queue.push(music)
            interaction.reply(`Queued: ${music.title}`)
        }   
    },
};
