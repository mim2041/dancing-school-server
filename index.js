require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yk5wl6u.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbConnect = async () => {
  try {
    client.connect();
    console.log("Database Connected Successfully✅");

  } catch (error) {
    console.log(error.name, error.message);
  }
}
dbConnect()


    const usersCollection = client.db('dancingSchool').collection('users');
    const classesCollection = client.db('dancingSchool').collection('classes');
    const selectedClassesCollection = client.db('dancingSchool').collection('selectedClasses');

    app.get('/', async(req, res) => {
      res.send("dancing school is running");
    })

     // verify admin user
     const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };
    
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
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    //get all users
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });
    app.get("/users/:email", async (req, res) => {
      const email=req.params.email
      const query = {email};
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


    app.put("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id:new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      
      res.send(result);
    });

    app.put("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id:new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "instructor",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      
      res.send(result);
    });


    app.get("/selectedClasses/:email", async (req, res) => {
      const email=req.params.email
      console.log(email)
      const query = {studentEmail:email};
      const users = await selectedClassesCollection.find(query).toArray();
      res.send(users);
    });
    app.post("/selectedClasses", async (req, res) => {
      const classInfo = req.body;
      const query = { id: classInfo.id,studentEmail:classInfo.studentEmail };
      const classes = await selectedClassesCollection.findOne(query);
      if (!classes) {
        const result = await selectedClassesCollection.insertOne(classInfo);
        res.send(result);
      }
    });
    app.delete("/selectedClasses/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id:new ObjectId(id) };
      const result = await selectedClassesCollection.deleteOne(query);
      res.send(result);
      
    });
     app.post("/instructor/addClass", async (req, res) => {
      const classInfo = req.body;
      // const query = { class_name: classInfo.class_name };
      // const clsname = await classesCollection.findOne(query);
      // console.log(clsname)
      // if (!clsname) {
        const result = await classesCollection.insertOne(classInfo);
        res.send(result);
      // }
    });

//  app.post("/create-payment-intent", async (req, res) => {
//       const booking = req.body;
//       const price = booking.price;
//       const amount = price * 100;

//       const paymentIntent = await stripe.paymentIntents.create({
//         currency: "usd",
//         amount: amount,
//         payment_method_types: ["card"],
//       });
//       res.send({
//         clientSecret: paymentIntent.client_secret,
//       });
//     });



    app.post("/payments", async (req, res) => {
      const payment = req.body;
      console.log(payment);
      const query = {
        book_id: payment.book_id,
      };
      const alreadyPaid = await paymentsCollection.find(query).toArray();
      if (alreadyPaid.length) {
        const message = `Already Buy this book by Someone .Please try another one`;
        return res.send({ acknowledged: false, message });
      }
      const result = await paymentsCollection.insertOne(payment);
      const id = payment.bookingId;
      const book_id = payment.book_id;
      const filter = { _id: ObjectId(id) };
      console.log(filter);
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const updatedResult = await bookingsCollection.updateOne(
        filter,
        updatedDoc
      );
      console.log(updatedResult, "res1");
      const filter1 = { _id: ObjectId(book_id) };
      const updatedDoc1 = {
        $set: {
          productStatus: "sold",
          isAdvertised: "no",
        },
      };
      const updatedResult1 = await productsCollection.updateOne(
        filter1,
        updatedDoc1
      );
      console.log(updatedResult1, "res2");
      res.send(result);


    });



app.listen(port, () => {
    console.log(`Dancing School is running on port ${port}`)
})