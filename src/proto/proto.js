/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.messagepackage = (function() {

    /**
     * Namespace messagepackage.
     * @exports messagepackage
     * @namespace
     */
    var messagepackage = {};

    messagepackage.Message = (function() {

        /**
         * Properties of a Message.
         * @memberof messagepackage
         * @interface IMessage
         * @property {string|null} [id] Message id
         * @property {string|null} [type] Message type
         * @property {number|null} [session] Message session
         * @property {string|null} [text] Message text
         * @property {string|null} [image] Message image
         * @property {number|null} [status] Message status
         * @property {messagepackage.ISender|null} [sender] Message sender
         * @property {number|null} [receiver] Message receiver
         * @property {string|null} [time] Message time
         * @property {string|null} [ext] Message ext
         */

        /**
         * Constructs a new Message.
         * @memberof messagepackage
         * @classdesc Represents a Message.
         * @implements IMessage
         * @constructor
         * @param {messagepackage.IMessage=} [properties] Properties to set
         */
        function Message(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Message id.
         * @member {string} id
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.id = "";

        /**
         * Message type.
         * @member {string} type
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.type = "";

        /**
         * Message session.
         * @member {number} session
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.session = 0;

        /**
         * Message text.
         * @member {string} text
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.text = "";

        /**
         * Message image.
         * @member {string} image
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.image = "";

        /**
         * Message status.
         * @member {number} status
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.status = 0;

        /**
         * Message sender.
         * @member {messagepackage.ISender|null|undefined} sender
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.sender = null;

        /**
         * Message receiver.
         * @member {number} receiver
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.receiver = 0;

        /**
         * Message time.
         * @member {string} time
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.time = "";

        /**
         * Message ext.
         * @member {string} ext
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.ext = "";

        /**
         * Creates a new Message instance using the specified properties.
         * @function create
         * @memberof messagepackage.Message
         * @static
         * @param {messagepackage.IMessage=} [properties] Properties to set
         * @returns {messagepackage.Message} Message instance
         */
        Message.create = function create(properties) {
            return new Message(properties);
        };

        /**
         * Encodes the specified Message message. Does not implicitly {@link messagepackage.Message.verify|verify} messages.
         * @function encode
         * @memberof messagepackage.Message
         * @static
         * @param {messagepackage.IMessage} message Message message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Message.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.type);
            if (message.session != null && Object.hasOwnProperty.call(message, "session"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.session);
            if (message.text != null && Object.hasOwnProperty.call(message, "text"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.text);
            if (message.image != null && Object.hasOwnProperty.call(message, "image"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.image);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.status);
            if (message.sender != null && Object.hasOwnProperty.call(message, "sender"))
                $root.messagepackage.Sender.encode(message.sender, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.receiver != null && Object.hasOwnProperty.call(message, "receiver"))
                writer.uint32(/* id 8, wireType 0 =*/64).int32(message.receiver);
            if (message.time != null && Object.hasOwnProperty.call(message, "time"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.time);
            if (message.ext != null && Object.hasOwnProperty.call(message, "ext"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.ext);
            return writer;
        };

        /**
         * Encodes the specified Message message, length delimited. Does not implicitly {@link messagepackage.Message.verify|verify} messages.
         * @function encodeDelimited
         * @memberof messagepackage.Message
         * @static
         * @param {messagepackage.IMessage} message Message message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Message.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Message message from the specified reader or buffer.
         * @function decode
         * @memberof messagepackage.Message
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {messagepackage.Message} Message
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Message.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.messagepackage.Message();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
                    break;
                case 2:
                    message.type = reader.string();
                    break;
                case 3:
                    message.session = reader.int32();
                    break;
                case 4:
                    message.text = reader.string();
                    break;
                case 5:
                    message.image = reader.string();
                    break;
                case 6:
                    message.status = reader.int32();
                    break;
                case 7:
                    message.sender = $root.messagepackage.Sender.decode(reader, reader.uint32());
                    break;
                case 8:
                    message.receiver = reader.int32();
                    break;
                case 9:
                    message.time = reader.string();
                    break;
                case 10:
                    message.ext = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Message message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof messagepackage.Message
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {messagepackage.Message} Message
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Message.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Message message.
         * @function verify
         * @memberof messagepackage.Message
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Message.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.session != null && message.hasOwnProperty("session"))
                if (!$util.isInteger(message.session))
                    return "session: integer expected";
            if (message.text != null && message.hasOwnProperty("text"))
                if (!$util.isString(message.text))
                    return "text: string expected";
            if (message.image != null && message.hasOwnProperty("image"))
                if (!$util.isString(message.image))
                    return "image: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                if (!$util.isInteger(message.status))
                    return "status: integer expected";
            if (message.sender != null && message.hasOwnProperty("sender")) {
                var error = $root.messagepackage.Sender.verify(message.sender);
                if (error)
                    return "sender." + error;
            }
            if (message.receiver != null && message.hasOwnProperty("receiver"))
                if (!$util.isInteger(message.receiver))
                    return "receiver: integer expected";
            if (message.time != null && message.hasOwnProperty("time"))
                if (!$util.isString(message.time))
                    return "time: string expected";
            if (message.ext != null && message.hasOwnProperty("ext"))
                if (!$util.isString(message.ext))
                    return "ext: string expected";
            return null;
        };

        /**
         * Creates a Message message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof messagepackage.Message
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {messagepackage.Message} Message
         */
        Message.fromObject = function fromObject(object) {
            if (object instanceof $root.messagepackage.Message)
                return object;
            var message = new $root.messagepackage.Message();
            if (object.id != null)
                message.id = String(object.id);
            if (object.type != null)
                message.type = String(object.type);
            if (object.session != null)
                message.session = object.session | 0;
            if (object.text != null)
                message.text = String(object.text);
            if (object.image != null)
                message.image = String(object.image);
            if (object.status != null)
                message.status = object.status | 0;
            if (object.sender != null) {
                if (typeof object.sender !== "object")
                    throw TypeError(".messagepackage.Message.sender: object expected");
                message.sender = $root.messagepackage.Sender.fromObject(object.sender);
            }
            if (object.receiver != null)
                message.receiver = object.receiver | 0;
            if (object.time != null)
                message.time = String(object.time);
            if (object.ext != null)
                message.ext = String(object.ext);
            return message;
        };

        /**
         * Creates a plain object from a Message message. Also converts values to other types if specified.
         * @function toObject
         * @memberof messagepackage.Message
         * @static
         * @param {messagepackage.Message} message Message
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Message.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.id = "";
                object.type = "";
                object.session = 0;
                object.text = "";
                object.image = "";
                object.status = 0;
                object.sender = null;
                object.receiver = 0;
                object.time = "";
                object.ext = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.session != null && message.hasOwnProperty("session"))
                object.session = message.session;
            if (message.text != null && message.hasOwnProperty("text"))
                object.text = message.text;
            if (message.image != null && message.hasOwnProperty("image"))
                object.image = message.image;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = message.status;
            if (message.sender != null && message.hasOwnProperty("sender"))
                object.sender = $root.messagepackage.Sender.toObject(message.sender, options);
            if (message.receiver != null && message.hasOwnProperty("receiver"))
                object.receiver = message.receiver;
            if (message.time != null && message.hasOwnProperty("time"))
                object.time = message.time;
            if (message.ext != null && message.hasOwnProperty("ext"))
                object.ext = message.ext;
            return object;
        };

        /**
         * Converts this Message to JSON.
         * @function toJSON
         * @memberof messagepackage.Message
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Message.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Message;
    })();

    messagepackage.Sender = (function() {

        /**
         * Properties of a Sender.
         * @memberof messagepackage
         * @interface ISender
         * @property {number|null} [id] Sender id
         * @property {string|null} [account] Sender account
         * @property {string|null} [avatar] Sender avatar
         * @property {string|null} [email] Sender email
         * @property {string|null} [regisTime] Sender regisTime
         * @property {string|null} [updateTime] Sender updateTime
         */

        /**
         * Constructs a new Sender.
         * @memberof messagepackage
         * @classdesc Represents a Sender.
         * @implements ISender
         * @constructor
         * @param {messagepackage.ISender=} [properties] Properties to set
         */
        function Sender(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sender id.
         * @member {number} id
         * @memberof messagepackage.Sender
         * @instance
         */
        Sender.prototype.id = 0;

        /**
         * Sender account.
         * @member {string} account
         * @memberof messagepackage.Sender
         * @instance
         */
        Sender.prototype.account = "";

        /**
         * Sender avatar.
         * @member {string} avatar
         * @memberof messagepackage.Sender
         * @instance
         */
        Sender.prototype.avatar = "";

        /**
         * Sender email.
         * @member {string} email
         * @memberof messagepackage.Sender
         * @instance
         */
        Sender.prototype.email = "";

        /**
         * Sender regisTime.
         * @member {string} regisTime
         * @memberof messagepackage.Sender
         * @instance
         */
        Sender.prototype.regisTime = "";

        /**
         * Sender updateTime.
         * @member {string} updateTime
         * @memberof messagepackage.Sender
         * @instance
         */
        Sender.prototype.updateTime = "";

        /**
         * Creates a new Sender instance using the specified properties.
         * @function create
         * @memberof messagepackage.Sender
         * @static
         * @param {messagepackage.ISender=} [properties] Properties to set
         * @returns {messagepackage.Sender} Sender instance
         */
        Sender.create = function create(properties) {
            return new Sender(properties);
        };

        /**
         * Encodes the specified Sender message. Does not implicitly {@link messagepackage.Sender.verify|verify} messages.
         * @function encode
         * @memberof messagepackage.Sender
         * @static
         * @param {messagepackage.ISender} message Sender message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sender.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.id);
            if (message.account != null && Object.hasOwnProperty.call(message, "account"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.account);
            if (message.avatar != null && Object.hasOwnProperty.call(message, "avatar"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.avatar);
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.email);
            if (message.regisTime != null && Object.hasOwnProperty.call(message, "regisTime"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.regisTime);
            if (message.updateTime != null && Object.hasOwnProperty.call(message, "updateTime"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.updateTime);
            return writer;
        };

        /**
         * Encodes the specified Sender message, length delimited. Does not implicitly {@link messagepackage.Sender.verify|verify} messages.
         * @function encodeDelimited
         * @memberof messagepackage.Sender
         * @static
         * @param {messagepackage.ISender} message Sender message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sender.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Sender message from the specified reader or buffer.
         * @function decode
         * @memberof messagepackage.Sender
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {messagepackage.Sender} Sender
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sender.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.messagepackage.Sender();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.int32();
                    break;
                case 2:
                    message.account = reader.string();
                    break;
                case 3:
                    message.avatar = reader.string();
                    break;
                case 4:
                    message.email = reader.string();
                    break;
                case 5:
                    message.regisTime = reader.string();
                    break;
                case 6:
                    message.updateTime = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Sender message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof messagepackage.Sender
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {messagepackage.Sender} Sender
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sender.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Sender message.
         * @function verify
         * @memberof messagepackage.Sender
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sender.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id))
                    return "id: integer expected";
            if (message.account != null && message.hasOwnProperty("account"))
                if (!$util.isString(message.account))
                    return "account: string expected";
            if (message.avatar != null && message.hasOwnProperty("avatar"))
                if (!$util.isString(message.avatar))
                    return "avatar: string expected";
            if (message.email != null && message.hasOwnProperty("email"))
                if (!$util.isString(message.email))
                    return "email: string expected";
            if (message.regisTime != null && message.hasOwnProperty("regisTime"))
                if (!$util.isString(message.regisTime))
                    return "regisTime: string expected";
            if (message.updateTime != null && message.hasOwnProperty("updateTime"))
                if (!$util.isString(message.updateTime))
                    return "updateTime: string expected";
            return null;
        };

        /**
         * Creates a Sender message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof messagepackage.Sender
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {messagepackage.Sender} Sender
         */
        Sender.fromObject = function fromObject(object) {
            if (object instanceof $root.messagepackage.Sender)
                return object;
            var message = new $root.messagepackage.Sender();
            if (object.id != null)
                message.id = object.id | 0;
            if (object.account != null)
                message.account = String(object.account);
            if (object.avatar != null)
                message.avatar = String(object.avatar);
            if (object.email != null)
                message.email = String(object.email);
            if (object.regisTime != null)
                message.regisTime = String(object.regisTime);
            if (object.updateTime != null)
                message.updateTime = String(object.updateTime);
            return message;
        };

        /**
         * Creates a plain object from a Sender message. Also converts values to other types if specified.
         * @function toObject
         * @memberof messagepackage.Sender
         * @static
         * @param {messagepackage.Sender} message Sender
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Sender.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.id = 0;
                object.account = "";
                object.avatar = "";
                object.email = "";
                object.regisTime = "";
                object.updateTime = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.account != null && message.hasOwnProperty("account"))
                object.account = message.account;
            if (message.avatar != null && message.hasOwnProperty("avatar"))
                object.avatar = message.avatar;
            if (message.email != null && message.hasOwnProperty("email"))
                object.email = message.email;
            if (message.regisTime != null && message.hasOwnProperty("regisTime"))
                object.regisTime = message.regisTime;
            if (message.updateTime != null && message.hasOwnProperty("updateTime"))
                object.updateTime = message.updateTime;
            return object;
        };

        /**
         * Converts this Sender to JSON.
         * @function toJSON
         * @memberof messagepackage.Sender
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Sender.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Sender;
    })();

    messagepackage.Notify = (function() {

        /**
         * Properties of a Notify.
         * @memberof messagepackage
         * @interface INotify
         * @property {string|null} [id] Notify id
         * @property {number|null} [type] Notify type
         * @property {number|null} [status] Notify status
         * @property {messagepackage.ISender|null} [sender] Notify sender
         * @property {number|null} [receiver] Notify receiver
         * @property {string|null} [time] Notify time
         * @property {string|null} [remark] Notify remark
         * @property {string|null} [ext] Notify ext
         */

        /**
         * Constructs a new Notify.
         * @memberof messagepackage
         * @classdesc Represents a Notify.
         * @implements INotify
         * @constructor
         * @param {messagepackage.INotify=} [properties] Properties to set
         */
        function Notify(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Notify id.
         * @member {string} id
         * @memberof messagepackage.Notify
         * @instance
         */
        Notify.prototype.id = "";

        /**
         * Notify type.
         * @member {number} type
         * @memberof messagepackage.Notify
         * @instance
         */
        Notify.prototype.type = 0;

        /**
         * Notify status.
         * @member {number} status
         * @memberof messagepackage.Notify
         * @instance
         */
        Notify.prototype.status = 0;

        /**
         * Notify sender.
         * @member {messagepackage.ISender|null|undefined} sender
         * @memberof messagepackage.Notify
         * @instance
         */
        Notify.prototype.sender = null;

        /**
         * Notify receiver.
         * @member {number} receiver
         * @memberof messagepackage.Notify
         * @instance
         */
        Notify.prototype.receiver = 0;

        /**
         * Notify time.
         * @member {string} time
         * @memberof messagepackage.Notify
         * @instance
         */
        Notify.prototype.time = "";

        /**
         * Notify remark.
         * @member {string} remark
         * @memberof messagepackage.Notify
         * @instance
         */
        Notify.prototype.remark = "";

        /**
         * Notify ext.
         * @member {string} ext
         * @memberof messagepackage.Notify
         * @instance
         */
        Notify.prototype.ext = "";

        /**
         * Creates a new Notify instance using the specified properties.
         * @function create
         * @memberof messagepackage.Notify
         * @static
         * @param {messagepackage.INotify=} [properties] Properties to set
         * @returns {messagepackage.Notify} Notify instance
         */
        Notify.create = function create(properties) {
            return new Notify(properties);
        };

        /**
         * Encodes the specified Notify message. Does not implicitly {@link messagepackage.Notify.verify|verify} messages.
         * @function encode
         * @memberof messagepackage.Notify
         * @static
         * @param {messagepackage.INotify} message Notify message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Notify.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.type);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.status);
            if (message.sender != null && Object.hasOwnProperty.call(message, "sender"))
                $root.messagepackage.Sender.encode(message.sender, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.receiver != null && Object.hasOwnProperty.call(message, "receiver"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.receiver);
            if (message.time != null && Object.hasOwnProperty.call(message, "time"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.time);
            if (message.remark != null && Object.hasOwnProperty.call(message, "remark"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.remark);
            if (message.ext != null && Object.hasOwnProperty.call(message, "ext"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.ext);
            return writer;
        };

        /**
         * Encodes the specified Notify message, length delimited. Does not implicitly {@link messagepackage.Notify.verify|verify} messages.
         * @function encodeDelimited
         * @memberof messagepackage.Notify
         * @static
         * @param {messagepackage.INotify} message Notify message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Notify.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Notify message from the specified reader or buffer.
         * @function decode
         * @memberof messagepackage.Notify
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {messagepackage.Notify} Notify
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Notify.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.messagepackage.Notify();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
                    break;
                case 2:
                    message.type = reader.int32();
                    break;
                case 3:
                    message.status = reader.int32();
                    break;
                case 4:
                    message.sender = $root.messagepackage.Sender.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.receiver = reader.int32();
                    break;
                case 6:
                    message.time = reader.string();
                    break;
                case 7:
                    message.remark = reader.string();
                    break;
                case 8:
                    message.ext = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Notify message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof messagepackage.Notify
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {messagepackage.Notify} Notify
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Notify.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Notify message.
         * @function verify
         * @memberof messagepackage.Notify
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Notify.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isInteger(message.type))
                    return "type: integer expected";
            if (message.status != null && message.hasOwnProperty("status"))
                if (!$util.isInteger(message.status))
                    return "status: integer expected";
            if (message.sender != null && message.hasOwnProperty("sender")) {
                var error = $root.messagepackage.Sender.verify(message.sender);
                if (error)
                    return "sender." + error;
            }
            if (message.receiver != null && message.hasOwnProperty("receiver"))
                if (!$util.isInteger(message.receiver))
                    return "receiver: integer expected";
            if (message.time != null && message.hasOwnProperty("time"))
                if (!$util.isString(message.time))
                    return "time: string expected";
            if (message.remark != null && message.hasOwnProperty("remark"))
                if (!$util.isString(message.remark))
                    return "remark: string expected";
            if (message.ext != null && message.hasOwnProperty("ext"))
                if (!$util.isString(message.ext))
                    return "ext: string expected";
            return null;
        };

        /**
         * Creates a Notify message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof messagepackage.Notify
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {messagepackage.Notify} Notify
         */
        Notify.fromObject = function fromObject(object) {
            if (object instanceof $root.messagepackage.Notify)
                return object;
            var message = new $root.messagepackage.Notify();
            if (object.id != null)
                message.id = String(object.id);
            if (object.type != null)
                message.type = object.type | 0;
            if (object.status != null)
                message.status = object.status | 0;
            if (object.sender != null) {
                if (typeof object.sender !== "object")
                    throw TypeError(".messagepackage.Notify.sender: object expected");
                message.sender = $root.messagepackage.Sender.fromObject(object.sender);
            }
            if (object.receiver != null)
                message.receiver = object.receiver | 0;
            if (object.time != null)
                message.time = String(object.time);
            if (object.remark != null)
                message.remark = String(object.remark);
            if (object.ext != null)
                message.ext = String(object.ext);
            return message;
        };

        /**
         * Creates a plain object from a Notify message. Also converts values to other types if specified.
         * @function toObject
         * @memberof messagepackage.Notify
         * @static
         * @param {messagepackage.Notify} message Notify
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Notify.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.id = "";
                object.type = 0;
                object.status = 0;
                object.sender = null;
                object.receiver = 0;
                object.time = "";
                object.remark = "";
                object.ext = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = message.status;
            if (message.sender != null && message.hasOwnProperty("sender"))
                object.sender = $root.messagepackage.Sender.toObject(message.sender, options);
            if (message.receiver != null && message.hasOwnProperty("receiver"))
                object.receiver = message.receiver;
            if (message.time != null && message.hasOwnProperty("time"))
                object.time = message.time;
            if (message.remark != null && message.hasOwnProperty("remark"))
                object.remark = message.remark;
            if (message.ext != null && message.hasOwnProperty("ext"))
                object.ext = message.ext;
            return object;
        };

        /**
         * Converts this Notify to JSON.
         * @function toJSON
         * @memberof messagepackage.Notify
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Notify.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Notify;
    })();

    messagepackage.AckResponse = (function() {

        /**
         * Properties of an AckResponse.
         * @memberof messagepackage
         * @interface IAckResponse
         * @property {number|null} [code] AckResponse code
         * @property {string|null} [msg] AckResponse msg
         */

        /**
         * Constructs a new AckResponse.
         * @memberof messagepackage
         * @classdesc Represents an AckResponse.
         * @implements IAckResponse
         * @constructor
         * @param {messagepackage.IAckResponse=} [properties] Properties to set
         */
        function AckResponse(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AckResponse code.
         * @member {number} code
         * @memberof messagepackage.AckResponse
         * @instance
         */
        AckResponse.prototype.code = 0;

        /**
         * AckResponse msg.
         * @member {string} msg
         * @memberof messagepackage.AckResponse
         * @instance
         */
        AckResponse.prototype.msg = "";

        /**
         * Creates a new AckResponse instance using the specified properties.
         * @function create
         * @memberof messagepackage.AckResponse
         * @static
         * @param {messagepackage.IAckResponse=} [properties] Properties to set
         * @returns {messagepackage.AckResponse} AckResponse instance
         */
        AckResponse.create = function create(properties) {
            return new AckResponse(properties);
        };

        /**
         * Encodes the specified AckResponse message. Does not implicitly {@link messagepackage.AckResponse.verify|verify} messages.
         * @function encode
         * @memberof messagepackage.AckResponse
         * @static
         * @param {messagepackage.IAckResponse} message AckResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AckResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.code != null && Object.hasOwnProperty.call(message, "code"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.code);
            if (message.msg != null && Object.hasOwnProperty.call(message, "msg"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.msg);
            return writer;
        };

        /**
         * Encodes the specified AckResponse message, length delimited. Does not implicitly {@link messagepackage.AckResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof messagepackage.AckResponse
         * @static
         * @param {messagepackage.IAckResponse} message AckResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AckResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AckResponse message from the specified reader or buffer.
         * @function decode
         * @memberof messagepackage.AckResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {messagepackage.AckResponse} AckResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AckResponse.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.messagepackage.AckResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.code = reader.int32();
                    break;
                case 2:
                    message.msg = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AckResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof messagepackage.AckResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {messagepackage.AckResponse} AckResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AckResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AckResponse message.
         * @function verify
         * @memberof messagepackage.AckResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AckResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.code != null && message.hasOwnProperty("code"))
                if (!$util.isInteger(message.code))
                    return "code: integer expected";
            if (message.msg != null && message.hasOwnProperty("msg"))
                if (!$util.isString(message.msg))
                    return "msg: string expected";
            return null;
        };

        /**
         * Creates an AckResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof messagepackage.AckResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {messagepackage.AckResponse} AckResponse
         */
        AckResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.messagepackage.AckResponse)
                return object;
            var message = new $root.messagepackage.AckResponse();
            if (object.code != null)
                message.code = object.code | 0;
            if (object.msg != null)
                message.msg = String(object.msg);
            return message;
        };

        /**
         * Creates a plain object from an AckResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof messagepackage.AckResponse
         * @static
         * @param {messagepackage.AckResponse} message AckResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AckResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.code = 0;
                object.msg = "";
            }
            if (message.code != null && message.hasOwnProperty("code"))
                object.code = message.code;
            if (message.msg != null && message.hasOwnProperty("msg"))
                object.msg = message.msg;
            return object;
        };

        /**
         * Converts this AckResponse to JSON.
         * @function toJSON
         * @memberof messagepackage.AckResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AckResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AckResponse;
    })();

    return messagepackage;
})();

module.exports = $root;
