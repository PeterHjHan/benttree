var labourTableSelectedItems = [];
var equipmentTableSelectedItems = [];
var materialTableSelectedItems = [];
var thirdpartyTableSelectedItems = [];

$(document).ready(function(){

	bentTreeStatusDropDown('#work_status_filter');
	$( "span.fs_icon" ).click(function(){

		$( ".project_col" ).toggleClass( "full" );
		$( "span.fs_icon" ).toggleClass( "on" );
		$( '.graph_title_components' ).css( 'display', 'none' );
		$('.checkbox_container_v2 input[type="checkbox"]' ).prop( 'checked', false );

		toggleTablesView( this );
		resetSelectedItems();
		

	});

	bind_sub_nav_action();
	bind_element_action('.benttree_status_select', "#work_status_filter");
	$( ".sub_nav_select" ).mouseleave(function(){
		$(this).removeClass("on");
	});
	toggleCustomCheckBoxDropDown();
	createFooter();
});


function onload(e, table, tableSelectedItemsArray) {
  //functions to call for the DataTable's callDrawBack function
  selectAll(e, table, tableSelectedItemsArray);
  closeShownColumns(e);
  disableApprovedOrRejectedItemCheckboxes(e, table, tableSelectedItemsArray);
  selectSingleCheckBox(e, table, tableSelectedItemsArray);
  displaySelectedItemsOnPaginate(e, table, tableSelectedItemsArray);
  showCountOfSelectedItems(e);
  changeCurrentPageExceptionsWhenAllExceptionsIsToggle(e);
  applyCustomIds('#entries_paginate a', 'custom_paginate_button');
}

function toggleTablesView(target) {
	let topLevel = $( target ).closest( '.project-detail' );
	let children = topLevel.find( '.graph-wrap' );
	children.find( 'th' ).css('width', 'auto');
	let table = topLevel.find('table');

	if ( $(target).hasClass("on") ) {
		$("#equipment_table_wrap").appendTo(".project_col_1.full");
		$("#material_table_wrap").prependTo(".project_col_2.full");

		children.each(function() {
			let entriesLength = $(this).find('#entries_length');
			entriesLength.css({display: 'inline-block'});	
		})
	} else {
		$("#equipment_table_wrap").prependTo(".project_col_2");
		$("#material_table_wrap").appendTo(".project_col_1");
		children.each(function() {
			let entriesLength = $( this ).find('#entries_length');
			entriesLength.css({display: 'none'});
		});
		
	}

	//hides the extended when fs.icon is clicked;
	table.each(function() {

		let tableRows = $( this ).children( 'tbody' ).children();

    tableRows.each(function() {
			let tables = [ labourTable, equipmentTable, materialTable, thirdpartyTable ];

			tables.forEach((table) => {
				let row = table.row( this );
				row.child.hide();
				$( this ).removeClass( 'shown' );
			});
    });
	});
}

function resetSelectedItems() {

	labourTableSelectedItems.length = 0;
	equipmentTableSelectedItems.length = 0;
	materialTableSelectedItems.length = 0;
	thirdpartyTableSelectedItems.length = 0;

	$('.graph-wrap').each(function() {
		let tableSelectedCount = $( this ).children('.graph-title').children('#table_selected_count');
		tableSelectedCount.text('0');
	});
}

function bind_sub_nav_action() {
	$( ".sub_nav_select li" ).unbind();

	$( ".sub_nav_select li.on" ).on( 'click', function() {
		$( this ).prependTo( $( this ).parent() );
		$( this ).parent().toggleClass( "on" );
		bind_sub_nav_action();
	});

	$( ".sub_nav_select li" ).not( ".on" ).on( 'click', function() {
		$( this ).parent().children( ".on" ).removeClass( "on" );
		$( this ).addClass( "on" );
		$( this ).parent().removeClass( "on" );
		bind_sub_nav_action();
		window.location = "./tickets?pno=" + $( this ).attr('pno');
	});
}
function bind_element_action(element, originalID) {
	$( `${element} li` ).unbind();

	$( `${element} li.on` ).on( 'click', function() {
		$( this ).prependTo( $( this ).parent() );
		$( this ).parent().toggleClass( "on" );
		bind_element_action(element, originalID);
	});

	$( `${element} li`).not( ".on" ).on( 'click', function() {

		if(originalID.length > 0){
			var value = $(this).attr('value');
			$(originalID).val(value);
			$(originalID).change();
		}

		$( this ).parent().children( ".on" ).removeClass( "on" );
		$( this ).addClass( "on" );
		$( this ).parent().removeClass( "on" );

		bind_element_action(element, originalID);
		if(element === '.sub_nav_select') {
			window.location = "/tickets?pno=" + $( this ).attr('pno');
		}
	});
}

