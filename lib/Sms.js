/**
 * Constructor
 * @param {object} options
 */
var Sms = module.exports = function(options) {
    
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
     * Text message, with maximum length:
     * 160 chars using Sms.ENCODING_GSM encoding, 
     * 70 chars using Sms.ENCODING_UTF encoding
     */
    this.body = '';
    
    /**
     * User data header,
     * is being set via Message wrapper, when splitting message into several sms objects
     * @see http://en.wikipedia.org/wiki/Concatenated_SMS#Sending_a_concatenated_SMS_using_a_User_Data_Header
     * @var {string}
     */
    this.udh = null;
    
    // Handle given options
    for (var name in options) {
        if (typeof this[name] !== 'undefined') {
            this[name] = options[name];
        }
    }
}

/**
 * Available encodings
 */
Sms.ENCODING_GSM = 'gsm0338';
Sms.ENCODING_UTF = 'utf8';

/**
 * Checks, if given string contains only valid gsm characters
 * @see http://unicode.org/Public/MAPPINGS/ETSI/GSM0338.TXT
 * @param {string} text
 * @return {boolean}
 */
Sms.isValidGSMString = function(text) {
    var chars = [
        0x0040, 0x0000, 0x00A3, 0x0024, 0x00A5, 0x00E8, 0x00E9, 0x00F9, 0x00EC, 0x00F2, 
        0x00E7, 0x00C7, 0x000A, 0x00D8, 0x00F8, 0x000D, 0x00C5, 0x00E5, 0x0394, 0x005F,
        0x03A6, 0x0393, 0x039B, 0x03A9, 0x03A0, 0x03A8, 0x03A3, 0x0398, 0x039E, 0x00A0,
        0x000C, 0x005E, 0x007B, 0x007D, 0x005C, 0x005B, 0x007E, 0x005D, 0x007C, 0x20AC,
        0x00C6, 0x00E6, 0x00DF, 0x00C9, 0x0020, 0x0021, 0x0022, 0x0023, 0x00A4, 0x0025,
        0x0026, 0x0027, 0x0028, 0x0029, 0x002A, 0x002B, 0x002C, 0x002D, 0x002E, 0x002F,
        0x0030, 0x0031, 0x0032, 0x0033, 0x0034, 0x0035, 0x0036, 0x0037, 0x0038, 0x0039,
        0x003A, 0x003B, 0x003C, 0x003D, 0x003E, 0x003F, 0x00A1, 0x0041, 0x0391, 0x0042,
        0x0392, 0x0043, 0x0044, 0x0045, 0x0395, 0x0046, 0x0047, 0x0048, 0x0397, 0x0049, 
        0x0399, 0x004A, 0x004B, 0x039A, 0x004C, 0x004D, 0x039C, 0x004E, 0x039D, 0x004F, 
        0x039F, 0x0050, 0x03A1, 0x0051, 0x0052, 0x0053, 0x0054, 0x03A4, 0x0055, 0x0056,
        0x0057, 0x0058, 0x03A7, 0x0059, 0x03A5, 0x005A, 0x0396, 0x00C4, 0x00D6, 0x00D1, 
        0x00DC, 0x00A7, 0x00BF, 0x0061, 0x0062, 0x0063, 0x0064, 0x0065, 0x0066, 0x0067, 
        0x0068, 0x0069, 0x006A, 0x006B, 0x006C, 0x006D, 0x006E, 0x006F, 0x0070, 0x0071, 
        0x0072, 0x0073, 0x0074, 0x0075, 0x0076, 0x0077, 0x0078, 0x0079, 0x007A, 0x00E4, 
        0x00F6, 0x00F1, 0x00FC, 0x00E0
    ];
    
    for (var i = 0; i < text.length; i++) {
        if (chars.indexOf(text.charCodeAt(i)) === -1) {
            return false;
        }
    }
    
    return true;
}

/** 
 * Converts given string to unicode
 * @param {string} text
 * @return {string}
 */
Sms.toUnicode = function(text) {

    if (typeof text !== 'string') {
        text = text.toString();
    }
    
    var result = '';
    
    for (var i = 0; i < text.length; i++) {
        var code = text.charCodeAt(i).toString(16);
        while (code.length < 4) {
            code = '0' + code;
        }
        result += code;
    }
    
    return result;
}

/**
 * Returns encoding for current sms instance
 * @param {string} text
 * @return {string}
 */
Sms.detectEncoding = function(text) {
    if (Sms.isValidGSMString(text)) {
        return Sms.ENCODING_GSM;
    }
    return Sms.ENCODING_UTF;
}
