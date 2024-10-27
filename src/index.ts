
import * as ping from "./commands/ping";
import config from "./config";

import { REST, Routes, Client } from "discord.js";

export const commands = {
  ping,
};

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST().setToken(config.DISCORD_BOT_TOKEN);

const client = new Client({
  intents: [
    "Guilds", "GuildMessages", "DirectMessages"
  ]
});

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(config.DISCORD_APP_ID, config.DISCORD_GUILD_ID),
      { body: commandsData },
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

client.once("ready", () => {
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

client.login(config.DISCORD_BOT_TOKEN);