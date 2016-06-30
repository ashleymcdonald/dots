(function() {
  var NOTIFICATION_MAX, NOTIFICATION_MIN, Store, attachEvents, bg, extension, frag, get_safe_threshold, input_events, process_cb_change, _ref;

  bg = chrome.extension.getBackgroundPage();

  extension = bg.extension;

  Store = bg.Store;

  process_cb_change = function(type, chkd, $el) {
    switch (type) {
      case "auto_copy":
        return Store.set("auto_copy", chkd || false);
      case "trending":
        $(".trends_count_num").attr("disabled", !chkd);
        return extension.trends.toggle(chkd);
    }
  };

  NOTIFICATION_MIN = 5;

  NOTIFICATION_MAX = 1000;

  get_safe_threshold = function(num_value) {
    var safe_value;
    num_value = parseInt(num_value);
    safe_value = Math.max(num_value, NOTIFICATION_MIN);
    safe_value = Math.min(safe_value, NOTIFICATION_MAX);
    return safe_value;
  };

  attachEvents = function() {
    input_events();
    $(".opts_form").submit(function(e) {
      return e.preventDefault();
    });
    return $(".signout").on("click", function(e) {
      e.preventDefault();
      return chrome.extension.sendMessage({
        method: 'signout'
      });
    });
  };

  input_events = function() {
    var updateNotificationRate;
    $("input[type=checkbox].bitly_opts_cb").on("change", function(e) {
      var $this;
      $this = $(this);
      return process_cb_change($this.data("type"), $this.is(":checked"), $this);
    });
    updateNotificationRate = function(e) {
      var safeValue, val;
      e.preventDefault();
      val = $(this).val();
      safeValue = get_safe_threshold(val);
      return extension.trends.setThreshold(safeValue);
    };
    $("input.trends_count_num").on("click", updateNotificationRate).bind("input", updateNotificationRate);
    return $(".link_bitly").on("click", function(e) {
      e.preventDefault();
      return chrome.tabs.create({
        url: "http://bitly.com"
      });
    });
  };

  newT.save("auto_copy.optionspage", function(data) {
    var opts_cb;
    opts_cb = {
      type: "checkbox",
      "data-type": "auto_copy",
      id: "opts_autocopy",
      clss: "autocopy bitly_opts_cb"
    };
    if (Store.get("auto_copy")) {
      opts_cb.checked = true;
    } else {
      delete opts_cb.checked;
    }
    return newT.fieldset({
      clss: ""
    }, newT.input(opts_cb), newT.label({
      "for": "opts_autocopy"
    }, newT.strong("Auto-copy Bitlink"), newT.p("Automatically copy bitly link to clipboard when I save a Bitlink with the Chrome extension.")));
  });

  newT.save("trending.optionspage", function(data) {
    var note_prefs, opts_cb, trend_counts_opts;
    note_prefs = extension.trends.prefs;
    opts_cb = {
      type: "checkbox",
      "data-type": "trending",
      id: "opts_trending",
      clss: "trending bitly_opts_cb"
    };
    trend_counts_opts = {
      type: "number",
      min: NOTIFICATION_MIN,
      clss: "trends_count_num",
      max: NOTIFICATION_MAX,
      placeholder: 10
    };
    if (note_prefs.enabled) {
      opts_cb.checked = true;
    } else {
      delete opts_cb.checked;
      trend_counts_opts.disabled = true;
    }
    if (note_prefs.threshold) {
      trend_counts_opts.value = note_prefs.threshold;
    }
    return newT.fieldset(newT.input(opts_cb), newT.label({
      "for": "opts_trending"
    }, newT.strong("Trending Bitlink notifications"), newT.p("Notify me when one of my Bitlinks is clicked ", newT.input(trend_counts_opts), " times within the past hour.")));
  });

  newT.save("header.optionspage", function(data) {
    return newT.frag(newT.div({
      clss: "options_header"
    }, newT.div({
      clss: "logo_box link_bitly"
    }, newT.img({
      clss: "",
      border: 0,
      src: "/graphics/logo-white.png"
    })), newT.h1("Chrome Extension Options"), newT.img({
      src: "/graphics/amused_100_swapped.png",
      clss: "bitly_fish_img"
    }), newT.render("userdata.optionspage", data)));
  });

  newT.save("userdata.optionspage", function(data) {
    return newT.div({
      clss: "user_login_box"
    }, newT.img({
      src: "http://bitly.com/u/" + data.username + ".png",
      clss: "bitly_user_img link_bitly"
    }), newT.strong({
      clss: "link_bitly"
    }, data.display_name || data.username), newT.span(" | "), newT.a({
      href: "#",
      clss: "signout"
    }, "Sign out"));
  });

  newT.save("all.optionspage", function(data) {
    return newT.frag(newT.render("header.optionspage", data), newT.form({
      clss: "opts_form",
      action: "#"
    }, newT.render("auto_copy.optionspage", data), newT.render("trending.optionspage", data)));
  });

  if (!((_ref = extension.user) != null ? _ref.x_login : void 0)) {
    return extension.signin();
  }

  frag = newT.render("all.optionspage", {
    display_name: extension.user.display_name,
    username: extension.user.x_login
  });

  $("#container").append(frag);

  attachEvents();

}).call(this);
