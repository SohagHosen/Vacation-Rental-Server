const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const app = express();

// middleware
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sz6ue.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const rooms = database.collection("hotels");
    const bookings = database.collection("bookings");
    // all rooms
    app.get("/rooms", async (req, res) => {
      const result = await rooms.find({}).toArray();
      res.send(result);
    });

    // single rooms
    app.get("/room/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };
      const room = await rooms.findOne(query);
      res.json(room);
    });

    // booking room
    app.post("/room/booking", async (req, res) => {
      const result = await bookings.insertOne(req.body);
      res.json(result);
    });

    // get user booking rooms
    app.get("/user/bookings/:email", async (req, res) => {
      const query = { email: { $in: [req.params.email] } };
      const result = await bookings.find(query).toArray();
      res.send(result);
    });

    // delete booking room
    app.delete("/booking/cancel/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };
      const result = await bookings.deleteOne(query);
      res.json(result);
    });
    // get all bookings
    app.get("/bookings", async (req, res) => {
      const result = await bookings.find({}).toArray();
      res.send(result);
    });

    // insert new room
    app.post("/room/new", async (req, res) => {
      const result = await rooms.insertOne(req.body);
      res.json(result);
    });

    // update room status
    app.patch("/booking/status/:id", async (req, res) => {
      console.log(req.params.id);
      const filter = { _id: ObjectId(req.params.id) };
      const options = { upsert: true };
      // create a document that sets the plot of the movie
      const updateDoc = {
        $set: req.body,
      };
      const result = await bookings.updateOne(filter, updateDoc, options);
      res.json(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
