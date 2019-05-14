$(document).ready(function () {

  $( 'a.module-create-menu-bt' ).click(function() {
    $( '.edit-form-bt-wrap label.button_default_fill' ).click();
  });

});

//functions with the suffix '_v2' are copied versions from the original functions from module.js,

//jQuerys's slideUp, slideDown, slideToggle methods do not work on tr or td; therefore, the divs with class 'edit_table_data' was created to allow the slide methods

function showEditUser(target) {
  //Creates and Removes the DOM dynamically when Edit button is clicked
  if (!$(target).hasClass('open_edit')) {
    let parentTr = $(target).closest('tr');
    let tr = $('<tr class="user_edit_wrap" ></tr>');
    let hiddenInfoTd = $(`<td><div class="edit_table_data"><input type="hidden" name="module-name" value="users"/><input type="hidden" name="id" value="${$(target).attr( 'record_id' ) }"/></div></td>`);
    let nameLineItem = $('<td class="edit_line_items"><div class="edit_table_data"><span class="edit_form_headings" >Name</span><input tabindex="6" type="text" name="name" id="user_name" class="edit_input" /></div></td> ');
    let emailLineItem = $('<td class="edit_line_items"><div class="edit_table_data"><span class="edit_form_headings" >Email</span><input tabindex="7" type="text" name="email" id="user_email" class="edit_input"/></div></td>');
    let userTypeLineItem = $('<td class="edit_line_items"><div class="edit_table_data"><span class="edit_form_headings" >User Type</span><select tabindex="8" name="is_admin" class="edit_input"><option value="0" selected>Regular User</option><option value="1">Admin User</option></select></div></td>');
    let passwordLineItem = $('<div class="edit_line_items edit_table_data"><span class="edit_form_headings" >New Password</span><input tabindex="9" type="password" name="password" class="edit_input"/></div>');
    let confirmPasswordLineItem = $('<div class="edit_line_items edit_table_data"><span class="edit_form_headings" >Password Confirm</span><input tabindex="10" type="password" name="password_confirm" class="edit_input"/></div>');

    let saveButton = $('<label tabindex="10" id="user_update_bt" class="sub_button button_green_fill">Update</label>');
    let cancelButton = $('<label tabindex="10" id="user_cancel_bt" class="sub_button button_default_fill">Cancel</label>');
    let deleteButton = $('<label tabindex="10" id="user_delete_bt" class="sub_button button_red_fill">Delete</label>');

    let buttonsWrap = $('<div class="edit-form-bt-wrap edit_table_data"></div>')
      .append(saveButton)
      .append(deleteButton)
      .append(cancelButton);

    let td2 = nameLineItem.append(passwordLineItem);
    let td3 = emailLineItem.append(confirmPasswordLineItem);
    let lastTd = $( '<td class="edit_line_items"></td>' ).append(buttonsWrap);

    let all = tr.append(hiddenInfoTd)
      .append(td2)
      .append(td3)
      .append(userTypeLineItem)
      .append('<td></td>')
      .append(lastTd);

    all.insertAfter(parentTr);

    let record_id = hiddenInfoTd.find( 'input[name="id"]' ).val();
    edit_v2(record_id, all);
    validate_password(all);
    closeAllOtherEdits(all);
    $(target).addClass( 'open_edit' );

    bind_user_delete_bt();
    bind_user_update_bt();
    bind_user_cancel_bt();

    tr.find( '.edit_table_data' ).hide().slideDown();

    if( $( '.module-create-wrap' ).css( 'display' ) === 'block' ) {
      $( '.module-create-wrap' ).slideToggle( 'normal', function(){
				$( '.module-create-wrap input' ).val('');
			});	
    }

  } else {

    $(target).closest( 'tr' ).next( '.user_edit_wrap' ).find( 'select.edit_input' ).remove();
    $(target).closest( 'tr' ).next( '.user_edit_wrap' ).find( '.edit_table_data' ).slideUp('normal', function () {
        $(this).closest( 'tr' ).remove();
    });
    $(target).removeClass( 'open_edit' );
  }

}

function bind_user_delete_bt() {
  $( '#user_delete_bt' ).on( 'click keypress', function(e) {
    if( e.which === 13 || e.type === 'click' ) {
      delete_record_v2( this );
    }
  });
}

function bind_user_update_bt() {
  $( '#user_update_bt' ).on( 'click keypress', function(e) {
    if( e.which === 13 || e.type === 'click' ) {
      save_v2( this );
    }
  });
}

function bind_user_cancel_bt() {
  $( '#user_cancel_bt' ).on( 'click keypress', function(e) {
    if( e.which === 13 || e.type === 'click' ) {
      cancelEdit( this );
    }
  });
}

