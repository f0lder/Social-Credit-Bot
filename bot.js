const { DiscordJS, Client, Intents } = require("discord.js");
const { MongoClient } = require("mongodb");

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    "GUILD_MEMBERS",
    "8",
    "GUILDS",
    "GUILD_MESSAGES",
  ],
});
//const dbClient = new MongoClient(URL);
const guildID = "861250776222924840";
const Login = require("./getVar.js");

const dbClient = new MongoClient(Login.MongoL);

async function insert(doc) {
  try {
    await dbClient.connect();
    const database = dbClient.db("discord");
    const logs = database.collection("credit");

    const result = await logs.insertMany(doc);
    //console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } finally {
    await dbClient.close();
    console.log(doc);
  }
}
async function infraction(penalty, userId, numberOfInfractions) {
  try {
    await dbClient.connect();
    const database = dbClient.db("discord");
    const users = database.collection("credit");
    const oldCred = await users.findOne({ id: userId });

    await users.updateOne(
      { id: userId },
      {
        $set: { cred: oldCred.cred - penalty }, //omg i dit it nope maybe?
        $inc: { infractions: numberOfInfractions },
      }
    );
    console.log(oldCred.cred - penalty);
  } finally {
    await dbClient.close();
  }
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setPresence({
    activity: { name: "citizens.", type: "WATCHING" },
    status: "dnd",
  });

  const guild = client.guilds.cache.get(guildID);
  // Fetch all members from a guild

  let commands;

  if (guild) {
    commands = guild.commands;
  } else {
    commands = client.application?.commands;
  }

  commands?.create({
    name: "credit",
    description: "my Social Credit",
  });
  commands?.create({
    name: "init",
    description: "Submit your server to the Spureme Leader Kim Jong-un",
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  async function myCred(id) {
    try {
      await dbClient.connect();
      const database = dbClient.db("discord");
      const users = database.collection("credit");

      const cred = users.find({ id: id });
      await cred.forEach((e) => {
        if (e.cred < 0) {
          var d = new Date();
          d.setDate(d.getDate() + 10);
          var m = "Your execution date is: " + d.toString();
        } else {
          var m = "";
        }
        interaction.reply({
          content: "Your social credit is " + e.cred + ". " + m,
          ephemeral: true,
        });
      });
    } finally {
      await dbClient.close();
      infraction(1, id, 1);
    }
  }

  if (commandName === "credit") {
    myCred(interaction.member.user.id);
  }
  if (
    commandName === "init" &&
    interaction.member.user.id == "266526587636154370"
  ) {
    var Users = [];
    const guild = client.guilds.cache.get(guildID);
    guild.members.fetch().then((members) => {
      // Loop through every members
      members.forEach((member) => {
        if (!member.user.bot) {
          var Slave = {
            name: member.user.username,
            id: member.user.id,
            infractions: 0,
            cred: 1000,
          };
          Users.push(Slave);
        }
      });
      insert(Users);
    });
    interaction.reply({ content: "Thank you.", ephemeral: true });
  }
});

const badWords = [
  "taiwan",
  "tiananmen",
  "square",
  "lao gan ma",
  "winnie the pooh",
  "XinJiang",
  "manga",
  "anime",
  "social credit",
  "government",
  "Xi Jinping",
  "Tibet",
  "Otoya Yamaguchi",
  "communism",
  "human rights",
  "independence",
  "freedom",
  "uyghur",
  "Dalai Lama",
  "Falun Dafa",
  "Liu Xiaobo",
  "Republic of China",
  "1989 august",
  "proletarian cultural revolution",
  "emperor",
  "nuclear warfare",
  "weapons",
  "protest",
  "gamer",
  "2 kids",
  "US",
  "America",
  "Western, Multi-party system",
  "torture",
  "organ harvesting",
  "abduction",
  "aggession",
  "plunder",
  "destruction",
  "prostitution",
  "gambling",
  "drugs",
  "lottery",
  "riots",
  "harassment",
  "Mao Zedong",
  "concentration camps",
  "camps",
  "working camps",
  "slavery",
  "Hu Yaobang",
  "gay",
];
client.on("messageCreate", (message) => {
  if (message.author.tag != client.user.tag && message.content) {
    infraction(1, message.author.id, 1);
    console.log(message.content);
  }
  if (message.content.includes("https")) {
    infraction(5, message.author.id, 1);
  }
  if (message.content) {
    var localPennalty = 0;
    var LocalInfractions = 0;
    for (var i = 0; i < badWords.length; i++) {
      if (message.content.includes(badWords[i])) {
        localPennalty = localPennalty + 50;
        LocalInfractions++;
      }
    }
    if (localPennalty && LocalInfractions) {
      infraction(localPennalty, message.author.id, LocalInfractions);
      console.log("Infraction on this message ", LocalInfractions);
    }
  }
  if (message.attachments.size > 0) {
    infraction(10, message.author.id, 1);
  }
});
client.login(Login.Token);
