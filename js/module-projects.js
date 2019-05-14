var project_id;

var contractorRatesTable;
var checkedRateIdArray = [];
var newRatesArray = [];

$(document).ready(function(){

	$( 'a.contractor-selection' ).click(function( event ){
		event.preventDefault();
		$( this ).toggleClass( 'on' );
		assign_contractor( $( this ) );
	});

	$( 'a.user-selection' ).click(function( event ){
		event.preventDefault();
		$( this ).toggleClass( 'on' );
		assign_user( $( this ) );
	});

	$( '.project-manage-bt').unbind();
	$( '.project-manage-bt' ).click(function( event ){
		event.preventDefault();
		closeCreateModuleWrapper();
		reset_uploader();
		reset_manage_views();
		$('a.module-inner-tab-bt[target-div="contractors-tab"]').click();
		if ( ! $( this ).parent().hasClass( 'on' ) ) {
			$( 'table.module-list-table td.on' ).removeClass( 'on' );
			$( this ).parent().toggleClass( 'on' );	
			load_project_manager( $( this ) );
		} else {
			$( this ).parent().toggleClass( 'on' );	
			$( '#project-manage-wrap, .module-inner-tab-views' ).slideUp( function() {
				$( '#project-manage-tr' ).hide();
			})
		}
	});

	$( '.module-edit-bt, .module-create-menu-bt' ).click( function() {
		closeContractorManageWrapper();
	});

	bind_rates_form();

	$( 'a#rate_save_bt' ).click(function() {
		reset_uploader();
		update_rates();
	});
 
	$( 'a#reset_rates').click(function() {
		reset_uploader();
		
		if ( confirm( 'Are you sure to reset/reload? Unsaved data will be lost.' ) ) {
			resetItemsOnProjectChange()
			contractorRatesTable.ajax.reload(null, false);
		}
	});

	$( '#rate-contractor-select' ).change(function() { 
		reset_uploader();
		resetItemsOnProjectChange();
		get_linked_rates_v2();
	});

	$( '#rule-contractor-select' ).change(function() { 
		get_linked_rules();
	});	


	$( '#rate_add_bt' ).unbind();
	$( '#rate_add_bt' ).on("click", function() { 
		addNewRateConfiguration();
	});


});

function validate_form_projects(){
	var error = 0;
	if ( $( 'input[name="name"]' ).val() == '' ){
		error = 1;
	}
	if ( $( 'input[name="email"]' ).val() == '' ){
		error = 1;
	}
	
	if (error) {
		return false;
	} else {
		return true;
	}
}

function load_project_manager( btObj ) {
	//benttree custom dropdown neeeds to be called here;
	project_id = $( btObj ).attr( 'record_id' );
	var test = $( '#project-manage-tr' ).insertAfter( $( btObj ).parent().parent('tr') );
	$( '#project-manage-tr' ).show();
	$( '#project-manage-wrap, .module-inner-tab-views' ).hide().slideDown( 'normal', function() {
		//Dropdowns are called after the sliddown because, the SELECT elements are already created in the DOM in projects.php, thus, if the moduleDropdown was called, it would take the values of the previous SELECT element and not the new ones
		benttreeProjectsModuleDropdown('#rule-contractor-select');
		benttreeProjectsModuleDropdown('#rate-contractor-select');
	});
	$( '.contractor-selection, .user-selection' ).removeClass( 'on' );
	applyInnerTabTitle(btObj);
	get_linked_contractors();
	get_linked_users();
}

