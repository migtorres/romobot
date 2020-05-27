cconst https = require('https'),
      qs = require('querystring'),
      ACCESS_TOKEN = "",
      BOT_TOKEN = "",
      CHANNELS = [],
      ADMINS = [];

// Verify Url - https://api.slack.com/events/url_verification
function verify(data, callback) {
    callback(null, data.challenge); 
}

function post(data, method, token) {
    const options = {
        hostname: 'slack.com',
        path: '/api/' + method,
        method: 'POST',
        port: 443,
        headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': data.length
        }
    };
        
    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
    
        res.on('data', d => {
          process.stdout.write(d)
        })
    });
    
    req.write(data)
    req.end()
}

function kick(user, channel) {
    var data = JSON.stringify({
        channel: channel,
        user: user
    });

    post(data, 'conversations.kick', ACCESS_TOKEN)
};

function send_message(text, user) {
    var data = { 
        user: user,
    };

    var user_channel = post(data, 'conversations.open', BOT_TOKEN).channel.id;
    
    console.log(user_channel)

    var message = { 
        token: BOT_TOKEN,
        channel: user_channel,
        text: text
    };

    var query = qs.stringify(message); // prepare the querystring
    https.get(`https://slack.com/api/chat.postMessage?${query}`);
}

        
function process_event(event, callback) {
    if (event.type == "member_joined_channel" && CHANNELS.includes(event.channel) && !ADMINS.includes(event.inviter)) {
        
        kick(event.user, event.channel);
        //var user_message = "Your were invited to " + event.channel + "but only Dave Baigent and Andy Kennedy can give you access";
        //var inviter_message = "Only Dave Baigent and Andy Kennedy can give you access to " + event.channel;

        //send_message(user_message, event.user);
        //send_message(inviter_message, event.inviter);
    }

    callback(null);
}

// Lambda handler
exports.handler = (data, context, callback) => {
    switch (data.type) {
        case "url_verification": verify(data, callback); break;
        case "event_callback": process_event(data.event, callback); break;
        default: callback(null);
    }
};