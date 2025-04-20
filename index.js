require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
} = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

// Discord configuration
const TARGET_VOICE_CHANNELS = [
  process.env.TARGET_VOICE_CHANNEL1_ID,
  process.env.TARGET_VOICE_CHANNEL2_ID,
];
const YOUR_DISCORD_USER_ID = process.env.DISCORD_USER_ID;

// NTFY configuration (optional)
const NTFY_TOPIC = process.env.NTFY_TOPIC;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Send webhook notification (optional)
async function sendWebhookNotification(title, message) {
  try {
    // Put title in the first line of the message instead of using headers
    const fullMessage = `${title}\n\n${message}`;
    
    await axios({
      method: 'post',
      url: `https://ntfy.sh/${NTFY_TOPIC}`,
      data: fullMessage,
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8'
      }
    });
  } catch (error) {
    console.error("Error sending ntfy notification:", error.message);
  }
}

// Send Discord DM
async function sendDiscordDM(messageOptions) {
  try {
    const user = await client.users.fetch(YOUR_DISCORD_USER_ID);
    if (user) {
      await user.send(messageOptions);
    }
  } catch (error) {
    console.error("Error sending Discord DM:", error);
  }
}

client.on("voiceStateUpdate", (oldState, newState) => {
  const user = oldState.member?.user || newState.member?.user;
  if (!user) return;

  // Case 1: User joined one of our target VCs
  if (
    TARGET_VOICE_CHANNELS.includes(newState.channelId) &&
    !TARGET_VOICE_CHANNELS.includes(oldState.channelId)
  ) {
    const channelName = newState.channel
      ? newState.channel.name
      : "unknown channel";
    const time = new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      dateStyle: "medium",
      timeStyle: "medium",
    });

    // Create embed
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`🔊 ${channelName}`)
      .setDescription(`**${user.username}** has joined this voice channel!`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields({
        name: "Time",
        value: time,
        inline: true,
      })
      .setFooter({ text: "Voice Channel Monitor" })
      .setTimestamp();

    // Send DM
    sendDiscordDM({ embeds: [embed] });

    // Send ntfy notification with message in the body
    sendWebhookNotification(
      `🔊 ${channelName}`,
      `${user.username} has joined this voice channel!\n\nTime: ${time}\n\nVoice Channel Monitor`
    ).catch((error) => console.error(`Failed to send ntfy:`, error.message));
  }

  // Case 2: User switched between monitored VCs
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
    const time = new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      dateStyle: "medium",
      timeStyle: "medium",
    });

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle(`🔄 ${newChannelName}`)
      .setDescription(
        `**${user.username}** switched from **${oldChannelName}** to this channel!`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields({
        name: "Time",
        value: time,
        inline: true,
      })
      .setFooter({ text: "Voice Channel Monitor" })
      .setTimestamp();

    sendDiscordDM({ embeds: [embed] });

    // Send ntfy notification
    sendWebhookNotification(
      `🔄 ${newChannelName}`,
      `${user.username} switched from ${oldChannelName} to this channel!\n\nTime: ${time}\n\nVoice Channel Monitor`
    ).catch((error) => console.error(`Failed to send ntfy:`, error.message));
  }

  // Case 3: User left a monitored VC
  else if (
    TARGET_VOICE_CHANNELS.includes(oldState.channelId) &&
    !TARGET_VOICE_CHANNELS.includes(newState.channelId)
  ) {
    const channelName = oldState.channel
      ? oldState.channel.name
      : "unknown channel";
    const time = new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      dateStyle: "medium",
      timeStyle: "medium",
    });

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle(`👋 ${channelName}`)
      .setDescription(`**${user.username}** has left this voice channel!`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields({
        name: "Time",
        value: time,
        inline: true,
      })
      .setFooter({ text: "Voice Channel Monitor" })
      .setTimestamp();

    sendDiscordDM({ embeds: [embed] });

    // Send ntfy notification
    sendWebhookNotification(
      `👋 ${channelName}`,
      `${user.username} has left this voice channel!\n\nTime: ${time}\n\nVoice Channel Monitor`
    ).catch((error) => console.error(`Failed to send ntfy:`, error.message));
  }
});

client.login(process.env.DISCORD_TOKEN);