function createFooter() {

  $('.graph-wrap').each(function() {

    let info = $( this ).find( '.dataTables_info' ).attr( 'id' , 'entries_info' );
    let footerPaginate = $( this ).find( '.dataTables_paginate' ).attr( 'id' ,'entries_paginate' );
    let length = $( this ).find( '.dataTables_length' ).attr( 'id' , 'entries_length' );

		let div = document.createElement( 'div' );
		div.className = 'table_footer';
    let tableWrapper = $( this ).find( '.dataTables_wrapper' );
    let combination = $( div ).append( info ).append( footerPaginate ).append( length );

    tableWrapper.append( combination );

	});
}

function bentTreeStatusDropDown(elementId, divCSS, ulCSS, liCSS) {

  let div = $(`<div class="benttree_status"></div>`);
  let ul = $(`<ul class="benttree_status_select"></ul>`);
  let newElements = div.append(ul);

  $(elementId).children()
    .sort(function(a,b) {
      if(a.innerHTML < b.innerHTML ){ return -1; }
    })
    .each(function(index) {
    $(`<li id="uid-${index}"
    class="benttree_status_option"
           value="${$(this).attr('value')}"
           >${$(this).text()}</li>`)
           .appendTo(ul);
  });

  ul.children(":first").addClass('on');

  ul.mouseleave(function() {
    $(this).removeClass('on');
  })

  $(elementId).after(newElements);

  return $(elementId).hide();
}

function toggleApproveAndRejectButton(e, array) {
  //Shows or Hides the Accept/Reject or Delete(Portal side) Buttons when checkboxes are checked
  let graph = $(e).closest( '.graph-wrap' );
  let approveRejectButtons = graph.find('.graph_title_components');

  if(array.length > 0) {
    $( approveRejectButtons ).css({display: "inline-block"});
  } else {
    $( approveRejectButtons ).css({display: "none"});
  }
}

function changeCurrentPageExceptionsWhenAllExceptionsIsToggle(e) {
  //When paginating, in the dropdown arrow beside the table heads checkbox, the "Select Exceptions" is changed to "Deselect Exceptions(n), where n = number of checked checkboxes on the page"
  let graph = $(e).closest( '.graph-wrap' );
  let pageException = graph.find( '#select_exceptions_page' );
  let allExceptionsData = graph.find( '#select_all_exceptions_data');
  let countOfExceptionsTr = graph.find( '.status_pending.status_ex').find('input').filter(':checked').length;

  if(allExceptionsData.hasClass('selected')) {
    pageException.addClass('selected');
    if(countOfExceptionsTr > 0) {
      pageException.text( `Deselect Exceptions (${countOfExceptionsTr})` );
    } else {
      pageException.removeClass( 'selected' );
      pageException.text( 'Select Exceptions');
    }
  }

  if( ! allExceptionsData.hasClass( 'selected' ) && countOfExceptionsTr == 0) {
    pageException.removeClass( 'selected' );
    pageException.text( 'Select Exceptions' );
  } else {
    pageException.addClass( 'selected' );
    pageException.text( `Deselect Exceptions (${countOfExceptionsTr})` );
  }

}

function showCountOfSelectedItems(e) {
  //Shows count of ALL Data (regardless if they are disabled or not);
  let tableData = $(e).DataTable();
  let totalDataCount = tableData.rows().data().length;
  let totalCount = $(e).closest('.graph-wrap').children('.graph-title').children('#table_total_count');

  return totalCount.text(totalDataCount);
}

