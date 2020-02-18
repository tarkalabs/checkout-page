POS.setPublicKey('5fe2b1f5-3d23-4a73-9588-fe845721a083');
const style = {
  base:{
    color: 'blue',
    lineHeight: '40px',
    height: 45,
    fontWeight: 400,
    fontSize: '13px'
  }
};
// POS.disableSecurityNumber();
POS.setStyle(style);
// POS.disableCardFormatter();
POS.initSecureFields('card-secure-fields');
document.getElementById('payment-form').addEventListener('submit', function (event) {
  event.preventDefault();
  const additionalData = {
    holder_name: document.getElementById('cardholder-name').value,
    billing_address: {phone: document.getElementById('phone').value}
  }
  POS.createToken(additionalData, result => {
    data= JSON.parse(result)
    $('.tab-pane.active').removeClass('active');
    $('ul.nav-tabs li.active').removeClass('active');
    $('.get-customer-data').addClass('active');
    $('#cinf').addClass('active');
    $('#tokenized-card').val(data.token);
    localStorage.setItem("pay_now_token", data.token)
    console.log(data);
  });
});
