import * as $protobuf from "protobufjs";
/** Namespace messagepackage. */
export namespace messagepackage {

    /** Properties of a Message. */
    interface IMessage {

        /** Message id */
        id?: (string|null);

        /** Message type */
        type?: (string|null);

        /** Message session */
        session?: (number|null);

        /** Message text */
        text?: (string|null);

        /** Message image */
        image?: (string|null);

        /** Message status */
        status?: (number|null);

        /** Message sender */
        sender?: (messagepackage.ISender|null);

        /** Message receiver */
        receiver?: (number|null);

        /** Message time */
        time?: (string|null);

        /** Message ext */
        ext?: (string|null);
    }

    /** Represents a Message. */
    class Message implements IMessage {

        /**
         * Constructs a new Message.
         * @param [properties] Properties to set
         */
        constructor(properties?: messagepackage.IMessage);

        /** Message id. */
        public id: string;

        /** Message type. */
        public type: string;

        /** Message session. */
        public session: number;

        /** Message text. */
        public text: string;

        /** Message image. */
        public image: string;

        /** Message status. */
        public status: number;

        /** Message sender. */
        public sender?: (messagepackage.ISender|null);

        /** Message receiver. */
        public receiver: number;

        /** Message time. */
        public time: string;

        /** Message ext. */
        public ext: string;

        /**
         * Creates a new Message instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Message instance
         */
        public static create(properties?: messagepackage.IMessage): messagepackage.Message;

        /**
         * Encodes the specified Message message. Does not implicitly {@link messagepackage.Message.verify|verify} messages.
         * @param message Message message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: messagepackage.IMessage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Message message, length delimited. Does not implicitly {@link messagepackage.Message.verify|verify} messages.
         * @param message Message message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: messagepackage.IMessage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Message message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Message
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): messagepackage.Message;

        /**
         * Decodes a Message message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Message
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): messagepackage.Message;

        /**
         * Verifies a Message message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Message message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Message
         */
        public static fromObject(object: { [k: string]: any }): messagepackage.Message;

        /**
         * Creates a plain object from a Message message. Also converts values to other types if specified.
         * @param message Message
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: messagepackage.Message, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Message to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sender. */
    interface ISender {

        /** Sender id */
        id?: (number|null);

        /** Sender account */
        account?: (string|null);

        /** Sender avatar */
        avatar?: (string|null);

        /** Sender email */
        email?: (string|null);

        /** Sender regisTime */
        regisTime?: (string|null);

        /** Sender updateTime */
        updateTime?: (string|null);
    }

    /** Represents a Sender. */
    class Sender implements ISender {

        /**
         * Constructs a new Sender.
         * @param [properties] Properties to set
         */
        constructor(properties?: messagepackage.ISender);

        /** Sender id. */
        public id: number;

        /** Sender account. */
        public account: string;

        /** Sender avatar. */
        public avatar: string;

        /** Sender email. */
        public email: string;

        /** Sender regisTime. */
        public regisTime: string;

        /** Sender updateTime. */
        public updateTime: string;

        /**
         * Creates a new Sender instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sender instance
         */
        public static create(properties?: messagepackage.ISender): messagepackage.Sender;

        /**
         * Encodes the specified Sender message. Does not implicitly {@link messagepackage.Sender.verify|verify} messages.
         * @param message Sender message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: messagepackage.ISender, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Sender message, length delimited. Does not implicitly {@link messagepackage.Sender.verify|verify} messages.
         * @param message Sender message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: messagepackage.ISender, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Sender message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sender
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): messagepackage.Sender;

        /**
         * Decodes a Sender message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Sender
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): messagepackage.Sender;

        /**
         * Verifies a Sender message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sender message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sender
         */
        public static fromObject(object: { [k: string]: any }): messagepackage.Sender;

        /**
         * Creates a plain object from a Sender message. Also converts values to other types if specified.
         * @param message Sender
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: messagepackage.Sender, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sender to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Notify. */
    interface INotify {

        /** Notify id */
        id?: (string|null);

        /** Notify type */
        type?: (number|null);

        /** Notify status */
        status?: (number|null);

        /** Notify sender */
        sender?: (messagepackage.ISender|null);

        /** Notify receiver */
        receiver?: (number|null);

        /** Notify time */
        time?: (string|null);

        /** Notify remark */
        remark?: (string|null);

        /** Notify ext */
        ext?: (string|null);
    }

    /** Represents a Notify. */
    class Notify implements INotify {

        /**
         * Constructs a new Notify.
         * @param [properties] Properties to set
         */
        constructor(properties?: messagepackage.INotify);

        /** Notify id. */
        public id: string;

        /** Notify type. */
        public type: number;

        /** Notify status. */
        public status: number;

        /** Notify sender. */
        public sender?: (messagepackage.ISender|null);

        /** Notify receiver. */
        public receiver: number;

        /** Notify time. */
        public time: string;

        /** Notify remark. */
        public remark: string;

        /** Notify ext. */
        public ext: string;

        /**
         * Creates a new Notify instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Notify instance
         */
        public static create(properties?: messagepackage.INotify): messagepackage.Notify;

        /**
         * Encodes the specified Notify message. Does not implicitly {@link messagepackage.Notify.verify|verify} messages.
         * @param message Notify message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: messagepackage.INotify, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Notify message, length delimited. Does not implicitly {@link messagepackage.Notify.verify|verify} messages.
         * @param message Notify message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: messagepackage.INotify, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Notify message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Notify
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): messagepackage.Notify;

        /**
         * Decodes a Notify message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Notify
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): messagepackage.Notify;

        /**
         * Verifies a Notify message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Notify message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Notify
         */
        public static fromObject(object: { [k: string]: any }): messagepackage.Notify;

        /**
         * Creates a plain object from a Notify message. Also converts values to other types if specified.
         * @param message Notify
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: messagepackage.Notify, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Notify to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an AckResponse. */
    interface IAckResponse {

        /** AckResponse code */
        code?: (number|null);

        /** AckResponse msg */
        msg?: (string|null);
    }

    /** Represents an AckResponse. */
    class AckResponse implements IAckResponse {

        /**
         * Constructs a new AckResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: messagepackage.IAckResponse);

        /** AckResponse code. */
        public code: number;

        /** AckResponse msg. */
        public msg: string;

        /**
         * Creates a new AckResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns AckResponse instance
         */
        public static create(properties?: messagepackage.IAckResponse): messagepackage.AckResponse;

        /**
         * Encodes the specified AckResponse message. Does not implicitly {@link messagepackage.AckResponse.verify|verify} messages.
         * @param message AckResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: messagepackage.IAckResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified AckResponse message, length delimited. Does not implicitly {@link messagepackage.AckResponse.verify|verify} messages.
         * @param message AckResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: messagepackage.IAckResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AckResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns AckResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): messagepackage.AckResponse;

        /**
         * Decodes an AckResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns AckResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): messagepackage.AckResponse;

        /**
         * Verifies an AckResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an AckResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns AckResponse
         */
        public static fromObject(object: { [k: string]: any }): messagepackage.AckResponse;

        /**
         * Creates a plain object from an AckResponse message. Also converts values to other types if specified.
         * @param message AckResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: messagepackage.AckResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this AckResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}
