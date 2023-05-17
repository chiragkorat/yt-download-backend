const express = require('express')

const app = express()
const PORT = 4000

app.listen(PORT, () => {
    console.log(`API listening on PORT ${PORT} `)
})

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument));

app.use('/auth', authRoute)
app.use('/api', routes)
app.get('/', (req, res) => {
    res.sendFile(__dirname + 'index.ejs');
    res.render('index')
})



// Export the Express API
module.exports = app