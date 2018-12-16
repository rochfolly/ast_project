import express = require('express');
const app = express();
const authRouter = express.Router()



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
import bodyparser = require('body-parser')
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

//Sessions et Logging
import morgan = require('morgan')
import session = require('express-session')
import levelSession = require('level-session-store')
const LevelStore = levelSession(session)

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

authRouter.post('/login', (req: any, res: any, next: any) => {
    dbUser.get(req.body.username, (err: Error | null, result?: User) => {
      if (err) next(err)
      if (result === undefined || !result.validatePassword(req.body.password)) {
        res.redirect('/login')
        console.log('Aucun compte à ce nom')
      }
      else {
        req.session.loggedIn = true
        req.session.user = result
        console.log('else error')
        res.redirect('/')
      }
    })
  })

app.use(authRouter)

const authCheck = function (req: any, res: any, next: any) {
  if (req.session.loggedIn) {
    next()
  } else res.redirect('/login')
}

app.get('/', authCheck, (req: any, res: any) => {
  res.render('home', { name: req.session.username })
})





//USERS

const userRouter = express.Router()

userRouter.post('/', (req: any, res: any, next: any) => {
    dbUser.get(req.body.username, function (err: Error | null, result?: User) {
      if (!err || result !== undefined) {
       res.status(409).send("user already exists")
      } else {
        dbUser.save(req.body, function (err: Error | null) {
          if (err) next(err)
          else {
            res.status(201).send("user added successfully")
            console.log('User ajouté')
          }
        })
      }
    })
   })

userRouter.get('/:username', (req: any, res: any, next: any) => {
     dbUser.get(req.params.username, function (err: Error | null, result?: User) {
      if (err || result === undefined) {
        res.status(404).send("user not found")
      } else res.status(200).json(result)
    })
   })

app.use('/user', userRouter)


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
