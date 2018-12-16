"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
const authRouter = express.Router();
//import path = require('path')
const metrics_1 = require("./metrics");
const dbMet = new metrics_1.MetricsHandler('./db/metrics');
const users_1 = require("./users");
const dbUser = new users_1.UserHandler('./db/users');
//Templates
app.set('view engine', 'ejs');
app.set('views', __dirname + '/../views');
//Style (Semantic UI)
app.use(express.static('public'));
//Clarification des requêtes
const bodyparser = require("body-parser");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
//Sessions et Logging
const morgan = require("morgan");
const session = require("express-session");
const levelSession = require("level-session-store");
const LevelStore = levelSession(session);
app.use(morgan('dev'));
app.use(session({
    secret: 'my very secret phrase',
    store: new LevelStore('./db/sessions'),
    resave: true,
    saveUninitialized: true
}));
authRouter.get('/login', (req, res) => {
    res.render('login');
});
authRouter.get('/signup', (req, res) => {
    res.render('signup');
});
authRouter.get('/logout', (req, res) => {
    delete req.session.loggedIn;
    delete req.session.user;
    res.redirect('/login');
});
authRouter.post('/login', (req, res, next) => {
    dbUser.get(req.body.username, (err, result) => {
        if (err)
            next(err);
        if (result === undefined || !result.validatePassword(req.body.password)) {
            res.redirect('/login');
            console.log('Aucun compte à ce nom');
        }
        else {
            req.session.loggedIn = true;
            req.session.user = result;
            console.log('Connexion réussie');
            res.redirect('/');
        }
    });
});
app.use(authRouter);
const authCheck = function (req, res, next) {
    if (req.session.loggedIn) {
        next();
    }
    else
        res.redirect('/login');
};
app.get('/', authCheck, (req, res) => {
    res.render('home', { name: req.session.user.username });
});
//USERS
const userRouter = express.Router();
userRouter.post('/', (req, res, next) => {
    dbUser.get(req.body.username, function (err, result) {
        if (!err || result !== undefined) {
            res.status(409).send("user already exists");
        }
        else {
            const newuser = new users_1.User(req.body.username, req.body.email, req.body.password);
            dbUser.save(newuser, function (err) {
                if (err)
                    next(err);
                else {
                    res.status(201).send("user added successfully");
                    console.log('User ' + req.body.username + ' ajouté');
                }
            });
        }
    });
});
userRouter.get('/:username', (req, res, next) => {
    dbUser.get(req.params.username, function (err, result) {
        if (err || result === undefined) {
            res.status(404).send("user not found");
        }
        else
            res.status(200).json(result);
    });
});
app.use('/user', userRouter);
///Metrics
const metricsRouter = express.Router();
metricsRouter.post('/', (req, res, next) => {
    const met = [new metrics_1.Metric(`${new Date(req.body.timestamp).getTime()}`, req.body.value)];
    dbMet.save(req.session.user.username, met, (err) => {
        if (err)
            next(err);
        res.status(200).send();
        console.log('Metric ajouté');
    });
    if (req.body.value) {
        res.render('home', { success: "Metric ajouté avec succès", name: req.session.user.username });
    }
    else
        res.render('home', { name: req.session.user.username });
});
metricsRouter.get('/add', (req, res) => {
    res.render('add', { name: req.session.user.username });
});
/*metricsRouter.get('/', (req:any, res: any) =>{
  res.redirect('/metrics/'+req.session.user.username)
})*/
metricsRouter.get('/:id', (req, res) => {
    if (req.params.id === req.session.user.username) {
        dbMet.get(req.params.id, (err, result) => {
            if (err) {
                throw err;
            }
            else if (!result) {
                res.send('Aucun résultat');
                res.end();
            }
            else {
                res.json(result);
            }
        });
    }
    else
        res.send("Vous n'avez pas accès à ces metrics");
});
metricsRouter.get('delete/:timestamp', (req, res) => {
    dbMet.remove(req.session.user.username, req.params.timestamp, (err) => {
        if (err)
            throw err;
        res.status(200).send();
    });
});
app.use('/metrics', authCheck, metricsRouter);
//Script de home.ejs
app.get('/metrics.json', (req, res, next) => {
    dbMet.get(req.session.user.username, (err, result) => {
        if (err)
            next(err);
        if (result === undefined) {
            res.send('Désolé, aucun résultat...');
        }
        else
            res.json(result);
    });
});
app.listen(4000, (err) => {
    if (err)
        throw err;
    console.log("Le projet est disponible à l'adresse suivante : http://localhost:4000/");
});
