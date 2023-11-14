const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.NAME}:${process.env.NAME_KEY}@cluster0.wvvqbv9.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const allAddjob = client.db("Addjob").collection("job");
    const bidjobs = client.db("Addjob").collection("bidjob");

    app.post("/bidjobs", async (req, res) => {
      const AddBidjobData = req.body;
      const result = await bidjobs.insertOne(AddBidjobData);
      res.send(result);
      // console.log(AddjobData);
    });

    app.get("/bidjobs/:id", async (req, res) => {
      const id = req.params.id;
      const find = { _id: new ObjectId(id) };
      const result = await bidjobs.findOne(find);
      res.send(result);
    });

    app.patch("/bidjobs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedBooking = req.body;
      console.log(updatedBooking);
      const updateDoc = {
        $set: {
          status: updatedBooking.status,
        },
      };
      const result = await bidjobs.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/bidjobs", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await bidjobs.find(query).toArray();
      res.send(result);
    });

    // All Job se======>>>>

    app.post("/Addjob", async (req, res) => {
      const AddjobData = req.body;
      const result = await allAddjob.insertOne(AddjobData);
      res.send(result);
      // console.log(AddjobData);
    });

    app.put("/alljob/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedjobs = req.body;
      const updatejobs = {
        $set: {
          Jobtitle: updatedjobs.Jobtitle,
          date: updatedjobs.date,
          select: updatedjobs.select,
          Minimum: updatedjobs.Minimum,
          Maximum: updatedjobs.Maximum,
          Description: updatedjobs.Description,
          Photo: updatedjobs.Photo,
        },
      };
      const result = await allAddjob.updateOne(filter, updatejobs, options);
      res.send(result);
    });

    app.get("/alljob/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allAddjob.findOne(query);
      res.send(result);
      // console.log(result);
    });

    app.get("/alljob", async (req, res) => {
      const cursor = allAddjob.find();
      const result = await cursor.toArray();
      res.send(result);
      // console.log(result);
    });

    app.get("/alljobs", async (req, res) => {
      console.log(req.query);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await allAddjob.find(query).toArray();
      res.send(result);
    });

    app.delete("/alljobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allAddjob.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("rabiul islam!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
