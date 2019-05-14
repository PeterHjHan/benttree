var tableFilters = {
	"pno" : pno,
	"wdate" : "",
	"status" : "",
	"ticket" : "",
	"exonly" : ""
};
var ticketTable,
	labourTable,
    equipmentTable,
    materialTable,
    thirdpartyTable;

function bind_click(id) {
	$("#" + id + " tbody").on('click', 'td', function() {
		$(this).parent('tr').toggleClass('selected');
		register_ticket_filter();
	});
}

function register_ticket_filter() {
	var temp_tickets = '';
	var count = $("tr.ticket_tr.selected").length;

	$("input#ticket_filter").val('');
	if (count == 0) {
		$("input#ticket_filter").trigger("change");
		$("span#ticket_selected_count").html($("span#ticket_total_count").html());
	} else {
		$("span#ticket_selected_count").html(count);
		$("tr.ticket_tr.selected").each(function() {
			if (temp_tickets != '') {
				temp_tickets += ',';
			}
			temp_tickets += $(this).attr('ticket_no');
			if (!--count) {
				$("input#ticket_filter").val(temp_tickets);
				$("input#ticket_filter").trigger("change");
			}
		});
	}
}

function bind_hover(id) {
	$("#" + id + " tbody").on('mouseenter', 'a.pr_alert', function() {
		var ex_codes = $(this).attr('ex_codes');
		var ex_code_array = ex_codes.split(",");
		var temp_html = '<div class="ex_detail_popup">';
		var bt_top = $(this).offset().top;
		var bt_left = $(this).offset().left;
		var doc_width = $(document).width();
		var is_ex_approved = $(this).parent('td').parent('tr').hasClass("status_ex_approved");
		var is_ex_rejected = $(this).parent('td').parent('tr').hasClass("status_ex_rejected");

		$(ex_code_array).each(function(index, value) {
			temp_html += '<span class="';
			if (is_ex_rejected) {
				temp_html += "ex_rejected";
			} else if (is_ex_approved) {
				temp_html += "ex_approved";
			}
			temp_html += '" >' + rule_desc[value] + '</span>';
		});
		temp_html += '</div>';
		$("#rules_popup_wrap").html(temp_html);

		var popup_width = $("#rules_popup_wrap div.ex_detail_popup").width();
		var popup_left = 0;
		if (doc_width > bt_left + popup_width) {
			$("#rules_popup_wrap div.ex_detail_popup").removeClass('far-right');
			popup_left = bt_left + 10 - (popup_width + 22) / 2;
		} else {
			$("#rules_popup_wrap div.ex_detail_popup").addClass('far-right');
			popup_left = bt_left + 28 - (popup_width + 22);
		}

		$("#rules_popup_wrap div.ex_detail_popup").css({
			"top" : bt_top + 23,
			"left" : popup_left
		});
	}).on('mouseleave', 'a.pr_alert', function() {
		$("#rules_popup_wrap").html('');
	});
}

function action_menu(id, table) {
	$("#" + id + " tbody").on('click', 'tr[role="row"] td', function() {
		if ( ! $( "#" + id ).parent().parent().parent(".project_col").hasClass("full") ) {
			var tr = $(this).closest('tr');
			var row = table.row(tr);
			var d = [];
			d.status = "new";
			d.data = row.data();

			if (row.child.isShown()) {
				$('div.action_wrap', row.child()).slideUp(function() {
					row.child.hide();
					tr.removeClass('shown');
				});
			} else {
				if (d.data.ex_codes) {
					// If its Exceptions Row
					if (d.data.ex_approved) {
						d.status = "approved";
					} else if (d.data.ex_rejected) {
						d.status = "rejected";
					}

					row.child(format_ex(d)).show();
					tr.addClass('shown');
					$('div.action_wrap', row.child()).slideDown();
					bind_action_bts(table);
				} else if (d.data) {
					// If its none-exceptions Row
					row.child(format_no_ex(d)).show();
					tr.addClass('shown');
					$('div.action_wrap', row.child()).slideDown();
					bind_action_bts(table);
				}
			}
		}
	});
}

function bind_full_menu(id, table) {
	bind_full_action_bts(id, table);
}