function assign_contractor( btObj ) {
	var contractor_id = $( btObj ).attr( 'contractor-id' );
	var link = $( btObj ).hasClass( 'on' );
	jQuery.ajax({
		type : 'post',
		url : 'api?module=projects&action=contractor_link',
		data : {
			'cid' : contractor_id,
			'pid' : project_id,
			'link': link
		},
		beforeSend : function() {
			//load_mask();
		},
		success : function(response) {
			var result = JSON.parse(response);
			if ( result['result'] == '1' ) {
				//location.reload();
			}
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function get_linked_contractors() {
	jQuery.ajax({
		type : 'get',
		url : 'api?module=projects&action=get_linked_contractors&pid=' + project_id,
		beforeSend : function() {
			//load_mask();
		},
		success : function(response) {
			var result = JSON.parse(response);
			if ( result['result'] == '1' ) {
			
				var count = $( result['data'] ).length;
				var i = 0;
				$( '#rate-contractor-select option').hide();

				if ( count === 0) {
					$( '#rate-contractor-select option[value=""]').text("No contractors assigned").show();
					$( '#rate-contractor-select' ).val('');
				}

				if ( count >= 1 ) {
					$( '#rate-contractor-select option[value=""]').text("Select Contractor").show();
					$( '#rate-contractor-select option[value=""]').show();
					$( '#rate-contractor-select' ).val('');
				}
				
				//only shows the select options that are available in the result['data']s
				$( result['data'] ).each(function(index, value) {
					$( '.contractor-selection[contractor-id="' + value + '"]').addClass( 'on' );
					$( '#rate-contractor-select option[value="' + value + '"]').show();

					i++;

					if ( i == count ) {
						if ( count == 1 ) {
							$( '#rate-contractor-select' ).val( value );
						}
						get_linked_rates_v2();	
					}
				});

			}
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function assign_user( btObj ) {
	var user_id = $( btObj ).attr( 'user-id' );
	var link = $( btObj ).hasClass( 'on' );
	jQuery.ajax({
		type : 'post',
		url : 'api?module=projects&action=user_link',
		data : {
			'uid' : user_id,
			'pid' : project_id,
			'link': link
		},
		beforeSend : function() {
			//load_mask();
		},
		success : function(response) {
			var result = JSON.parse(response);
			if ( result['result'] == '1' ) {
				//location.reload();
			}
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function get_linked_users() {
	jQuery.ajax({
		type : 'get',
		url : 'api?module=projects&action=get_linked_users&pid=' + project_id,
		beforeSend : function() {
			//load_mask();
		},
		success : function(response) {
			var result = JSON.parse(response);
			if ( result['result'] == '1' ) {
				$( result['data'] ).each(function(index, value) {
					$( '.user-selection[user-id="' + value + '"]').addClass( 'on' );
				});
			}
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function get_linked_rates_v2() {
	//Creates the DataTable for the RATES Configuration in the module-inner-details
	var contractor_id = $( '#rate-contractor-select' ).val();
  contractorRatesTable = $( '#rates_table' ).DataTable({
		"destroy" : true,
		"autoWidth": false,
		"ordering" : false,
		"lengthMenu" : [ [20, 40, 60, -1], [20, 40, 60, "All"] ],
		"searching" : false,
		"language" : {
			"emptyTable" : "There are no Rates for this contractor",
		},
		"createdRow" : function(row, data, dataIndex) {
			$(row).attr('rate_id', data.rate_id);
		},
		"order" : [[1, "desc"]],
		"ajax": {
			"type" : "get",
			"url": 'api?module=projects&action=get_linked_rates&pid=' + project_id + '&contractor_id=' + contractor_id,
			"dataSrc" : function(result) {

				if( result.data_count === 0 ) {
					return [];
				} else {
					let values = Object.values(result.data);

					return values;
				}
			}, 
		},
		"columnDefs" : [{
			"targets" : 1,
			"data" : "rate_category",
			"sortable" : false,
			"className" : null,
			"render": function(data, type, row, meta) {

				var temp_text = 	"<select class='rate_category' id='rate_category'>" +
														"<option value='labour' "; 
															if ( data == 'labour' ) { temp_text += " selected " }
															temp_text += ">Labour</option>" +
														"<option value='equipment' ";
															if ( data == 'equipment' ) { temp_text += " selected " }
															temp_text += ">Equipment</option>" +
														"<option value='material' ";
															if ( data == 'material' ) { temp_text += " selected " }
															temp_text += ">Material</option>" +
													"</select>"

				return temp_text;
			}
		}, {
			"targets" : 2,
			"data" : 'rate_desc',
			"render" : function(data, type, row, meta) {
				return `<input type="text" class="rate_desc" value="${data}"/>`;
			}
		}, { 
			"targets" : 3,
			"data" : 'rate_st_rate',
			"render" : function(data, type, row, meta) {
				return `<input type="number" class="rate_st_rate" value="${data}"/>`;
			}
		}, {
			"targets" : 4,
			"data" : "rate_ot_rate", 
			"render" : function(data, type, row, meta) {
				return `<input type="number" class="rate_ot_rate" value="${data}"/>`;
			}
		}, {
			"targets" : 5,
			"render" : function(val, _, obj) {
				return `<a class="rate-delete-bt"></a>`;
			}
		}, {
			"targets" : 0,
			"render" : function(val, _, obj) {
				return `<label class="checkbox_container_v2"><input type="checkbox"/><span class="custom_checkbox_v2 checkbox_small"></span></label>`;
			}
		}
	],
		"initComplete" : function() {
			initCompletes(this, contractorRatesTable);
		},
		"drawCallback" : function() {
			drawCallbacks(this, contractorRatesTable);
		},
	});
}

function initCompletes(e, table) {
	createFooter('.module-inner-div-content');
	applyCustomIds('#entries_paginate a', 'custom_paginate_button');
}

function drawCallbacks(e, table) {
	scrolltoTableTr("#project-manage-tr");
	applyCustomIds('#entries_paginate a', 'custom_paginate_button');
	bind_rates_form();
	selectAllItems(e, table, checkedRateIdArray, 'rate_id', delete_all_rate );
	singleCheckbox(e, table, checkedRateIdArray, 'rate_id' );
	toggleSelectAllCheckboxOnPaginate(e);
	toggleDeleteAllButton( 'table#rates_table', checkedRateIdArray, );
	showEditInput();
}

function get_linked_rates() {

	//Dead function (used for referencw when creating get_linked_rates_v2)
	//this was used to generate the table without the jquery's DataTable Module
	var contractor_id = $( '#rate-contractor-select' ).val();
	if ( contractor_id != '' ) {
		$( '#rates-tab h4 a' ).show();
		$( '#rates_table' ).show();
		jQuery.ajax({
			type : 'get',
			url : 'api?module=projects&action=get_linked_rates&pid=' + project_id + '&contractor_id=' + contractor_id,
			beforeSend : function() {
				//load_mask();
			},
			success : function(response) {
				var result = JSON.parse(response);
				var data = $( result['data'] );
				var data_count = result['data_count'];
				var i =0;
				$( 'table#rates_table tbody' ).html('');
				if ( data_count > 0 ) {
					$.each( data[0], function(index, value) {
						var temp_text = "<tr class='rate_config_row'>" +
							"<td>" +
								"<input type='hidden' class='rate_id' value='" + index + "' />" +
								"<select class='rate_category'>" +
									"<option value=''>Select a Category</option>" +
									"<option value='labour' "; 
						if ( value['rate_category'] == 'labour' ) { temp_text += " selected " }
						temp_text += ">Labour</option>" +
									"<option value='equipment' ";
						if ( value['rate_category'] == 'equipment' ) { temp_text += " selected " }
						temp_text += ">Equipment</option>" +
									"<option value='material' ";
						if ( value['rate_category'] == 'material' ) { temp_text += " selected " }
						temp_text += ">Material</option>" +
								"</select>" +
							"</td>" +
							"<td>" +
								"<input type='text' class='rate_desc' value='" + value['rate_desc'] + "' />" +
							"</td>" +
							"<td>" +
								"<input type='number' class='rate_st_rate' value='" + value['rate_st_rate'] + "' />" +
							"</td>" +
							"<td>" +
								"<input type='number' class='rate_ot_rate' value='" + value['rate_ot_rate'] + "' />" +
							"</td>" +
							"<td>" +
								"<a class='rate-delete-bt'>Delete</a>" + 
							"</td>" +
						"</tr>";

						$( 'table#rates_table tbody' ).append( temp_text );
						i++;
						if ( data_count == i ) {
							rates_form_validate();
						}
					});
				} else {
					var temp_text = "<tr class='rate_config_row'>" +
							"<td>" +
								"<input type='hidden' class='rate_id' value='' />" +
								"<select class='rate_category'>" +
									"<option value=''>Select a Category</option>" +
									"<option value='labour'>Labour</option>" +
									"<option value='equipment'>Equipment</option>" +
									"<option value='material'>Material</option>" +
								"</select>" +
							"</td>" +
							"<td>" +
								"<input type='text' class='rate_desc' value='' />" +
							"</td>" +
							"<td>" +
								"<input type='number' class='rate_st_rate' value='' />" +
							"</td>" +
							"<td>" +
								"<input type='number' class='rate_ot_rate' value='' />" +
							"</td>" +
							"<td>" +
								"<a class='rate-delete-bt off'>Delete</a>" + 
							"</td>" +
						"</tr>";
						$( 'table#rates_table tbody' ).append( temp_text );
						bind_rates_form();
				}
			},
			error : function(response) {
				alert('Internal error.');
			}
		});
	}
}

function update_rates() {
	var contractor_id = $( '#rate-contractor-select' ).val();
	var rates = [];
	$( '#rates_table tbody tr' ).each(function() {
		rates.push({
			rate_id : $( this ).attr('rate_id'),
			rate_category : $( this ).find( '.rate_category').val(),
			rate_desc : $( this ).find( '.rate_desc' ).val(),
			rate_st_rate : $( this ).find( '.rate_st_rate' ).val(),
			rate_ot_rate : $( this ).find( '.rate_ot_rate' ).val()
		});
	});
	
	jQuery.ajax({
		type : 'post',
		url : 'api?module=projects&action=assign_rates',
		data : {
			'pid' : project_id,
			'rates': rates,
			'contractor_id': contractor_id
		},
		beforeSend : function() {
			//load_mask();
		},
		success : function(response) {
			var result = JSON.parse(response);
			if ( result['result'] == '1' ) {
				alert('Rates Updated.');
				contractorRatesTable.ajax.reload(null, false);
			}
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function bind_rates_form() {
	$('#rates_table td input, a.rate-delete-bt').unbind();
	$('#rates_table td input.rate_desc').change(function(){
		let counter = 0;
		let rateDescription = $(this).closest('tbody').children().find('input.rate_desc')
		rateDescription.each(function() {
			if( $(this).val().length === 0) {
				counter++;
			}
		});
		let tr = $( this ).parent().parent();
		if( counter <= 0 && !tr.attr('rate_id') ) {
			rates_form_validate();
		}
	});
	$('a.rate-delete-bt').click(function(){
		delete_rate_entry( $( this ) );
	});
}

function rates_form_validate() {
	var parent_table = $( 'table#rates_table' );
	var table_tr = $( parent_table ).find('tbody').find('tr');
	var table_tr_count = $( table_tr ).length;
	var i = 0;
	var j = 0;
	var temp_td;
	$( table_tr ).each(function(){
		i = 0;
		temp_td = $( this ).find( 'td input' );
		$( temp_td ).each(function() {
			if ( $( this ).val() != '' ) {
				i++;
				$( this ).parent().parent().find( 'a.rate-delete-bt' ).show();
			}
		});
		if ( i > 0 ) {
			j++;
			if ( j >= table_tr_count ) {
				addNewRateConfiguration();
				// bind_rates_form();
			}
		}
	});
}

function delete_rate_entry( obj ) {
	var rate_id = $( obj ).closest('tr').attr('rate_id');
	if ( confirm( 'Are you sure to delete this configuration?\nThis action cannot be undone.' ) ) {
		if ( rate_id != '' ) {
			jQuery.ajax({
				type : 'post',
				url : 'api?module=projects&action=delete_rate_configuration&rate_id=' + rate_id,
				data : {
					'rate_id' : rate_id
				},
				beforeSend : function() {
					//load_mask();
				},
				success : function(response) {
					//setting null, false values to reload keeps the page on the same page on the TR
					checkedRateIdArray.length = 0;
					contractorRatesTable.ajax.reload(null, false);
				},
				error : function(response) {
					alert('Internal error.');
				}
			});
		}
		$( obj ).parent('td').parent('tr').remove();
	}
}

function delete_all_rate( rateIdArray, table ) {
	
	if ( confirm( `Are you sure to delete All ${rateIdArray.length} configurations?\n This action cannot be undone.` )) {
		rateIdArray.forEach((rateId, index)=> {
			jQuery.ajax({
				type : 'post',
				url : 'api?module=projects&action=delete_rate_configuration&rate_id=' + rateId,
				data : { "rate_id" : rateId },
				beforeSend : function() {
					//load_mask();
				},
				success : function(response) {
					var result = JSON.parse(response);
					var data = result.data;
					rateIdArray.shift();
	
					if(rateIdArray.length === 0) {
						table.ajax.reload();
					}
				},
				error : function(response) {
					alert('Internal error.');
				}
			});
		})

	}
}

function bind_rules_form() {
	$('#rules_table td input.is_active').unbind();
	$('#rules_table td a.param_1').unbind();
	$('#rules_table td label input.is_active').change(function(){
		var id = $(this).closest('tr').attr('id');
		update_rule_config( id );
	});

	$('#rules_table td a.param_1').click(function(){
		var temp_input = '<input class="param_1_input" value="' + $(this).html() + '"/>';
		$(this).after(temp_input);
		$(this).hide();
		$(this).next('input.param_1_input').focus();
		bind_rules_param_input();
	});
}

function bind_rules_param_input() {
	$('#rules_table td input.param_1_input').blur(function(){
		var param_1 = $(this).val();
		var id = $(this).parent('td').parent('tr').attr('id');
		$(this).parent().find('a.param_1').html( param_1 );
		$(this).hide();
		$(this).parent().find('a.param_1').show();
		$(this).remove();
		update_rule_config( id );
	});
}

function update_rule_config( id ) {
	var contractor_id = $( '#rule-contractor-select' ).val();
	var param_1 = $("#" + id ).find( 'a.param_1' ).html();
	var is_active = $("#" + id ).find( 'input.is_active' ).prop('checked');
	var rule_id = $("#" + id ).attr('rule_id');
	jQuery.ajax({
		type : 'post',
		url : 'api?module=rules&action=update_rule_config',
		data : { id: id, param_1: param_1, is_active: is_active, project_id: project_id, contractor_id: contractor_id, rule_id: rule_id },
		beforeSend : function() {
			//load_mask();
		},
		success : function(response) {
			var result = JSON.parse(response);
			var new_id = result['id'];
			$("#" + id).attr('id', new_id);
			// console.log("Result", result);
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function get_linked_rules() {
	var contractor_id = $( '#rule-contractor-select' ).val();
	if ( contractor_id != '' ) {
		$('#rules_table tbody').html('');
		jQuery.ajax({
			type : 'get',
			url : 'api?module=rules&action=get_linked_rules&pid=' + project_id + '&contractor_id=' + contractor_id,
			beforeSend : function() {
				//load_mask();
			},
			success : function(response) {
				var result = JSON.parse(response);
				var data = result['data'];
				var temp_html = '';
				var i = 0;
				$.each( data, function(index, value) {
					var rule_desc = value['rule_desc'];
					var param_1_text = '<a class="param_1">[ x ]</a>';
					var id = value['id'];
					if ( value['id'] == null ) {
						id = 'rule_tr_' + i;
					}
					if ( value['param_1'] != null && value['param_1'] != '' ) {
						param_1_text = '<a class="param_1">' + value['param_1'] + '</a>';
					}
					rule_desc = rule_desc.replace( '[param_1]', param_1_text );
					
					var mainTr = 						$(`<tr id="${id}" rule_id="${value['rule_id']}"></tr>`);
					var ruleNo = 						$(`<td style="width:10%">${value['rule_no']}</td>`);
					var ruleDesc = 					$(`<td style="width:80%" class="rule_desc">${rule_desc}</td>`);
					var checkboxTd = 				$('<td style="width:10%"></td>')
					var label = 						$('<label class="checkbox_container_v2"></label>');
					var checkbox_input = 		$('<input class="is_active" type="checkbox"/>')
					var checkbox_view = 		$('<span class="custom_checkbox_v2 checkbox_small"></span>')
					var checkbox_container = label.append(checkbox_input).append(checkbox_view);
					var checkbox_component = checkboxTd.append(checkbox_container);

					if( value['is_active'] == 1 ) {
						$(checkbox_input).prop('checked', true);
					}

					let row = mainTr.append(ruleNo)
													.append(ruleDesc)
													.append(checkbox_component);

					$('#rules_table tbody').append(row);
					i++;
				});
				bind_rules_form();
			},
			error : function(response) {
				alert('Internal error.');
			}
		});
	} else {
		console.log('test');
	}	
}

function applyInnerTabTitle(target) {
	let name = $(target).attr('name');
	$( '.inner-tab-title' ).text(name);
}

function closeCreateModuleWrapper() {
	if( $('#create-user-wrap').css('display') !== 'none') {
		$( '#create-user-wrap' ).slideUp();
		$( '.edit_on' ).removeClass('edit_on');
		$( '.module-create-menu-bt.on' ).removeClass( 'on' );
	}
}

function closeContractorManageWrapper() {
	if( $( '#project-manage-tr').css( 'display' ) !== 'none') {
		$('.module-list-table').find( 'tbody tr' ).children().removeClass( 'on' );
		$( '#project-manage-wrap, .module-inner-tab-views' ).slideUp('normal', function()  {
			$( '#project-manage-tr' ).hide();
		})
	}
}

function addNewRateConfiguration() {
	
	var newRowNode = contractorRatesTable.row.add({
		"rate_category": "Labour",
		"rate_desc" : "",
		"rate_st_rate": "0.00",
		"rate_ot_rate": "0.00",
	}).draw('page').node();

	contractorRatesTable.page('last').draw(false);

	$(newRowNode).children().css('background-color', 'rgba(184, 206, 138, 0.25)')
								.animate({ color: 'black' });

	$(newRowNode).addClass('new_line');
	$(newRowNode).children().find('.rate-delete-bt').parent().append('<a class="remove-row-bt"></a>');
	$(newRowNode).children().find('.rate-delete-bt').remove();
	$(newRowNode).children().find('.checkbox_container_v2').remove();

	insertNewRateIntoArray();
	removeNewContractRule();
}

function insertNewRateIntoArray() {

	var data = {
		rate_id: "",
		rate_category: "",
		rate_desc: "",
		rate_st_rate : 0.00,
		rate_ot_rate: 0.00,
	};
	
	$('tr.new_line').find('input, select').each( function() {
		$(this).on('focusout', function() {
			let value = $(this).val();
			let className = $(this).attr( 'class' );
			data[className] = $(this).parent().find(`.${className}`).val();
		});
	});

}

function removeNewContractRule() {
	$( '.remove-row-bt').unbind();
	$( '.remove-row-bt' ).on('click', function() {
		contractorRatesTable.row( $(this).closest('tr') ).remove().draw('page');
	}); 
}	

function reset_manage_views() {

	let ratesSelect = $( newFunction() ).find('[value=""]');
	let rulesSelect = $( '#rule-contractor-select-wrap .benttree_custom_dropdown_wrapper' ).find('[value=""]');
	let selectContractSelect = $( '#rule-contractor-select-wrap .benttree_custom_dropdown_wrapper, #rate-contractor-select-wrap .benttree_custom_dropdown_wrapper' ).find('[value=""]');

	if( ratesSelect.css('display') ==='none' ) {
		ratesSelect.show();
		ratesSelect.prependTo( ratesSelect.parent() );
	}
	
	if( rulesSelect.css('display') === 'none' ) {
		rulesSelect.show();
		rulesSelect.prependTo( rulesSelect.parent() );	
	}
	
	selectContractSelect.parent().children().removeClass(); 
	$( '#rule-contractor-select, #rate-contractor-select' ).val('').change();
	$( ratesSelect ).closest( '.module-inner-div-header').children( '.rate-contractor-top-right-wrap').hide()
	$( selectContractSelect ).closest('.module-inner-div.on').find('.inner-div-default-message').show()
	$( rulesSelect).closest('.module-inner-div.on').find('#rules_table').hide();

	resetItemsOnProjectChange();

	function newFunction() {
		return '#rate-contractor-select-wrap .benttree_custom_dropdown_wrapper';
	}
}

function resetItemsOnProjectChange() {
	$( '#delete_all_btn' ).hide();
	$( 'table#rates_table' ).find( 'input[type="checkbox"]').prop('checked', false);
	checkedRateIdArray.length = 0;
}

function showEditInput() {
	var existingTr = $( '#rates_table tbody').find('tr[rate_id]')
	var inputs = existingTr.find('input');

	inputs.on('change', function() {
			$( this ).css({ color: '#91B742' });
	})	
}

function benttreeProjectsModuleDropdown(selectName) {

	$(selectName).next().remove();

    let originalSelect = $(selectName);
    let outerDiv = document.createElement('div');
    let ul = document.createElement('ul');
    let liArray = [];
    let unixTimeStamp = + new Date();

    $(outerDiv).addClass('benttree_custom_dropdown_wrapper');
    $(ul).attr('guid', unixTimeStamp);

    originalSelect.children().each( function() {
      let value = $( this ).val();
			let context = $( this ).text();
      if ( !liArray.includes(value) && $( this ).css('display') !== 'none' ) {
        $('<li>').attr('value', value).text(context)
        .appendTo(ul);
        liArray.push(value);
      }
    });

    let combined = $(outerDiv).append(ul);
    originalSelect.after(combined);

    $(ul).on( 'click', function() {
      $( this ).toggleClass( 'open' );
    })
    $(ul).mouseleave(function () {
      $( this ).removeClass( 'open' );
    });

    //this part mimics the Select change
    $(ul).children().each(function() {
      $( this ).click( function() {
        if( $( this ).attr('value') !== '' && !$( this ).hasClass('select-selected-on')) {
          let value = $( this ).attr('value');
          $(selectName).val(value).trigger('change');
          $( this ).addClass('select-selected-on');
          $( this ).parent().children().not( $( this ) ).removeClass('select-selected-on');
          $( this ).prependTo($(this).parent());
					$( this ).parent().find('[value=""]').hide();
          $( selectName ).closest( '.module-inner-div-header').children( '.module-inner-div-header-top-right-wrap').show();
          $( selectName ).closest('.module-inner-div.on').find('#rates_table_wrapper').show();
          $( selectName ).closest('.module-inner-div.on').find('#rules_table').show();
          $( selectName ).closest('.module-inner-div.on').find('.inner-div-default-message').hide()
        }
      });
    });

    $(selectName).hide();
    return;

}