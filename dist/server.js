"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const app = express();
const metrics_1 = require("./metrics");
//Templates
app.set('view engine', 'ejs');
app.set('views', __dirname + '/../views');
//Style (Semantic UI)
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.render('login');
    res.send('Bienvenue dans mon projet Node.js');
});
app.get('/metrics', (req, res) => {
    metrics_1.MetricsHandler.get((err, result) => {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});
app.listen(4000, (err) => {
    if (err)
        throw err;
    console.log("Le projet est disponible à l'adresse suivante : http://localhost:4000/");
});
