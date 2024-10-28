import { APIServer } from "./api";
import { client } from "./discord";

class PMCBot {
  private apiServer: APIServer;
  private discordBot: typeof client;

  constructor() {
    this.apiServer = new APIServer();
    this.discordBot = client;
  }

  public async start() {
    try {
      await this.discordBot.start();
      this.apiServer.start();

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