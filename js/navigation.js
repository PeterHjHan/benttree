

$(document).ready(function(){

  clearUndefinedCookies();
  let currentUrl = window.location.href;
  if(!currentUrl.includes('login')) {
    setPreferences();
    applyPreferences();
  }
});

//=============================== COOKIES =========================

function setPreferences() {
  $(window).on('beforeunload', function() {
    $.ajax({
      type: "GET",
      url: "/api?module=tickets&action=get_email",
    })
    .then((res)=> {
      let position = res.indexOf("{");
      let email = res.slice(0, position);

      var preferenceCookies = {
        username: email,
        preferences: {
          navbar: "",
          table: "",
        },
      }

      let navBarCurrentState = $('#expand-nav');
      let navBarCookie = "";

      if( navBarCurrentState.hasClass( 'expanded' ) ) {
        navBarCookie = 'nav-expanded';
        preferenceCookies.preferences["navbar"] = navBarCookie;
      } else {
        navBarCookie = 'nav-not-expanded';
        preferenceCookies.preferences["navbar"] = navBarCookie;
      }

      if( $('.fs_icon').length != 0 ) {
        let tableCurrentState = $('.fs_icon');
        let tableCookie = "";

        if( tableCurrentState.hasClass('on') ) {
          tableCookie = "tab-fullsize";
          preferenceCookies.preferences["table"] = tableCookie;
        } else {
          tableCookie = "tab-partialsize";
          preferenceCookies.preferences["table"] = tableCookie;
        }

      }  else {
        let allCookies = Cookies.getJSON();
        let userCookie = email + 'preferences';
        let userPreferencesCookieValue = allCookies[userCookie];

        if( ! userPreferencesCookieValue ) {
          preferenceCookies.preferences["table"] = '';
        } else {
          preferenceCookies.preferences["table"] = userPreferencesCookieValue.preferences.table;
        }
      }
      Cookies.set( preferenceCookies.username + 'preferences', preferenceCookies, { expires: 365 } );
    });
  });
}

function applyPreferences() {

  let allCookies = Cookies.getJSON();

  $.ajax({
    type: "GET",
    url: "/api?module=tickets&action=get_email",
  })
  .then((res)=> {
    let position = res.indexOf("{");
    let email = res.slice(0, position);

    let userCookie = email+'preferences';
    let userPreferencesCookieValue = allCookies[userCookie];

    if( userPreferencesCookieValue.username === email ){
      if( userPreferencesCookieValue.preferences.table === 'tab-partialsize' ){
        let fsIcon = $( 'span.fs_icon' );
        $( '.fs_icon' ).removeClass( 'on' );
        $( '.project_col' ).removeClass( 'full' );

        if( fsIcon.length !== 0 ) {
          toggleTablesView( fsIcon );
        }

      }
      if( userPreferencesCookieValue.preferences.navbar === 'nav-expanded' ) {
        $('header, .main-box, #sub_nav, #expand-nav, .nav-link-text, .project-gnb, .partial-footer, .secondary-nav, #bottom').css({'transition': 'none'});
        expandNav();
        setTimeout(()=>{
          $('header, .main-box, #sub_nav, #expand-nav, .nav-link-text, .project-gnb, .partial-footer, .secondary-nav, #bottom').css({'transition': 'all 0.3s ease-in-out 0.1s'});
        },100);
      }
    }
  });
}

function clearUndefinedCookies() {
  let allCookies = Cookies.getJSON();

  for(cookie in allCookies) {
    if(cookie.includes('undefined')) {
      Cookies.remove(cookie);
    }
  };
}
//=============================== STYLING =========================



function expandNav() {
  //Expands the side nav;
  $('header, .main-box, #sub_nav, #expand-nav, .nav-link-text, .project-gnb, .partial-footer, .secondary-nav').toggleClass('expanded');
}

function applyCustomIds(target, customId) {
  //Apply id to a target
  $(target).attr('id', customId);
}

(function($) {
  //custom benttree dropdown, refer to README for specifications
  $.fn.benttreeSelectDropdown = function(options) {

    options = $.extend({
      width: 250,
      height: 30,
      margin: 0,
      textColor: '#7FBDE6',
      textAlign : 'left',
      borderColor: '#ddd',
    }, options);

    //input validators
    if(isNaN(options.width)) options.width = 250;
    if(isNaN(options.height)) options.height = 30;
    if(isNaN(options.margin)) options.margin = 0;

    let selectWrapper = document.createElement('div');
    let ul = document.createElement('ul');
    let _this = this;
    let li = '';
    let liValues = [];

    $(selectWrapper).addClass('benttree_custom_dropdown_wrapper');

    _this.children().each( function() {
      let value = $( this ).val();
      let text = $( this ).text();

      if( ! liValues.includes(value) ) {
        li += `<li value="${value}" style="color: ${options.textColor}; text-align: ${options.textAlign}; height: ${options.height - 10}px; line-height: ${options.height-15}px">${text}</li>`;
        liValues.push(value);
      }
    });

    $(ul).css({ width: options.width, height: options.height, border: `1px solid ${options.borderColor}`, "background-position-y": `${options.height/2 -10}px` });
    $(selectWrapper).css({ width: options.width , margin: options.margin });

    $(ul).append(li);
    $(selectWrapper).append(ul);

    $(ul).on( 'click keyup', function() {
      $( this ).toggleClass('open');
    })
    $(ul).on('mouseleave', function() {
      $( this ).removeClass('open');
    })

    $(ul).children().each(function() {
      $( this ).click( function() {
        if(  !$( this ).hasClass('select-selected-on')) {
          let value = $( this ).attr('value');
          $(_this).val(value).trigger('change');
          $( this ).addClass('select-selected-on');
          $( this ).parent().children().not( $( this ) ).removeClass('select-selected-on');
          $( this ).prependTo($(this).parent());
        }
      });
    });

    $(_this).hide();
    return _this.after(selectWrapper);
  }

})($);


