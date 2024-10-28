import { CommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { config } from "@/utils/config";
import { prisma } from "@/utils/prisma";

export const data = new SlashCommandBuilder()
  .setName("link")
  .setDescription("Csatold a Microsoft fiókodat a Discord fiókodhoz.");

export async function execute(interaction: CommandInteraction) {
  const waitEmbed = new EmbedBuilder()
    .setTitle('Microsoft fiók csatlakoztatása')
    .setDescription('Kérlek várj, mindjárt küldök egy üzenetet a Microsoft fiókod csatlakoztatásához.')
    .setColor('Yellow')
    .setTimestamp();

  await interaction.reply({
    embeds: [ waitEmbed ],
    ephemeral: true,
  });

  const authUrl = `https://login.microsoftonline.com/` +
    `${config.microsoft.tenantId}` +
    `/oauth2/v2.0/authorize?` +
    `client_id=${config.microsoft.clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(config.microsoft.redirectUri)}` +
    `&scope=${encodeURIComponent(config.microsoft.scopes)}` +
    `&state=${interaction.user.id}`; // Pass Discord user ID as state

  const embed = new EmbedBuilder()
    .setTitle('Microsoft fiók csatlakoztatása')
    .setDescription('Kérlek kattints az alábbi gombra a Microsoft fiókod csatlakoztatásához.')
    .setColor('Green')
    .setTimestamp();

  const user = await prisma.user.findUnique({
    where: { discord_id: interaction.user.id }
  });

  if (!user) {
    await prisma.user.create({
      data: {
        discord_id: interaction.user.id
      }
    });
  }

  let components: any[] = []

  if (user?.microsoft_id) {
    embed.setDescription('A Microsoft fiókod már csatlakoztatva van!');
    embed.setColor('Red');
  } else {
    components = [{
      type: 1,
      components: [{
        type: 2,
        style: 5,
        label: 'Fiók csatlakoztatása',
        url: authUrl
      }]
    }];
  }

  const userMessage = await interaction.user.send({
    embeds: [ embed ],
    components
  });

  waitEmbed.setDescription('Az üzenet elküldve a privát üzeneteid közé.');
  waitEmbed.setColor('Green');
  await interaction.editReply({
    embeds: [ waitEmbed ],
  });

  console.log(`Sent link message with ID ${userMessage.id}`);
}