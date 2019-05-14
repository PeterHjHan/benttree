$( document ).ready( function() {
	$( 'a.module-create-menu-bt' ).click(function() {
		var module_name = $( 'input[name="module-name"]' ).val().slice(0, -1);
		$( '#create-user-wrap h3').text( `Create ${module_name}` );
		$( 'a.module-list-menu-bt' ).toggleClass( 'on' );
		$( 'a.module-delete-bt' ).hide();
		$( '.module-edit-bt').removeClass('edit_on');
		if ( $( '.module-create-wrap input[name="id"]' ).val() != '' ) {
			$( '.module-create-wrap input' ).val('');
		}
		$(".module-create-form span.error_msg, .module-create-form span.error_msg_input").remove();
		if( $( '.module-create-wrap').css( 'display' ) !== 'none' && $( this ).hasClass( 'on' ) ) {
			$( 'a.module-create-menu-bt' ).removeClass( 'on' );
			$( '.module-create-wrap' ).slideUp( 'normal', function(){
				$( '.module-create-wrap input' ).val('');
			});	
		} else {
			$( '.module-create-wrap' ).slideDown( 'normal', function(){
				$( '.module-create-wrap input' ).val('');
				$( 'a.module-create-menu-bt' ).addClass('on');
			});	
		}
	});

	$( 'a.module-cancel-bt').on( 'click keypress', function(e) {
		if( e.which === 13 || e.type === 'click' ) {
			$( 'a.module-list-menu-bt' ).addClass( 'on' );
			$( 'a.module-create-menu-bt' ).removeClass( 'on' );
			$(".module-create-form span.error_msg, .module-create-form span.error_msg_input").remove();
			$( '.module-create-wrap' ).slideUp( 'normal', function(){
				$( 'a.module-delete-bt' ).hide();
				$( '.module-create-wrap input' ).val('');
			});
		}
	});

	$( '.module-edit-bt' ).click(function() {
		var record_id = $(this).attr("record_id");
		var module_name = $( 'input[name="module-name"]' ).val().slice(0, -1);
		$( 'a.module-create-menu-bt' ).removeClass('on');
		$( '#create-user-wrap h3').text( `Edit ${module_name}`);
		$( '.module-delete-bt' ).show();


		if( $( '.module-create-wrap').css( 'display' ) !== 'none' && $( this ).hasClass( 'edit_on' )) {
			$( '.module-create-wrap' ).slideUp( 'normal');
			$( this ).removeClass( 'edit_on' );
		} else {
			edit(record_id);
			$( '.module-create-wrap' ).slideDown( 'normal', function(){
			});
			$( '.module-edit-bt').removeClass( 'edit_on' );
			$( this ).addClass( 'edit_on' );
		}
	});

	$( 'a.module-save-bt' ).on( 'click keypress', function(e){
		var module_name = $( 'input[name="module-name"]' ).val();

		//e.which === 13 means 'if the key is the "enter" keyboard
		if( e.which === 13 || e.type === 'click' ) {
			if ( validate_form(module_name) ) { 
				save();
			} else {
				show_form_data_msg();
			}
		}
	});

	$( 'a.module-delete-bt' ).on( 'click keypress', function(e){
		if( e.which === 13 || e.type === 'click' ) {
			delete_record();
		}
	});

	$( '.module-inner-tab a' ).click(function(){
		var target_div = $( this ).attr( 'target-div' );
		$( '.module-inner-tab a' ).removeClass( 'on' );
		$( this ).addClass( 'on' );
		$( '.module-inner-div' ).removeClass( 'on' );
		$( '.module-inner-div#' + target_div ).addClass( 'on' );
	});
});

