console.log('Bot is booting...');

require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const {ButtonStyle, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const {MessageButton, MessageActionRow, EmbedBuilder} = require('discord.js');
const {config, PermissionsBitField} = require('discord.js');
const Discord = require('discord.js');
const {PublicKey, Connection} = require('@solana/web3.js');

const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
      IntentsBitField.Flags.GuildMessageReactions,
      IntentsBitField.Flags.GuildEmojisAndStickers,
    ],
  });

const verifiedRole = '1093931126080417903';

client.on('ready', (c) => {
  console.log(`${c.user.tag} is now booted and logged in!`);
});

client.on('interactionCreate', async (interaction) => {
  console.log(`${interaction.user.tag} used the command: /${interaction.commandName}`);

  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'verify') {
    const disID = interaction.user.tag;
    const walID = interaction.options.get('solana-wallet').value;
    const nftMint = new PublicKey('929ZbdDRiCbMBZVtXtZwyG2BX7FpN6xSyGbwowcd8GvR');
    const connection = new Connection('https://api.mainnet-beta.solana.com');

    console.log(disID);
    console.log(walID);
    console.log(nftMint);

    try {
      const accountInfo = await connection.getAccountInfo(new PublicKey(walID));
      console.log(accountInfo);
      if (accountInfo === null) {
        throw new Error("Error: cannot find the account");
      }
      const holdingNFT = accountInfo.owner.equals(nftMint);
      console.log('holdingNFT:', holdingNFT);

      if (holdingNFT) {
        interaction.member.roles.add(verifiedRole)
          .then(() => {
            interaction.reply({ content: 'Congratulations! You have been verified.', ephemeral: true });
          })
          .catch((error) => {
            console.error(`Failed to assign verified role: ${error}`);
            interaction.reply({ content: 'An error occurred while verifying your wallet.', ephemeral: true });
          });
      } else {
        interaction.member.roles.remove(verifiedRole)
          .then(() => {
            interaction.reply({ content: 'Sorry, we could not verify your wallet.', ephemeral: true });
          })
          .catch((error) => {
            console.error(`Failed to remove verified role: ${error}`);
            interaction.reply({ content: 'An error occurred while verifying your wallet.', ephemeral: true });
          });
      }
    } catch (error) {
      console.error(`Error verifying wallet: ${error}`);
      interaction.reply({ content: 'An error occurred while verifying your wallet.', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
