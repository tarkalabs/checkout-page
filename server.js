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
    'api-version': '1.2.0'
  }
}

const headers = {
  // Replace app-id and private-key with the id and private key of your Business Unit.
  // The default provider configured in this Business Unit must support the Get Supported Payment Methods API.
  'app-id': 'com.devtechnica.tc-test',
  'private-key': 'd1898114-dbc1-4f6a-b72b-d2c73043ae18',
  'x-payments-os-env': 'test',
  'api-version': '1.2.0',
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
  request_payload = {
    customer_reference: req.body.customer_reference,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    payment_methods: [{
      type: "tokenized",
      token: req.body["payment_methods[]"],
      credit_card_cvv: "123"
    }],
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
  var payload = {
    payment_method: {
      "type": "tokenized",
      "token": req.body.payment_method,
      "credit_card_cvv": "123"
    }
  }
  axios.post("https://api.paymentsos.com/payments/"+req.body.payment_id+"/charges", payload, opts).then(function(data){
    res.send({charge: data});
  }).catch((e)=> {
    console.log("error while creating charge: "+e);
    debugger;
    res.send({ charge: e, message: "failed"});
  });
})

app.post('/payments', (req, res) => {
  var payload = {
    amount: parseInt(req.body.amount),
    currency: req.body.currency,
    customer_id: req.body.customer_id
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
