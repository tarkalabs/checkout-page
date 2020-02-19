function retrievePaymentMethod(token){
  // /customers/{customer_id}/payment-methods/{token}
  var customer_id = localStorage.get("customer_id");
  $.ajax({
    url: "/customers/"+customer_id+"/payment-methods/"+token,
    method: 'GET'
  }).then(function(res){
    var response = JSON.parse(res.data)
    console.log("payment method:");
    console.log(response);
  });
}

function retrieveCustomer(){
  var customer_ref =localStorage.getItem("customer_reference");
  fetch("/customers?customer_reference="+customer_ref).then(function(res){
    var response;
    res.json().then(function(jsonres){
      response = JSON.parse(jsonres.data);
      debugger;
      console.log("customer response");
      console.log(response);
    })
  }); 
}

function createCharge(){
  $.ajax({
    url: "/charge",
    method: 'POST',
    data: {
      "shipping_address": {
        "country": $('#country-ip').val(),
        "state": $('#state-ip').val(),
        "city": $('#city-ip').val(),
        "line1": $('#address-one-ip').val(),
        "line2": $('#address-two-ip').val(),
        "zip_code": $('#postal-two-ip').val(),
        "email": $('#email-ip').val()
      },
      payment_id: localStorage.getItem("last_payment_id"),
      payment_method: localStorage.getItem("pay_now_token")
    }
  }).then(function(data){
    console.log("charge created successfully") 
    alert("payment completed successfully");
    console.log(data);
  }).fail(function(e){
    console.log(e)
  });
}

function createPayment(){
  $.ajax({
    url: "/payments",
    method: 'POST',
    data: {
      amount: 1000,
      currency: "INR",
      customer_id: localStorage.getItem("customer_id"),
      token: localStorage.getItem("pay_now_token")
    }
  }).then(function(resp){
    var payment_data = JSON.parse(resp.data).data;
    localStorage.setItem("last_payment_id", payment_data.id)
    createCharge();
  }).fail(e => {
    console.log(e)
  });
}

function createCustomer(){
  var customer_reference = Math.round(Math.random()*1000);
  localStorage.setItem("customer_reference", customer_reference);
  var customer_data = {
    "customer_reference": localStorage.getItem("customer_reference"),
    "first_name": $('#first-name-ip').val(),
    "last_name": $('#last-name-ip').val(),
    "email": $('#email-ip').val(),
    "additional_details": { "test_key": "test_value" },
    "shipping_address": {
      "country": $('#country-ip').val(),
      "state": $('#state-ip').val(),
      "city": $('#city-ip').val(),
      "line1": $('#address-one-ip').val(),
      "line2": $('#address-two-ip').val(),
      "zip_code": $('#postal-two-ip').val(),
      "email": $('#email-ip').val()
    },
    "payment_methods": [localStorage.getItem("pay_now_token")]
  }
  var response;
  $.ajax({
    url: "/create_customer_data",
    method: 'POST',
    data: customer_data
  }).then(function(res){
    if(res.data){ 
      response = JSON.parse(res.data) 
      console.log(response);
      localStorage.setItem("customer_id", response.data.id);
    }
  }).fail(function(err){
    console.log("an error has occured while trying to save customer: "+err)
  });
  createPayment();
  return response;
}

$(document).ready(function(){
  $('#customer-info-form').on('submit', function(e){
    e.preventDefault(); 
    var customer_data = createCustomer();
  });
  $('#saved-payments').on('click', retrieveCustomer);
});

$("#pay-paytm").on('click', function(){
  var amount = $('#paytm-pay-amount').val();
  if(!amount) {
    alert("please enter an amount");
    console.log(amount);
    return false;
  } else {
    var paytm_payment_data = {
      // customer_id: localStorage.getItem("customer_id"),
      //return_url: window.location.href,
      "payment": JSON.stringify({"amount": amount,
        "currency": "INR",
        "billing_address": {
          "phone": $('#paytm-phone').val()
        },
        "order": {
          "id": String(Math.round(Math.random()*99999))
        }
      }),
      "charge": JSON.stringify({
        "merchant_site_url": window.location.href,
        "payment_method": {
          "source_type": "ewallet",
          "type": "untokenized",
          "vendor": "Paytm"
        },
        "reconciliation_id": String(Math.round(Math.random()*99999))
      })
    }
    $.ajax({
      url: "/paytm",
      method: 'POST',
      data: paytm_payment_data
    }).then(function(resp){
      var data = JSON.parse(resp.data);
      var paytm_redirect_url = data.redirection.url;
      window.location.href = paytm_redirect_url;
    });
  }
});
