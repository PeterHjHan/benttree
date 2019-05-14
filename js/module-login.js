
$(document).ready(function() {
  maskEmail();

  let hiddenEmail = maskEmail();
  let $currentEmail = $('.form_input_email').val();

  $('.form_input_email').on('input', function(){
    $('#remember_me_input').prop('checked', false);
    let value = $('.form_input_email').val();
    $currentEmail = value;
  })

  $('#benttree_login_form').on('submit', function() {
    if($currentEmail === hiddenEmail) {
      $('.form_input_email').val(Cookies.get('benttree'))
    } else{
      $('.form_input_email').val($currentEmail);
    }
  })

})

function maskEmail() {
  if(Cookies.get('benttree')) {
    let hiddenEmail = ""
    let email = Cookies.get('benttree');

    for(let i = 0; i < email.length; i++) {
      i > 2 ? hiddenEmail += "*" : hiddenEmail += email[i]
    }
    $('.form_input_email').val(hiddenEmail);
    $('#remember_me_input').prop('checked', true);
    return hiddenEmail;
  }
  
}