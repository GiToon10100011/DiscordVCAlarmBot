require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel],
});

// Configuration - replace with array of voice channels to monitor
const TARGET_VOICE_CHANNELS = [
  process.env.TARGET_VOICE_CHANNEL1_ID,
  process.env.TARGET_VOICE_CHANNEL2_ID,
];
const NOTIFICATION_CHANNEL_ID = process.env.NOTIFICATION_CHANNEL_ID;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("voiceStateUpdate", (oldState, newState) => {
  // Get the notification channel
  const notificationChannel = client.channels.cache.get(
    NOTIFICATION_CHANNEL_ID
  );
  if (!notificationChannel) return;

  const user = oldState.member?.user || newState.member?.user;
  if (!user) return;

  // Case 1: User joined one of our target VCs from outside (not from another target VC)
  if (
    TARGET_VOICE_CHANNELS.includes(newState.channelId) &&
    !TARGET_VOICE_CHANNELS.includes(oldState.channelId)
  ) {
    const channelName = newState.channel
      ? newState.channel.name
      : "unknown channel";

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`🔊 ${channelName}`)
      .setDescription(`**${user.username}** has joined this voice channel!`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields({
        name: "Time",
        value: `${new Date().toLocaleTimeString()}`,
        inline: true,
      })
      .setFooter({ text: "Voice Channel Monitor" })
      .setTimestamp();

    notificationChannel.send({ embeds: [embed] });
  }

  // Case 2: User switched from one target VC to another target VC
  else if (
    TARGET_VOICE_CHANNELS.includes(newState.channelId) &&
    TARGET_VOICE_CHANNELS.includes(oldState.channelId) &&
    newState.channelId !== oldState.channelId
  ) {
    const oldChannelName = oldState.channel
      ? oldState.channel.name
      : "unknown channel";
    const newChannelName = newState.channel
      ? newState.channel.name
      : "unknown channel";

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle(`🔄 ${newChannelName}`)
      .setDescription(
        `**${user.username}** switched from **${oldChannelName}** to this channel!`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields({
        name: "Time",
        value: `${new Date().toLocaleTimeString()}`,
        inline: true,
      })
      .setFooter({ text: "Voice Channel Monitor" })
      .setTimestamp();

    notificationChannel.send({ embeds: [embed] });
  }

  // Case 3: User disconnected from one of our target VCs
  else if (
    TARGET_VOICE_CHANNELS.includes(oldState.channelId) &&
    !TARGET_VOICE_CHANNELS.includes(newState.channelId)
  ) {
    const channelName = oldState.channel
      ? oldState.channel.name
      : "unknown channel";

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle(`👋 ${channelName}`)
      .setDescription(`**${user.username}** has left this voice channel!`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields({
        name: "Time",
        value: `${new Date().toLocaleTimeString()}`,
        inline: true,
      })
      .setFooter({ text: "Voice Channel Monitor" })
      .setTimestamp();

    notificationChannel.send({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
