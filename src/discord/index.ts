import * as ping from "./commands/ping";
import * as link from "./commands/link";
import * as unlink from "./commands/unlink";
import * as username from "./commands/username";
import * as auth from "./commands/authorize";
import { config } from "@/utils/config";
import { REST, Routes, Client, EmbedBuilder, type Interaction, Collection } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const commands = {
  ping,
  link,
  unlink,
  username,
  auth
};


export class DiscordBot {
  public client: Client;
  private rest: REST;
  private commandsData: Collection<string, unknown> = new Collection();

  constructor() {
    this.client = new Client({
      intents: ["Guilds", "GuildMessages", "DirectMessages", "GuildMembers"],
    });

    this.rest = new REST().setToken(config.discord.botToken);

    this.commandsData = new Collection();

    this.client.once("ready", this.onReady.bind(this));
    this.client.on("interactionCreate", this.onInteractionCreate.bind(this));
  }

  private async loadCommands() {
    const foldersPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(foldersPath);
    for (const file of commandFiles) {
      const filePath = path.join(foldersPath, file);
      const command = await import(filePath);
      if ('data' in command && 'execute' in command) {
        console.log(`[INFO] Loaded command ${command.data.name} from ${filePath}`);
        this.commandsData.set(command.data.name, command);
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }

  private async onReady() {
    console.log("Discord bot ready!");
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
      await this.loadCommands();
      console.log("Started refreshing application (/) commands.");
      await this.rest.put(
        Routes.applicationGuildCommands(config.discord.appId, config.discord.guildId),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { body: this.commandsData.map((command: any) => command.data.toJSON()) }
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