function selectAllData(e, table, tableSelectedItemsArray) {
  //This function is called when "Select All Pending is clicked"
  let graph = $(e).closest( '.graph-wrap' );
  let allCheckBoxContainer = graph.find('tr th .checkbox_container_v2');
  let allCheckBox = allCheckBoxContainer.find('input[type="checkbox"]');
  let checkboxContainer = graph.find( 'tbody' ).find('.checkbox_container_v2');
  let selectedCount = graph.children('.graph-title').children('#table_selected_count');
  let pageCheckBoxCount = graph.find( 'tbody' ).find('.status_pending').not('.status_ex').length;
  let data = table.rows().data();
  let allData = $(data);

  //TODO: WHY?????? allData needed ?

  if( $(e).hasClass('selected') ) {
    $(e).removeClass('selected');
    $(e).text('Select All Pending');
  } else {
    $(e).addClass('selected');
  }

  if( $(e).hasClass( 'selected' )) {
    let counter = 0;
    checkboxContainer.each( function() {
      let checkboxPendingRow = $( this ).closest('tr').hasClass('status_pending');
      let checkboxExceptionsRow = $( this ).closest( 'tr' ).hasClass( 'status_ex' );
      let checkbox = $( this ).find( 'input[type="checkbox"]' );
      let guid = $( this ).closest('tr').attr('guid');

      if(checkboxPendingRow && !checkboxExceptionsRow) {
        checkbox.prop('checked',true);
      }

      //this will remove any duplicate Guids that are in the Table's array
      tableSelectedItemsArray.forEach((item) => {
        let index = tableSelectedItemsArray.indexOf(guid);

        if(checkboxPendingRow && !checkboxExceptionsRow) {
          if( guid === item ) {
            tableSelectedItemsArray.splice(index, 1);
          }
        }
      });
    });

    //adds all the guid in the table's array
    for(res in allData) {
      let values = allData[res];
      if(values.id){
        if( values.ticket_status === "Pending" && values.ex_codes === null) {
          tableSelectedItemsArray.push(values.id);
          counter++;
        }
      }
    }
    if(tableSelectedItemsArray.length !== 0 && counter !== 0) {
      $(e).text(`Deselect All Pending (${counter})`);
    }

  } else {
    //Removes guid with the status "Pending" from the selected table array
    tableSelectedItemsArray.forEach(() => {
      for(res in allData) {
        let values = allData[res];
        let index = tableSelectedItemsArray.indexOf(values.id);

        if( values.ticket_status === "Pending" && values.ex_codes === null) {
          if(index > -1) {
            tableSelectedItemsArray.splice(index,1);
          }
        }
      }
    });

    checkboxContainer.each( function() {
      let checkboxPendingRow = $( this ).closest( 'tr' ).hasClass( 'status_pending' );
      let checkboxPendingExceptionsRow = $( this ).closest( 'tr' ).hasClass( 'status_ex' );
      let checkbox = $( this ).find( 'input[type="checkbox"]' );
      if( checkboxPendingRow && !checkboxPendingExceptionsRow ) {
        checkbox.prop('checked',false);
      }
    });

  }

  //conditions to apply/remove checkmarks on the top select all checkbox
  let checkedCheckboxCount = graph.find( 'tbody' ).find( '.status_pending').not( '.status_ex').find('input[type="checkbox"]').filter(':checked').length;

  if(pageCheckBoxCount === checkedCheckboxCount) {
    allCheckBox.prop('checked', true);
  }
  if(checkedCheckboxCount === 0 ){
    allCheckBox.prop('checked', false);
  }

  if(tableSelectedItemsArray.length == 0 ) {
    $(e).removeClass( 'selected' );
  }

  toggleApproveAndRejectButton(e, tableSelectedItemsArray);
  highlightSelectedCount(graph, tableSelectedItemsArray.length);
  selectedCount.text(tableSelectedItemsArray.length);

}

