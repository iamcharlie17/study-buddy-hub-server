const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000


// middleware 
app.use(cors())
app.use(express())



app.get('/', (req, res) => {
  res.send('Study Buddy Hub is running')
})

app.listen(port, () => {
  console.log(`Study Buddy Hub listening on port ${port}`)
})