import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle, type ModalActionRowComponentBuilder } from "discord.js";


export const data = new SlashCommandBuilder()
  .setName("username")
  .setDescription("Minecraft felhasználónév beállítása.");

export async function execute(interaction: CommandInteraction) {
  const usernameInput = new TextInputBuilder()
    .setCustomId('link-success-username')
    .setLabel('Felhasználónév')
    .setPlaceholder('A szerveren használt felhasználónév')
    .setRequired(true)
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(16);

  const modalActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(usernameInput);

  const modal = new ModalBuilder()
    .setCustomId('link-success-modal')
    .setTitle('Minecraft felhasználónév beállítása')
    .addComponents(modalActionRow)

  await interaction.showModal(modal);
}