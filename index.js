const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
require("dotenv").config();


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yk5wl6u.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const usersCollection = client.db('dancingSchool').collection('users');
    const classesCollection = client.db('dancingSchool').collection('classes');


    
    // verify student
    const verifyStudent = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await userCollection.findOne(query);

      if (user?.role !== "student") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };


  //check admin user
  app.get("/users/admin/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email };
    const user = await usersCollection.findOne(query);
    res.send({ isAdmin: user?.role === "admin" });
  });

    //check instructor user
    app.get("/users/instructor/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isInstructor: user?.role === "instructor" });
    });

    //check student user
    app.get("/users/student/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isStudent: user?.role === "student" });
    });
    
    app.get('/classes', async(req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    })

    app.get('/instructors', async(req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    })

    //get all users
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    
    // save user info
    app.post("/users", async (req, res) => {
      const userInfo = req.body;
      const query = { email: userInfo.email };
      const user = await usersCollection.findOne(query);
      if (!user) {
        const result = await usersCollection.insertOne(userInfo);
        res.send(result);
      }
    });

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
    res.send('Dancing school is running');
})

app.listen(port, () => {
    console.log(`Dancing School is running on port ${port}`)
})