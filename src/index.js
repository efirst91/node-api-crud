// ./src/index.js
// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const api = require("./routes/index")
const db = require('./db/db-confg')



// defining the Express app
const app = express();
// defining an array to work as the database (temporary solution)

try {
  db().then(()=>{});
} catch (e) {
    console.log('Error while trying to connect to db', e)
}

// adding Helmet to enhance your Rest API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

app.use('/api', api);

// starting the server
app.listen(3001, () => {
    console.log('listening on port 3001');
});



