const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3200

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");


// middleware 
app.use(cors({
  origin: ['http://localhost:5173', 'https://study-buddy-hub-4ba13.web.app'],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser());

const verifyToken = (req, res, next) =>{
  const token = req.cookies?.accessToken;
  // console.log("middleware token: ", token)
  if(!token) return res.status(401).send({message: "forbidden"})
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
    if(err) return res.status(401).send({message: "forbidden"})
    // console.log(decoded)
    req.user = decoded
    next()
  })
  
}


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
    const submissionCollection = client.db('StudyBuddyHub').collection("submission")

    //post jwt---

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      // console.log(user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1hr",
      });
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      });
      res.send({ message: "success" });
    });

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

   

    //get api for a single assignment using id
    app.get('/assignment-details/:id' , async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await assingmentCollection.findOne(query);
      res.send(result);
    })

     //delete api ----
     app.delete('/delete-assignment/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await assingmentCollection.deleteOne(query)
      res.send(result)
    })

    //update api----
    app.put('/update-assignment/:id', async(req, res)=>{
      const id = req.params.id;
      const updatedInfo = req.body;
      // console.log(updatedInfo)
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true }
      const updatedDoc = {
        $set:{
          title: updatedInfo.title,
          description: updatedInfo.description,
          marks: updatedInfo.marks,
          difficulty: updatedInfo.difficulty,
          dueDate: updatedInfo.dueDate,
          thumbnail: updatedInfo.thumbnail,
        }
      }
      const result = await assingmentCollection.updateOne(filter, updatedDoc, options)
      res.send(result)
    })

    //post api for submission assignments collection
    app.post('/assignment-submission', async(req, res)=>{
      const submission = req.body;
      const result = await submissionCollection.insertOne(submission)
      res.send(result)
    })

    //get api for submited assignments---
    app.get('/assignment-submissions', verifyToken, async(req, res)=>{
      const result = await submissionCollection.find().toArray()
      res.send(result)
    })

    //get data using id for give assignment marks
    app.get('/assignment-marks/:id' , async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await submissionCollection.findOne(query);
      res.send(result)
    })    

    // update submission data for obtain marks
    app.put('/assignment-marks/:id', async(req, res)=>{
      const id = req.params.id;
      const marksInfo = req.body;
      // console.log(marksInfo, id)
      const filter = {_id: new ObjectId(id)}
      const options = {
        upsert: true
      }
      const updateMarks = {
        $set: {
          obtainedMarks: marksInfo.marks,
          feedback: marksInfo.feedback
        }
      }
      const result = await submissionCollection.updateOne(filter, updateMarks, options)
      res.send(result)
    })

    //get api for filtered data-----
    app.get('/assignments/filter/:difficulty', async(req, res)=>{
      const difficulty = req.params.difficulty;
      // console.log(difficulty)

      const query = {difficulty: difficulty}
      const result = await assingmentCollection.find(query).toArray()
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