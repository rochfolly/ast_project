const express = require('express');
const app = express();
const bodyparser = require('body-parser')

import { MetricsHandler, Metric } from './metrics';
const dbMet: MetricsHandler = new MetricsHandler('./db/metrics')

//Templates
app.set('view engine', 'ejs')
app.set('views', __dirname + '/../views')

//Style (Semantic UI)
app.use(express.static('public'))

//Clarification des requêtes
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))


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
