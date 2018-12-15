import express = require('express');
import bodyparser = require('body-parser')
import morgan = require('morgan')
import session = require('express-session')
import levelSession = require('level-session-store')

const app = express();
const authRouter = express.Router()
const LevelStore = levelSession(session)


import { MetricsHandler, Metric } from './metrics'
const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')

import { UserHandler, User } from './users'
const dbUser: UserHandler = new UserHandler('./db/users')

//Templates
app.set('view engine', 'ejs')
app.set('views', __dirname + '/../views')

//Style (Semantic UI)
app.use(express.static('public'))

//Clarification des requêtes
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

//Sessions et Logging
app.use(morgan('dev'))

app.use(session({
  secret: 'my very secret phrase',
  store: new LevelStore('./db/sessions'),
  resave: true,
  saveUninitialized: true
}))



authRouter.get('/login', (req: any, res: any) => {
  res.render('login')
})

authRouter.get('/signup', (req: any, res: any) => {
  res.render('signup')
})

authRouter.get('/logout', (req: any, res: any) => {
  delete req.session.loggedIn
  delete req.session.user
  res.redirect('/login')
})


app.get('/', (req: any, res: any) => {
	res.render('login')
})

app.get('/metrics/:id', (req: any, res: any) => {
  dbMet.get(req.params.id, (err: Error | null, result?: any) => {
    if (err) {
      throw err
    }
		else if(!result){
			res.send('Aucun résultat')
			res.end()
		}
    else res.json(result)
  })
})

app.listen(4000, (err: Error) => {
	if (err) throw err
	console.log("Le projet est disponible à l'adresse suivante : http://localhost:4000/")
})
