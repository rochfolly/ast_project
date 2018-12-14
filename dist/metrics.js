"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Metric {
    constructor(ts, v) {
        this.timestamp = new Date(ts);
        this.value = v;
    }
}
exports.Metric = Metric;
class MetricsHandler {
    static get(callback) {
        const result = [
            new Metric('2013-11-04 14:00 UTC', 12),
            new Metric('2013-11-04 14:30 UTC', 15)
        ];
        callback(null, result);
    }
}
exports.MetricsHandler = MetricsHandler;
