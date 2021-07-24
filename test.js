const protobuf = require("protobufjs");
const crypto = require("crypto");

// 生成 Alice 的密钥。
const alice = crypto.createECDH("secp521r1");
const aliceKey = alice.generateKeys();
// const alicePub = alice.getPublicKey("hex");
// console.log(alice.getPrivateKey("hex").toString("hex"));

// const alicePrivateKey = alice.getPrivateKey("hex");
// console.log(alicePrivateKey);

// 生成 Bob 的密钥。
const bob = crypto.createECDH("secp521r1");
const bobKey = bob.generateKeys();
// const bobPub = bob.getPublicKey("hex");
// console.log(bob.getPrivateKey("hex").toString("hex"));

// const aaa = crypto.createECDH("secp521r1");
// aaa.setPrivateKey(alicePrivateKey, "hex");

console.log(bob.getPublicKey().toString("hex"));
console.log(alice.getPublicKey().toString("hex"));

// 交换并生成密钥。
const aliceSecret = alice.computeSecret(bob.getPublicKey(), null, "hex");
const bobSecret = bob.computeSecret(alice.getPublicKey(), null, "hex");

// const aaaSecret = bob.computeSecret(aliceKey);

console.log(aliceSecret.toString("hex"));
console.log(bobSecret.toString("hex"));
// console.log(aaaSecret.toString("hex"));

/** https://colobu.com/2015/01/07/Protobuf-language-guide/
 * https://juejin.im/post/6844903735664050184
 * 先压缩再加密 还是 先加密再压缩：
 *    https://security.stackexchange.com/questions/19969/encryption-and-compression-of-data
 * protobuf 只是做序列化 是压缩技术？？ 会影响加密解密的安全性问题吗？？？
 */

protobuf.load("./common/proto/message.proto", function (err, root) {
  if (err) throw err;

  // Obtain a message type
  var AwesomeMessage = root.lookupType("messagepackage.Message");

  // Exemplary payload
  var payload = {
    msgId: "1",
    type: 0,
    content: "ssss",
    timestamp: new Date().getTime(),
  };

  // const algorithm = "aes-192-cbc";
  // const password = "zhangyifan";
  // const key = crypto.scryptSync(password, "key", 24);

  // const iv = crypto.randomBytes(16);
  // const cipher = crypto.createCipheriv(algorithm, key, iv);

  // let encrypted = cipher.update(JSON.stringify(payload), "utf8", "hex");
  // encrypted += cipher.final("hex");

  // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
  var errMsg = AwesomeMessage.verify(payload);
  if (errMsg) throw Error(errMsg);

  // Create a new message
  var message = AwesomeMessage.create(payload); // or use .fromObject if conversion is necessary

  // Encode a message to an Uint8Array (browser) or Buffer (node)
  var buffer = AwesomeMessage.encode(message).finish();
  console.log(buffer);
  // ... do something with buffer

  // Decode an Uint8Array (browser) or Buffer (node) to a message
  var message = AwesomeMessage.decode(buffer);
  // console.log(message);
  // ... do something with message

  // If the application uses length-delimited buffers, there is also encodeDelimited and decodeDelimited.

  // Maybe convert the message back to a plain object
  var object = AwesomeMessage.toObject(message, {
    longs: String,
    enums: String,
    bytes: String,
    // see ConversionOptions
  });
  console.log(object);

  // const decipher = crypto.createDecipheriv(algorithm, key, iv);

  // let decrypted = decipher.update(object.data, "hex", "utf8");
  // decrypted += decipher.final("utf8");
  // console.log(decrypted);
});

// message AckResponse {
//   required int32 code = 1;
// 	required string msg = 2;
//   repeated Result details = 3;
// }

// message Result {
//   required string name = 1;
//   required int32 age = 2;
// }

// const { messagepackage } = require("./proto/proto");
// const {
//   Message: ProtoMessage,
//   Notify: ProtoNotify,
//   AckResponse,
// } = messagepackage;

// function setAckResponseToProto(ack) {
//   const message = AckResponse.create(ack);
//   return AckResponse.encode(message).finish();
// }

// function getAckResponseFromProto(buffer) {
//   const decodedMessage = AckResponse.decode(buffer);
//   return AckResponse.toObject(decodedMessage, {
//     longs: String,
//     enums: String,
//     bytes: String,
//   });
// }

// const buf = setAckResponseToProto({
//   code: 200,
//   msg: "successed",
//   details: [
//     { name: "111", age: 11 },
//     { name: "222", age: 22 },
//     { name: "333", age: 33 },
//   ],
// });

// console.log(buf);

// const data = getAckResponseFromProto(buf);

// console.log(data);
// console.log(data.details.length);

