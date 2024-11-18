import { CommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { prisma } from "@/utils/prisma";
import { wss } from "@/wss";

export const data = new SlashCommandBuilder()
  .setName("auth")
  .setDescription("Belépés engedélyezése a Minecraft szerverre.")
  .addStringOption(o =>
    o.setName("code")
      .setDescription("A 6 jegyű belépő kódod.")
      .setRequired(true)
      .setMaxLength(6)
      .setMinLength(6)
  );

export async function execute(interaction: CommandInteraction) {
  const code = interaction.options.get("code");
  const user = await prisma.user.findUnique({
    where: { discord_id: interaction.user.id }
  });

  if (!user) {
    await interaction.reply({
      content: "Nem találtam a felhasználót!",
      ephemeral: true,
    });
    return;
  }

  if (!user.mc_username) {
    await interaction.reply({
      content: "Nem találtam a Minecraft felhasználónevet!",
      ephemeral: true,
    });
    return;
  }

  if (!code) {
    await interaction.reply({
      content: "Nem találtam a kódot!",
      ephemeral: true,
    });
    return;
  }

  const codeValue = code.value as string;

  const authRequest = await prisma.authRequest.findFirst({
    where: { code: codeValue, user_id: user.discord_id }
  });

  if (!authRequest) {
    await interaction.reply({
      content: "Nem találtam a belépő kódot!",
      ephemeral: true,
    });
    return;
  }

  await prisma.authRequest.delete({
    where: { id: authRequest.id }
  });

  wss.sendMessage(JSON.stringify({
    event: 'doneAuthorization',
    mc_username: user.mc_username
  }));

  const embed = new EmbedBuilder()
    .setTitle('Sikeres belépés')
    .setDescription(`Sikeresen beléptél a Minecraft szerverre a **${user.mc_username}** felhasználónévvel!`)
    .setColor('Green')
    .setTimestamp();


  await interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
}