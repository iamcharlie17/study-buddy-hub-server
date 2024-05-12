const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 3200


// middleware 
app.use(cors({
  origin: ['http://localhost:5173']
}))
app.use(express.json())


const uri = "mongodb+srv://studyBuddyHub:fTsvY5z0jn1auyOW@cluster0.x7zkge4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const assingmentCollection = client.db('StudyBuddyHub').collection("assignments");

    //create assignment-------
    app.post('/create-assignments', async(req, res)=>{
      const assignment = req.body
      // console.log(assignment)
      const result = await assingmentCollection.insertOne(assignment)
      // console.log(result)
      res.send(result)
    })

    // get api for all assignments
    app.get('/assignments', async(req, res)=>{
      const result = await assingmentCollection.find().toArray()
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Study Buddy Hub is running')
})

app.listen(port, () => {
  console.log(`Study Buddy Hub listening on port ${port}`)
})