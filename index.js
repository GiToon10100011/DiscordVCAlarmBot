require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ApplicationCommandOptionType,
  Events,
  REST,
  Routes,
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

// NTFY configuration
const NTFY_TOPIC = process.env.NTFY_TOPIC;

// AFK Configuration
let afkMode = false;
let afkMessage = "I'm currently AFK. I'll be back soon!";
let afkTextChannelId = process.env.NOTIFICATION_CHANNEL_ID;
let usersJoinedDuringAfk = new Set(); // Track users who joined during AFK mode

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Register slash commands
  const commands = [
    {
      name: "afk",
      description: "Manage AFK mode",
      options: [
        {
          name: "action",
          description: "Turn AFK mode on or off",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: "On", value: "on" },
            { name: "Off", value: "off" },
          ],
        },
        {
          name: "message",
          description: "Custom AFK message",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: "channel",
          description: "Channel to send AFK notifications to",
          type: ApplicationCommandOptionType.Channel,
          required: false,
        },
      ],
    },
    {
      name: "status",
      description: "Display current bot settings and status",
    },
  ];

  try {
    const rest = new REST({ version: "10" }).setToken(
      process.env.DISCORD_TOKEN
    );
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
    console.log("Slash commands registered");
  } catch (error) {
    console.error("Error registering slash commands:", error);
  }
});

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "afk") {
    // Only allow the specified user to use this command
    if (interaction.user.id !== YOUR_DISCORD_USER_ID) {
      return interaction.reply({
        content: "Sorry, only the bot owner can use this command.",
        ephemeral: true,
      });
    }

    const action = interaction.options.getString("action");

    if (action === "on") {
      afkMode = true;

      // Set custom message if provided
      const customMessage = interaction.options.getString("message");
      if (customMessage) {
        afkMessage = customMessage;
      }

      // Set text channel if provided
      const channel = interaction.options.getChannel("channel");
      if (channel) {
        afkTextChannelId = channel.id;
      }

      return interaction.reply({
        content: `AFK mode enabled with message: "${afkMessage}" in ${
          afkTextChannelId ? `<#${afkTextChannelId}>` : "no channel specified"
        }`,
        ephemeral: true,
      });
    } else if (action === "off") {
      afkMode = false;

      // Notify users who joined during AFK mode that you're back
      if (usersJoinedDuringAfk.size > 0 && afkTextChannelId) {
        try {
          const channel = await client.channels.fetch(afkTextChannelId);
          if (channel) {
            const userMentions = Array.from(usersJoinedDuringAfk)
              .map((id) => `<@${id}>`)
              .join(" ");
            await channel.send(`${userMentions} I'm back now!`);
          }
        } catch (error) {
          console.error("Error sending return message:", error);
        }
      }

      // Clear the list of users
      usersJoinedDuringAfk.clear();

      return interaction.reply({
        content:
          "AFK mode disabled. Only regular notifications will be active.",
        ephemeral: true,
      });
    }
  } else if (interaction.commandName === "status") {
    // Only allow the specified user to use this command
    if (interaction.user.id !== YOUR_DISCORD_USER_ID) {
      return interaction.reply({
        content: "Sorry, only the bot owner can use this command.",
        ephemeral: true,
      });
    }

    try {
      // Get monitored channels
      const monitoredChannels = [];
      for (const channelId of TARGET_VOICE_CHANNELS) {
        if (channelId) {
          try {
            const channel = await client.channels.fetch(channelId);
            if (channel) {
              monitoredChannels.push(`${channel.name} (${channelId})`);
            } else {
              monitoredChannels.push(`Unknown (${channelId})`);
            }
          } catch (err) {
            monitoredChannels.push(`Error fetching channel (${channelId})`);
          }
        }
      }

      // Get notification channel info
      let notificationChannelName = "Not set";
      if (afkTextChannelId) {
        try {
          const channel = await client.channels.fetch(afkTextChannelId);
          if (channel) {
            notificationChannelName = `#${channel.name} (${afkTextChannelId})`;
          } else {
            notificationChannelName = `Unknown (${afkTextChannelId})`;
          }
        } catch (err) {
          notificationChannelName = `Error fetching channel (${afkTextChannelId})`;
        }
      }

      // Get users who joined during AFK
      const afkUsers =
        Array.from(usersJoinedDuringAfk)
          .map((id) => `<@${id}>`)
          .join(", ") || "None";

      // Create status embed
      const embed = new EmbedBuilder()
        .setColor(afkMode ? 0x57f287 : 0xe74c3c)
        .setTitle("📊 Voice Channel Monitor Status")
        .addFields(
          {
            name: "AFK Mode",
            value: afkMode ? "✅ Enabled" : "❌ Disabled",
            inline: true,
          },
          {
            name: "Notification Channel",
            value: notificationChannelName,
            inline: true,
          },
          {
            name: "AFK Message",
            value: afkMessage || "Not set",
            inline: false,
          },
          {
            name: "Monitored Voice Channels",
            value: monitoredChannels.join("\n") || "None",
            inline: false,
          }
        )
        .setFooter({ text: "Voice Channel Monitor" })
        .setTimestamp();

      // Add users who joined during AFK if any
      if (afkMode && usersJoinedDuringAfk.size > 0) {
        embed.addFields({
          name: "Users Joined During AFK",
          value: afkUsers,
          inline: false,
        });
      }

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error displaying status:", error);
      return interaction.reply({
        content: `Error displaying status: ${error.message}`,
        ephemeral: true,
      });
    }
  }
});

