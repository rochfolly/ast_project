"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const encoding_down_1 = __importDefault(require("encoding-down"));
const leveldown_1 = __importDefault(require("leveldown"));
const levelup_1 = __importDefault(require("levelup"));
const fs = require("fs");
const del = require("del");
class LevelDb {
    static open(path) {
        const encoded = encoding_down_1.default(leveldown_1.default(path), { valueEncoding: 'json' });
        return levelup_1.default(encoded);
    }
    static clear(path) {
        if (fs.existsSync(path)) {
            del.sync(path, { force: true });
        }
    }
}
exports.LevelDb = LevelDb;
