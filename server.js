const express = require('express');
const env = require('dotenv');
const app = express();
const directory = require('serve-index');

const port = env.PORT || 3000;

app.use(express.static('static'));
app.use(express.static('html'));
app.use(directory('html'));


app.listen(port, () => {
	console.log(`Server started on port: ${port}`);
});
