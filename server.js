const express = require('express');
const app = express();

app.set('view engine', 'ejs')
app.use(express.static('public'))


app.get('/', (req, res) => {
	res.render('pages/login')
	//res.send('Bienvenue dans mon projet Node.js')
})

app.listen(4000, (err) => {
	if (err) throw err
	console.log("Le projet est disponible à l'adresse suivante : http://localhost:4000")
})
