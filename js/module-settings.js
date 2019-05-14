$(document).ready(function(){
	$('#pr_reset_all').click(function(){
		if ( confirm("Are you sure to reset all data?") ) {
			reset_data();
		}
	});

	$('#pr_reset_ex').click(function(){
		if ( confirm("Are you sure to reset exceptions data?") ) {
			reset_ex_data();
		}
	});

	togglePannel();
	expandAllPanels();
	collapseAllPanels();
	$( '.original-select' ).benttreeSelectDropdown({ width: 200});
});

function reset_data() {
	jQuery.ajax({
		type : 'get',
		url : 'api?module=settings&action=reset_all',
		beforeSend:function(){
			
		},
		success : function(response) {
			var result = JSON.parse(response);
			if ( result.success ) {
				alert( 'Data reset complete.' );	
			}
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function reset_ex_data() {
	jQuery.ajax({
		type : 'get',
		url : 'api?module=settings&action=reset_ex_all',
		beforeSend:function(){
			
		},
		success : function(response) {
			var result = JSON.parse(response);
			if ( result.success ) {
				alert( 'Data reset complete.' );	
			}
		},
		error : function(response) {
			alert('Internal error.');
		}
	});
}

function togglePannel() {
	$( '.panel-headings' ).on('click', function() {

		$( this ).toggleClass( 'open' );
		if( $(this).hasClass( 'open' ) ) {
			$( this ).find( '.arrow-down-icon' ).css({ transform: 'rotate(180deg)'});
		} else {
			$( this ).find( '.arrow-down-icon' ).css({ transform: 'rotate(0deg)'});
		}
		$( this ).parent().find( '.panel-details' ).slideToggle();
	})
}

function expandAllPanels() {
	$( '#expand_all_btn').on('click', function() {
		$( '.panel-details' ).slideDown();
	});
}

function collapseAllPanels() {
	$( '#collapse_all_btn' ).on('click', function() {
		$( '.panel-details' ).slideUp();
	})
}