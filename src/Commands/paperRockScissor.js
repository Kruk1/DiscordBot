const { SlashCommandBuilder, bold, EmbedBuilder} = require("@discordjs/builders");
const options = ['rock', 'paper', 'scissors']


module.exports = {
  data: new SlashCommandBuilder()
    .setName("rock-paper-scissors")
    .setDescription("Play rock, paper and scissors!")
    .addStringOption(option =>
        option.setName('choice')
        .setDescription('Your choice')
        .setRequired(true)
        .addChoices(
            { name: 'Rock', value: 'rock' },
            { name: 'Paper', value: 'paper' },
            { name: 'Scissors', value: 'scissors' },
        )
    )
    .addUserOption(option =>
        option.setName('user')
        .setDescription('Duel with someone')
    ),
  execute: async (interaction, client) => {

    const filter = response => {
        if(interaction.options.getUser('user'))
            return options.some(option => option.toLowerCase() === response.content.toLowerCase()) && interaction.options.getUser('user').id === response.author.id && response.author.id !== interaction.user.id;
        return options.some(option => option.toLowerCase() === response.content.toLowerCase()) && response.author.id !== interaction.user.id;
    };

    if(!interaction.options.getUser('user'))
    {
        await interaction.reply("Waiting for opponent... Write rock, paper, scissors to play!")
        .then(() =>
        {
            interaction.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
                .then(collected => {
                    const choice = interaction.options.getString('choice')
                    if(choice === collected.first().content) {
                        return interaction.followUp(bold(`Draw! Play again`))
                    }
                    else if(choice === 'rock')
                    {
                        if(collected.first().content !== 'paper')
                        {
                            return interaction.followUp(`Winner is <@${interaction.user.id}>!`)
                        }
                    }
                    else if(choice === 'paper')
                    {
                        if(collected.first().content !== 'scissors')
                        {
                            return interaction.followUp(`Winner is <@${interaction.user.id}>!`)
                        }
                    }
                    else if(choice === 'scissors')
                    {
                        if(collected.first().content !== 'rock')
                        {
                            return interaction.followUp(`Winner is <@${interaction.user.id}>!`)
                        }
                    }
                    return interaction.followUp(`Winner is <@${collected.first().author.id}>!`)
                })
                .catch(collected => {
                    interaction.followUp('Nobody want to play!')
                });
        })
    }
    else
    {
        const user = interaction.options.getUser('user')
        const choice = interaction.options.getString('choice')

        if(user.id === interaction.user.id) return interaction.reply(bold(`You cant play with yourself!`))

        await interaction.reply(`Waiting for <@${user.id}>...`)
        .then(() =>
        {
            interaction.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
                .then(collected => {
                    let winner = collected.first().author.id
                    const drawEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Draw!')
                    if(choice === collected.first().content) {
                        return interaction.channel.send({ embeds: [drawEmbed] })
                    }
                    else if(choice === 'rock')
                    {
                        if(collected.first().content !== 'paper')
                        {
                            winner = interaction.user.id
                        }
                    }
                    else if(choice === 'paper')
                    {
                        if(collected.first().content !== 'scissors')
                        {
                            winner = interaction.user.id
                        }
                    }
                    else if(choice === 'scissors')
                    {
                        if(collected.first().content !== 'rock')
                        {
                            winner = interaction.user.id
                        }
                    }
                    const winnerEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Winner')
                    .setDescription(`<@${winner}>`)
                    return interaction.channel.send({ embeds: [winnerEmbed] })
                })
                .catch(collected => {
                    interaction.followUp(`<@${user.id}> didnt respond!`)
                });
        })
    }
  },
};