function selectExceptionsOnPage(e, table, tableSelectedItemsArray) {
  //Makes checkboxes with status_ex all checked when 'Select Exceptions' is clicked
  let graph = $(e).closest('.graph-wrap');
  let singleCheckBox = graph.find('tbody tr td:first-child .checkbox_container_v2 input');
  let selectedCountText = graph.find( '#table_selected_count' );
  let countOfTr = graph.find( 'tbody tr.status_pending').length;
  let pendingAndExceptionsCount = graph.find( 'tbody tr' ).filter( '.status_pending.status_ex').length;

  if( ! $(e).hasClass('selected')) {
    if(pendingAndExceptionsCount > 0) {
      singleCheckBox.each( function() {
        let pendingRow = $( this ).closest('tr').hasClass( 'status_pending' );
        let exceptionRow = $( this ).closest( 'tr' ).hasClass( 'status_ex' );
        let guid = $( this ).closest( 'tr' ).attr( 'guid' );

        if( pendingRow && exceptionRow) {
          if( ! $( this ).is(':checked')) {
            $( this ).prop('checked', true);
            tableSelectedItemsArray.push(guid);
          }
        }
      });
    $(e).addClass('selected');
    $(e).text( `Deselect Exceptions (${pendingAndExceptionsCount})` );

    if(countOfTr === pendingAndExceptionsCount) {
      graph.find( 'thead tr th label input').prop( 'checked', true );
    }
  }

  } else {

    singleCheckBox.each( function() {
      let pendingRow = $( this ).closest('tr').hasClass( 'status_pending' );
      let exceptionRow = $( this ).closest( 'tr' ).hasClass( 'status_ex' );
      let guid = $( this ).closest( 'tr' ).attr( 'guid' );
      let index = tableSelectedItemsArray.indexOf(guid);

      if( pendingRow && exceptionRow) {
        if( $( this ).is(':checked')) {
          $( this ).prop('checked', false);
          tableSelectedItemsArray.splice(index, 1);
        }
      }
    });
    $(e).removeClass('selected');
    $(e).text('Select Exceptions');

    if(countOfTr === pendingAndExceptionsCount) {
      graph.find( 'thead tr th label input').prop( 'checked', false );
    }
  }

  toggleApproveAndRejectButton(e, tableSelectedItemsArray);
  selectedCountText.text(tableSelectedItemsArray.length);
  highlightSelectedCount(graph, tableSelectedItemsArray.length);
}

