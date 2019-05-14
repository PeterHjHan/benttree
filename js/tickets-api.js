

function get_ticket_data() {
	var ticket_filter = $("#ticket_filter").val().split(",");
	ticketTable = $('#ticket-table').DataTable({
		"language" : {
			search : "",
			searchPlaceholder : "Search Tickets"
		},
		"deferRender" : true,
		"scrollY" : 200,	
		"scrollCollapse" : true,
		"scroller" : true,
		"destroy" : true,
		"bLengthChange" : false,
		"searching" : true,
		"order" : [[0, "desc"]],
		"paging" : false,
		"bInfo" : false,
		"ajax" : "api?module=inlineItems&action=get_tickets&pno=" + pno,
		"createdRow" : function(row, data, dataIndex) {
			$(row).attr("ticket_no", data.ticket_no);
			$(row).addClass("ticket_tr");
			if (ticket_filter.indexOf(data.ticket_no) > -1) {
				$(row).addClass("selected");
			}
		},
		"columnDefs" : [{
			"targets" : 0,
			"data" : "work_date",
			"width" : "8%",
		}, {
			"targets" : 1,
			"data" : "ticket_no",
			"width" : "8%",
		}, {
			"targets" : 2,
			"data" : "description",
			"width" : "60%",
		}, {
			"targets" : 3,
			"data" : "total_count",
			"className" : 'dt-body-right',
			"width" : "8%"
		}, {
			"targets" : 4,
			"data" : "ex_count",
			"className" : 'dt-body-right',
			"width" : "8%"
		}, {
			"targets" : 5,
			"data" : "ticket_total",
			"width" : "8%",
			"className" : 'dt-body-right',
			"render" : $.fn.dataTable.render.number(',', '.', 2, '')
		}],
		"initComplete" : function(settings, json) {
			$("span#ticket_total_count").html($("tr.ticket_tr").length);
			var count = $("tr.ticket_tr.selected").length;
			if (count == 0) {
				$("span#ticket_selected_count").html($("span#ticket_total_count").html());
			} else {
				$("span#ticket_selected_count").html(count);
			}
		}
	});

	bind_click('ticket-table');
}

function get_labour_table_data() {

	labourTable = $('#labour-table').DataTable({
		"destroy" : true,
		"autoWidth": false,
		"lengthMenu" : [ [20, 40, 60, -1], [20, 40, 60, "All"] ],
		"searching" : false,
		"order" : [[1, "desc"]],
		"ajax" : {
			"url" : "api?module=inlineItems&action=get_labour",
			"data" : function(res) {
				return tableFilters;
			},
		},
		"createdRow" : function(row, data, dataIndex) {
			parse_row(row, data, dataIndex);
		},
		"columnDefs" : [{
			"targets" : 0,
			"data" : null,
			"sortable" : false,
			"className" : 'dt-body-center full_view select_all',
			"render" : function(val, _, obj) {
				temp_html = '<label class="checkbox_container_v2"><input type="checkbox" class="labour_check" /><span class="custom_checkbox_v2"></span></label>';
				return temp_html;
			},
			
		},{
			"targets" : 1,
			"data" : "work_date",
		}, {
			"targets" : 2,
			"data" : "ticket_no"
		}, {
			"targets" : 3,
			"data" : "personnel"
		}, {
			"targets" : 4,
			"data" : "type"

		}, {
			"targets" : 5,
			"data" : "st_hours",
			"className" : 'dt-body-right',
		}, {
			"targets" : 6,
			"data" : "st_rate",
			"className" : 'dt-body-right full_view',
			"render" : $.fn.dataTable.render.number(',', '.', 2, '')
		}, {
			"targets" : 7,
			"data" : "ot_hours",
			"className" : 'dt-body-center',
		}, {
			"targets" : 8,
			"data" : "ot_rate",
			"className" : 'dt-body-right full_view',
			"render" : $.fn.dataTable.render.number(',', '.', 2, '')
		}, {
			"targets" : 9,
			"data" : "loa",
			"className" : 'dt-body-right',
			"render" : $.fn.dataTable.render.number(',', '.', 2, '')
		}, {
			"targets" : 10,
			"data" : "ticket_amount",
			"className" : 'dt-body-right',
			"render" : $.fn.dataTable.render.number(',', '.', 2, '')
		}, {
			"targets" : -4,
			"data" : null,
			"className" : "col_view",
			"sortable" : false,
			"render" : function(val, _, obj) {
				return build_action_bt(val, _, obj);
			}
		}, {
			"targets" : -3,
			"data" : "ex_text",
			"className" : "full_view",
			"render" : function(val, _, obj) {
				return build_error_col(val, _, obj);
			}
		}, {
			"targets" : -2,
			"data" : null,
			"className" : "full_view full_notes_col",
			"sortable" : false,
			"render" : function(val, _, obj) {
				return build_note_col(val, _, obj);
			}
		}, {
			"targets" : -1,
			"data" : null,
			"className" : "full_view full_ar_col dt-body-center",
			"sortable" : false,
			"render" : function(val, _, obj) {
				return ar_bt(val, _, obj);
			}
		}],
		"initComplete" : function() {
			let target = $(this).closest('.graph-wrap').find('#entries_length label select');

		},
		
		"drawCallback" : function() {
			drawCallBacks(this, labourTable, labourTableSelectedItems);
			bind_full_menu('labour-table', labourTable);
		},
	});
	bind_full_menu('labour-table', labourTable);
	action_menu('labour-table', labourTable);
	bind_hover('labour-table');
}

