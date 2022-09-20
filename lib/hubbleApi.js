class HubbleApi {
  #url;
  #fetch;

  constructor() {
    this.#url = process.env.API_URL
    this.#fetch = require('node-fetch');
  }

  async postConversationCreate(params) {
    const path = `/api/v1/extensions/teams/conversations`;

    console.log(this.#url + path);

    let options = {
      headers: {
        'Content-type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        'teamsUserId': params['teamsUserId'],
        'conversation': params['conversation']
      })
    };
    console.log(options);

    const response = await this.#fetch(this.#url + path, options);

    const data = await response.json();

    console.log(data);

    return data;
  }

  async postCommentReply(params) {
    const path = `/api/v1/extensions/teams/comments/${params['commentId']}/reply`;

    console.log(this.#url + path);

    let options = {
      headers: {
        'Content-type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        'userId': params['userId'],
        'body': params['body']
      })
    };

    console.log(options);

    const response = await this.#fetch(this.#url + path, options);

    const data = await response.json();

    console.log(data);

    return data;
  }

  async postCommentLike(params) {
    const path = `/api/v1/extensions/teams/comments/${params['commentId']}/like`;

    console.log(this.#url + path);

    let options = {
      headers: {
        'Content-type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        'userId': params['userId']
      })
    };

    console.log(options);

    const response = await this.#fetch(this.#url + path, options);

    const data = await response.json();

    console.log(data);

    return data;
  }
}

module.exports.HubbleApi = HubbleApi;