function selectAllExceptionsData(e, table, tableSelectedItemsArray) {
  //Selects all Data with the status of status_ex when "Select All Exceptions is clicked"
  let allData = table.rows().data();
  let selectedCount = $(e).closest( '.graph-wrap' ).find('#table_selected_count');
  let graph = $(e).closest('.graph-wrap');
  let singleCheckbox = graph.find('tbody').find('input[type="checkbox"]');
  let selectAllCheckbox = graph.find( 'thead' ).find( '.checkbox_container_v2 input' );
  let pendingRowsCount = graph.find('tbody').children().filter('.status_pending').length;

  if( $(e).hasClass('selected') ) {
    $(e).removeClass('selected');
    $(e).text('Select All Exceptions');
  } else {
    $(e).addClass('selected');
  }

  if( $(e).hasClass('selected') ) {
    let counter = 0;

    singleCheckbox.each( function() {
      let pendingRow = $( this ).closest('tr').hasClass('status_pending');
      let exceptionRow = $( this ).closest( 'tr' ).hasClass( 'status_ex' );
      let guid = $( this ).closest('tr').attr('guid');

      if(pendingRow && exceptionRow) {
        $(this).prop('checked', true);
      }

      tableSelectedItemsArray.forEach((item) => {
        let index = tableSelectedItemsArray.indexOf(guid);

        if(pendingRow && exceptionRow) {
          if( guid === item ) {
            tableSelectedItemsArray.splice(index, 1);
          }
        }
      });
    });

    for(data in allData) {
      let values = allData[data];
      if(values.ticket_status === 'Pending' && values.ex_codes !== null) {
        tableSelectedItemsArray.push( values.id );
        counter++;
      }
    }
    if(tableSelectedItemsArray.length !== 0 && counter !== 0){
      $(e).text(`Deselect All Exceptions (${counter})`);
    }

    let pendingAndExceptionCheckedCount = graph.find( 'tbody' ).children().find( '.checkbox_container_v2 input').filter(':checked').length; 

    if(pendingRowsCount === pendingAndExceptionCheckedCount) {
      selectAllCheckbox.prop('checked', true);
    }

  } else {

    tableSelectedItemsArray.forEach(() => {
      for(res in allData) {
        let values = allData[res];
        let index = tableSelectedItemsArray.indexOf(values.id);

        if( values.ticket_status === "Pending" && values.ex_codes !== null) {
          if(index > -1) {
            tableSelectedItemsArray.splice(index,1);
          }
        }
      }
      singleCheckbox.each( function() {
        let pendingRow = $( this ).closest('tr').hasClass('status_pending');
        let exceptionRow = $( this ).closest( 'tr' ).hasClass( 'status_ex' );
        if(pendingRow && exceptionRow) {
          $(this).prop('checked', false);
        }
      });
    });
  }

  let countOfExceptionsTr = graph.find( '.status_pending.status_ex').find('input').filter(':checked').length;
  let pageException = graph.find( '#select_exceptions_page' );

  if(countOfExceptionsTr > 0) {
    pageException.addClass( 'selected' );
    pageException.text( `Deselect Exceptions (${countOfExceptionsTr})` );
  } else {
    pageException.removeClass( 'selected' );
    pageException.text( 'Select Exceptions');
  }

  if(tableSelectedItemsArray.length == 0 ) {
    $(e).removeClass( 'selected' );
  }

  let pendingAndExceptionCheckedCount = graph.find( 'tbody' ).children().find( '.checkbox_container_v2 input').filter(':checked').length; 

  if(pendingRowsCount !== pendingAndExceptionCheckedCount) {
    selectAllCheckbox.prop('checked', false);
  }

  toggleApproveAndRejectButton(e, tableSelectedItemsArray);
  highlightSelectedCount(graph, tableSelectedItemsArray.length);
  selectedCount.text(tableSelectedItemsArray.length);
}

function selectAll(e, table, tableSelectedItemsArray) {
  //triggered when the top checkbox in the table header is clicked  
  let allCheckBoxContainer= e.find('tr th .checkbox_container_v2');

  allCheckBoxContainer.unbind();
  allCheckBoxContainer.change(function() {
    let graph = $(e).closest('.graph-wrap');
    let selectExceptionsOnPage = graph.find( '#select_exceptions_page' ) ;
    let selectedCountText = graph.find( '#table_selected_count' );
    let selectAllCheckbox = $( this ).children( 'input[type="checkbox"]' );
    let checkboxes = $( this ).closest( 'table' ).children( 'tbody' ).find( '.checkbox_container_v2 input[type="checkbox"]' );

    if(selectAllCheckbox.is(":checked")) {

      checkboxes.each(function() {
        let row = $( this ).closest( 'tr' ).hasClass( 'status_pending' );
        let rowEx = $( this ).closest( 'tr' ).hasClass( 'status_ex' );
        if( row && !rowEx ) {  
          if( ! $( this ).is( ':checked' )) {
            clickSingleCheckBoxes( this, true);
          }
        }
      });

    } else {
      checkboxes.each( function() {
        let guid = $( this ).closest( 'tr' ).attr( 'guid' );
        let index = tableSelectedItemsArray.indexOf(guid);

        if ( $(this).is(':checked') ) {
          $( this ).prop('checked', false);
          tableSelectedItemsArray.splice(index, 1);
        }
      });

      if( selectExceptionsOnPage.hasClass( 'selected' ) ) {
        selectExceptionsOnPage.removeClass( 'selected' );
        selectExceptionsOnPage.text( 'Selected Exceptions' );
      }
    }
    highlightSelectedCount(graph, tableSelectedItemsArray.length);
    selectedCountText.text(tableSelectedItemsArray.length);
    toggleApproveAndRejectButton(e, tableSelectedItemsArray);
  });
}

