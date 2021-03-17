const express = require('express');
const app = express();

const port = 3000 || env.PORT;

app.use(express.static('static'));

app.use(express.static('node_modules/matter-js/build'));


app.listen(port, () => {
	console.log(`Server started on port: ${port}`);
});
