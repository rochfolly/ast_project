import { LevelDb } from './database'
import WriteStream from 'level-ws'

export class Metric {
  public timestamp: Date
  public value: number

  constructor(ts: string, v: number) {
    this.timestamp = new Date(ts)
    this.value = v
  }
}

export class MetricsHandler {
  public db: any

  constructor(dbPath: string) {
    this.db = LevelDb.open(dbPath)
  }

  public get(key: string, callback: (error: Error | null, result?: Metric[]) => void) {
    const stream = this.db.createReadStream()
    var met: Metric[] = []

    stream.on('error', callback)
    stream.on('end', (err: Error) => {
        callback(null, met)
      })
    stream.on('data', (data: any) => {
      const [ , k, timestamp] = data.key.split(":")
      const value = data.value

      if (key !== k) {
       console.log(`LevelDb error: ${data} does not match key ${key}`)
      } else {
     met.push(new Metric(timestamp, value))
     }
    })

  }

  public save(key: string, metrics: Metric[], callback: (error: Error | null) => void) {
    const stream = WriteStream(this.db)

    stream.on('error', callback)
    stream.on('close', callback)

    metrics.forEach(m => {
      stream.write({ key: `metric:${key}:${m.timestamp}`, value: m.value })
    })

    stream.end()
  }

  public remove(key: string, tsp: string, callback: (error: Error | null) => void) {
    const stream = this.db.createReadStream()

    stream.on('error', (err:Error) => callback(err))
    stream.on('end', () => callback(null))
    stream.on('data', (data:any) => {
        const [ , k, timestamp] = data.key.split(":")
        if ((key === k) && (tsp === timestamp)) this.db.del(data.key)
      })
  }


}