function selectSingleCheckBox(e, table, tableSelectedItemsArray) {

  let singleCheckbox = $(e).closest('.graph-wrap').find('tbody tr td .checkbox_container_v2 input[type="checkbox"]');

  singleCheckbox.unbind();
  singleCheckbox.change(function() {
    let graph = $( this ).closest( '.graph-wrap' );
    let parentCheckbox = $( this ).closest( 'table' ).children( 'thead' ).find('input[type="checkbox"]');
    let checkboxCount = $( this ).closest( 'tbody' ).find('.status_pending').not('.status_ex').length;
    let checkedCheckboxCount = $( this ).closest( 'tbody' ).find('.status_pending').not('.status_ex').find('input[type="checkbox"]').filter(':checked').length;
    let guid = $( this ).closest('tr').attr('guid');
    let selectedCount = graph.children( '.graph-title' ).children( '#table_selected_count');
    let selectAllDataButton = graph.find( '#select_all_data' );
    let selectExceptionsButton = graph.find( '#select_exceptions_page' );
    let selectAllExceptionsButton = graph.find( '#select_all_exceptions_data' );
    let checkboxPendingRow = $( this ).closest('tr').hasClass('status_pending');
    let checkboxExceptionsRow = $( this ).closest( 'tr' ).hasClass( 'status_ex' );


    if( $( this ).is(':checked') ) {
      tableSelectedItemsArray.push(guid);
      selectedCount.text(tableSelectedItemsArray.length);

      if ( checkboxPendingRow && !checkboxExceptionsRow ) {
        changeCountViewOfSelectFunctions( selectAllDataButton, 'increase' );
      } 
      if ( checkboxPendingRow && checkboxExceptionsRow ) {
        changeCountViewOfSelectFunctions( selectExceptionsButton, 'increase' );
        changeCountViewOfSelectFunctions( selectAllExceptionsButton, 'increase' );
      }

    } else {
      let index = tableSelectedItemsArray.indexOf(guid);
      if(index > -1) {
        tableSelectedItemsArray.splice(index, 1);
        selectedCount.text(tableSelectedItemsArray.length);
      }

      if ( checkboxPendingRow && !checkboxExceptionsRow ) {
        changeCountViewOfSelectFunctions( selectAllDataButton, 'decrease' );
      } 
      if ( checkboxPendingRow && checkboxExceptionsRow ) {
        changeCountViewOfSelectFunctions( selectExceptionsButton, 'decrease' );
        changeCountViewOfSelectFunctions( selectAllExceptionsButton, 'decrease' );
      }

    }

    if( checkedCheckboxCount === checkboxCount && checkboxCount !== 0 ) {
      parentCheckbox.prop('checked', true);
    }  else {
      parentCheckbox.prop('checked', false);
    }

    toggleApproveAndRejectButton(e, tableSelectedItemsArray);
    highlightSelectedCount(graph, tableSelectedItemsArray.length);

  });
}

function changeCountViewOfSelectFunctions( selectAllType, changeType ) {
//this function changes the Selected Count View when Select All functions are enabled

  if( $( selectAllType ).hasClass('selected') ) {
    let fullText = $( selectAllType ).text();
    let indexOfLeftBracket = fullText.indexOf('(');
    let indexOfRightBracket = fullText.indexOf(')');
    let countOfSelected = Number(fullText.slice(indexOfLeftBracket + 1, indexOfRightBracket));
    let textDescription = fullText.slice(0, indexOfLeftBracket);

    if ( changeType === 'increase' ) {
      countOfSelected++;
    } else if(changeType === 'decrease' ) {
      countOfSelected--;
    }

    selectAllType.text( `${textDescription}(${countOfSelected})` );
    
  } 
}

