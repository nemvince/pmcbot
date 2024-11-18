import * as ping from "./commands/ping";
import * as link from "./commands/link";
import * as unlink from "./commands/unlink";
import * as username from "./commands/username";
import * as auth from "./commands/authorize";
import { config } from "@/utils/config";
import { REST, Routes, Client, EmbedBuilder, type Interaction } from "discord.js";

export const commands = {
  ping,
  link,
  unlink,
  username,
  auth
};

export class DiscordBot {
  public client: Client;
  private rest: REST;
  private commandsData: unknown[];

  constructor() {
    this.client = new Client({
      intents: ["Guilds", "GuildMessages", "DirectMessages", "GuildMembers"],
    });

    this.rest = new REST().setToken(config.discord.botToken);
    this.commandsData = Object.values(commands).map((command) => command.data);

    this.client.once("ready", this.onReady.bind(this));
    this.client.on("interactionCreate", this.onInteractionCreate.bind(this));
  }

  private async onReady() {
    console.log("Ready!");
  }

  private async onInteractionCreate(interaction: Interaction) {
    if (interaction.isCommand()) {
      const { commandName } = interaction;

      if (commands[commandName as keyof typeof commands]) {
        commands[commandName as keyof typeof commands].execute(interaction);
      }
    }

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