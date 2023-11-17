const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// console.log(process.env.ACCESS_TOKEN_SECRET);

const verifyCookies = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "not authorized" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    //error
    if (error) {
      console.log(error);
      return res.status(401).send({ message: "unauthorized" });
    }
    req.user = decoded;
    console.log(decoded);
    next();
  });
  // next();
};

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

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        // expiresIn: "2s",
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    app.post("/logout", async (req, res) => {
      const user = req.body;
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    app.post("/bidjobs",  async (req, res) => {
      const AddBidjobData = req.body;
      const result = await bidjobs.insertOne(AddBidjobData);
      res.send(result);
    });

    app.get("/bidjobs/:id",  async (req, res) => {
      const id = req.params.id;
      const find = { _id: new ObjectId(id) };
      const result = await bidjobs.findOne(find);
      res.send(result);
    });

    app.patch("/bidjobs/:id",  async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedBooking = req.body;
      const updateDoc = {
        $set: {
          status: updatedBooking.status,
        },
      };
      const result = await bidjobs.updateOne(filter, updateDoc);
      res.send(result);
    });

    // user bids find with email
    app.get("/bidjobs", verifyCookies, async (req, res) => {
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
    });

    app.put("/alljob/:id",  async (req, res) => {
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

    app.get("/alljob/:id",  async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allAddjob.findOne(query);
      res.send(result);
    });

    app.get("/alljob", async (req, res) => {
      const cursor = allAddjob.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //Posted Jobs find with email
    app.get("/alljobs", verifyCookies, async (req, res) => {
      if (req.query.email !== req.user.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const result = await allAddjob.find(query).toArray();
      res.send(result);
    });

    app.delete("/alljobs/:id", verifyCookies, async (req, res) => {
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