function format_ex(rowData) {

	var d = rowData.data;
	var status = rowData.status;
	var ex_codes = d.ex_codes;
	var ex_text = d.ex_text;
	var ex_text_array = ex_text.split("|");
	var ex_ids = d.ex_ids;
	var ex_code_array = ex_codes.split(",");
	var ex_id_array = ex_ids.split(",");
	var ex_approved_array = d.ex_approved.split(",");
	var ex_rejected_array = d.ex_rejected.split(",");
	var return_text = '';

	return_text += '<div class="action_wrap" guid="' + d.id + '">';
	return_text += '<table>';
	$(ex_text_array).each(function(index, value) {
		return_text += '<tr><td class="action_col_1">';
		if ( d.ex_approved || d.ex_rejected ) {
			if (d.ex_approved) {
				return_text += '<span class="pr_alert pr_ex ex_approved">' + value + '</span></td>';
				return_text += '<td class="action_col_2">';
				return_text += ex_approved_array[index];
				return_text += '</td>';
				return_text += '<td class="action_col_3">Approved By: </td>';
				return_text += '<td class="action_col_4">'+d.updated_by+'</td>';
				return_text += '</tr>';
			} else {
				return_text += '<span class="pr_alert pr_ex ex_rejected">' + value + '</span></td>';
				return_text += '<td class="action_col_2">';
				return_text += ex_rejected_array[index];
				return_text += '</td>';
				return_text += '<td class="action_col_3">Rejected By:</td>';
				return_text += '<td class="action_col_4">'+d.updated_by+'</td>';
				return_text += '</tr>';
			}

		} else {
			return_text += '<span class="pr_alert pr_ex">' + value + '</span></td>';
			return_text += '<td class="action_col_2"><textarea class="action_note" placeholder="Enter Additional Notes" ></textarea></td>';
			return_text += '<td class="action_col_3"><a guid="' + d.id + '" ex_id="' + ex_id_array[index] + '" action="approve" class="approve_bt">Approve</a></td>';
			return_text += '<td class="action_col_4"><a guid="' + d.id + '" ex_id="' + ex_id_array[index] + '" action="reject" class="reject_bt">Reject</a></td>';
			return_text += '</tr>';
		}
	});
	return_text += '</table>';
	return_text += '</div>';
	return return_text;
}

function format_no_ex(rowData) {
	var return_text = '';
	var d = rowData.data;
	var status = rowData.status;
	return_text += '<div class="action_wrap" guid="' + d.id + '">';
	return_text += '<table>';

	return_text += '<tr><td class="action_col_1 action_col_' + d.ticket_status + '">No Exceptions found.</td>';
	if ( d.ticket_status == 'Pending' ) {
		return_text += '<td class="action_col_2"><textarea class="action_note" placeholder="Enter Additional Notes" ></textarea></td>';
		return_text += '<td class="action_col_3"><a guid="' + d.id + '" action="approve" class="approve_bt">Approve</a></td>';
		return_text += '<td class="action_col_4"><a guid="' + d.id + '" action="reject" class="reject_bt">Reject</a></td>';	
	} else if ( d.ticket_status == 'Approved' ){
		return_text += '<td class="action_col_2 action_col_' + d.ticket_status + '">' + d.notes + '</td>';
		return_text += '<td class="action_col_3">Approved By: </td>';
		return_text += '<td class="action_col_4">'+d.updated_by+'</td>';
	} else {
		return_text += '<td class="action_col_2 action_col_' + d.ticket_status + '">' + d.notes + '</td>';
		return_text += '<td class="action_col_3">Rejected By:</td>';
		return_text += '<td class="action_col_4">'+d.updated_by+'</td>';
	}
	return_text += '</tr>';
	return_text += '</table>';
	return_text += '</div>';
	return return_text;
}

function parse_row(row, data, dataIndex) {
	$(row).attr("guid", data.id);
	$(row).addClass("status_" + data.ticket_status.toLowerCase());
	if (data.ex_codes) {
		$(row).addClass("status_ex");
	}
	if (data.ex_approved) {
		$(row).addClass("status_ex_approved");
		$(row).removeClass("status_ex");
	}
	if (data.ex_rejected) {
		$(row).addClass("status_ex_rejected");
		$(row).removeClass("status_ex");
	}
}

function build_action_bt(val, _, obj) {
	var temp_html = '';
	if (obj.ex_codes) {
		temp_html = '<a class="pr_alert pr_ex" ex_codes="' + obj.ex_codes + '">' + obj.ex_codes + '</a>';
	} else {
		temp_html = '<a class="pr_gear pr_status_' + obj.ticket_status + '">Options</a>';
	}
	return temp_html;
}

function bind_action_bts(table) {
	$("a.approve_bt, a.reject_bt").not(".disabled").click(function() {
		var id = $(this).attr('guid');
		var ex_id = $(this).attr('ex_id');
		var action = $(this).attr('action');
		var note = $(this).parent('td').parent('tr').find('.action_note').val();
		if (ex_id) {
			update_ex(id, ex_id, action, note, table);	
		} else {
			update_status(id, action, note, table);
		}
	});
}

