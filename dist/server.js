"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
const authRouter = express.Router();
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
            console.log('else error');
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
app.get('/metrics/:id', (req, res) => {
    dbMet.get(req.params.id, (err, result) => {
        if (err) {
            throw err;
        }
        else if (!result) {
            res.send('Aucun résultat');
            res.end();
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
