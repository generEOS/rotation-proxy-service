"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@dfuse/client");
var eosjs_1 = require("eosjs");
var eosjs_jssig_1 = require("eosjs/dist/eosjs-jssig");
var text_encoding_1 = require("text-encoding");
var node_fetch_1 = __importDefault(require("node-fetch"));
var ws_1 = __importDefault(require("ws"));
global.fetch = node_fetch_1.default;
global.WebSocket = ws_1.default;
var EosClient = /** @class */ (function () {
    /**
     * @param config
     * @param client
     * @param fetch
     */
    function EosClient(config, client, fetch) {
        this.config = config;
        this.client = client;
        var signatureProvider = new eosjs_jssig_1.JsSignatureProvider([this.config.privateKey]);
        var rpc = new eosjs_1.JsonRpc(this.client.endpoints.restUrl, { fetch: fetch });
        this.rpc = rpc;
        this.api = new eosjs_1.Api({
            rpc: rpc,
            signatureProvider: signatureProvider,
            textDecoder: new text_encoding_1.TextDecoder(),
            textEncoder: new text_encoding_1.TextEncoder()
        });
    }
    EosClient.prototype.getHeadInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rpc.get_info()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    EosClient.prototype.streamHeadInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stream;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.streamHeadInfo(function (message) {
                            if (message.type === client_1.InboundMessageType.LISTENING) {
                                console.log(_this.prettyJson(message.data));
                            }
                            if (message.type === client_1.InboundMessageType.HEAD_INFO) {
                                console.log(_this.prettyJson(message.data));
                            }
                        })];
                    case 1:
                        stream = _a.sent();
                        return [4 /*yield*/, client_1.waitFor(15000)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, stream.close()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @param accounts
     */
    EosClient.prototype.streamAccount = function (accounts) {
        return __awaiter(this, void 0, void 0, function () {
            var stream;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.streamActionTraces({
                            accounts: accounts,
                            with_inline_traces: true,
                            with_dbops: true,
                            with_dtrxops: true,
                            with_ramops: true,
                            with_tableops: true
                        }, function (message) {
                            if (message.type === client_1.InboundMessageType.LISTENING) {
                                console.log(_this.prettyJson(message.data));
                                return;
                            }
                            if (message.type === client_1.InboundMessageType.ACTION_TRACE) {
                                console.log(_this.prettyJson(message.data));
                                return;
                            }
                            if (message.type === client_1.InboundMessageType.ERROR) {
                                console.log(_this.prettyJson(message.data));
                                return;
                            }
                        })];
                    case 1:
                        stream = _a.sent();
                        return [4 /*yield*/, client_1.waitFor(15000)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, stream.close()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @param account
     */
    EosClient.prototype.getAccount = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.rpc.get_account(account)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @param account
     */
    EosClient.prototype.hasAccount = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.stateTable('eosio', account, 'userres')];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.rows.length > 0];
                }
            });
        });
    };
    /**
     * @param account
     * @param action
     * @param actor
     * @param permission
     * @param data
     * @param _options
     */
    EosClient.prototype.pushTrx = function (account, action, actor, permission, data, _options) {
        if (permission === void 0) { permission = 'active'; }
        return __awaiter(this, void 0, void 0, function () {
            var trx, options, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trx = {
                            account: account,
                            name: action,
                            authorization: [
                                {
                                    actor: actor,
                                    permission: permission
                                }
                            ],
                            data: data
                        };
                        options = _options == undefined ? { blocksBehind: 360, expireSeconds: 3600 } : _options;
                        return [4 /*yield*/, this.api.transact({
                                actions: [trx]
                            }, options)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, { result: response }];
                }
            });
        });
    };
    /**
     * @param account
     * @param scope
     * @param table
     * @param _key
     * @param _options
     * @param _atBlock
     */
    EosClient.prototype.fetchTable = function (account, scope, table, _key, _options, _atBlock) {
        return __awaiter(this, void 0, void 0, function () {
            var options, response, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = _options == undefined ? { blockNum: _atBlock === undefined ? undefined : _atBlock } : _options;
                        if (!(_key == undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.stateTable(account, scope, table, options)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, { result: response.rows }];
                    case 2: return [4 /*yield*/, this.client.stateTableRow(account, scope, table, _key, options)];
                    case 3:
                        response = _a.sent();
                        return [2 /*return*/, { result: response.row }];
                }
            });
        });
    };
    /**
     * @param id
     */
    EosClient.prototype.fetchTrx = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.fetchTransaction(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Helper functions
     */
    EosClient.prototype.printResult = function (result, startTime, endTime) {
        console.log('Transaction push result ' + this.prettyJson(result) + '\n');
        var elapsed = (endTime.getTime() - startTime.getTime()) / 1000.0;
        console.log("Pushed with guaranteed '" + this.config.guaranteed + "' in '" + elapsed + "' seconds" + '\n');
        var networkMatch = this.client.endpoints.restUrl.match(/https:\/\/(mainnet|testnet|kylin).eos.dfuse.io/);
        if (networkMatch !== null && networkMatch[1] != null) {
            var network = networkMatch[1] + '.';
            if (network === 'mainnet') {
                network = '';
            }
            console.log("- https://" + network + "eosq.app/tx/" + result.transaction_id + '\n');
        }
    };
    EosClient.prototype.prettyJson = function (input) {
        return JSON.stringify(input, null, 2);
    };
    return EosClient;
}());
exports.EosClient = EosClient;
//# sourceMappingURL=client.js.map