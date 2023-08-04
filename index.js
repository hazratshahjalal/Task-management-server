const express = require('express');
const app = express();

const cors = require('cors')
require('dotenv').config()


const PORT = process.env.PORT || 4300;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r7lfnhm.mongodb.net/?retryWrites=true&w=majority`;

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

    const tasksCollection = client.db('task-management').collection('taskItems');

    //tasks api
    app.get('/tasks', async (req, res) => {
      const result = await tasksCollection.find().toArray();
      res.send(result);
    });

    // Tasks API: Add a new task
    app.post('/tasks', async (req, res) => {
      const newTask = req.body;

      try {
        const result = await tasksCollection.insertOne(newTask);
        console.log('New task added:', newTask);

        // The issue may be in the next line, accessing 'ops' property of 'result'
        res.status(201).json(result.ops[0]);
      } catch (error) {
        console.error('Error adding new task:', error);
        res.status(500).json({ error: 'Failed to add a new task' });
      }
    });

    // Task deletion
    app.delete('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    })


    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("HI HI")
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})