function edit( record_id ) {
	var module_name = $( 'input[name="module-name"]' ).val();
	jQuery.ajax({
		type : 'get',
		url : 'api?module=' + module_name + '&action=load&id=' + record_id,
		success : function(response) {
			var result = JSON.parse(response);
			$.each(result.data, function(index, value) {
    			if ( $( '.module-create-wrap input[name="' + index + '"]').length == 1 ) {
    				$( '.module-create-wrap input[name="' + index + '"]').val(value);	
    			} else if ( $( '.module-create-wrap select[name="' + index + '"]').length == 1 ) {
					$( '.module-create-wrap select[name="' + index + '"]').val(value);
    			}
  			});
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function save() {
	var module_name = $( 'input[name="module-name"]' ).val();
	var data = {};
	$( '.module-create-wrap input, .module-create-wrap select' ).each(function(){
		var field_name = $(this).attr('name');
		var field_val = $(this).val();
		data[field_name] = field_val;
	});
	data['module_name'] = module_name;
	jQuery.ajax({
		type : 'post',
		url : 'api?module=' + module_name + '&action=save',
		data : data,
		beforeSend : function() {
			//load_mask();
		},
		success : function(response) {
			var result = JSON.parse(response);
			if ( result['result'] == '1' ) {
				location.reload();
			}
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function show_form_data_msg() {
	var temp_text = '<span class="error_msg_input" style="padding : 20px">Please check your input.</span>';
	if( $(".module-create-form span.error_msg_input").length === 0 ) {
		$( ".module-create-form .module-form-bt-wrap" ).prepend( temp_text );
	}
	
}

function validate_form(module_name) {
	if ( window['validate_form_' + module_name]() ) {
		return true;
	} else {
		return false;
	}
}

function delete_record() {
	if ( confirm("Are you sure to delete?") ) {
		var module_name = $( 'input[name="module-name"]' ).val();
		var data = {};
		var id = $( '.module-create-wrap input[name="id"]' ).val();
		data['module_name'] = module_name;
		data['id'] = id;
		jQuery.ajax({
			type : 'post',
			url : 'api?module=' + module_name + '&action=delete',
			data : data,
			beforeSend : function() {
				//load_mask();
			},
			success : function(response) {
				var result = JSON.parse(response);
				if ( result['result'] == '1' ) {
					location.reload();
				}
			},
			error : function(response) {
				alert('Internal error.');
			}
		});
	}
}


function createFooter(querySelector) {
	//creates the Footer to be inserted into the DataTable Module
	//the footer is a container for the pagination information
  let info = $(querySelector).find( '.dataTables_info' ).attr( 'id' , 'entries_info' );
  let footerPaginate = $(querySelector).find( '.dataTables_paginate' ).attr( 'id' ,'entries_paginate' );
  let length = $(querySelector).find( '.dataTables_length' ).attr( 'id' , 'entries_length' );

  let div = document.createElement( 'div' );
  div.className = 'table_footer';
  let tableWrapper = $(querySelector).find( '.dataTables_wrapper' );
  let combination = $( div ).append( info ).append( footerPaginate ).append( length );

  tableWrapper.append( combination );

}

function scrolltoTableTr(targetQuery) {
	//This function scrolls the Users view with the targetQuery on top of the screen
	//During DataTables pagination, this will always put the table header in the top view
	//Can be optional 
	$([document.documentElement, document.body]).animate({
		scrollTop: $(targetQuery).offset().top
}, 1);
}

function toggleDeleteAllButton(tableQuery, tableModuleIdArray) {
	var checkbox = $( tableQuery ).find('input[type="checkbox"]' );
	var deleteButton = $( '#delete_all_btn' );

	if( tableModuleIdArray.length > 0) {
		deleteButton.css('display', 'inline-block');
		deleteButton.text(`Delete Selected (${tableModuleIdArray.length})`);

	} else {

		deleteButton.hide();
	}
}

function selectAllItems(e, table, tableModuleIdArray, IDAttributeName, deleteAllFunctionName) {
	//called when the user clicks on the table header's checkbox and puts all tbody checkboxes into the designated array

	var allCheckboxContainer = $(e).children( 'thead' ).find( '.all_checkbox' );

	allCheckboxContainer.unbind();
	allCheckboxContainer.on( 'change', function() {
		var allCheckbox = $( this ).children( 'input[type="checkbox"]' );
		var singleCheckbox = $( this ).closest( 'table' ).find( 'tbody tr' ).not( '.new_line' ).find( 'input[type="checkbox"]');

		if( allCheckbox.is( ':checked' ) ) {
			singleCheckbox.prop( 'checked', true);
			singleCheckbox.each( function() {

				var lineItemRateId = $( this ).closest( 'tr' ).attr(IDAttributeName) ;

				if( !tableModuleIdArray.includes(lineItemRateId) ) {
					tableModuleIdArray.push( lineItemRateId );
				}
			});
		} else {
			singleCheckbox.prop( 'checked', false);
			singleCheckbox.each( function() {
				var lineItemRateId = $( this ).closest( 'tr' ).attr(IDAttributeName);
				var index = tableModuleIdArray.indexOf(lineItemRateId);

				tableModuleIdArray.splice(index, 1);
			})
		}
		
		toggleDeleteAllButton( 'table#rates_table', tableModuleIdArray);

	});
	
	bind_delete_all_button(tableModuleIdArray, table, deleteAllFunctionName);
}

function singleCheckbox(e, table, tableModuleIdArray, IDAttributeName) {
	var singleCheckboxContainer = $( e ).children( 'tbody' ).find( '.checkbox_container_v2' );
	
	singleCheckboxContainer.unbind();
	singleCheckboxContainer.on( 'change' , function() {
		var actualCheckbox = $( this ).children( 'input[type="checkbox"]' );
		var rateId = $( this ).closest( 'tr' ).attr( IDAttributeName );
		var actualAllCheckbox = $(e).children( 'thead' ).find( 'input[type="checkbox"]' );
		var lineItemsCount = $( this ).closest( 'table' ).find( 'tbody tr' ).not( '.new_line' ).length;
		var checkedLineItemsCount = $( this ).closest( 'table' ).find( 'tbody tr td input[type="checkbox"]' ).filter(':checked').length;

		if( actualCheckbox.is( ':checked') ) {
			tableModuleIdArray.push( rateId );
		} else {
			var index = tableModuleIdArray.indexOf( rateId );
			tableModuleIdArray.splice(index, 1);
		}
		toggleDeleteAllButton(  'table#rates_table', tableModuleIdArray );

		if( lineItemsCount === checkedLineItemsCount  ) {
			actualAllCheckbox.prop( 'checked', true );
		} else {
			actualAllCheckbox.prop( 'checked', false);
		}
	});
}

function toggleSelectAllCheckboxOnPaginate(e) {
	//this function CHECKS the select All Checkbox if the current page's checkboxes are all checked during pagination
	e.on('draw.dt', function() {
		var singleCheckboxContainer = $( e ).children( 'tbody' ).find( '.checkbox_container_v2' );
		var actualAllCheckbox = $(e).children( 'thead' ).find( 'input[type="checkbox"]' );
		var lineItemsCount = singleCheckboxContainer.closest( 'table' ).find( 'tbody' ).children( 'tr' ).not( '.new_line' ).length;
		var checkedLineItemsCount = singleCheckboxContainer.closest( 'table' ).find( 'tbody tr td input[type="checkbox"]' ).filter(':checked').length;

		if( lineItemsCount === checkedLineItemsCount && lineItemsCount !== 0 ) {
			actualAllCheckbox.prop( 'checked', true );
		} else {
			actualAllCheckbox.prop( 'checked', false);
		}

	})
}


function bind_delete_all_button(array, table, functionName) {
	
	$( '#delete_all_btn' ).unbind();
	$('#delete_all_btn').click( function() {
		functionName(array, table);
	});
}
