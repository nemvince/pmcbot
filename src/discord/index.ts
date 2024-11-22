import { config } from "@/utils/config";
import adze from "adze";
import { REST, Routes, Client, EmbedBuilder, type Interaction, Collection, SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const logger = new adze({ showTimestamp: true }).namespace('DSC').seal();

interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: Interaction) => void;
}

export class DiscordBot {
  public client: Client;
  private rest: REST;
  private commandsData: Collection<string, Command> = new Collection();

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
        logger.log(`Loaded command ${command.data.name} from ${filePath}`);
        this.commandsData.set(command.data.name, command);
      } else {
        logger.error(`Command ${file} is missing data or execute function!`);
      }
    }
  }

  private async onReady() {
    logger.success(`Logged in as ${this.client.user}`);
  }

  private async onInteractionCreate(interaction: Interaction) {
    if (interaction.isCommand()) {
      const { commandName } = interaction;

      const command = this.commandsData.get(commandName);
      if (!command) return;
      command.execute(interaction);
    }

    return;
  }

  public async start() {
    try {
      await this.loadCommands();
      logger.log(`Loaded ${this.commandsData.size} commands.`);
      await this.rest.put(
        Routes.applicationGuildCommands(config.discord.appId, config.discord.guildId),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { body: this.commandsData.map((command: any) => command.data.toJSON()) }
      );

      logger.success('Successfully registered application commands.');
    } catch (error) {
      logger.fail('Failed to register application commands.');
      logger.error(error);
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