function get_equipment_table_data() {
	equipmentTable = $('#equipment-table').DataTable({
		"destroy" : true,
		"pageLength" : 20,
		"autoWidth": false,
		"lengthMenu" : [ [20, 40, 60, -1], [20, 40, 60, "All"] ],
		"searching" : false,
		"order" : [[1, "desc"]],
		"ajax" : {
			"url" : "api?module=inlineItems&action=get_equipment",
			"data" : function() {
				return tableFilters;
			},
		},
		"createdRow" : function(row, data, dataIndex) {
			parse_row(row, data, dataIndex);
		},

		"columnDefs" : [{
			"targets" : 0,
			"data" : null,
			"sortable" : false,
			"className" : 'dt-body-center full_view select_all',
			"render" : function(val, _, obj) {
				temp_html = '<label class="checkbox_container_v2"><input type="checkbox" class="equipment_check" /><span class="custom_checkbox_v2"></span></label>';
				return temp_html;
			}
		},{
			"targets" : 1,
			"className" : 'dt-body-center',
			"data" : "work_date"
		}, {
			"targets" : 2,
			"className" : 'dt-body-right',
			"data" : "ticket_no"
		}, {
			"targets" : 3,
			"data" : "type"
		}, {
			"targets" : 4,
			"data" : "unit_identifier"
		}, {
			"targets" : 5,
			"data" : "equip_hours",
			"className" : 'dt-body-right',
			"render" : function(val, _, obj) {
				var temp_html = obj.equip_hours;
				if ( parseInt(obj.equip_hours) > 0 ) {
					temp_html += " ( ";
					temp_html += ( parseInt(obj.ticket_amount) / parseInt(obj.equip_hours) ).toFixed(2)
					temp_html += " $/h )";
				}
				return temp_html;
			}
		}, {
			"targets" : 6,
			"data" : "equip_days",
			"className" : 'dt-body-right',
			"render" : function(val, _, obj) {
				var temp_html = obj.equip_days;
				if ( parseInt(obj.equip_days) > 0 ) {
					temp_html += " ( ";
					temp_html += ( parseInt(obj.ticket_amount) / parseInt(obj.equip_days) ).toFixed(2)
					temp_html += " $/d )";
				}
				return temp_html;
			}
		}, {
			"targets" : 7,
			"data" : "ticket_amount",
			"className" : 'dt-body-right',
			"render" : $.fn.dataTable.render.number(',', '.', 2, '')
		}, {
			"targets" : -4,
			"data" : null,
			"className" : "col_view",
			"sortable" : false,
			"render" : function(val, _, obj) {
				return build_action_bt(val, _, obj);
			}
		}, {
			"targets" : -3,
			"data" : "ex_text",
			"className" : "full_view",
			"render" : function(val, _, obj) {
				return build_error_col(val, _, obj);
			}
		}, {
			"targets" : -2,
			"data" : null,
			"className" : "full_view full_notes_col",
			"sortable" : false,
			"render" : function(val, _, obj) {
				return build_note_col(val, _, obj);
			}
		}, {
			"targets" : -1,
			"data" : null,
			"className" : "full_view full_ar_col dt-body-center",
			"sortable" : false,
			"render" : function(val, _, obj) {
				return ar_bt(val, _, obj);
			}
		}],
		"drawCallback" : function() {
			drawCallBacks(this, equipmentTable, equipmentTableSelectedItems);
			bind_full_menu('equipment-table', equipmentTable);
		},
	});
	bind_full_menu('equipment-table', equipmentTable);
	action_menu('equipment-table', equipmentTable);
	bind_hover('equipment-table');
}