function closeAllOtherEdits(e) {
  //Closes any other open edits;
  let table = $(e).parent();
  let otherOpenEditButton = table.find( '.open_edit' );
  let targetOpenEditButton = $(e).prev().find( '.open_edit' );
  let editTr = table.find( '.user_edit_wrap' );

  if (editTr.length > 1) {
    otherOpenEditButton.not( targetOpenEditButton ).click();
  }
}

function delete_record_v2(e) {
  if (confirm("Are you sure to delete?")) {
    var editForm = $(e).closest( '.user_edit_wrap' );
    var module_name = editForm.find( 'input[name="module-name"]' ).val();
    var data = {};
    var id = editForm.find( 'input[name="id"]' ).val();
    data['module_name'] = module_name;
    data['id'] = id;

    jQuery.ajax({
      type: 'post',
      url: 'api?module=' + module_name + '&action=delete',
      data: data,
      beforeSend: function () {
        //load_mask();
      },
      success: function (response) {
        var result = JSON.parse(response);
        if (result['result'] == '1') {
          location.reload();
        }
      },
      error: function (response) {
        alert('Internal error.');
      }
    });
  }
}

function edit_v2(record_id, tableRow) {
  var module_name = $( 'input[name="module-name"]' ).val();
  jQuery.ajax({
    type: 'get',
    url: 'api?module=' + module_name + '&action=load&id=' + record_id,
    success: function (response) {
      var result = JSON.parse(response);
      $.each(result.data, function (index, value) {
        if ($(tableRow).find( `input[name="${index}"]` ).length === 1) {
          $(tableRow).find( `input[name="${index}"]` ).val(value);
        } else if ($(tableRow).find( `select[name="${index}"]` ).length === 1) {
          $(tableRow).find( `select[name="${index}"]` ).val(value);
        }
      });
    },
    error: function (response) {
      alert('Internal error.');
    }
  });
}

function cancelEdit(e) {
  //Closes the opened edit form and removes the open edit DOM
  $(e).closest( 'tr' ).find( '.edit_table_data' ).slideUp('normal', function () {
    $(this).closest( 'tr' ).remove();
  });
  $(e).closest( 'tr' ).prev().find( '.open_edit' ).removeClass('open_edit');
}

function save_v2(e) {

  if (validate_form_users_v2(e)) {
    var module_name = $( 'input[name="module-name"]' ).val();
    var data = {}
    $(e).closest( 'tr.user_edit_wrap' ).find( 'input, select' ).each(function () {
      var field_name = $(this).attr('name');
      var field_val = $(this).val();
      data[field_name] = field_val;
    });
    jQuery.ajax({
      type: 'post',
      url: 'api?module=' + module_name + '&action=save',
      data: data,
      beforeSend: function () {
        //load_mask();
      },
      success: function (response) {
        var result = JSON.parse(response);
        if (result['result'] == '1') {
          location.reload();
        }
      },
      error: function (response) {
        alert('Internal error.');
      }
    });
  }

}

function validate_form_users_v2(e) {

  let name = $(e).closest( 'tr' ).find( 'input[name="name"]' );
  let email = $(e).closest( 'tr' ).find( 'input[name="email"]' );
  let password = $(e).closest( 'tr' ).find( 'input[name="password"]' );
  let passwordConfirm = $(e).closest( 'tr' ).find( 'input[name="password_confirm"]' );

  var error = false;
  if (name.val() == '') {
    error = true;
  }
  if (email.val() == '') {
    error = true;
  }
  if (password.val() !== passwordConfirm.val() || password.val() === '') {
    error = true;
  }

  if (error) {
    let errorMessage = $(e).closest( 'tr' ).find( '.edit_line_items span.error_msg_input' );

    if (errorMessage.length === 0) {
      let temporaryErrorMessage = '<span class="error_msg_input">Please check your input.</span>';
      let div = $(e).closest( 'tr' ).find( '.edit-form-bt-wrap' );
      $(div).prepend( temporaryErrorMessage );
    }
    return false;
  } else {
    return true;
  }
}

function validate_password(e) {
  let passwordInput = $(e).find( 'input[name="password"]' );
  let confirmPasswordInput = $(e).find( 'input[name="password_confirm"]' );

  passwordInput.add(confirmPasswordInput).on("keyup", function () {
    let errorMessageBox = $(e).find( '.edit_line_items span.error_msg' );
    if (passwordInput.val() != confirmPasswordInput.val()) {
      if (errorMessageBox.length === 0) {
        let div = confirmPasswordInput.parent();
        $('<span class="error_msg">Password do not match</span>').insertAfter(div);
      }
    } else {
      errorMessageBox.remove();
    }
  });
}