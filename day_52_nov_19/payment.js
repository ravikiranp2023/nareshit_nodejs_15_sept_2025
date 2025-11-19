require("dotenv").config();
const crypto = require("crypto");
const axios = require("axios");

// Helper: create SHA256 + keyIndex signature
function createChecksum(base64Payload, route) {
  const fullString = base64Payload + route + process.env.MERCHANT_KEY;
  const sha256 = crypto.createHash("sha256").update(fullString).digest("hex");
  return sha256 + "###" + process.env.KEY_INDEX;
}

// -------------------------------------------------------
//   CREATE PAYMENT ORDER → returns PhonePe checkout URL
// -------------------------------------------------------
const newPayment = async (req, res) => {
  try {
    const { user_id, price, phone, name } = req.body; // FIXED: no hardcoded body
    
    if (!user_id || !price) {
      return res.status(400).send({ error: "Invalid input" });
    }

    const merchantTransactionId = "TXN" + Date.now();

    const data = {
      merchantId: process.env.MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: "MUID_" + user_id,
      name,
      amount: price * 100,
      redirectUrl: `https://www.shutterstock.com/shutterstock/videos/3580923965/thumb/1.jpg?ip=x480`,   
      redirectMode: "POST",
      mobileNumber: phone,
      paymentInstrument: { type: "PAY_PAGE" }
    };

    const base64Payload = Buffer.from(JSON.stringify(data)).toString("base64");
    const checksum = createChecksum(base64Payload, "/pg/v1/pay");

    const response = await axios.post( // nodejs is hitting phonepe
      `${process.env.PHONEPE_BASE}/pg/v1/pay`,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": process.env.MERCHANT_ID
        }
      }
    );

    return res.json({
      success: true,
      redirectUrl: response.data.data.instrumentResponse.redirectInfo.url,
      txnId: merchantTransactionId,
    });

  } catch (err) {
    console.error("Payment error:", err.response?.data || err.message);
    return res.status(500).send({
      success: false,
      message: "Payment Failed",
      error: err.response?.data || err.message,
    });
  }
};

// -------------------------------------------------------
//   CHECK PAYMENT STATUS
// -------------------------------------------------------
const checkStatus = async (req, res) => {
  try {
    const merchantTransactionId = req.params.txnId;

    const string = `/pg/v1/status/${process.env.MERCHANT_ID}/${merchantTransactionId}`;
    const sha256 = crypto
      .createHash("sha256")
      .update(string + process.env.MERCHANT_KEY)
      .digest("hex");
    const checksum = sha256 + "###" + process.env.KEY_INDEX;

    const response = await axios.get(
      `${process.env.PHONEPE_BASE}/pg/v1/status/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": process.env.MERCHANT_ID,
        },
      }
    );

    return res.json(response.data);

  } catch (err) {
    console.error("Status error:", err.response?.data || err.message);
    return res.status(500).send({
      success: false,
      error: err.response?.data || err.message,
    });
  }
};

module.exports = { newPayment, checkStatus };
