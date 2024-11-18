import { CommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { prisma } from "@/utils/prisma";

export const data = new SlashCommandBuilder()
  .setName("unlink")
  .setDescription("Csatolás megszüntetése a Microsoft fiókod és a Discord fiókod között.");

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const embed = new EmbedBuilder()
    .setTitle('Microsoft fiók csatlakoztatásának megszüntetése')
    .setTimestamp();

  const user = await prisma.user.findUnique({
    where: { discord_id: interaction.user.id }
  });

  if (!user) {
    embed.setDescription('A Discord fiókodhoz nem tartozik Microsoft fiók!');
    embed.setColor('Red');
    return interaction.editReply({ embeds: [ embed ] });
  }

  if (!user.microsoft_id) {
    embed.setDescription('A Discord fiókodhoz nem tartozik Microsoft fiók!');
    embed.setColor('Red');
    return interaction.editReply({ embeds: [ embed ] });
  }

  await prisma.user.update({
    where: { discord_id: interaction.user.id },
    data: {
      microsoft_id: null,
      email: null,
      name: null
    }
  });

  embed.setDescription('A Microsoft fiókod sikeresen leválasztva a Discord fiókodról!');
  embed.setColor('Green');
  interaction.editReply({ embeds: [ embed ] });
}