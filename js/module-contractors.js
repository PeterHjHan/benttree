var contractorUsersTable;
var contractorsUserIdArray = [];

$(document).ready(function(){
	$('.contractor-users-list-bt').click(function(){
		var contractor_id = $(this).attr('guid');
		var contractor_name = $(this).attr('contractor_name');
		$(".module-create-wrap").slideUp();
		$("#contractor-users-list-wrap").insertAfter( $(this).parent().parent() );

		if(! $( this ).hasClass('open_edit') ) {
			let otherTr = $( this ).closest( 'tbody' ).children().find( '.open_edit' );
			$( this ).addClass('open_edit');
			get_contractor_users_v2(contractor_id, contractor_name);
			otherTr.not($(this)).removeClass('open_edit');
		} else {

			$("#contractor-users-list-div, #contractor-headings-wrap, #contractor-user-form").slideUp("normal" ,function() {
				$('#contractor-users-list-wrap, #contractor-users-update-div').hide();
			});
			$( this ).removeClass('open_edit');
		}

		closeContractorUsersListWrap();
		
	});

	$('#contractor-user-delete-bt').on( 'click keypress', function(e) {
		if( e.which === 13 || e.type === 'click' ) {
			if( confirm("Would you like to delete this user?")) {
				let contractorUserId = $( this ).closest( '.contractor-user-form' ).find('#contractor_user_id').val();
				let contractor_guid = $( this ).prev().attr('guid')
				delete_contractor_users(contractorUserId, contractor_guid);
			}
		}
	})

	$('#contractor-user-add').click(function(){
		$( this ).closest('#contractor-headings-wrap').find("#contractor-users-update-div h3").text("Create Contractor User");
		$("#contractor-users-update-div input, #contractor-users-update-div select").val('');
		$('#contractor_user_type').val(0);
		$("span.error_msg#error_password").remove();
		$("span.error_msg#error_input").remove();
		$('#contractor-user-delete-bt').hide();
		
		

		if( $( '#contractor-users-update-div' ).css('display') !== 'none' && $( this ).hasClass('edit_on')  ) {
			$( '.edit_on' ).removeClass( 'edit_on' );
			$("#contractor-users-update-div").slideUp("normal");	
		} else {
			$("#contractor-users-update-div").slideDown();
			$( '.edit_on' ).removeClass( 'edit_on' );
			$( this ).addClass( 'edit_on' );
		}


	});

	$('#contractor-user-close').on( 'click', function(){
		$("#contractor-users-update-div input, #contractor-users-update-div select").val('');
		$("#contractor-users-list-div, #contractor-headings-wrap").slideUp("normal" ,function() {
			$('#contractor-users-list-wrap, #contractor-users-update-div').hide();
		});
		$( '.open_edit' ).removeClass('open_edit'); 
	});

	$("#contractor-user-cancel-bt").on( 'click keypress', function(e){
		if( e.which === 13 || e.type === 'click' ) {
			$("#contractor-users-update-div input, #contractor-users-update-div select").val('');
			$("#contractor-users-update-div").slideUp();
		}
	});
	$('#contractor-user-save-bt').on( 'click keypress', function(e){
		if( e.which === 13 || e.type === 'click' ) {
			var contractor_id = $(this).attr('guid');
			if( validate_contractors_users_form() ) {
				update_contractor_users(contractor_id);
			}
		}
	});

	validate_password();

});

function validate_form_contractors(){
	var error = 0;
	if ( $( 'input[name="name"]' ).val() == '' ){
		error = 1;
	}
	
	if (error) {
		return false;
	} else {
		return true;
	}
}

function get_contractor_users_v2( contractor_id, contractor_name ) {
	//Creates the DataTable for the contractor_users
	$("#contractor-users-list-wrap span#contractor-name").html(contractor_name);
	contractorUsersTable = $( '#contractor-user-table' ).DataTable({
		"destroy": true,
		"autoWidth": false,
		"ordering": false,
		"lengthMenu" : [ [20, 40, 60, -1], [20, 40, 60, "All"] ],
		"searching" : false,
		"language" : {
			"emptyTable" : "There are no Users for this Contractor",
		},
		"createdRow" : function( row, data, dataIndex ) {
			$(row).attr('contractor_id', data.id)
		},
		"ajax" : {
			'type' : 'get',
			'url' : 'api?module=contractor_users&action=listview&guid=' + contractor_id,
			'dataSrc' : function(result) {
				if(!result.data || result.data.count === 0 ) {
					return [];
				} else {
					let values = Object.values(result.data);
					return values;
				}
			}
		},
		"columnDefs" : [{
			"targets" : 0,
			"render" : function() {
				return `<label class="checkbox_container_v2"><input type="checkbox"/><span class="custom_checkbox_v2 checkbox_small"></span></label>`;
			}
		}, {
			"targets": 1,
			"data" : "name",
		}, {
			"targets" : 2,
			"data" : "email",
		}, {
			"targets": 3,
			"data" : "user_type",
		}, {
			"targets": 4,
			"data" : "last_login",
		} , {
			"targets": 5,
			"data" : "id",
			"render": function(data) {
				return `<a class='contractor-user-edit-bt sub_button button_blue_fill' contractor-user-id='${data}'>Edit</a>`
			}
		}],
		"initComplete" : function() {
			$("#contractor-users-list-wrap, #contractor-users-list-div, #contractor-headings-wrap, #contractor-user-form").show();
			$("#contractor-user-save-bt").attr('guid', contractor_id);
			$("#contractor_id").val(contractor_id);
			$('#contractor-users-update-div').hide();
			$("#contractor-users-list-div").hide().slideDown("normal");
			initCompletes();
		},
		"drawCallback" : function() {
			drawCallBacks(this, contractorUsersTable);
		}
	})

}