function get_material_table_data() {
	materialTable = $('#material-table').DataTable({
		"destroy" : true,
		"autoWidth": false,
		"lengthMenu" : [ [20, 40, 60, -1], [20, 40, 60, "All"] ],
		"searching" : false,
		"order" : [[1, "desc"]],
		"ajax" : {
			"url" : "api?module=inlineItems&action=get_material",
			"data" : function() {
				return tableFilters;
			},
		},
		"createdRow" : function(row, data, dataIndex) {
			parse_row(row, data, dataIndex);
		},

		"columnDefs" : [{
			"targets" : 0,
			"data" : null,
			"sortable" : false,
			"className" : 'dt-body-center full_view select_all',
			"render" : function(val, _, obj) {
				temp_html = '<label class="checkbox_container_v2"><input type="checkbox" class="material_check" /><span class="custom_checkbox_v2"></span></label>';
				return temp_html;
			}
		},{
			"targets" : 1,
			"className" : 'dt-body-center',
			"data" : "work_date"
		}, {
			"targets" : 2,
			"className" : 'dt-body-right',
			"data" : "ticket_no"
		}, {
			"targets" : 3,
			"data" : "resource_description"
		}, {
			"targets" : 4,
			"data" : "unit_identifier"
		}, {
			"targets" : 5,
			"data" : "equip_days",
			"className" : 'dt-body-right'
		}, {
			"targets" : 6,
			"data" : "st_rate",
			"className" : 'dt-body-right',
			"render" : $.fn.dataTable.render.number(',', '.', 2, '')
		}, {
			"targets" : 7,
			"data" : "ticket_amount",
			"className" : 'dt-body-right',
			"render" : $.fn.dataTable.render.number(',', '.', 2, '')
		}, {
			"targets" : -4,
			"data" : null,
			"className" : "col_view",
			"sortable" : false,
			"render" : function(val, _, obj) {
				return build_action_bt(val, _, obj);
			}
		}, {
			"targets" : -3,
			"data" : "ex_text",
			"className" : "full_view",
			"render" : function(val, _, obj) {
				return build_error_col(val, _, obj);
			}
		}, {
			"targets" : -2,
			"data" : null,
			"className" : "full_view full_notes_col",
			"sortable" : false,
			"render" : function(val, _, obj) {
				return build_note_col(val, _, obj);
			}
		}, {
			"targets" : -1,
			"data" : null,
			"className" : "full_view full_ar_col dt-body-center",
			"sortable" : false,
			"render" : function(val, _, obj) {
				return ar_bt(val, _, obj);
			}
		}],
		"drawCallback" : function() {
			drawCallBacks(this, materialTable, materialTableSelectedItems);
			bind_full_menu('material-table', materialTable);
		},
	});
	bind_full_menu('material-table', materialTable);
	action_menu('material-table', materialTable);
	bind_hover('material-table');
}

