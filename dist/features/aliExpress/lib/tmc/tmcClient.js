"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmcClient = void 0;
const ws_1 = __importDefault(require("ws"));
const common_js_1 = require("./common.js");
const tmcCodec_js_1 = require("./tmcCodec.js");
const topUtil_js_1 = require("../topUtil.js");
var codec = new tmcCodec_js_1.TmcCodec();
var client;
class TmcClient {
    constructor(appkey, appsecret, groupName) {
        this._appkey = appkey;
        this._appsecret = appsecret;
        this._groupName = groupName;
        this._uri = "ws://mc.api.taobao.com/";
        this._ws = null;
        this.isReconing = false;
        this._callback = null;
        this._interval = null;
        client = this;
    }
    createSign(timestamp) {
        var basestring = this._appsecret;
        basestring += "app_key" + this._appkey;
        basestring += "group_name" + this._groupName;
        basestring += "timestamp" + timestamp;
        basestring += this._appsecret;
        return (0, topUtil_js_1.md5)(basestring).toUpperCase();
    }
    createConnectMessage() {
        var msg = {};
        msg.messageType = common_js_1.Common.enum.MessageType.CONNECT;
        var timestamp = Date.now();
        var content = {
            app_key: this._appkey,
            group_name: this._groupName,
            timestamp: timestamp + "",
            sign: this.createSign(timestamp),
            sdk: "NodeJS-1.2.0",
            intranet_ip: (0, topUtil_js_1.getLocalIPAdress)(),
        };
        msg.content = content;
        var buffer = codec.writeMessage(msg);
        return buffer;
    }
    createPullMessage() {
        var msg = {};
        msg.protocolVersion = 2;
        msg.messageType = common_js_1.Common.enum.MessageType.SEND;
        var content = {
            __kind: common_js_1.Common.enum.MessageKind.PullRequest,
        };
        msg.token = client._token;
        msg.content = content;
        var buffer = codec.writeMessage(msg);
        return buffer;
    }
    createConfirmMessage(id) {
        var msg = {};
        msg.protocolVersion = 2;
        msg.messageType = common_js_1.Common.enum.MessageType.SEND;
        var content = {
            __kind: common_js_1.Common.enum.MessageKind.Confirm,
            id: id,
        };
        msg.token = client._token;
        msg.content = content;
        var buffer = codec.writeMessage(msg);
        return buffer;
    }
    autoPull() {
        if (client._ws) {
            client._ws.send(client.createPullMessage(), { binary: true, mask: true });
        }
    }
    reconnect(duration) {
        if (this.isReconing)
            return;
        this.isReconing = true;
        setTimeout(function timeout() {
            client.connect(client._uri, client._callback);
        }, duration);
    }
    connect(uri, callback) {
        this._uri = uri;
        this._callback = callback;
        if (client._ws != null) {
            client._ws.close();
        }
        var ws = new ws_1.default(this._uri);
        ws.on("open", function open() {
            client._ws = ws;
            this.send(client.createConnectMessage(), { binary: true, mask: true });
            if (!client._interval) {
                client._interval = setInterval(client.autoPull, 5000);
            }
        });
        ws.on("message", function (data, flags) {
            if (flags.binary) {
                var message = codec.readMessage(data);
                if (message != null &&
                    message.messageType == common_js_1.Common.enum.MessageType.CONNECTACK) {
                    if (message.statusCode) {
                        throw new Error(message.statusPhase);
                    }
                    else {
                        client._token = message.token;
                        console.log("top message channel connect success, token = " + message.token);
                    }
                }
                else if (message != null &&
                    message.messageType == common_js_1.Common.enum.MessageType.SEND) {
                    var status = { success: true };
                    try {
                        client._callback(message, status);
                    }
                    catch (err) {
                        status.success = false;
                    }
                    if (status.success) {
                        ws.send(client.createConfirmMessage(message.id), {
                            binary: true,
                            mask: true,
                        });
                    }
                }
                else {
                    // console.log(message);
                }
            }
        });
        ws.on("ping", function (data, flags) {
            ws.pong(data, { mask: true }, true);
        });
        ws.on("error", function (reason, errorCode) {
            console.log("tmc client error,reason : " + reason + " code : " + errorCode);
            console.log("tmc client channel closed begin reconnect");
            client._ws = null;
            client.reconnect(15000);
        });
        ws.on("close", function close() {
            console.log("tmc client channel closed begin reconnect");
            client._ws = null;
            client.reconnect(3000);
        });
        this.isReconing = false;
    }
}
const _TmcClient = TmcClient;
exports.TmcClient = _TmcClient;
