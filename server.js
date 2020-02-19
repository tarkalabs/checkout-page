const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const bodyparser = require('body-parser');
const CircularJSON = require('circular-json');

const app = express();
const opts = {
  headers: {
    'app-id': 'com.devtechnica.tc-test',
    'private-key': 'd1898114-dbc1-4f6a-b72b-d2c73043ae18',
    'x-payments-os-env': 'test',
    'api-version': '1.3.0'
  }
}

const headers = {
  // Replace app-id and private-key with the id and private key of your Business Unit.
  // The default provider configured in this Business Unit must support the Get Supported Payment Methods API.
  'app-id': 'com.devtechnica.tc-test',
  'private-key': 'd1898114-dbc1-4f6a-b72b-d2c73043ae18',
  'x-payments-os-env': 'test',
  'api-version': '1.3.0',
};

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src', 'js')));
app.use(express.static(path.join(__dirname, 'src', 'css')));
app.use(cors());
app.get('/supportedpaymentmethods', (req, res) => {
  axios.get('https://api.paymentsos.com/supported-payment-methods', { headers })
    .then((response) => {
      res.send(response.data);
    })
    .catch((e) => {
      console.log(e.response.data);
      res.send(e.response.data);
    });
});
app.use(bodyparser.urlencoded({ extended: false }));
app.post('/create_customer_data', (req, res) => {
  var request_payload = {
    customer_reference: req.body.customer_reference,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    //payment_methods: [{
    //  type: "tokenized",
    //  token: req.body["payment_methods[]"],
    //  credit_card_cvv: "123"
    //}],
    shipping_address: {
      country: req.body["shipping_address[country]"],
      state: req.body["shipping_address[state]"],
      city: req.body["shipping_address[city]"],
      line1: req.body["shipping_address[line1]"],
      line2: req.body["shipping_address[line2]"],
      email: req.body.email,
    }
  }
  axios.post('https://api.paymentsos.com/customers', request_payload, opts).then(function(data){
    console.log(data);
    axios.post('https://api.paymentsos.com/customers/'+data.customer_id+'/payment-methods/'+req.body['payment_methods[]']);
    res.send({message: "request processed successfully", data: CircularJSON.stringify(data)})
  }).catch((e) => {
    debugger;
    console.log("error: "+e);
    res.send({error: e});
  });
});

app.get('/customers', (req, res) => {
  axios.get('https://api.paymentsos.com/supported-payment-methods', { headers }).then(function(data){
    console.log(data);
    res.send({ message: "customer retrieved successfully", data: CircularJSON.stringify(data)});
  }).catch((e) => {
    console.log("error: "+e);
    res.send({data: JSON.stringify({error: e})});
  });
});

app.get('/customers/:customer_id/payment-methods/:token', (req, res) => {
  var customer_id = req.params.customer_id;
  var token = req.params.token;
  console.log("fetching payment for customer: "+customer_id+ " token: "+token);
  axios.get('https://api.paymentsos.com/customers/'+customer_id+'/payment-methods/'+token, req.body, opts).then(function(data){
    console.log(data);
    res.send({ message: "payment retrieved successfully", data: CircularJSON.stringify(data)})
  }).catch((e) => {
    debugger;
    console.log("error: "+e);
    res.send({error: e});
  });
})

app.post("/charge", (req, res) => {
  var payload ={
    "merchant_site_url": "https://tunecore.in",
    "reconciliation_id": "testtransaction"+Math.round(Math.random()*1000),
    "provider_specific_data": {
      "payu_india": {
        "additional_details": {
          "recurring": "1"
        }
      }
    },
    "payment_method": {
      "type": "tokenized",
      "token": req.body.payment_method,
      "credit_card_cvv": "123"
    },
    "billing_address": {
      country: req.body["shipping_address[country]"],
      state: req.body["shipping_address[state]"],
      city: req.body["shipping_address[city]"],
      line1: req.body["shipping_address[line1]"],
      line2: req.body["shipping_address[line2]"],
      email: req.body.email
    }
  } 
  axios.post("https://api.paymentsos.com/payments/"+req.body.payment_id+"/charges", payload, opts).then(function(data){
    res.send({charge: CircularJSON.stringify(data)});
  }).catch((e)=> {
    console.log("error while creating charge: "+e);
    debugger;
    res.send({ charge: e, message: "failed"});
  });
})

app.post('/paytm', (req, res) => {
  // create a payment 
  var payload = JSON.parse(req.body.payment);
  let charge_payload = JSON.parse(req.body.charge);
  payload['amount'] = parseInt(payload.amount);
  console.log("creating payment..")
  axios.post("https://api.paymentsos.com/payments", payload, opts).then(function(pay_response){
    console.log(pay_response.data);
    console.log("payment created successfully..")
    console.log("creating charge..")
    axios.post("https://api.paymentsos.com/payments/"+pay_response.data.id+"/charges", charge_payload, opts).then(function(charge_data){
      console.log(charge_data);
      console.log("charge created successfully");
      res.send({data: CircularJSON.stringify(charge_data.data)});
    }).catch(function(err){
      debugger;
      res.send({message: "charge creation failed"})
    });
  }).catch(function(e){
    debugger;
    res.send({ message: "payment creation failed" });
    console.log("paytm: create-payment-error: "+e);
  });
});

app.post('/payments', (req, res) => {
  var payload = {
    amount: parseInt(req.body.amount),
    currency: req.body.currency,
    customer_id: req.body.customer_id,
    "billing_address": {
        country: req.body["shipping_address[country]"],
        state: req.body["shipping_address[state]"],
        city: req.body["shipping_address[city]"],
        line1: req.body["shipping_address[line1]"],
        line2: req.body["shipping_address[line2]"],
        email: req.body.email
      }
    }
  axios.post("https://api.paymentsos.com/payments", payload, opts).then(function(data){
    console.log(data);
    res.send({ message: "Payment created Successfully", data: CircularJSON.stringify(data)});
  }).catch((e) => {
    console.log("error: "+e.message);
    console.log(e.response);
    res.send({message: e.message, response: CircularJSON.stringify(e.response)});
  });
})

app.listen('9000', () => {
  console.log('server is up on port 9000');
});
