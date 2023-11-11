const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

console.log(process.env.NAME_KEY);
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




    app.post('/Addjob',async (req,res) =>{
      const AddjobData = req.body;
      const result = await allAddjob.insertOne(AddjobData);
      res.send(result);
      // console.log(AddjobData);

    })






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
