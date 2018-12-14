const express = require('express');
const app = express();

import { MetricsHandler, Metric } from './metrics';

//Templates
app.set('view engine', 'ejs')
app.set('views', __dirname + '/../views')

//Style (Semantic UI)
app.use(express.static('public'))


app.get('/', (req: any, res: any) => {
	res.render('login')
})

app.get('/metrics', (req: any, res: any) => {
  MetricsHandler.get((err: Error | null, result?: any) => {
    if (err) {
      throw err
    }
    res.json(result)
  })
})

app.listen(4000, (err: Error) => {
	if (err) throw err
	console.log("Le projet est disponible à l'adresse suivante : http://localhost:4000/")
})
