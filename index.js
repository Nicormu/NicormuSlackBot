require("dotenv").config();
const axios = require("axios");
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

// --- UTILITY BUT MAKE IT SASSY ---

app.command("/dsb-callcenter", async ({ ack, respond }) => {
  await ack();
  await respond({
    text: `*Ugh, fine. Here's what I can do for you:*
🛠️ */dsb-callcenter* - Shows this menu (you are here).
🏓 */dsb-pinglatency* - Check how fast my brain is working today.
⏱️ */dsb-study [minutes]* - Forces you to actually do your work.
🐈 */dsb-catsecrets* - Useless but adorable cat facts.
🤡 */dsb-clown* - Jokes that will make you groan.
🎱 */dsb-8ballvision [question]* - Ask a calculator for life advice.
✂️ */dsb-rps [rock/paper/scissors]* - Fight me.
🚿 */dsb-showerthought* - Things to keep you awake at 3 AM.`
  });
});

app.command("/dsb-pinglatency", async ({ ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `🏓 Pong! Latency: ${latency}ms. Faster than your Wi-Fi, probably.` });
});

app.command("/dsb-study", async ({ command, ack, respond, client }) => {
  await ack();
  const minutes = parseInt(command.text.trim());

  if (isNaN(minutes) || minutes <= 0) {
    await respond({ text: "Bro, that's not a number. Try something like `/dsb-study 25` so I don't break." });
    return;
  }

  await respond({ text: `📚 Timer set for ${minutes} minute(s). Put the phone down. I'm watching you.` });

  setTimeout(async () => {
    try {
      await client.chat.postMessage({
        channel: command.user_id,
        text: `🔔 DING DING! You survived ${minutes} minutes of actual productivity. Go touch grass or grab a snack.`
      });
    } catch (error) {
      console.error(error);
    }
  }, minutes * 60 * 1000);
});

// --- CHAOTIC API COMMANDS ---

app.command("/dsb-catsecrets", async ({ ack, respond }) => {
  await ack();
  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `🐈 *Cat Fact that you didn't ask for:*\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "The cat API scratched me. No facts today." });
  }
});

app.command("/dsb-clown", async ({ ack, respond }) => {
  await ack();
  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({ text: `🤡 ${response.data.setup}\n\n...${response.data.punchline} \n*(Please clap)*` });
  } catch (err) {
    await respond({ text: "I forgot the punchline. Just pretend I said something hilarious." });
  }
});

app.command("/dsb-showerthought", async ({ ack, respond }) => {
  await ack();
  const thoughts = [
    "Watermelons are basically water that you can chew.",
    "Your future self is talking trash about you right now.",
    "If you drop soap on the floor, is the floor clean or is the soap dirty?",
    "We say 'sleep like a baby' when babies wake up crying every two hours.",
    "The word 'queue' is just a Q followed by four silent letters.",
    "If a tomato is a fruit, then ketchup is technically a smoothie.",
    "Your stomach thinks all potatoes are mashed.",
    "The 's' in 'lisp' is silent, which is ironic.",
    "If you try to fail and succeed, which one did you actually do?",
    "If we aren't supposed to have midnight snacks, why is there a light in the fridge?",
    "If a book about failures doesn't sell, is it a success?"
  ];
  const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
  await respond({ text: `🚿 *Late Night Brain Worms:*\n${randomThought}` });
});

// --- UNFAIR GAMES ---

app.command("/dsb-8ball", async ({ command, ack, respond }) => {
  await ack();
  if (!command.text) {
    await respond({ text: "I can't read your mind. Ask a question! Example: `/dsb-8ball Am I cool?`" });
    return;
  }

  const answers = [
    "Absolutely.", "Yeah, sure, whatever.", "I guess so.",
    "Try asking when I care.", "Ask again later, I'm on my break.", "Literally no.",
    "Don't count on it, buddy.", "Nope.", "Yikes. Very doubtful."
  ];
  const choice = answers[Math.floor(Math.random() * answers.length)];
  
  await respond({ text: `🎱 *You asked:* ${command.text}\n*My flawless wisdom:* ${choice}` });
});

app.command("/dsb-rps", async ({ command, ack, respond }) => {
  await ack();
  const userMove = command.text.trim().toLowerCase();
  const validMoves = ["rock", "paper", "scissors"];

  if (!validMoves.includes(userMove)) {
    await respond({ text: "It's Rock, Paper, Scissors. It's not that hard bro. Example: `/dsb-rps rock`" });
    return;
  }

  const botMove = validMoves[Math.floor(Math.random() * validMoves.length)];
  let result = "";

  if (userMove === botMove) result = "It's a tie! I demand a rematch. 🤝";
  else if (
    (userMove === "rock" && botMove === "scissors") ||
    (userMove === "paper" && botMove === "rock") ||
    (userMove === "scissors" && botMove === "paper")
  ) {
    result = "You win! Beginner's luck. 🙄";
  } else {
    result = "I WIN! Bow down to your robot overlord! 🤖👑";
  }

  await respond({ text: `You played *${userMove}*.\nI played *${botMove}*.\n\n${result}` });
});

// --- SASSY EASTER EGGS ---

app.message(/i'?m bored/i, async ({ message, say }) => {
  const suggestions = [
    "Go touch grass 🌱",
    "Blink manually for the next 60 seconds 👁️👄👁️",
    "Time to do 10 pushups. No cheating! 💪",
    "Try turning yourself off and back on again 🔌"
  ];
  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
  await say(`<@${message.user}> ${randomSuggestion}`);
});

app.message(/good bot/i, async ({ message, say }) => {
  await say(`I know, <@${message.user}>. I know. 💅`);
});

app.message(/bad bot/i, async ({ message, say }) => {
  await say(`Excuse me, <@${message.user}>? I'm doing my best here! 😭`);
});

app.message(/pineapple/i, async ({ message, say }) => {
  await say(`🍍 WHOA THERE, we don't use the P-word in this server, <@${message.user}>! 🍍`);
});

// --- START APP ---

(async () => {
  await app.start();
  console.log("⚡️ The sassiest Slack bot alive is now running!");
})();