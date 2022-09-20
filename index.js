// index.js is used to setup and configure your bot

// Import required packages

const restify = require("restify");

require('dotenv').config();

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter } = require("botbuilder");
const { TeamsBot } = require("./teamsBot");
const { CardFactory } = require("botbuilder");


const AdaptiveCardProperties = {
  "type": "AdaptiveCard",
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "version": "1.4"
}

// // Create adapter.
// // See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
  appId: process.env.BOT_ID,
  appPassword: process.env.BOT_PASSWORD,
});

adapter.onTurnError = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights. See https://aka.ms/bottelemetry for telemetry
  //       configuration instructions.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a message to the user
  await context.sendActivity(`The bot encountered an unhandled error:\n ${error.message}`);
  await context.sendActivity("To continue to run this bot, please fix the bot source code.");
};

// Create the bot that will handle incoming messages.
const conversationReferences = {};
const bot = new TeamsBot(conversationReferences);


const Logger = require('bunyan')
const log = new Logger.createLogger({
      name: 'teams-app',
      serializers: {
          req: Logger.stdSerializers.req,
          res: Logger.stdSerializers.res
      }
  })
  
// Create HTTP server.
const server = restify.createServer({
  log: log
});

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());


server.pre(function (request, response, next) {
    request.log.info({ req: request, res: response }, "Request");
    next();
});


server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log(`\nBot started, ${server.name} listening to ${server.url} for api ${process.env.API_URL}`);
});



server.get("/", async (req, res) => {
  
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify({ 'healthcheck': 'ok' }));
});


server.get("/healthcheck", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify({ 'healthcheck': 'ok' }));
});

// Listen for incoming requests.
server.post('/api/messages', async (req, res) => {
  try{
    await adapter.processActivity(req, res, async (context) => {
      await bot.run(context);
    });
  } catch (e){
    console.log(e)
  }
});

// Listen for incoming notifications and send proactive messages to users.
server.post('/api/notify', async (req, res) => {
  console.log(req.headers);
  console.log({...req.body.body, ...AdaptiveCardProperties});
  try{
    await adapter.continueConversation(req.body, async (context) => {
      await context.sendActivity({
        text: req.body.message,
        summary: req.body.summary,
        attachments: [CardFactory.adaptiveCard({...req.body.body, ...AdaptiveCardProperties})]
      });
      
    });

    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ 'status': 'ok' }));
  } catch (e){
    console.log(e)
  }
});


// Gracefully shutdown HTTP server
["exit", "SIGTERM", "SIGUSR1", "SIGUSR2", "SIGINT", "SIGTERM", "SIGUSR1", "SIGUSR2"].forEach((event) => {
  process.on(event, () => {
    console.log(`Shutting down server: ${event}`)
    server.close();
  });
});
