require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { newPayment, checkStatus } = require("./payment");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/payment", newPayment);
app.get("/status/:txnId", checkStatus);

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
