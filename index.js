const express = require('express');
const app = express();

app.get('/', (req, res) => {
	res.end('Initialisation')
})

app.listen(4000, (err) => {
	console.log("Listening on port 4000 at http://localhost:3000/")
})