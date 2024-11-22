import { prisma } from "@/utils/prisma";
import { 
  CommandInteraction, 
  EmbedBuilder, 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle} from "discord.js";
import { logger } from "..";

export const data = new SlashCommandBuilder()
  .setName("username")
  .setDescription("Minecraft felhasználónév beállítása.")
  .addStringOption(o =>
    o.setName("username")
      .setDescription("A Minecraft felhasználóneved.")
      .setRequired(true)
      .setMaxLength(16)
      .setMinLength(3)
  );

export async function execute(interaction: CommandInteraction) {
  const user = await prisma.user.findUnique({
    where: { discord_id: interaction.user.id }
  });

  const errorEmbed = new EmbedBuilder()
      .setTitle('Hiba')
      .setDescription('A Discord fiókodhoz nem tartozik Microsoft fiók! Kérlek csatlakoztass egy Microsoft fiókot a Discord fiókodhoz a `/link` parancs segítségével.')
      .setColor('Red')
      .setTimestamp();

  if (!user) {
    await interaction.reply({
      embeds: [errorEmbed],
      ephemeral: true
    });
    return;
  }

  if (!user.microsoft_id) {
    await interaction.reply({
      embeds: [errorEmbed],
      ephemeral: true
    });
    return;
  }

  if (user.mc_username) {
    const existingUsernameEmbed = new EmbedBuilder()
      .setTitle('Már beállított felhasználónév')
      .setDescription(`A felhasználóneved már be van állítva: **${user.mc_username}**`)
      .setColor('Red')
      .setTimestamp();

    await interaction.reply({
      embeds: [existingUsernameEmbed],
      ephemeral: true
    });
    return;
  }

  const usernameOption = interaction.options.get("username");
  if (!usernameOption || !usernameOption.value) return;
  
  const username = usernameOption.value as string;

  const confirmEmbed = new EmbedBuilder()
    .setTitle('Felhasználónév megerősítése')
    .setDescription(`Biztosan be akarod állítani a Minecraft felhasználónevedet erre: **${username}**?\n\nEzt később már nem tudod könnyen módosítani.`)
    .setColor('Yellow');

  const confirmButtons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('username_confirm')
        .setLabel('Igen, megerősítem')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('username_cancel')
        .setLabel('Mégsem')
        .setStyle(ButtonStyle.Danger)
    );

  const response = await interaction.reply({
    embeds: [confirmEmbed],
    components: [confirmButtons],
    ephemeral: true
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter = (i: any) => 
    (i.customId === 'username_confirm' || i.customId === 'username_cancel') && 
    i.user.id === interaction.user.id;
  
  const collector = response.createMessageComponentCollector({
    filter,
    time: 60000
  });

  collector.on('collect', async (i) => {
    if (i.customId === 'username_confirm') {
      const usernameRegex = /^[a-zA-Z0-9_]{2,16}$/;
      if (!usernameRegex.test(username)) {
        const invalidEmbed = new EmbedBuilder()
          .setTitle('Érvénytelen felhasználónév')
          .setDescription('A felhasználónév csak betűket, számokat és alulvonást tartalmazhat, 2 és 16 karakter között.')
          .setColor('Red')
          .setTimestamp();

        await i.update({ 
          embeds: [invalidEmbed], 
          components: [] 
        });

        return;
      }

      const existingUsername = await prisma.user.findFirst({
        where: { mc_username: username }
      });

      if (existingUsername) {
        const existingEmbed = new EmbedBuilder()
          .setTitle('Felhasználónév foglalt')
          .setDescription('Ez a felhasználónév már foglalt. Kérlek válassz egy másikat.')
          .setColor('Red')
          .setTimestamp();

        await i.update({ 
          embeds: [existingEmbed], 
          components: [] 
        });

        return;
      }

      await prisma.user.update({
        where: { discord_id: interaction.user.id },
        data: {
          mc_username: username
        }
      });

      // change member nickname
      const guild = interaction.guild;
      if (guild) {
        try {
          const member = guild.members.cache.get(interaction.user.id);
          if (member) {
            // [original nickname] [username]
            const nickname = `${member.user.globalName} | ${username}`;
            await member.setNickname(nickname);
          }
        } catch (error) {
          logger.error(`Failed to change nickname for Discord ID ${interaction.user.id} to ${username}`, error);
        }
      }

      const successEmbed = new EmbedBuilder()
        .setTitle('Minecraft felhasználónév beállítása')
        .setDescription(`A felhasználóneved sikeresen beállítva: ${username}`)
        .setColor('Green')
        .setTimestamp();

      await i.update({ 
        embeds: [successEmbed], 
        components: [] 
      });

      logger.log(`Set Minecraft username for Discord ID ${interaction.user.id} to ${username}`);
    } else if (i.customId === 'username_cancel') {
      const cancelEmbed = new EmbedBuilder()
        .setTitle('Felhasználónév beállítás megszakítva')
        .setDescription('A felhasználónév beállítása törölve.')
        .setColor('Red')
        .setTimestamp();

      await i.update({ 
        embeds: [cancelEmbed], 
        components: [] 
      });
    }

    collector.stop();
  });

  collector.on('end', async (collected) => {
    if (collected.size === 0) {
      const timeoutEmbed = new EmbedBuilder()
        .setTitle('Időtúllépés')
        .setDescription('A megerősítés ideje lejárt.')
        .setColor('Red')
        .setTimestamp();

      await interaction.reply({ 
        embeds: [timeoutEmbed], 
        components: [] 
      });
    }
  });
}