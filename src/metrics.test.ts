import { expect } from 'chai'
import { Metric, MetricsHandler } from './metrics'
import { LevelDb } from "./database"

const dbPath: string = 'db_test'
var dbMet: MetricsHandler = new MetricsHandler('./db/metrics')

describe('Metrics', function () {
   before(function () {
     LevelDb.clear(dbPath)
     dbMet = new MetricsHandler(dbPath)
   })

   after(function () {
     dbMet.db.close()
   })

   describe('#get', function () {
     it('should get empty array on non existing group', function () {
        dbMet.get("0", function (err: Error | null, result?: Metric[]) {
          expect(err).to.be.null
          expect(result).to.not.be.undefined
          expect(result).to.be.empty
        })
     })
   })

   describe('#save', function () {
     const met = [new Metric(`${new Date('2018-12-17 01:40 UTC').getTime()}`, 9)]
      it('should save data', function (done) {
        dbMet.save("savetest", met, (err: Error | null) => {
        expect(err).to.be.undefined
        dbMet.get("savetest", (err: Error | null, result?: Metric[]) => {
          expect(result).to.not.be.undefined
          expect(result).to.be.an('array')
          expect(result).to.eql(met)
          done()
        })
      })
     })

      it('should update existing data', function (done) {
        //Pour s'assurer que la data existe
      dbMet.save("savetest", met, (err: Error | null) => {
        expect(err).to.be.undefined
        //ensuite on met à jour
        const newMet = [new Metric(`${new Date('2018-12-17 01:55 UTC').getTime()}`, 10)]
        dbMet.save("savetest", newMet, (err: Error | null) => {
          expect(err).to.be.undefined
          dbMet.get("savetest", (err: Error | null, result?: Metric[]) => {
            expect(result).to.not.be.undefined
            expect(result).to.be.an('array')
            expect(result).to.eql(newMet)
            done()
          })
        })
      })
    })
   })

  describe('#delete', function() {
    const met = [new Metric(`${new Date('2018-11-30 08:00 UTC').getTime()}`,10)]

    before(function (done) {
      dbMet.save("deletest", met, (err: Error | null) => {
        expect(err).to.be.undefined
        done()
      })
    })

    it('should delete data', function(done) {
      dbMet.remove("deletest","1394942400000", (err: Error | null) => {
        expect(err).to.be.null
        dbMet.get("deletest", (err: Error | null, result?: Metric[]) => {
          expect(err).to.be.null
          expect(result).to.not.be.undefined
          expect(result).to.be.an('array')
          done()
        })
      })
    })

    it('should not fail if data does not exist', function (done) {
      dbMet.remove("none","1234567800000", (err: Error | null) => {
          expect(err).to.be.null
          done()
        })
      })
    })
  })
