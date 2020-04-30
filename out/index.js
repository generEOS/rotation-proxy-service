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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("./client");
var helper_1 = require("./helper");
var path_1 = __importStar(require("path"));
var fs_1 = __importDefault(require("fs"));
require('dotenv').config({ path: path_1.resolve(__dirname, '../.env') });
// import winston from 'winston'
// const logger = winston.createLogger({
//   level:  'info',
//   format: winston.format.simple(),
//   transports:  [
//     new winston.transports.File({ filename: process.env.LOG_ERROR, level: 'error' }),
//     new winston.transports.File({ filename: process.env.LOG })
//   ]
// });
var log_path = 'logs';
if (!fs_1.default.existsSync(log_path)) {
    fs_1.default.mkdirSync(log_path);
}
var logger = require('simple-node-logger').createSimpleLogger(path_1.default.join(log_path, process.env.LOG));
var bp_num = Number(process.env.BP_NUM);
var start_rank = Number(process.env.START_RANK);
var end_rank = Number(process.env.END_RANK);
var eos = new client_1.EosClient(helper_1.config, helper_1.client, helper_1.customizedFetch);
function compare(a, b) {
    if (a.json.total_votes > b.json.total_votes) {
        return 1;
    }
    if (a.json.total_votes < b.json.total_votes) {
        return -1;
    }
    return 0;
}
function rotate(nums, k) {
    return nums.slice(k).concat(nums.slice(0, k));
}
function fetchBPs() {
    return __awaiter(this, void 0, void 0, function () {
        var obj, response, producers, i, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    obj = {
                        producers: []
                    };
                    return [4 /*yield*/, eos.fetchTable('eosio', 'eosio', 'producers')];
                case 1:
                    response = _a.sent();
                    producers = response.result.sort(compare).reverse().slice(start_rank - 1, end_rank - 1);
                    for (i = 0; i < end_rank - start_rank; i++) {
                        obj.producers.push({ id: i, name: producers[i].json.owner });
                    }
                    return [2 /*return*/, obj];
                case 2:
                    error_1 = _a.sent();
                    logger.error(error_1.message, ' at ', new Date().toJSON());
                    return [2 /*return*/, {}];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function vote(bps) {
    return __awaiter(this, void 0, void 0, function () {
        var voted_bps, i, data;
        return __generator(this, function (_a) {
            try {
                logger.info('-----*Start VOTE*----');
                voted_bps = [];
                for (i = end_rank - start_rank - bp_num; i < end_rank - start_rank; i++) {
                    voted_bps.push(bps.producers[i].name);
                }
                logger.info('-----*Producer List*----' + '\n' + voted_bps);
                data = {
                    voter: process.env.VOTER,
                    proxy: process.env.PROXY,
                    producers: voted_bps
                };
                // Note: 'votepermission' is a custom permission
                // let response  = eos.pushTrx('eosio','voteproducer',<string>process.env.VOTER,'votepermission',data)
                // logger.info('-----*STATUS*----' + '\n' + JSON.stringify(response, null, 2))
                bps.producers = rotate(bps.producers, 1);
                logger.info('-----*End VOTE*----');
            }
            catch (error) {
                logger.error(error.message, ' at ', new Date().toJSON());
            }
            return [2 /*return*/];
        });
    });
}
var bps = {}; // Initialize BPs Global Variable
function start() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchBPs()];
                case 1:
                    bps = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
start();
setInterval(function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, start()];
                case 1:
                    bps = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}, 60 * 1000);
// }, 60 * 60 * 24 * 30 * 1000) // Each 30 DAYS 
setInterval(function () {
    vote(bps);
}, 10 * 1000);
// }, 60 * 60 * 24 * 1000) // Each DAY - for 30 DAYS
//# sourceMappingURL=index.js.map