const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

//MongoDB connection

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vrjzl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Connect to the "insertDB" database and access its "haiku" collection
    const database = client.db("Coffeshop");
    const coffeCollection = database.collection("coffe");

    //add coffe to the database
    app.post("/coffes", async (req, res) => {
      let newCoffe = req.body;
      const result = await coffeCollection.insertOne(newCoffe);
      res.send(result);
    });
    //get coffe from the database
    app.get("/coffes", async (req, res) => {
      const cursor = coffeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //get single coffe from the database
    app.get("/coffes/:id", async (req, res) => {
      let id = req.params.id;
      let query = { _id: new ObjectId(id) };

      let result = await coffeCollection.findOne(query);
      console.log("single coffe was requested");
      res.send(result);
    });
    //delete coffe from the database
    app.delete("/coffes/:id", async (req, res) => {
      let id = req.params.id;
      let query = { _id: new ObjectId(id) };
      let result = await coffeCollection.deleteOne(query);

      res.send(result);
      if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }
    });
    //Update coffe from the database
    app.put("/coffes/:id", async (req, res) => {
      let id = req.params.id;
      let coffe = req.body;
      const options = { upsert: true };
      const updatedCoffe = {
        $set: {
          name: coffe.name,
          chef: coffe.chef,
          details: coffe.details,
          supplier: coffe.supplier,
          photo: coffe.photo,
        },
      };
      let query = { _id: new ObjectId(id) };
      // Update the first document that matches the filter
      const result = await coffeCollection.updateOne(
        query,
        updatedCoffe,
        options
      );

      res.send(result);
      console.log("Single update request");
    });
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
