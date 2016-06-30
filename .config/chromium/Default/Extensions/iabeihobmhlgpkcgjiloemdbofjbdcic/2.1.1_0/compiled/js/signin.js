(function() {
  var extension;

  extension = chrome.extension.getBackgroundPage().extension;

  newT.save("header.signinpage", function(data) {
    return newT.frag(newT.div({
      clss: "options_header"
    }, newT.div({
      clss: "logo_box link_bitly"
    }, newT.img({
      clss: "",
      border: 0,
      src: "/graphics/logo-white.png"
    })), newT.h1("Authorization"), newT.img({
      src: "/graphics/amused_100_swapped.png",
      clss: "bitly_fish_img"
    })));
  });

  chrome.tabs.getCurrent(function(tab) {
    var code_matches, oauth_code;
    code_matches = document.location.href.match(/\bcode=([^&]+)\b/);
    oauth_code = (code_matches != null ? code_matches.length : void 0) > 1 && code_matches.pop() || null;
    if (oauth_code) {
      return extension.api.auth({
        code: oauth_code,
        redirect_uri: extension.chromePage('signin')
      }).done(function() {
        return extension.trigger('Auth:login', tab);
      });
    } else {
      $('#container').append(newT.render('header.signinpage'));
      $('#container').append('<a style="margin-left: 150px;" href="#" id="authorize">Click Here to Authorize Chrome Extension</a>');
      return $('#authorize').on('click', function() {
        return extension.signin(tab.id);
      });
    }
  });

}).call(this);
