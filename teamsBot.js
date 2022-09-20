// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TeamsActivityHandler, TurnContext} = require("botbuilder");

const { HubbleApi } = require("./lib/hubbleApi");


class TeamsBot extends TeamsActivityHandler {
  constructor(conversationReferences) {
    super();
    const hubbleApi = new HubbleApi();
    // Dependency injected dictionary for storing ConversationReference objects used in NotifyController to proactively message users
    this.conversationReferences = conversationReferences;

    this.onConversationUpdate(async (context, next) => {
      console.log(context._activity.from.aadObjectId);
      console.log(context.activity);
      this.addConversationReference(context.activity);
      const response = await hubbleApi.postConversationCreate({teamsUserId: context._activity.from.aadObjectId, conversation: context._activity.conversation});
      console.log(response);

      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {

          //Welcome Messageの送信
          const welcomeMessage = 'HubbleのMicrosoft Teamsアプリへようこそ！<br> \
            Hubble内にあなた宛のコメントがあれば、このアプリから通知が届きます。<br> \
            通知の受取だけでなく、アプリ内でコメント返信やいいねもできます。<br><br> \
            このアプリでは「help」コマンドが利用可能です。<br> \
            使い方などのヘルプページは[こちら](https://help.hubble-docs.com/ja/articles/6385296)。<br><br> \
            （ご利用時の注意点）<br> \
            Hubbleのアカウントが必須のアプリになります。<br> \
            Hubbleのアカウントをお持ちでない方は[こちら](https://hubble-docs.com/contact)からお問合せください';

          await context.sendActivity(welcomeMessage);
        }
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    this.onMessage(async (context, next) => {
      try{
        this.addConversationReference(context.activity);

        const helpMessage = 'この連携では以下が可能です。<br>・Hubble内にあなた宛のコメントがあれば、このHubbleアプリから通知が届きます。<br>・通知の受け取りだけでなく、コメント返信やいいねなどのアクションも可能です。<br>ヘルプページは[こちら](https://help.hubble-docs.com/ja/articles/6385296)。';
        const errorMessage = 'このコメントはどこにも反映されていません。<br>Hubbleからの通知の「コメントする」を使って、返信してください。';

        if (context.activity.text === 'help' || context.activity.text === 'help ') {
          await context.sendActivity(helpMessage);
        } else if (context.activity.value) {
          console.log(context.activity.value);
          if (context.activity.value.hubbleAction) {
            console.log(context.activity.value);
            let data = null;

            switch (context.activity.value.hubbleAction) {
              case 'reply':
                data = await hubbleApi.postCommentReply({
                  commentId: context.activity.value.commentId,
                  userId: context.activity.value.userId,
                  body: context.activity.value.comment
                });

                console.log(data);

                if (data.success === undefined || data.success === true) {
                  await context.sendActivity('コメントがHubbleに送信されました。');
                } else {
                  await context.sendActivity('コメントがHubbleに送信されませんでした。');
                }

                break;
              case 'like':
                data = await hubbleApi.postCommentLike({
                  commentId: context.activity.value.commentId,
                  userId: context.activity.value.userId
                });

                console.log(data);

                if (data.success === undefined || data.success === true) {
                  await context.sendActivity('いいねがHubbleに送信されました。');
                } else {
                  await context.sendActivity('いいねがHubbleに送信されませんでした。');
                }

                break;
            }
          } else {
            await context.sendActivity(errorMessage);
          }
        } else {
          await context.sendActivity(errorMessage);
        }

        await next();
      } catch(e){
        console.log(e)
      }
    });

  }

  addConversationReference(activity) {
    const conversationReference = TurnContext.getConversationReference(activity);
    this.conversationReferences[conversationReference.conversation.id] = conversationReference;
  }

}

module.exports.TeamsBot = TeamsBot;
