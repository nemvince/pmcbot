const { DISCORD_APP_ID, DISCORD_BOT_TOKEN, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_BOT_TOKEN || !DISCORD_APP_ID || !DISCORD_GUILD_ID) {
  throw new Error("Missing environment variables");
}

export default {
  DISCORD_APP_ID,
  DISCORD_BOT_TOKEN,
  DISCORD_GUILD_ID,
};