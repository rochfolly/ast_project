#!/usr/bin/env ts-node

import { MetricsHandler, Metric } from '../src/metrics'
import { UserHandler, User } from '../src/users'
const dbMet = new MetricsHandler('db/metrics')
const dbUser = new UserHandler('db/users')


const metrics1 = [
  new Metric(`${new Date("2018-12-15 14:00 UTC").getTime()}`, 2),
  new Metric(`${new Date("2018-12-15 14:30 UTC").getTime()}`, 4),
  new Metric(`${new Date("2018-12-15 15:00 UTC").getTime()}`, 6)
];

const metrics2 = [
  new Metric(`${new Date("2018-12-16 16:00 UTC").getTime()}`, 5),
  new Metric(`${new Date("2018-12-16 17:00 UTC").getTime()}`, 15),
  new Metric(`${new Date("2018-12-16 18:00 UTC").getTime()}`, 25)
];

const user1 = new User("anakin", "anakin@skywalker.com", "highground");
const user2 = new User("obi-wan", "obiwan@kenobi.com", "hellothere");

//Save Users
dbUser.save(user1, (err: Error | null) => {
    if (err) throw err
    console.log('User1 sauvegardé, voici les identifiants: ')
    console.log('Username: anakin, password: highground ')
})

dbUser.save(user2, (err: Error | null) => {
      if (err) throw err
      console.log('User2 sauvegardé, voici les identifiants: ')
      console.log('Username: obi-wan, password: hellothere ')
})

//Save Metrics
dbMet.save('anakin', metrics1, (err: Error | null) => {
  if (err) throw err
  console.log('Metrics for User1 saved')
})

dbMet.save('obi-wan', metrics2, (err: Error | null) => {
  if (err) throw err
  console.log('Metrics for User2 saved')
})
