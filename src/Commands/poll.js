const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders")
const voteEmojis = ['1️⃣','2️⃣','3️⃣','4️⃣']

module.exports = {
  data: new SlashCommandBuilder()
    .setName("make-poll")
    .setDescription("Create poll!")
    .addStringOption(option => 
        {
            return option.setName('question')
            .setDescription('write question')
            .setRequired(true)
        })
    .addStringOption(option => 
        {
            return option.setName('option1')
            .setDescription('first option of the poll')
            .setRequired(true)
        })
    .addStringOption(option => 
        {
            return option.setName('option2')
            .setDescription('second option of the poll')
            .setRequired(true)
        })
    .addNumberOption(option =>
        {
            return option.setName('time')
            .setDescription('set poll time in seconds')
            .setRequired(true)
        })
    .addStringOption(option => 
        {
            return option.setName('option3')
            .setDescription('third option of the poll')
        })
    .addStringOption(option => 
        {
            return option.setName('option4')
            .setDescription('fourth option of the poll')
        }),
  execute: async (interaction, client) => {
    try
    {
        const question = interaction.options.getString('question')
        const option1 = interaction.options.getString('option1')
        const option2 = interaction.options.getString('option2')
        const option3 = interaction.options.getString('option3')
        const option4 = interaction.options.getString('option4')
        const time = interaction.options.getNumber('time')
        const pollEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('The poll is started!')
        .setDescription(`Question: ${question}`)
        .addFields([
            { name: '\u200b', value: ' ', inline: false },
            { name: '1️⃣', value: option1, inline: true },
            { name: '2️⃣', value: option2, inline: true }
        ])
        .setFooter({ text: interaction.user.username, iconURL: "https://cdn.discordapp.com/avatars/"+interaction.user.id+"/"+interaction.user.avatar+".jpeg" })
        if(option3) pollEmbed.addFields([{ name: '3️⃣', value: option3, inline: true }])
        if(option4) pollEmbed.addFields([{ name: ' ', value: ' ', inline: true }, { name: '4️⃣', value: option4, inline: true }, { name: ' ', value: ' ', inline: true }, { name: '\u200b', value: ' ', inline: false }])
        else pollEmbed.addFields([{ name: '\u200b', value: ' ', inline: false }])

        const reactions = ['1️⃣', '2️⃣']
        const embed = await interaction.reply({ embeds: [pollEmbed], fetchReply: true })
        await Promise.all(reactions.map(async r => await embed.react(r)))
        if(option3) await embed.react('3️⃣')
        if(option4) await embed.react('4️⃣')

        const filter = reaction => {
            return voteEmojis.some(emoji => reaction.emoji.name == emoji)
        }
        
        const collector = embed.createReactionCollector({ filter, time: time * 1000 })

        collector.on('collect', async (reaction, user) => {
            const userId = user.id
            const userReactions = embed.reactions.cache.filter(reaction => reaction.users.cache.has(userId))
            if(userReactions.size > 1)
            {   
                const elements = Array.from(userReactions.entries())
                const firstElement = elements.find(key => key[0] !== reaction.emoji.name)
                await embed.reactions.cache.delete(firstElement[0])
                await collector.collected.delete(firstElement[0])
                await firstElement[1].users.remove(userId)
            }
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`)
        })

        collector.on('end', collected => {
            const numberVotesOptions = [collected.filter(vote => vote.emoji.name === '1️⃣'), collected.filter(vote => vote.emoji.name === '2️⃣'), 
                collected.filter(vote => vote.emoji.name === '3️⃣'), collected.filter(vote => vote.emoji.name === '4️⃣')]
            
            let winner = []
            for(specificVotes of numberVotesOptions)
            {
                for(vote of specificVotes)
                {
                    if(winner.length === 0 || winner[0][1].count < vote[1].count)
                    {
                        winner = [vote]
                    }
                    else if(winner[0][1].count === specificVotes[1].count)
                    {
                        winner.push(vote)
                    }
                }
            }

            let result = ''

            winner.forEach(won => result += won[0] + ' ')

            const resultsEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('The poll is ended!')
            .setDescription('Results:')
            .addFields([
                { name: '\u200b', value: ' ', inline: false },
                { name: '1️⃣', value: `${numberVotesOptions[0].get('1️⃣') ? numberVotesOptions[0].get('1️⃣').count - 1 : 0}`, inline: true },
                { name: '2️⃣', value: `${numberVotesOptions[1].get('2️⃣') ? numberVotesOptions[1].get('2️⃣').count - 1 : 0}`, inline: true }
            ])
            .setFooter({ text: interaction.user.username, iconURL: "https://cdn.discordapp.com/avatars/"+interaction.user.id+"/"+interaction.user.avatar+".jpeg" })
            if(option3) resultsEmbed.addFields([{ name: '3️⃣', value: `${numberVotesOptions[2].get('3️⃣') ? numberVotesOptions[2].get('3️⃣').count - 1 : 0}`, inline: true }])
            if(option4) resultsEmbed.addFields([{ name: ' ', value: ' ', inline: true }, { name: '4️⃣', value: `${numberVotesOptions[3].get('4️⃣') ? numberVotesOptions[3].get('4️⃣').count - 1 : 0}`, inline: true }, { name: ' ', value: ' ', inline: true }, { name: '\u200b', value: ' ', inline: false }])
            else resultsEmbed.addFields([{ name: '\u200b', value: ' ', inline: false }])
            resultsEmbed.addFields([{ name: 'Winner', value: result }])
            return interaction.channel.send({ embeds: [resultsEmbed] })
        })
    }
    catch(e)
    {
        console.log(e)
    }}
};
