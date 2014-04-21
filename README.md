Silverstreet sms adapter
========================
Adapter for sending sms in node.js using http://silverstreet.com/ HTTP MT api. 

To install fresh version, run `npm install alvassin/nodejs-silverstreet`

```js
var silverstreet = require('silverstreet');

// Setup gateway
var gate = new silverstreet.Gateway({
    username : 'your-name',
    password : 'hackme',
    sender   : 'robot'
}); 

// Create message
var message = new silverstreet.Message({
    destination : '79261234567',
    body        : 'I will detect, which encoding could be used for your message. ' +
                  'Then, if necessary, I will split your message in several sms messages, ' +
                  'and send them to the server'
});

// Send message
gate.send(message, function(error) {
    if (error) {
        console.log('error:', error);
    } else {
        console.log('success!');
    }
});
```

#### Features
* Send single GSM-encoded (160 chars), Unicode-encoded (70 chars) messages
* Automatic concatenation (allows 153 chars for GSM & 67 chars for Unicode message parts)
* No third-party module dependencies (only node.js native `http` & `querystring`)

#### Components
* `silverstreet.Sms` - represents single sms message
* `silverstreet.Message` - Sms wrapper, implements concatenated delivery
* `silverstreet.Gateway` - represents controller, which can be used to send configured Sms/Message objects

#### Todo
* Implement delivery reports support
* Implement credits check