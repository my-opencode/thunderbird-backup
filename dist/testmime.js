"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Decoder = void 0;
const iconv_1 = require("iconv");
class Decoder {
    constructor() {
        /**
        * mime.decodeBase64(str) -> String
        * - str (String): String to be decoded from Base64
        * - charset (String): Source charset, defaults to UTF-8
        *
        * Decodes a string from Base64 format. Base64 is mime-word safe.
        * NB! Always returns UTF-8
        **/
        this.decodeBase64 = function (str, charset) {
            const buffer = Buffer.from(str, "base64");
            if (charset && charset.toUpperCase() != "UTF-8") {
                return fromCharset(charset, buffer);
            }
            // defaults to utf-8
            return buffer.toString("utf-8");
        };
        return this;
    }
    /**
    * mime.decodeMimeWord(str, encoding, charset) -> String
    * - str (String): String to be encoded
    * - encoding (String): Encoding Q for quoted printable or B (def.) for base64
    * - charset (String): Charset to be used, defaults to UTF-8
    *
    * Decodes a string from mime encoded word format, see [[encodeMimeWord]]
    *
    **/
    decodeMimeWord(str) {
        const parts = str.split("?");
        const charset = parts && parts[1];
        const encoding = parts && parts[2];
        const text = parts && parts[3];
        if (!charset || !encoding || !text)
            return str;
        if (encoding.toUpperCase() == "Q") {
            return this.decodeQuotedPrintable(text, true, charset);
        }
        if (encoding.toUpperCase() == "B") {
            return this.decodeBase64(text, charset);
        }
        return text;
    }
    /**
    * mime.deccodeQuotedPrintable(str, mimeWord, charset) -> String
    * - str (String): String to be decoded
    * - mimeWord (Boolean): Use mime-word mode (defaults to false)
    * - charset (String): Charset to be used, defaults to UTF-8
    *
    * Decodes a string from Quoted-printable format.
    **/
    decodeQuotedPrintable(str, mimeWord, charset) {
        charset = charset && charset.toUpperCase() || "UTF-8";
        try {
            if (mimeWord) {
                str = str.replaceAll(/_/g, " ");
            }
            else {
                str = str.replaceAll(/=\r\n/gm, '');
                str = str.replace(/=$/, "");
            }
            if (charset == "UTF-8")
                str = decodeURIComponent(str.replaceAll(/%/g, '%25').replaceAll(/=/g, "%"));
            else {
                let _str = str;
                str = str.replaceAll(/%/g, '%25').replaceAll(/=/g, "%");
                if (charset == "ISO-8859-1" || charset == "LATIN1") {
                    try {
                        str = decodeURI(str);
                    }
                    catch (err) {
                        console.log(`decode uri on: ${str}`);
                    }
                    try {
                        _str = decodeURI(_str.replaceAll(/=[A-Z0-9]{2}/g, function (subs) {
                            const n = parseInt(subs.slice(1), 16);
                            return `&#${n};`;
                        }));
                        str = decodeURI(_str);
                    }
                    catch (err) {
                        console.log(`decode uri on: ${str}`);
                        throw err;
                    }
                }
                else {
                    console.log(`other charset`, charset);
                    const strBuffer = decodeBytestreamUrlencoding(str);
                    str = fromCharset(charset, strBuffer);
                }
            }
            return str;
        }
        catch (err) {
            console.log(`Error decoding quoted printable "${charset}" "${str}"`);
            if (err instanceof Error)
                console.log(err.stack || `no stack`);
            throw err;
        }
    }
    /**
    * mime.parseMimeWords(str) -> String
    * - str (String): string to be parsed
    *
    * Parses mime-words into UTF-8 strings
    **/
    parseMimeWords(str) {
        return str.replace(/=\?[^?]+\?[QqBb]\?[^?]+\?=/g, (function (a) {
            return this.decodeMimeWord(a);
        }).bind(this));
    }
}
exports.Decoder = Decoder;
/* Helper functions */
/**
* fromCharset(charset, buffer, keep_buffer) -> String | Buffer
* - charset (String): Source charset
* - buffer (Buffer): Buffer in <charset>
* - keep_buffer (Boolean): If true, return buffer, otherwise UTF-8 string
*
* Converts a buffer in <charset> codepage into UTF-8 string
**/
function fromCharset(charset, buffer, keep_buffer) {
    const iconv = new iconv_1.Iconv(charset, 'UTF-8');
    buffer = iconv.convert(buffer);
    return keep_buffer ? buffer : buffer.toString("utf-8");
}
/**
* decodeBytestreamUrlencoding(encoded_string) -> Buffer
* - encoded_string (String): String in urlencode coding
*
* Converts an urlencoded string into a bytestream buffer. If the used
* charset is known the resulting string can be converted to UTF-8 with
* [[fromCharset]].
* NB! For UTF-8 use decodeURIComponent and for Latin 1 decodeURL instead
**/
function decodeBytestreamUrlencoding(encoded_string) {
    let c, i, j = 0;
    const prcnts = encoded_string.match(/%/g) || "", buffer_length = encoded_string.length - (prcnts.length * 2), buffer = Buffer.alloc(buffer_length);
    for (i = 0; i < encoded_string.length; i++) {
        c = encoded_string.charCodeAt(i);
        if (c == 37) { // %
            c = parseInt(encoded_string.substr(i + 1, 2), 16);
            i += 2;
        }
        buffer[j++] = c;
    }
    return buffer;
}
/*
const s = `=?UTF-8?Q?Re=3a_Proposition_de_notice_de_d=c3=a9m=c3=a9nagement_en_?=`;
const ms = `=?UTF-8?Q?Re=3a_Proposition_de_notice_de_d=c3=a9m=c3=a9nagement_en_?=
=?UTF-8?Q?signature_d=27email?=`;
*/
const s = `=?ISO-8859-1?Q?Re:_cam=E9ra_s=E9cu?=`;
const d = new Decoder();
console.log(decodeURI(`Re:_cam%C3%E9ra_s%C3%E9cu`));
console.log(unescape(`Re:_cam%E9ra_s%E9cu`));
// console.log(decodeURIComponent(`Re:_cam=E9ra_s=E9cu`.replace(/%/g, '%25').replace(/=/g, "%")));
console.log(d.decodeMimeWord(s));
/*
console.log(d.parseMimeWords(ms));
*/ 
