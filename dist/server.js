"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const metrics_1 = require("./metrics");
const dbMet = new metrics_1.MetricsHandler('./db/metrics');
//Templates
app.set('view engine', 'ejs');
app.set('views', __dirname + '/../views');
//Style (Semantic UI)
app.use(express.static('public'));
//Clarification des requêtes
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.render('login');
});
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
