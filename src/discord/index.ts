import * as ping from "./commands/ping";
import * as link from "./commands/link";
import * as unlink from "./commands/unlink";
import * as username from "./commands/username";
import { config } from "@/utils/config";
import { REST, Routes, Client, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, type ModalActionRowComponentBuilder, ButtonBuilder, ButtonStyle, type MessageActionRowComponentBuilder } from "discord.js";
import { prisma } from "@/utils/prisma";

export const commands = {
  ping,
  link,
  unlink,
  username
};

export class DiscordBot {
  private client: Client;
  private rest: REST;
  private commandsData: any[];

  constructor() {
    this.client = new Client({
      intents: ["Guilds", "GuildMessages", "DirectMessages"],
    });

    this.rest = new REST().setToken(config.discord.botToken);
    this.commandsData = Object.values(commands).map((command) => command.data);

    this.client.once("ready", this.onReady.bind(this));
    this.client.on("interactionCreate", this.onInteractionCreate.bind(this));
  }

  private async onReady() {
    console.log("Ready!");
  }

  private async onInteractionCreate(interaction: any) {
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'link-success-modal') {
        const embed = new EmbedBuilder()
          .setTitle('Minecraft felhasználónév beállítása')
          .setTimestamp();

        const user = await prisma.user.findUnique({
          where: { discord_id: interaction.user.id }
        });

        if (!user) {
          return;
        }

        if (!user.microsoft_id) {
          return;
        }

        const username = interaction.fields.getTextInputValue('link-success-username');

        const usernameTaken = await prisma.user.findFirst({
          where: { mc_username: username }
        });

        if (usernameTaken) {
          embed.setDescription('Ez a felhasználónév már foglalt!');
          embed.setColor('Red');
          interaction.reply({ embeds: [embed] });

          return;
        }

        embed.setTitle('Minecraft felhasználónév beállítása - Biztosan?');
        embed.setDescription(`VIGYÁZZ! Ha a felhasználóneved megváltoztatod, elveszik az összes eddigi adatod! Biztosan a(z) "${username}" nevet szeretnéd használni?`);

        const confirm = new ButtonBuilder()
          .setCustomId('confirm')
          .setLabel('Igen, megváltoztatom')
          .setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
          .setCustomId('cancel')
          .setLabel('Mégsem')
          .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<MessageActionRowComponentBuilder>()
          .addComponents(confirm, cancel);

        const response = await interaction.reply({
          embeds: [embed],
          components: [row],
          ephemeral: true
        })

        const collectorFilter = (i: { user: { id: any; }; }) => i.user.id === interaction.user.id;
        try {
          const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

          if (confirmation.customId === 'confirm') {
            await prisma.user.update({
              where: { discord_id: interaction.user.id },
              data: {
                mc_username: username
              }
            });

            embed.setDescription('Minecraft felhasználónév sikeresen beállítva!');
            embed.setColor('Green');
            interaction.editReply({ embeds: [embed] });
            confirmation.update({ content: 'OK', components: [] });
          } else if (confirmation.customId === 'cancel') {
            await confirmation.update({ content: 'Törölve', components: [] });
          }
        } catch (e) {
          await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }
        return;
      }
    }

    if (interaction.isCommand()) {
      const { commandName } = interaction;

      if (commands[commandName as keyof typeof commands]) {
        commands[commandName as keyof typeof commands].execute(interaction);
      }
    };

    return;
  }

  public async start() {
    try {
      console.log("Started refreshing application (/) commands.");

      await this.rest.put(
        Routes.applicationGuildCommands(config.discord.appId, config.discord.guildId),
        { body: this.commandsData },
      );

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }

    await this.client.login(config.discord.botToken);
  }

  public async sendSuccessfulLinkMessage(userId: string) {
    const embed = new EmbedBuilder()
      .setTitle('Microsoft fiók csatlakoztatása')
      .setDescription('Sikeresen csatlakoztattad a Microsoft fiókod a Discord fiókodhoz! Kérlek add meg a Minecrat felhasználónevedet, a szerveren a "/username" parancs segítségével.')
      .setColor('Green')
      .setTimestamp();

    await this.client.users.fetch(userId).then((user) => {
      user.send({ embeds: [embed] });
    });
  };
}

export const client = new DiscordBot();