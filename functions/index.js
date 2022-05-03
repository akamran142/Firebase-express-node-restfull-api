/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
// we are using firebase emulator to run server

const functions = require("firebase-functions");
const admin = require("firebase-admin"); // import firebase admin
const express = require("express"); // import express
const cors = require("cors"); // import cors

const serviceAccount = require("./security-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// db app and cors should be below admin initialization
const db = admin.firestore(); // connect admin to firestore database
const app = express(); // initialize express app

// connect app to cors,
// cors are used to manage http request on borwser
app.use(cors({origin: true}));

// test Api
app.get("/helloworld", (req, res)=> {
  return res.status(200).send("Hello world");
});

//  db >> collection >> docs >> json(data)
// CRUD
// create
app.post("/api/create", async (req, res)=>{
  try {
    // slash "/" added here after and before Date.now() to create a proper path
    await db.collection("userinfo").doc(`/${Date.now()}/`).create({
      id: Date.now(),
      name: req.body.name,
      mobile: req.body.mobile,
      address: req.body.address,
    });
    return res.status(200).send({Status: "Success", msg: "Data saved"});
  } catch (error) {
    console.log(error);
    return req.status(200).send({Status: "Fail", msg: "Data not saved"});
  }
});
// read
app.get("/api/read", async (req, res)=> {
  try {
    // eslint-disable-next-line max-len
    // as we want to read and get data from database so we will store that data in a variable to read
    // first create a variable to store collection
    const document = db.collection("userinfo");
    // as data within collection is an array of objects so create a variable to store that objects array
    const response = [];
    // access collection data ,stored in document variable
    await document.get().then((snapshot) => {
      // then save data in variable from docs within collection
      const docs = snapshot.docs;
      // run a loop on docs to get data from snapshot.docs and store data one by one in selectItem object varaible
      for (const doc of docs) {
        // object will be pass from this loop , so to get all values one by one from object we need to destructure that object and then get our name mobile and address
        const selectItem = {
          // doc = 1object >> data >> name
          id: doc.id,
          name: doc.data().name,
          mobile: doc.data().mobile,
          address: doc.data().address,
        };
        // now push data to response array
        response.push(selectItem);
      }
      return response;
    });
    return res.status(200).send(response);
  } catch (error) {
    console.log(error);
    return res.status(200).send("Data faild to get");
  }
});
// get only a specific id data
app.get("/api/read/:id", async (req, res)=> {
  try {
    const document = db.collection("userinfo").doc(req.params.id);
    const userDoc = await document.get();
    const response = userDoc.data();
    return res.status(200).send(response);
  } catch (error) {
    console.log(error);
    return res.status(200).send("Data faild to get");
  }
});
// update
app.put("/api/update/:id", async (req, res)=> {
  try {
    const document = db.collection("userinfo").doc(req.params.id).update(
        {
          name: req.body.name,
          mobile: req.body.mobile,
          address: req.body.address,
        },
    );
    return res.status(200).send("Data is updated");
  } catch (error) {
    console.log(error);
    return res.status(200).send("Data is not updated");
  }
});
// delete
app.delete("/api/delete/:id", async (req, res)=> {
  try {
    const document = await db.collection("userinfo").doc(req.params.id).delete();
    return res.status(200).send("Data is Deleted");
  } catch (error) {
    console.log(error);
    return res.status(200).send("Data is not Deleted");
  }
});
exports.app = functions.https.onRequest(app);
