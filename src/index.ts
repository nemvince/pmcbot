import { app } from "./api";
import { client } from "./discord";
import { wss } from "./wss";

class PMCBot {
  private apiServer: typeof app;
  private discordBot: typeof client;

  constructor() {
    this.apiServer = app;
    this.discordBot = client;
  }

  public async start() {
    try {
      await this.discordBot.start();
      this.apiServer.start();
      wss.start();

      this.setupGracefulShutdown();
    } catch (error) {
      console.error(error);
    }
  }

  private setupGracefulShutdown() {
    process.on("SIGINT", async () => {
      console.log("Shutting down...");
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("Shutting down...");
      process.exit(0);
    });
  }
}

const bot = new PMCBot();
bot.start();