// last_login, user_type
function get_contractor_users( contractor_id, contractor_name ) {
	//Original code used to create the datatable, NO LONGER USED, kept for reference;
	$("#contractor-users-list-wrap span#contractor-name").html(contractor_name);
	jQuery.ajax({
		type : 'get',
		url : 'api?module=contractor_users&action=listview&guid=' + contractor_id,
		beforeSend:function(){
			
		},
		success : function(response) {
			$("#contractor-users-list-wrap, #contractor-users-list-div, #contractor-headings-wrap, #contractor-user-form").show();
			$("#contractor-user-table tbody" ).html('');
			$("#contractor-user-save-bt").attr('guid', contractor_id);
			$("#contractor_id").val(contractor_id);
			var result = JSON.parse(response);
			$.each(result.data, function(index, value) {
				var temp_html = "<tr>"+
				"<td class='module-list-checkbox'><label class='checkbox_container_v2'><input type='checkbox' id='labour_check_all' /><span class='custom_checkbox_v2 checkbox_small'></span></label></td>" + 
				"<td>" + value['name'] + "</td>" + 
				"<td>" + value['email'] + "</td>" + 
				"<td>" + value['user_type'] + "</td>" + 
				"<td>" + value['last_login'] + "</td>" + 
				"<td class='module-list-ca'><a class='contractor-user-edit-bt sub_button button_blue_fill' contractor-user-id='" + index + "'>Edit</a></td>" + 
				"</tr>";
    			$( "#contractor-user-table tbody" ).append(temp_html);
    			bind_edit_bt();
				});
			$('#contractor-users-update-div').hide();
			$("#contractor-users-list-div").hide().slideDown("normal");
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function update_contractor_users( contractor_id ) {
	//Function called to both ADD New user and Update existing User
	var data = {};
	$( "#contractor_id").val(contractor_id);
	$( '#contractor-user-form input, #contractor-user-form select' ).each(function(){
		var field_name = $(this).attr('name');
		var field_val = $(this).val();
		data[field_name] = field_val;
	});
	
	jQuery.ajax({
		type : 'post',
		data : data,
		url : 'api?module=contractor_users&action=save&guid=' + contractor_id,
		beforeSend:function(){
			
		},
		success : function(response) {
			$( '#contractor-users-update-div' ).slideUp();
			contractorUsersTable.ajax.reload(null, false);
			$( '#contractor-users-update-div input, #contractor-users-update-div select' ).val('');
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

//FIXME: Edit button and Add button is NOT being clicked after Clicking on the save button

function delete_contractor_users( contractor_user_id, contractor_guid ) {
	//deletes single user
	let data = {};
	data["id"] = contractor_user_id;
	jQuery.ajax({
		type : 'post',
		data: data,
		url : 'api?module=contractor_users&action=delete_user&guid=' + contractor_user_id,
		beforeSend:function(){
			
		},
		success : function(response) {
			contractorUsersTable.ajax.reload();
			$("#contractor-users-update-div").slideUp();
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function delete_selected_contractor_users(contractorUserIdArray, contractor_guid) {
	//deletes checkbox checkbed users;
	if( confirm( `Would you like to delete ${contractorUserIdArray.length} users?\n This action cannot be undone.`) ){
		contractorUserIdArray.forEach((contractor_user_id, index) => {
			let data = {};
			data["id"] = contractor_user_id;
			jQuery.ajax({
				type : 'post',
				data: data,
				url : 'api?module=contractor_users&action=delete_user&guid=' + contractor_user_id,
				beforeSend:function(){
					
				},
				success : function(response) {
	
					contractorUserIdArray.shift();
					if(contractorUserIdArray.length === 0) {
						contractorUsersTable.ajax.reload();
						$("#contractor-users-update-div").slideUp();
					}
				},
				error : function(response) {
					alert('Internal error.');
				}
			});
		});
	}
}

function get_contractor_user_details( user_id ) {
	jQuery.ajax({
		type : 'get',
		url : 'api?module=contractor_users&action=get_details&user_id=' + user_id,
		beforeSend:function(){
			
		},
		success : function(response) {
			var result = JSON.parse(response);
			$("#contractor_user_id").val(result.data['id']);
			$("#contractor_user_name").val(result.data['name']);
			$("#contractor_user_type").val(result.data['user_type']);
			$("#contractor_user_email").val(result.data['email']);
			$("#contractor_user_password").val('');
			$("#contractor_user_password_confirm").val('');
			$("span.error_msg#error_password").remove();
			$("span.error_msg#error_input").remove();
		},
		error : function(response) {$( this ).closest('#contractor-headings-wrap').find("#contractor-users-update-div h3").text("Create Contractor User");
			alert('Internal error.');
		}
	});
}

function bind_edit_bt() {
	$('.contractor-user-edit-bt').unbind();
	$('.contractor-user-edit-bt').click(function(){
		if( $( '#contractor-users-update-div' ).css('display') !== 'none' && $( this ).hasClass('edit_on')  ) {
			$( '.edit_on' ).removeClass( 'edit_on' );
			$("#contractor-users-update-div").slideUp("normal");	
		} else {
			let contractorUsername = $( this ).closest( 'tr' ).find('td:nth-child(2)').text();
			$( this ).closest("#contractor-users-list-wrap").find("#contractor-users-update-div h3").text(`Edit Contractor: ${contractorUsername}`);
			$("#contractor-users-update-div").slideDown("normal");
			$('#contractor-user-delete-bt').show();		
			get_contractor_user_details( $(this).attr('contractor-user-id') );
			$( '.edit_on' ).removeClass( 'edit_on' );
			$( this ).addClass( 'edit_on' );
		}
	});
}

function validate_password() {
  let passwordInput = $( 'input[name="password"]' );
  let confirmPasswordInput = $( 'input[name="password_confirm"]' );

  passwordInput.add(confirmPasswordInput).on("keyup", function () {
    let errorMessageBox = $( 'span.error_msg#error_password' );
    if (passwordInput.val() != confirmPasswordInput.val()) {
      if (errorMessageBox.length === 0) {
        $('<span class="error_msg" id="error_password">Password do not match</span>').insertAfter(confirmPasswordInput);
      }
    } else {
      errorMessageBox.remove();
    }
  });
}

function validate_contractors_users_form() {

	let name = $( "#contractor_user_name" );
	let userType = $( "#contractor_user_type" );
	let email = $( "#contractor_user_email" );
	let password = $( "#contractor_user_password" );
	let passwordConfirm = $( "#contractor_user_password_confirm" );

  var error = 0;
  if (name.val() == '') {
    error = 1;
  }
  if (email.val() == '') {
    error = 1;
	}
	if (userType.val() == '' || userType.val() === null ) {
		error = 1;
	}
  if (password.val() !== passwordConfirm.val() || password.val() === '') {
    error = 1;
  }

  if (error) {
    let errorMessage = $( 'span.error_msg#error_input' );

    if (errorMessage.length === 0) {
      let errorMessage = '<span id="error_input" class="error_msg">Please check your input.</span>';
      $( '.module-form-bt-wrap' ).prepend(errorMessage);
    }
    return false;
  } else {
    return true;
  }
}

function closeContractorUsersListWrap() {
	$( '.module-create-menu-bt, .module-edit-bt' ).click( function() {
		
		if( $( '#contractor-users-list-wrap').css('display') === 'table-row') {
			$("#contractor-users-update-div input, #contractor-users-update-div select").val('');
			$("#contractor-users-list-div, #contractor-headings-wrap").slideUp("normal" ,function() {
				$('#contractor-users-list-wrap, #contractor-users-update-div').hide();
			});
			$( '.open_edit' ).removeClass('open_edit'); 
		}
	});
}

function initCompletes(e, table) {
	createFooter('#contractor-users-list-div');
	applyCustomIds('#entries_paginate a', 'custom_paginate_button');
}

function drawCallBacks(e,table) {
	selectAllItems(e, table, contractorsUserIdArray, 'contractor_id', delete_selected_contractor_users);
	singleCheckbox(e, table, contractorsUserIdArray, 'contractor_id');
	applyCustomIds('#entries_paginate a', 'custom_paginate_button');
	toggleDeleteAllButton('table#contractor-user-table', contractorsUserIdArray);
	toggleSelectAllCheckboxOnPaginate(e);
	bind_edit_bt();
}