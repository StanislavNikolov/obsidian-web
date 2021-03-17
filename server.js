const express = require('express');
const env = require('dotenv');
const app = express();

const port = env.PORT || 3000;

app.use(express.static('static'));
app.use(express.static('node_modules/matter-js/build'));


app.listen(port, () => {
	console.log(`Server started on port: ${port}`);
});