function get_third_party_table_data() {
	thirdpartyTable = $('#third-party-table').DataTable({
		"destroy" : true,
		"autoWidth": false,
		"lengthMenu" : [ [20, 40, 60, -1], [20, 40, 60, "All"] ],
		"searching" : false,
		"order" : [[1, "desc"]],
		"ajax" : {
			"url" : "api?module=inlineItems&action=get_thirdparty",
			"data" : function() {
				return tableFilters;
			},
		},
		"createdRow" : function(row, data, dataIndex) {
			parse_row(row, data, dataIndex);
		},
		"columnDefs" : [{
			"targets" : 0,
			"data" : null,
			"sortable" : false,
			"className" : 'dt-body-center full_view select_all',
			"render" : function(val, _, obj) {
				temp_html = '<label class="checkbox_container_v2"><input type="checkbox" class="third_party_check" /><span class="custom_checkbox_v2"></span></label>';
				return temp_html;
			}
		}, {
			"targets" : 1,
			"className" : 'dt-body-center',
			"data" : "work_date"
		}, {
			"targets" : 2,
			"className" : 'dt-body-right',
			"data" : "ticket_no"
		}, {
			"targets" : 3,
			"data" : "third_party_invoice"
		}, {
			"targets" : 4,
			"data" : "third_party_description"
		}, {
			"targets" : 5,
			"data" : "markup",
			"className" : 'dt-body-right',
			"render" : $.fn.dataTable.render.number(',', '.', 2, '')
		}, {
			"targets" : 6,
			"data" : "ticket_amount",
			"className" : 'dt-body-right',
			"render" : $.fn.dataTable.render.number(',', '.', 2, '')
		}, {
			"targets" : -4,
			"data" : null,
			"className" : "col_view",
			"sortable" : false,
			"render" : function(val, _, obj) {
				return build_action_bt(val, _, obj);
			}
		}, {
			"targets" : -3,
			"data" : "ex_text",
			"className" : "full_view",
			"render" : function(val, _, obj) {
				return build_error_col(val, _, obj);
			}
		}, {
			"targets" : -2,
			"data" : null,
			"className" : "full_view full_notes_col",
			"sortable" : false,
			"render" : function(val, _, obj) {
				return build_note_col(val, _, obj);
			}
		}, {
			"targets" : -1,
			"data" : null,
			"className" : "full_view full_ar_col dt-body-center",
			"sortable" : false,
			"render" : function(val, _, obj) {
				return ar_bt(val, _, obj);
			}
		}],
		"drawCallback" : function() {
			drawCallBacks(this, thirdpartyTable, thirdpartyTableSelectedItems);
			bind_full_menu('third-party-table', thirdpartyTable);
		},
	});
	bind_full_menu('third-party-table', thirdpartyTable);
	action_menu('third-party-table', thirdpartyTable);
	bind_hover('third-party-table');
}

function update_ex (id, ex_id, action, notes, table) {
	jQuery.ajax({
		type : 'post',
		url : 'api?module=inlineItems&action=update_ex',
		data : { id: id, ex_id: ex_id, action: action, notes: notes },
		beforeSend : function() {
			//load_mask();
		},
		success : function(response) {
			var result = JSON.parse(response);
			var data = result.data;
			table.ajax.reload( null, false );	
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function update_status(id, action, notes, table) {
	jQuery.ajax({
		type : 'post',
		url : 'api?module=inlineItems&action=update_status',
		data : { id: id, action: action, notes: notes },
		beforeSend : function() {
			//load_mask();
		},
		success : function(response) {
			var result = JSON.parse(response);
			var data = result.data;
			table.ajax.reload( null, false );	
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function run_parse() {
	jQuery.ajax({
		type : 'get',
		url : 'api?module=parse&action=parse_lineitems&pno=' + pno,
		beforeSend : function() {
			load_mask();
		},
		success : function(response) {
			//setTimeout( function() {
				var result = JSON.parse(response);
				var data = result.data;
				var temp_html = "";
				//$("#exceptions_result tbody").html('');
				//$(data).each(function(index, value) {
				//	temp_html = "<tr>" + "<td class='rule_no'>" + value.rule_no + "</td>" + "<td class='rule_desc'>" + rule_desc[value.rule_no] + "</td>" + "<td class='ex_no'>" + value.ex_no + "</td>" + "</tr>";
				//	$("#exceptions_result tbody").append(temp_html);
				//});
				unload_mask();
				reload_tables();
				loadPopupMsg('Completed running algorithms.');
				//$("#processing_wrap").hide();
				//$("#ex_notice_wrap").show();
			//}, 3000);
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function drawCallBacks(e, table, tableSelectedItemsArray) {
	onload(e, table, tableSelectedItemsArray);	
}

