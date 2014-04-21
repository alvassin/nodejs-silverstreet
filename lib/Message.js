var Sms = require(__dirname + '/Sms');

/**
 * Returns a random integer between min and max,
 * helper function
 * @param {number} min
 * @param {number} max
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Constructor
 * @param {object} options
 */
var Message = module.exports = function(options) {
    
    /**
     * Recipient phone number
     * @var {string}
     */
    this.destination = ''; 
    
    /**
     * Sender name
     * @var {string}
     */
    this.sender = '';
    
    /**
     * Text message
     * @var {string}
     */
    this.body = '';
    
    // Handle given options
    for (var name in options) {
        if (typeof this[name] !== 'undefined') {
            this[name] = options[name];
        }
    }
}

/**
 * Splits current content to sms messages array, 
 * considering message body encoding
 * @return Sms[]
 */
Message.prototype.chunk = function() {

    // Get sms chunks count
    var encoding = Sms.detectEncoding(this.body);
    var chunks = [];
    if (encoding === Sms.ENCODING_UTF) {
        if (this.body.length > 70) {
            chunks = this.body.match(/.{1,67}/g);
        } else {
            chunks = [this.body];
        }
    } else {
        if (this.body.length > 160) {
            chunks = this.body.match(/.{1,153}/g);
        } else {
            chunks = [this.body];
        }
    }
    
    // Generate CSMS reference number
    var udhReference = getRandomInt(0, 255).toString(16);
    if (udhReference.length < 2) {
        udhReference = '0' + udhReference;
    }
    
    // Add to udh messages number
    var udhCount = chunks.length.toString(16);
    if (udhCount.length < 2) {
        udhCount = '0' + udhCount;
    }
    
    // Create sms collection
    var parts = [];
    for (var i = 0; i < chunks.length; i++) {
        
        // Get chunk hex number
        var udhNumber = (i + 1).toString(16);
        if (udhNumber.length < 2) {
            udhNumber = '0' + udhNumber;
        }
        
        // Create sms message
        parts.push(new Sms({
            destination : this.destination,
            body        : chunks[i],
            sender      : this.sender,
            udh         : parts.length > 1 ? ('050003' + udhReference + udhCount + udhNumber) : '',
        }));
    }

    return parts;
};
