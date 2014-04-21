var http        = require('http'),
    Message     = require(__dirname + '/Message'), 
    querystring = require('querystring'),
    Sms         = require(__dirname + '/Sms');

/**
 * Constructor
 * @param {object} options
 */
var Gateway = module.exports = function(options) {
    
    /**
     * Api username
     * @var {string}
     */
    this.username = '';
    
    /**
     * Api password
     * @var {string}
     */
    this.password = '';
    
    /**
     * Sender name
     * @var {string}
     */
    this.sender = '';
    
    // Handle given options
    for (var name in options) {
        if (typeof this[name] !== 'undefined') {
            this[name] = options[name];
        }
    }
}

/**
 * Sends sms
 * @param {Sms} sms
 * @param {function} callback
 */
Gateway.prototype.sendSms = function(sms, callback) {
    
    // Check gateway configuration
    var required = ['username', 'password', 'sender'];
    for (var i in required) {
        if (typeof this[required[i]] !== 'string' || !this[required[i]]) {
            callback(new Error('Gateway property "' + required[i] + '" is required'));
            return;
        }
    }
    
    // Check message
    var required = ['destination', 'body'];
    for (var i in required) {
        if (typeof sms[required[i]] !== 'string' || !sms[required[i]]) {
            callback(new Error('Sms property "' + required[i] + '" is required'));
            return;
        }
    }
    
    // Retrieve encoding
    var smsEncoding = Sms.detectEncoding(sms.body);
    
    // Retrieve sms body
    var smsBody = sms.body;
    var smsBodyType = 1;
    if (smsEncoding === Sms.ENCODING_UTF) {
        smsBody = Sms.toUnicode(sms.body);
        smsBodyType = 4;
    }
    
    // Build the post string from an object
    var postData = {
        username    : this.username,
        password    : this.password,
        destination : sms.destination,
        sender      : sms.sender ? sms.sender : this.sender,
        bodytype    : smsBodyType,
        body        : smsBody,
    };
        
    if (sms.udh) {
        postData.udh = sms.udh;
    }
    
    postData = querystring.stringify(postData);
    
    // Set up the request
    var postRequest = http.request({
        host: 'api.silverstreet.com',
        port: '80',
        path: '/send.php',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    }, function(res) {
        
        res.setEncoding('utf8');
        var result = '';
        
        res.on('data', function(chunk){ result += chunk; });
        res.on('end', function(){
            
            switch(result) {
            
                case '01':
                    callback(null);
                    break;
                    
                default:
                    callback(new Error(result));
                    break;
            }
        });
    });

    // Perform request
    postRequest.write(postData);
    postRequest.end();
}

/**
 * Sends given message, if given Message - it will be split into chunk sms.
 * @param {Sms|Message} message
 * @param {function} callback
 */
Gateway.prototype.send = function(message, callback) {
    
    if (message instanceof Message) {
        var parts = message.chunk();
        
        var partsLeft = parts.length;
        var partsError = null;
        
        for (var i in parts) {
            this.sendSms(parts[i], function(error) {
                if (error) {
                    partsError = error;
                }
                partsLeft--;
                
                if (partsLeft < 1) {
                    callback(partsError);
                }
            });
        }
        
    } else {
        this.sendSms(message, callback);
    }
}