// Send webhook notification
async function sendWebhookNotification(title, message) {
  try {
    // Put title in the first line of the message instead of using headers
    const fullMessage = `${title}\n\n${message}`;

    await axios({
      method: "post",
      url: `https://ntfy.sh/${NTFY_TOPIC}`,
      data: fullMessage,
      headers: {
        "Content-Type": "text/plain; charset=UTF-8",
      },
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

// Send AFK message to channel
async function sendAfkMessage(userId, channelName) {
  try {
    if (!afkTextChannelId) return;

    const channel = await client.channels.fetch(afkTextChannelId);
    if (!channel) return;

    usersJoinedDuringAfk.add(userId);

    await channel.send(`<@${userId}> ${afkMessage} (Joined ${channelName})`);
  } catch (error) {
    console.error("Error sending AFK message:", error);
  }
}

client.on("voiceStateUpdate", (oldState, newState) => {
  const user = oldState.member?.user || newState.member?.user;
  if (!user) return;

  // Check if this is YOU returning from being AFK
  if (
    user.id === YOUR_DISCORD_USER_ID && // This is you
    afkMode && // AFK mode is active
    oldState.channelId === null && // You were not in a voice channel before
    newState.channelId !== null // You've joined a voice channel now
  ) {
    // You've returned while in AFK mode, so notify all users who joined during your absence
    if (usersJoinedDuringAfk.size > 0 && afkTextChannelId) {
      try {
        const channel = client.channels.cache.get(afkTextChannelId);
        if (channel) {
          const userMentions = Array.from(usersJoinedDuringAfk)
            .map((id) => `<@${id}>`)
            .join(" ");
          channel.send(`${userMentions} 다시 돌아옴 ㅋㅋ`);

          // Turn off AFK mode and clear the list
          afkMode = false;
          usersJoinedDuringAfk.clear();

          // Notify you that AFK mode was automatically disabled
          const user = client.users.cache.get(YOUR_DISCORD_USER_ID);
          if (user) {
            user.send(
              "AFK mode has been automatically disabled because you returned."
            );
          }
        }
      } catch (error) {
        console.error("Error sending return message:", error);
      }
    }
  }

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

    // Send ntfy notification
    sendWebhookNotification(
      `🔊 ${channelName}`,
      `${user.username} has joined this voice channel!\n\nTime: ${time}\n\nVoice Channel Monitor`
    ).catch((error) => console.error(`Failed to send ntfy:`, error.message));

    // Check if AFK mode is on and if the owner is in the VC the user joined
    if (afkMode && newState.channel?.members.has(YOUR_DISCORD_USER_ID)) {
      // Someone joined your VC while you're AFK
      if (user.id !== YOUR_DISCORD_USER_ID) {
        sendAfkMessage(user.id, channelName);
      }
    }
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

    // Check if AFK mode is on and if the owner is in the VC the user switched to
    if (afkMode && newState.channel?.members.has(YOUR_DISCORD_USER_ID)) {
      // Someone switched to your VC while you're AFK
      if (user.id !== YOUR_DISCORD_USER_ID) {
        sendAfkMessage(user.id, newChannelName);
      }
    }
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
