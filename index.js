require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser')
const routes = require('./routes/routes');
const authRoute = require('./routes/authRoute');
const passport = require('passport');
const applyPassportStrategy = require('./middlewares/passport');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cors = require('cors')

applyPassportStrategy(passport);

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))

app.set('views', './view');
app.set('view engine', 'ejs');
app.use(cors())


app.use(express.json());

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument));

app.use('/auth', authRoute)
app.use('/api', routes)
app.get('/', (req, res) => {
    res.sendFile(__dirname + 'index.ejs');
    res.render('index')
})


app.listen(3000, () => {
    console.log(`Server Started at ${3000}`)
})