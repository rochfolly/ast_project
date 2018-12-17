import express = require('express');
const app = express();
const authRouter = express.Router()
//import path = require('path')

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
        console.log('Connexion réussie')
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
  res.render('home', { name: req.session.user.username })
})





//USERS

const userRouter = express.Router()

userRouter.post('/', (req: any, res: any, next: any) => {
    dbUser.get(req.body.username, function (err: Error | null, result?: User) {
      if (!err || result !== undefined) {
       res.status(409).send("user already exists")
      } else {
        const newuser = new User(req.body.username, req.body.email, req.body.password)
        dbUser.save(newuser, function (err: Error | null) {
          if (err) next(err)
          else {
            console.log('User ' +req.body.username+ ' ajouté')
            res.status(201).redirect("/")
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



///Metrics
const metricsRouter = express.Router()

metricsRouter.post('/', (req: any, res: any, next: any) => {
  const met = [new Metric(`${new Date(req.body.timestamp).getTime()}`, req.body.value)]
  dbMet.save(req.session.user.username, met, (err: Error | null) => {
    if (err) next(err)
    res.status(200).send()
    console.log('Metric ajouté')
  })
  if(req.body.value){
    res.render('home', {success : "Metric ajouté avec succès", name : req.session.user.username})
  }
  else res.render('home', {name : req.session.user.username})
})


metricsRouter.get('/add', (req:any, res: any) =>{
  res.render('add', {name : req.session.user.username})
})

/*metricsRouter.get('/', (req:any, res: any) =>{
  res.redirect('/metrics/'+req.session.user.username)
})*/


metricsRouter.get('/:id', (req: any, res: any) => {
  if(req.params.id === req.session.user.username){
    dbMet.get(req.params.id, (err: Error | null, result?: any) => {
      if (err) {
        throw err
      }
		  else if(!result){
			  res.send('Aucun résultat')
			  res.end()
	  	}
     else {
       res.json(result)
     }
   })
  }
  else res.send("Vous n'avez pas accès à ces metrics")
})


metricsRouter.get('delete/:timestamp', (req: any, res: any) => {
  console.log('Suppression')
  dbMet.remove(req.session.user.username, req.params.timestamp, (err: Error | null) => {
    if (err) throw err
    res.status(200).send()
  })
})


app.use('/metrics', authCheck, metricsRouter)

//Script de home.ejs
app.get('/metrics.json', (req: any, res: any, next: any) => {
  dbMet.get(req.session.user.username, (err: Error | null, result?: Metric[]) => {
    if (err) next(err)
    if (result === undefined) {
      res.send('Désolé, aucun résultat...')
    } else res.json(result)
  })
})

app.listen(4000, (err: Error) => {
	if (err) throw err
	console.log("Le projet est disponible à l'adresse suivante : http://localhost:4000/")
})