function bind_full_action_bts(id, table) {
	$("#" + id + " a.approve_bt, a.reject_bt").unbind();
	$("#" + id + " a.approve_bt, a.reject_bt").not(".disabled").click(function() {
		var id = $(this).attr('guid');
		var ex_id = $(this).attr('ex_id');
		var action = $(this).attr('action');
		var note = $(this).parent('td').parent('tr').find('.action_note').val();
		if (ex_id) {
			update_ex(id, ex_id, action, note, table);	
		} else {
			update_status(id, action, note, table);
		}
	});
}

function build_error_col(val, _, obj) {
	if ( obj.ex_text ) {
		var ex_text = obj.ex_text;
		var ex_text_array = ex_text.split("|");
		var ex_ids = obj.ex_ids;
		var ex_codes = obj.ex_codes;
		var ex_code_array = ex_codes.split(",");
		var ex_id_array = ex_ids.split(",");
		var ex_approved_array = obj.ex_approved.split(",");
		var ex_rejected_array = obj.ex_rejected.split(",");
		
		if ( ex_text_array.length > 1 ) {
			return ex_text_array[0]; // + "<a href=''>Show All</a>"
		} else {
			return ex_text_array[0];
		}
	} else {
		return "";
	}
}
function build_note_col(val, _, obj) {
	return "<input type='text' class='fs_view_notes action_note' value='" + obj.notes + "'/>";
}

function ar_bt(val, _, obj) {
	var return_text = "";
	var status = obj.status;
	var ex_id_array = [''];
	if (obj.ex_ids) {
		var ex_ids = obj.ex_ids;
		ex_id_array = ex_ids.split(",");	
	}
	

	if ( obj.ex_approved || obj.ex_rejected ) {
		if (obj.ex_approved) {
			return_text = '<a guid="' + obj.id + '" class="approve_bt disabled">Approve</a><a class="reject_bt" action="reject">Reject</a>';
		} else {
			return_text = '<a guid="' + obj.id + '" class="approve_bt" action="approve">Approve</a><a class="reject_bt disabled">Reject</a>';
		}
	} else {
		return_text = '<a guid="' + obj.id + '" ex_id="' + ex_id_array[0] + '" action="approve" class="approve_bt">Approve</a><a guid="' + obj.id + '"  ex_id="' + ex_id_array[0] + '" action="reject" class="reject_bt">Reject</a>';
	}

	return return_text;	
}


function load_mask() {
	$("#popup_bg").show();
	$("#processing_wrap").show();
}

function unload_mask() {
	$("#popup_bg").hide();
	$("#ex_notice_wrap").hide();
	$("#upload_popup").hide();
}

function reset_options() {
	$("#work_date_filter").val('').change();
	$("#work_status_filter").val('').change();
	$("#ex_only").prop('checked', false).change();
	$("#ticket-table_filter input").val('').change();
	ticketTable.search( '' ).columns().search( '' ).draw();
	$("tr.ticket_tr.selected").removeClass("selected");
	$("input#ticket_filter").val('');
	register_ticket_filter();
	set_filters();
	return true;
}

function reload_full() {
	if ( reset_options() ) {
		ticketTable.ajax.reload();
		labourTable.ajax.reload();
		equipmentTable.ajax.reload();
		materialTable.ajax.reload();
		thirdpartyTable.ajax.reload();	
	}
}

function reload_tables() {
	labourTable.ajax.reload();
	equipmentTable.ajax.reload();
	materialTable.ajax.reload();
	thirdpartyTable.ajax.reload();
}

function set_filters() {
	var changedDate = $("#work_date_filter").val();
	var wdate = '';
	if (changedDate != '') {
		wdate = (new Date(changedDate)).toISOString().split("T")[0];
	}
	var status = $("#work_status_filter").val();
	var exonly = $("#ex_only").prop('checked');
	var ticket_filter = $("#ticket_filter").val();

	tableFilters['wdate'] = wdate;
	tableFilters['status'] = status;
	tableFilters['exonly'] = exonly;
	tableFilters['ticket'] = ticket_filter;
}

function init_tables() {
	get_ticket_data();
	get_labour_table_data();
	get_equipment_table_data();
	get_material_table_data();
	get_third_party_table_data();
}

$(document).ready(function() {
	set_filters();
	init_tables();
	$("#work_date_filter").datepicker();
	$("#work_date_filter, #work_status_filter, #ex_only, #ticket_filter").change(function() {
		set_filters();
		reload_tables();
	});
	// $("#work_status_filter").selectmenu();
	// $("#work_status_filter").on('selectmenuchange', function() {
	// 	set_filters();
	// 	reload_tables();
	// });

	$("a#pr_exception_bt").click(function() {
		run_parse();
	});

	$("a.close_popup").click(function() {
		unload_mask();
		reload_tables();
	});

	$(".graph-title span.exp_icon").click(function() {
		$(this).parent().parent().find(".dataTables_wrapper").slideToggle();
		$(this).toggleClass("on");
	});

	$("#bt_refresh").click(function(){
		reload_full();
	});
});
