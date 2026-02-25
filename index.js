require('dotenv').config();
const express = require("express");
const { Client, GatewayIntentBits, Partials } = require('discord.js');

// Web server
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Bot aktif");
});

app.listen(PORT, () => {
    console.log(`Web server çalışıyor, port: ${PORT}`);
});

// Discord Bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const TOKEN = process.env.TOKEN;

const EMOJIS = ["🔼", "🔽"];
const ALLOWED_CHANNELS = ["1475574304472305836","1475902546462904612","1475904157692072127"]; // buraya kanal ID'lerini yaz

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!ALLOWED_CHANNELS.includes(message.channel.id)) return;
    if (message.attachments.size === 0) return;

    const hasMedia = message.attachments.some(att => {
        const type = att.contentType || "";
        const name = att.name || "";
        return (
            type.startsWith("image/") ||
            type.startsWith("video/") ||
            name.match(/\.(png|jpg|jpeg|gif|webp|mp4|mov|webm)$/i)
        );
    });

    if (!hasMedia) return;

    const delay = Math.floor(Math.random() * 5000) + 5000;

    setTimeout(async () => {
        try {
            for (const emoji of EMOJIS) {
                await message.react(emoji);
            }
        } catch (err) {
            console.error(err);
        }
    }, delay);
});

client.once("ready", async () => {
    console.log(`Bot giriş yaptı: ${client.user.tag}`);

    for (const channelId of ALLOWED_CHANNELS) {
        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel) continue;

            const messages = await channel.messages.fetch({ limit: 30 });

            for (const message of messages.values()) {
                if (message.author.bot) continue;
                if (message.attachments.size === 0) continue;

                const hasMedia = message.attachments.some(att => {
                    const type = att.contentType || "";
                    const name = att.name || "";
                    return (
                        type.startsWith("image/") ||
                        type.startsWith("video/") ||
                        name.match(/\.(png|jpg|jpeg|gif|webp|mp4|mov|webm)$/i)
                    );
                });

                if (!hasMedia) continue;

                const existingReactions = message.reactions.cache.map(r => r.emoji.name);

                for (const emoji of EMOJIS) {
                    if (!existingReactions.includes(emoji)) {
                        await message.react(emoji);
                    }
                }
            }
        } catch (err) {
            console.error("Geçmiş kontrol hatası:", err);
        }
    }
});

client.login(TOKEN);