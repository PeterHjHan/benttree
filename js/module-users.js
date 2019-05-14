$(document).ready(function(){
	$( 'input[name="password"], input[name="password_confirm"' ).on("keyup", function(){
		if ( $( 'input[name="password"]' ).val() != $( 'input[name="password_confirm"]' ).val() ){
			show_password_error();
		} else {
			$( 'input[name="password"]' ).parent('li').children( 'span.error_msg' ).remove();
		}
	});

});
function validate_form_users(){
	var error = 0;
	if ( $( 'input[name="name"]' ).val() == '' ){
		error = 1;
	}
	if ( $( 'input[name="email"]' ).val() == '' ){
		error = 1;
	}
	if ( $( 'input[name="password"]' ).val() != $( 'input[name="password_confirm"]' ).val() ){
		error = 1;
	}
	
	if (error) { 
		return false;
	} else {
		return true;
	}
}
function show_password_error() {
	var temp_text = '<span class="error_msg">Passwords do not match.</span>';
	if ( $( 'input[name="password_confirm"]' ).parent('li').children( 'span.error_msg' ).length == 0 ) {
		$( 'input[name="password_confirm"]' ).parent('li').append(temp_text);	
	}
}