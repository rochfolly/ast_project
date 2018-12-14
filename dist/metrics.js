"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database");
const level_ws_1 = __importDefault(require("level-ws"));
class Metric {
    constructor(ts, v) {
        this.timestamp = new Date(ts);
        this.value = v;
    }
}
exports.Metric = Metric;
class MetricsHandler {
    constructor(dbPath) {
        this.db = database_1.LevelDb.open(dbPath);
    }
    get(key, callback) {
        const stream = this.db.createReadStream();
        var met = [];
        stream.on('error', callback);
        stream.on('data', (data) => {
            const [_, k, timestamp] = data.key.split(":");
            const value = data.value;
            if (key != k) {
                console.log(`LevelDB error: ${data} does not match key ${key}`);
            }
            else {
                met.push(new Metric(timestamp, value));
            }
        });
    }
    save(key, metrics, callback) {
        const stream = level_ws_1.default(this.db);
        stream.on('error', callback);
        stream.on('close', callback);
        metrics.forEach(m => {
            stream.write({ key: `metric:${key}${m.timestamp}`, value: m.value });
        });
        stream.end();
    }
}
exports.MetricsHandler = MetricsHandler;
