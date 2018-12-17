"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const metrics_1 = require("./metrics");
const database_1 = require("./database");
const dbPath = 'db_test';
var dbMet = new metrics_1.MetricsHandler('./db/metrics');
describe('Metrics', function () {
    before(function () {
        database_1.LevelDb.clear(dbPath);
        dbMet = new metrics_1.MetricsHandler(dbPath);
    });
    after(function () {
        dbMet.db.close();
    });
    describe('#get', function () {
        it('should get empty array on non existing group', function () {
            dbMet.get("0", function (err, result) {
                chai_1.expect(err).to.be.null;
                chai_1.expect(result).to.not.be.undefined;
                chai_1.expect(result).to.be.empty;
            });
        });
    });
    describe('#save', function () {
        const met = [new metrics_1.Metric(`${new Date('2018-12-17 01:40 UTC').getTime()}`, 9)];
        it('should save data', function (done) {
            dbMet.save("savetest", met, (err) => {
                chai_1.expect(err).to.be.undefined;
                dbMet.get("savetest", (err, result) => {
                    chai_1.expect(result).to.not.be.undefined;
                    chai_1.expect(result).to.be.an('array');
                    chai_1.expect(result).to.equal(met);
                    done();
                });
            });
        });
        it('should update existing data', function (done) {
            //Pour s'assurer que la data existe
            dbMet.save("savetest", met, (err) => {
                chai_1.expect(err).to.be.undefined;
                //ensuite on met à jour
                const newMet = [new metrics_1.Metric(`${new Date('2018-12-17 01:55 UTC').getTime()}`, 10)];
                dbMet.save("savetest", newMet, (err) => {
                    chai_1.expect(err).to.be.undefined;
                    dbMet.get("savetest", (err, result) => {
                        chai_1.expect(result).to.not.be.undefined;
                        chai_1.expect(result).to.be.an('array');
                        chai_1.expect(result).to.equal(newMet);
                        done();
                    });
                });
            });
        });
    });
    describe('#delete', function () {
        const met = [new metrics_1.Metric(`${new Date('2018-11-30 08:00 UTC').getTime()}`, 10)];
        before(function (done) {
            dbMet.save("deletest", met, (err) => {
                chai_1.expect(err).to.be.undefined;
                done();
            });
        });
        it('should delete data', function (done) {
            dbMet.remove("deletest", "1394942400000", (err) => {
                chai_1.expect(err).to.be.null;
                dbMet.get("deletest", (err, result) => {
                    chai_1.expect(err).to.be.null;
                    chai_1.expect(result).to.not.be.undefined;
                    chai_1.expect(result).to.be.an('array');
                    chai_1.expect(result).to.be.empty;
                    done();
                });
            });
        });
        it('should not fail if data does not exist', function (done) {
            dbMet.remove("none", "1234567800000", (err) => {
                chai_1.expect(err).to.be.null;
                done();
            });
        });
    });
});
