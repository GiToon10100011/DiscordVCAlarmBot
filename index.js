require("dotenv").config();
const nodemailer = require("nodemailer");
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
    GatewayIntentBits.DirectMessages, // Add this intent for DMs
  ],
  partials: [Partials.Channel, Partials.Message], // Add Channel and Message partials for DMs
});

// Configuration - replace with your actual IDs
const TARGET_VOICE_CHANNELS = [
  process.env.TARGET_VOICE_CHANNEL1_ID,
  process.env.TARGET_VOICE_CHANNEL2_ID,
];
const USER_ID_TO_DM = process.env.USER_ID_TO_DM; // Your Discord user ID here

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASS,
  },
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Send email notification
async function sendEmailNotification(subject, htmlBody) {
  try {
    await transporter.sendMail({
      from: `"Discord Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: subject,
      html: htmlBody,
    });
  } catch (error) {
    console.error("Error sending email notification:", error);
  }
}

// Send Discord DM
async function sendDiscordDM(message) {
  try {
    const user = await client.users.fetch(USER_ID_TO_DM);
    if (!user) {
      console.error("Could not find Discord user to DM");
      return;
    }

    await user.send(message);
    console.log("Discord DM sent");
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

    // Send email
    sendEmailNotification(
      `🔊 ${user.username} joined ${channelName}`,
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #3498db;">Voice Channel Join Alert</h2>
        <p style="font-size: 16px;"><strong>${user.username}</strong> has joined the voice channel <strong>${channelName}</strong>!</p>
        <p style="color: #666;">Time: ${time}</p>
      </div>`
    );

    // Send Discord DM
    sendDiscordDM(
      `🔊 **${user.username}** has joined **${channelName}**!\nTime: ${time}`
    );
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

    // Send email
    sendEmailNotification(
      `🔄 ${user.username} switched to ${newChannelName}`,
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #e67e22;">Voice Channel Switch Alert</h2>
        <p style="font-size: 16px;"><strong>${user.username}</strong> switched from <strong>${oldChannelName}</strong> to <strong>${newChannelName}</strong>!</p>
        <p style="color: #666;">Time: ${time}</p>
      </div>`
    );

    // Send Discord DM
    sendDiscordDM(
      `🔄 **${user.username}** switched from **${oldChannelName}** to **${newChannelName}**!\nTime: ${time}`
    );
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

    // Send email
    sendEmailNotification(
      `👋 ${user.username} left ${channelName}`,
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #e74c3c;">Voice Channel Leave Alert</h2>
        <p style="font-size: 16px;"><strong>${user.username}</strong> has left the voice channel <strong>${channelName}</strong>!</p>
        <p style="color: #666;">Time: ${time}</p>
      </div>`
    );

    // Send Discord DM
    sendDiscordDM(
      `👋 **${user.username}** has left **${channelName}**!\nTime: ${time}`
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