function displaySelectedItemsOnPaginate(e, table, tableSelectedItemsArray) {
  //During pagination, selected items are checked if they were previously checked.
  let graph = $( e ).closest('.graph-wrap');
  let tr = $(e).children( 'tbody' ).children();
  let allCheckBox = graph.find('thead').find( '.checkbox_container_v2 input' );

  if(tableSelectedItemsArray.length > 0) {

    tr.each( function() {
      let checkbox = $( this ).find( 'td label input[type="checkbox"]');
      let guid = $( this ).attr( 'guid' );
      let breakout = false;

      tableSelectedItemsArray.forEach((item) => {
        if(!breakout) {
          if( guid === item ) {
            checkbox.prop('checked', true);
            breakout = true;
          } else {
            checkbox.prop('checked', false);
          }
        }
      });
    });

    let onlyPendingItemsCount = tr.filter('.status_pending').not('.status_ex' ).length;
    let checkedPendingItemsCount = tr.parent().find( '.status_pending' ).not( '.status_ex').find( '.checkbox_container_v2 input').filter(':checked').length;

    onlyPendingItemsCount === checkedPendingItemsCount && onlyPendingItemsCount !== 0? allCheckBox.prop('checked', true) : allCheckBox.prop('checked', false);

  } else {
    let checkbox = graph.find( 'td label input[type="checkbox"]');
    checkbox.prop('checked', false);
  }
}

function disableApprovedOrRejectedItemCheckboxes(e, table, tableSelectedItemsArray) {
  e.on('draw.dt',function() {
    let singleCheckboxContainer = $( this ).children( 'tbody' ).find( '.checkbox_container_v2' );
    toggleApproveAndRejectButton(e, tableSelectedItemsArray);

    singleCheckboxContainer.each(function() {
      let checkboxRow = $( this ).closest( 'tr' ).hasClass( 'status_pending' );
      if( !checkboxRow) {
        $( this ).children( 'span' ).prop( 'id' , 'disabled' );
        $( this ).children( 'input').prop('disabled', true);
      }
    });
  });
}

function clickSingleCheckBoxes(checkboxTr, value) {
  $(checkboxTr).click();
  $(checkboxTr).prop('checked', value);
}

function closeShownColumns(e) {
  //In the tables' collapsed view, a user can click on the line items to view the error in a new row. The function gets rid of those rows when changed to the Extended View of the table
  e.on('draw.dt', function() {
    let tableRows = $( this ).children( 'tbody' ).children();

    tableRows.each(function() {
      let row = e.DataTable().row( this );
      row.child.hide();
      $( this ).removeClass('shown');
    });
  });

}

function highlightSelectedCount(graph, count) {
  //Colorizes the Number of the selected in the Table header
  let selectedCountText = graph.find('#table_selected_count');

  if(count > 0) {
    selectedCountText.addClass('font_green');
  } else {
    selectedCountText.removeClass('font_green');
  }
}

function toggleCustomCheckBoxDropDown() {

  $('.checkbox_select_dropdown_container').click(function() {
    $(this).children().toggleClass('show');
  });

  $('.checkbox_select_dropdown').mouseleave(function() {
    $( this ).removeClass('show');
  });

}

function actionAll(e, table, actionType, tableSelectedItemsArray) {
  let graph = $(e).closest('.graph-wrap');
  let selectedCount = graph.children('.graph-title').children('#table_selected_count');
  let selectAllCheckbox = graph.find( 'thead' ).find( '.checkbox_container_v2 input' );
  let selectAll = graph.find( '#select_all_data' );
  let selectExceptionsOnPage = graph.find( '#select_exceptions_page' );
  let selectAllExceptionsData = graph.find( '#select_all_exceptions_data');

  if( confirm( `Would you like to ${actionType} ${tableSelectedItemsArray.length} items?` ) ){
    $.ajax({
      type : 'POST',  
      url : 'api?module=inlineItems&action=bulk_status_update',
      data : { action : actionType, guid_array: tableSelectedItemsArray },
      success : function(response) {
        tableSelectedItemsArray.length = 0;
        table.ajax.reload(null, false);
        selectedCount.text('0');
        highlightSelectedCount(graph, tableSelectedItemsArray.length);
        selectAll.removeClass( 'selected' );
        selectAll.text( 'Select All Pages');

        selectAllCheckbox.prop( 'checked', false);

        selectExceptionsOnPage.removeClass( 'selected' );
        selectExceptionsOnPage.text( 'Select Exceptions');

        selectAllExceptionsData.removeClass( 'selected' );
        selectAllExceptionsData.text( 'Select All Exceptions' );

      },
      error : function(response) {
        alert('Internal error.');
      }
    });
  }
}