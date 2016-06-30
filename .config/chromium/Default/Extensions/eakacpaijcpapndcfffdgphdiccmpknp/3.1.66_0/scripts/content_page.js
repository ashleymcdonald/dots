(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(require('./../views/content_page.coffee')).initialize().render();


},{"./../views/content_page.coffee":44}],2:[function(require,module,exports){
(function (global){
var $, Handlebars, _;

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Handlebars = require('hbsfy/runtime');

Handlebars.registerHelper('select', function(value, options) {
  return options.fn(this).replace(new RegExp("value=\"" + value + "\""), '$& selected=selected');
});

Handlebars.registerHelper('option', function(selectedValue, options) {
  var isMatch, selected, text, value;
  value = options.hash.value || this;
  text = options.hash.text || this;
  isMatch = (selectedValue != null ? selectedValue.toLowerCase() : void 0) === value.toLowerCase();
  selected = isMatch ? 'selected="selected"' : '';
  return new Handlebars.SafeString("<option value='" + value + "'    " + selected + ">" + text + "</option>");
});

Handlebars.registerHelper('ifDefined', function(value, options) {
  if (!_.isUndefined(value)) {
    return options.fn(this);
  }
});

Handlebars.registerHelper('ifEqual', function(v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"hbsfy/runtime":162}],3:[function(require,module,exports){
var Handlebars;

Handlebars = require('hbsfy/runtime');

Handlebars.registerPartial('page-info-icon', require('./../../templates/partials/page_info_icon.hbs'));

Handlebars.registerPartial('highlight-icon', require('./../../templates/partials/highlight_icon.hbs'));

Handlebars.registerPartial('locked-icon', require('./../../templates/partials/locked_icon.hbs'));

Handlebars.registerPartial('settings-icon', require('./../../templates/partials/settings_icon.hbs'));

Handlebars.registerPartial('dock-icon', require('./../../templates/partials/dock_icon.hbs'));

Handlebars.registerPartial('close-icon', require('./../../templates/partials/close_icon.hbs'));

Handlebars.registerPartial('ose-icon', require('./../../templates/partials/ose_icon.hbs'));

Handlebars.registerPartial('export-icon', require('./../../templates/partials/export_icon.hbs'));


},{"./../../templates/partials/close_icon.hbs":93,"./../../templates/partials/dock_icon.hbs":94,"./../../templates/partials/export_icon.hbs":95,"./../../templates/partials/highlight_icon.hbs":96,"./../../templates/partials/locked_icon.hbs":97,"./../../templates/partials/ose_icon.hbs":98,"./../../templates/partials/page_info_icon.hbs":99,"./../../templates/partials/settings_icon.hbs":100,"hbsfy/runtime":162}],4:[function(require,module,exports){
(function (global){
var Analytics, Browser, Mixpanel, Model, Page, Settings, User, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

Mixpanel = require('mixpanel');

Settings = require('./settings.coffee');

Page = require('./page.coffee');

User = require('./user.coffee');

Browser = require('./browser.coffee');

module.exports = Analytics = (function(_super) {
  __extends(Analytics, _super);

  function Analytics() {
    _ref = Analytics.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Analytics.analytics = null;

  Analytics.getInstance = function() {
    return this.analytics != null ? this.analytics : this.analytics = new Analytics;
  };

  Analytics.prototype.ACTIVE_USER_THROTTLE_MS = 24 * 60 * 60 * 1000;

  Analytics.prototype.settings = null;

  Analytics.prototype.user = null;

  Analytics.prototype.eventQueue = [];

  Analytics.prototype._mixpanel = null;

  Analytics.prototype.initialize = function() {
    this.settings = Settings.getInstance();
    this.user = User.getInstance();
    this.listenTo(this.settings, 'change:mixpanelId', this.submitQueuedEvents);
    this.listenTo(this.user, 'change:isPro', this.updatePerson);
    return this.listenTo(this.settings, 'change:isMozbarOn change:isButtonOn', this.updatePerson);
  };

  Analytics.prototype.mixpanel = function() {
    return this._mixpanel != null ? this._mixpanel : this._mixpanel = Mixpanel.init('654003c6ddd03e88764138e600453a67', {
      request_options: {
        scheme: 'https'
      }
    });
  };

  Analytics.prototype.trackEvent = function(name, extraAttrs) {
    var attrs;
    attrs = this.getEventAttributes();
    if (!attrs.distinct_id) {
      this.eventQueue.push({
        name: name,
        attrs: extraAttrs
      });
      return;
    }
    if (extraAttrs) {
      attrs = _.extend(extraAttrs, attrs);
    }
    return this.mixpanel().track(name, attrs);
  };

  Analytics.prototype.trackNewInstall = function() {
    console.log('tracking new install!');
    return this.trackEvent('New Install');
  };

  Analytics.prototype.trackActiveUser = function() {
    var lastActiveUser;
    this.updatePerson();
    lastActiveUser = this.settings.get('lastMixpanelActiveUser');
    if (Date.now() - lastActiveUser < this.ACTIVE_USER_THROTTLE_MS) {
      return;
    }
    this.trackEvent('Active User');
    return this.settings.set('lastMixpanelActiveUser', Date.now());
  };

  Analytics.prototype.trackPanelView = function(panel) {
    return this.trackEvent('Panel View', {
      panel: panel,
      viewedOnboarding: this.hasUserSeenHighlight('show-info-panel')
    });
  };

  Analytics.prototype.trackToggleDockPosition = function() {
    this.trackEvent('Toggle Dock Position');
    return this.mixpanel().people.increment(this.settings.get('mixpanelId'), 'Toggle Dock Position');
  };

  Analytics.prototype.trackKeywordDifficulty = function() {
    this.trackEvent('Keyword Difficulty', {
      viewedOnboarding: this.hasUserSeenHighlight('activate-keyword-difficulty')
    });
    return this.mixpanel().people.increment(this.settings.get('mixpanelId'), 'Keyword Difficulty');
  };

  Analytics.prototype.trackExport = function() {
    this.trackEvent('SERP Export', {
      viewedOnboarding: this.hasUserSeenHighlight('export')
    });
    return this.mixpanel().people.increment(this.settings.get('mixpanelId'), 'SERP Export');
  };

  Analytics.prototype.trackInitiateOnboarding = function() {
    return this.trackEvent('Initiated Onboarding via Help');
  };

  Analytics.prototype.trackCloseOnboarding = function() {
    return this.trackEvent('Closed Onboarding');
  };

  Analytics.prototype.trackOnboardingComplete = function() {
    return this.trackEvent('Completed Onobarding');
  };

  Analytics.prototype.getEventAttributes = function() {
    return {
      distinct_id: this.settings.get('mixpanelId'),
      type: Page.isSerp() ? 'serp' : 'non-serp',
      isPro: this.getUserType(),
      isLightTheme: this.settings.get('isLightTheme'),
      isDockedOnBottom: this.settings.get('isDockedOnBottom'),
      browser: Browser.browserName(),
      os: Browser.osName(),
      pageOnboardingStep: this.settings.get('onboarding').pageStep,
      serpOnboardingStep: this.settings.get('onboarding').serpStep
    };
  };

  Analytics.prototype.updatePerson = function() {
    if (!this.settings.get('isButtonOn')) {
      return;
    }
    return this.mixpanel().people.set(this.settings.get('mixpanelId'), {
      type: this.getUserType(),
      isMozbarOn: this.settings.get('isMozbarOn'),
      isDockedOnBottom: this.settings.get('isDockedOnBottom'),
      $last_name: this.user.get('display_name'),
      browser: Browser.browserName(),
      os: Browser.osName(),
      pageOnboardingStep: this.settings.get('onboarding').pageStep,
      serpOnboardingStep: this.settings.get('onboarding').serpStep,
      extensionVersion: this.settings.get('extensionVersion')
    });
  };

  Analytics.prototype.getUserType = function() {
    if (this.user.get('isPro')) {
      return 'paid';
    } else {
      return 'free';
    }
  };

  Analytics.prototype.hasUserSeenHighlight = function(highlight) {
    var visited;
    visited = this.settings.get('onboarding').viewedHighlights;
    return visited.indexOf(highlight) !== -1;
  };

  Analytics.prototype.submitQueuedEvents = function() {
    var e, _i, _len, _ref1;
    if (!this.settings.get('mixpanelId')) {
      return;
    }
    _ref1 = this.eventQueue;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      this.trackEvent(e.name, e.attrs);
    }
    return this.eventQueue = [];
  };

  return Analytics;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./browser.coffee":5,"./page.coffee":18,"./settings.coffee":29,"./user.coffee":35,"mixpanel":163}],5:[function(require,module,exports){
(function (global){
var $, Browser, pageMod;

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

pageMod = require('sdk/page-mod');

module.exports = Browser = (function() {
  function Browser() {}

  Browser.get = function(file, callback) {
    if (typeof chrome !== "undefined" && chrome !== null) {
      $.get(chrome.extension.getURL(file), function(contents) {
        return callback.call(this, contents);
      });
      return;
    }
    return callback.call(this, self.options[file]);
  };

  Browser.browserName = function() {
    if (navigator.userAgent.indexOf('Chrome') !== -1) {
      return 'chrome';
    }
    if (navigator.userAgent.indexOf('Firefox') !== -1) {
      return 'firefox';
    }
    return 'unknown';
  };

  Browser.osName = function() {
    if (navigator.userAgent.indexOf('Macintosh') !== -1) {
      return 'os x';
    }
    if (navigator.userAgent.indexOf('Windows') !== -1) {
      return 'windows';
    }
    if (navigator.userAgent.indexOf('Linux') !== -1) {
      return 'linux';
    }
    return 'unknown';
  };

  Browser.isChrome = function() {
    return (typeof chrome !== "undefined" && chrome !== null ? chrome.runtime : void 0) != null;
  };

  Browser.isFirefox = function() {
    return (pageMod.PageMod != null) || ((typeof self !== "undefined" && self !== null ? self.port : void 0) != null);
  };

  Browser.sendMessage = function(message, data, response) {
    var _ref;
    if (typeof chrome !== "undefined" && chrome !== null) {
      if ((_ref = chrome.runtime) != null) {
        _ref.sendMessage({
          type: message,
          data: data
        }, response);
      }
    }
    if (this.isFirefox()) {
      if (response != null) {
        self.port.once("" + message + ":response", function(data) {
          return response(data);
        });
      }
      return self.port.emit(message, data);
    }
  };

  return Browser;

})();


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"sdk/page-mod":113}],6:[function(require,module,exports){
var ButtonMetrics, CACHE_DAYS, Page, UrlMetrics, mozCols, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Page = require('./page.coffee');

UrlMetrics = require('./url_metrics.coffee');

mozCols = require('./moz_cols.coffee');

CACHE_DAYS = 1;

module.exports = ButtonMetrics = (function(_super) {
  __extends(ButtonMetrics, _super);

  function ButtonMetrics() {
    _ref = ButtonMetrics.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ButtonMetrics.prototype.initialize = function() {
    var _this = this;
    this.once('sync', function() {
      _this.isFetching = false;
      return _this.setCachedValue(Page.hostname(), _this.get('nicePda'));
    });
    return ButtonMetrics.__super__.initialize.apply(this, arguments);
  };

  ButtonMetrics.prototype.fetch = function(options) {
    var _this = this;
    if (this.isFetching || this.get('nicePda')) {
      return;
    }
    return this.getCachedValue(Page.hostname(), function(value) {
      if (value != null ? value.nicePda : void 0) {
        _this.set({
          nicePda: value.nicePda
        });
        return;
      }
      return ButtonMetrics.__super__.fetch.apply(_this, arguments);
    });
  };

  ButtonMetrics.prototype.getCols = function() {
    return mozCols.getBits(['pda']);
  };

  ButtonMetrics.prototype.getCachedValue = function(key, callback) {
    return typeof chrome !== "undefined" && chrome !== null ? chrome.storage.local.get('buttonMetrics', function(results) {
      var _ref1, _ref2;
      if (!(Date.now() < (results != null ? (_ref1 = results.buttonMetrics) != null ? (_ref2 = _ref1[key]) != null ? _ref2.expires : void 0 : void 0 : void 0))) {
        return callback(null);
      }
      return callback(results.buttonMetrics[key].value);
    }) : void 0;
  };

  ButtonMetrics.prototype.setCachedValue = function(key, value) {
    return typeof chrome !== "undefined" && chrome !== null ? chrome.storage.local.get('buttonMetrics', function(results) {
      var buttonMetrics, data, now, _i, _len;
      now = new Date();
      buttonMetrics = (results != null ? results.buttonMetrics : void 0) || {};
      for (data = _i = 0, _len = buttonMetrics.length; _i < _len; data = ++_i) {
        key = buttonMetrics[data];
        if (now > data.expires) {
          delete buttonMetrics[key];
        }
      }
      buttonMetrics[key] = {
        value: {
          nicePda: value
        },
        expires: now.setDate(now.getDate() + CACHE_DAYS)
      };
      return typeof chrome !== "undefined" && chrome !== null ? chrome.storage.local.set({
        buttonMetrics: buttonMetrics
      }) : void 0;
    }) : void 0;
  };

  return ButtonMetrics;

})(UrlMetrics);


},{"./moz_cols.coffee":15,"./page.coffee":18,"./url_metrics.coffee":34}],7:[function(require,module,exports){
(function (global){
var Backbone, Cities, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

module.exports = Cities = (function(_super) {
  __extends(Cities, _super);

  function Cities() {
    _ref = Cities.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Cities.prototype.region = '';

  Cities.prototype.url = function() {
    return "https://d2eeipcrcdle6.cloudfront.net/mozbar/cities/" + this.region + ".json";
  };

  Cities.prototype.parse = function(resp) {
    var city, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = resp.length; _i < _len; _i++) {
      city = resp[_i];
      _results.push({
        name: city
      });
    }
    return _results;
  };

  return Cities;

})(Backbone.Collection);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
(function (global){
var FacebookStats, Model, Page, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

Page = require('./page.coffee');

module.exports = FacebookStats = (function(_super) {
  __extends(FacebookStats, _super);

  function FacebookStats() {
    _ref = FacebookStats.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  FacebookStats.prototype.defaults = {
    site: 'facebook',
    tooltip: 'Facebook Activity',
    count: '--'
  };

  FacebookStats.prototype.url = function() {
    return "https://api.facebook.com/method/links.getStats?" + ("urls=" + (Page.href()) + "&format=json");
  };

  FacebookStats.prototype.parse = function(resp) {
    var _ref1;
    return _.extend(resp[0] || {}, {
      count: (_ref1 = resp[0]) != null ? _ref1.total_count.toLocaleString() : void 0
    });
  };

  FacebookStats.prototype.validate = function(attrs) {
    if (attrs.count === this.defaults.count) {
      return 'Data not loaded!';
    }
  };

  return FacebookStats;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./page.coffee":18}],9:[function(require,module,exports){
(function (global){
var Geolocation, Model, Page, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

Page = require('./page.coffee');

module.exports = Geolocation = (function(_super) {
  __extends(Geolocation, _super);

  function Geolocation() {
    _ref = Geolocation.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Geolocation.instance = null;

  Geolocation.getInstance = function() {
    return this.instance != null ? this.instance : this.instance = new Geolocation;
  };

  Geolocation.prototype.defaults = {
    hostname: Page.hostname(),
    ip: null,
    country_code: null,
    country_name: null
  };

  Geolocation.prototype.url = function() {
    return "//mozbar.moz.com/" + (this.get('hostname'));
  };

  Geolocation.prototype.validate = function(attrs) {
    if (_.isNull(attrs.ip)) {
      return 'Data not loaded!';
    }
  };

  return Geolocation;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./page.coffee":18}],10:[function(require,module,exports){
var GoogleDomains;

module.exports = GoogleDomains = (function() {
  function GoogleDomains() {}

  GoogleDomains.getDomain = function(country) {
    return this.domains[country] || ("http://www.google.com/search?cr=country" + country);
  };

  GoogleDomains.domains = {
    AF: "http://www.google.com.af/search?",
    DZ: "http://www.google.dz/search?",
    AS: "http://www.google.as/search?",
    AI: "http://www.google.com.ai/search?",
    AG: "http://www.google.com.ag/search?",
    AR: "http://www.google.com.ar/search?",
    AM: "http://www.google.am/search?",
    AU: "http://www.google.com.au/search?",
    AT: "http://www.google.at/search?",
    AZ: "http://www.google.az/search?",
    BS: "http://www.google.bs/search?",
    BH: "http://www.google.com.bh/search?",
    BD: "http://www.google.com.bd/search?",
    BY: "http://www.google.by/search?",
    BE: "http://www.google.be/search?",
    BZ: "http://www.google.com.bz/search?",
    BO: "http://www.google.com.bo/search?",
    BA: "http://www.google.ba/search?",
    BR: "http://www.google.com.br/search?",
    BN: "http://www.google.com.bn/search?",
    BG: "http://www.google.bg/search?",
    BI: "http://www.google.bi/search?",
    CA: "http://www.google.ca/search?",
    CL: "http://www.google.cl/search?",
    CN: "http://www.google.cn/search?",
    CO: "http://www.google.com.co/search?",
    CD: "http://www.google.cd/search?",
    CK: "http://www.google.co.ck/search?",
    CR: "http://www.google.co.cr/search?",
    HR: "http://www.google.hr/search?",
    CU: "http://www.google.com.cu/search?",
    CZ: "http://www.google.cz/search?",
    CI: "http://www.google.ci/search?",
    DK: "http://www.google.dk/search?",
    DM: "http://www.google.dm/search?",
    DO: "http://www.google.com.do/search?",
    EC: "http://www.google.com.ec/search?",
    EG: "http://www.google.com.eg/search?",
    SV: "http://www.google.com.sv/search?",
    EE: "http://www.google.ee/search?",
    FI: "http://www.google.fi/search?",
    FR: "http://www.google.fr/search?",
    GE: "http://www.google.ge/search?",
    DE: "http://www.google.de/search?",
    GH: "http://www.google.com.gh/search?",
    GI: "http://www.google.com.gi/search?",
    GR: "http://www.google.gr/search?",
    GT: "http://www.google.com.gt/search?",
    HN: "http://www.google.hn/search?",
    HK: "http://www.google.com.hk/search?",
    HU: "http://www.google.hu/search?",
    IS: "http://www.google.is/search?",
    IN: "http://www.google.in/search?",
    ID: "http://www.google.co.id/search?",
    IE: "http://www.google.ie/search?",
    IL: "http://www.google.co.il/search?",
    IT: "http://www.google.it/search?",
    JM: "http://www.google.com.jm/search?",
    JP: "http://www.google.co.jp/search?",
    JO: "http://www.google.jo/search?",
    KE: "http://www.google.kz/search?",
    KI: "http://www.google.co.ke/search?",
    KR: "http://www.google.co.kr/search?",
    LA: "http://www.google.la/search?",
    LV: "http://www.google.lv/search?",
    LB: "http://www.google.com.lb/search?",
    LS: "http://www.google.com.ly/search?",
    LI: "http://www.google.li/search?",
    LT: "http://www.google.lt/search?",
    LU: "http://www.google.lu/search?",
    MO: "http://www.google.mk/search?",
    MG: "http://www.google.com.my/search?",
    MV: "http://www.google.com.mt/search?",
    MH: "http://www.google.mu/search?",
    MX: "http://www.google.com.mx/search?",
    FM: "http://www.google.fm/search?",
    MD: "http://www.google.md/search?",
    MA: "http://www.google.co.ma/search?",
    NR: "http://www.google.nr/search?",
    NP: "http://www.google.com.np/search?",
    NL: "http://www.google.nl/search?",
    NZ: "http://www.google.co.nz/search?",
    NG: "http://www.google.com.ng/search?",
    NO: "http://www.google.no/search?",
    OM: "http://www.google.com.om/search?",
    PK: "http://www.google.com.pk/search?",
    PA: "http://www.google.com.pa/search?",
    PY: "http://www.google.com.py/search?",
    PE: "http://www.google.com.pe/search?",
    PH: "http://www.google.com.ph/search?",
    PL: "http://www.google.pl/search?",
    PT: "http://www.google.pt/search?",
    PR: "http://www.google.com.pr/search?",
    QA: "http://www.google.com.qa/search?",
    RO: "http://www.google.ro/search?",
    RU: "http://www.google.ru/search?",
    SH: "http://www.google.sh/search?",
    WS: "http://www.google.as/search?",
    SA: "http://www.google.com.sa/search?",
    SN: "http://www.google.sn/search?",
    YU: "http://www.google.rs/search?",
    SC: "http://www.google.sc/search?",
    SG: "http://www.google.com.sg/search?",
    SK: "http://www.google.sk/search?",
    SI: "http://www.google.si/search?",
    ZA: "http://www.google.co.za/search?",
    ES: "http://www.google.es/search?",
    LK: "http://www.google.lk/search?",
    SE: "http://www.google.se/search?",
    CH: "http://www.google.ch/search?",
    TW: "http://www.google.com.tw/search?",
    TH: "http://www.google.co.th/search?",
    TK: "http://www.google.tk/search?",
    TO: "http://www.google.to/search?",
    TT: "http://www.google.tt/search?",
    TN: "http://www.google.tn/search?",
    TR: "http://www.google.com.tr/search?",
    TM: "http://www.google.tm/search?",
    UA: "http://www.google.com.ua/search?",
    AE: "http://www.google.ae/search?",
    GB: "http://www.google.co.uk/search?",
    US: "http://www.google.com/search?gl=us",
    UY: "http://www.google.com.uy/search?",
    UZ: "http://www.google.co.uz/search?",
    VE: "http://www.google.co.ve/search?",
    VN: "http://www.google.com.vn/search?",
    ZM: "http://www.google.co.zm/search?",
    ZW: "http://www.google.co.zw/search?"
  };

  return GoogleDomains;

})();


},{}],11:[function(require,module,exports){
(function (global){
var GooglePlusStats, Model, Page, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

Page = require('./page.coffee');

module.exports = GooglePlusStats = (function(_super) {
  __extends(GooglePlusStats, _super);

  function GooglePlusStats() {
    _ref = GooglePlusStats.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  GooglePlusStats.prototype.defaults = {
    site: 'google-plus',
    tooltip: 'Google +',
    count: '--'
  };

  GooglePlusStats.prototype.url = function() {
    return "https://clients6.google.com/rpc";
  };

  GooglePlusStats.prototype.fetch = function(opts) {
    return GooglePlusStats.__super__.fetch.call(this, _.extend(opts || {}, {
      type: 'post',
      contentType: 'application/json-rpc',
      data: JSON.stringify({
        method: 'pos.plusones.get',
        id: 'p',
        jsonrpc: '2.0',
        key: 'p',
        apiVersion: 'v1',
        params: {
          nolog: true,
          id: Page.href(),
          source: 'widget',
          userId: '@viewer',
          groupId: '@self'
        }
      })
    }));
  };

  GooglePlusStats.prototype.parse = function(resp) {
    return {
      count: resp.result.metadata.globalCounts.count.toLocaleString()
    };
  };

  GooglePlusStats.prototype.validate = function(attrs) {
    if (attrs.count === this.defaults.count) {
      return 'Data not loaded!';
    }
  };

  return GooglePlusStats;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./page.coffee":18}],12:[function(require,module,exports){
(function (global){
var HttpStatusList, Model, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

module.exports = HttpStatusList = (function(_super) {
  __extends(HttpStatusList, _super);

  function HttpStatusList() {
    _ref = HttpStatusList.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  HttpStatusList.prototype.defaults = {
    isOk: false,
    status: null,
    statusCode: null,
    url: null
  };

  HttpStatusList.prototype.initialize = function(attrs, options) {
    HttpStatusList.__super__.initialize.apply(this, arguments);
    this.updateAttributes();
    return this.listenTo(this, 'change', this.updateAttributes);
  };

  HttpStatusList.prototype.updateAttributes = function() {
    var code;
    code = this.get('status').match(/^HTTP\/\d+\.\d+ (\d+)/)[1];
    return this.set({
      isOk: code === '200',
      statusCode: code
    });
  };

  return HttpStatusList;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],13:[function(require,module,exports){
(function (global){
var Collection, HttpStatus, HttpStatusList, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Collection = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Collection;

HttpStatus = require('./http_status.coffee');

module.exports = HttpStatusList = (function(_super) {
  __extends(HttpStatusList, _super);

  function HttpStatusList() {
    _ref = HttpStatusList.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  HttpStatusList.prototype.model = HttpStatus;

  HttpStatusList.prototype.sync = function(method, model, options) {
    var _ref1;
    if (method !== 'read') {
      throw new Error('Not implemented');
    }
    return typeof chrome !== "undefined" && chrome !== null ? (_ref1 = chrome.runtime) != null ? _ref1.sendMessage({
      type: 'status-history'
    }, function(response) {
      return options.success.call(model, response);
    }) : void 0 : void 0;
  };

  HttpStatusList.prototype.isValid = function() {
    return this.length > 0;
  };

  return HttpStatusList;

})(Collection);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./http_status.coffee":12}],14:[function(require,module,exports){
(function (global){
var $, KeywordDifficulty, Model, Page, SerpResultsMetrics, User, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

Page = require('./page.coffee');

SerpResultsMetrics = require('./serp_results_metrics.coffee');

User = require('./user.coffee');

module.exports = KeywordDifficulty = (function(_super) {
  __extends(KeywordDifficulty, _super);

  function KeywordDifficulty() {
    _ref = KeywordDifficulty.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  KeywordDifficulty.prototype.defaults = {
    isLoaded: false,
    difficulty: '--',
    volume: '--',
    isPro: false
  };

  KeywordDifficulty.prototype.serpResultsMetrics = null;

  KeywordDifficulty.prototype.searchResultUrls = [];

  KeywordDifficulty.prototype.user = User.getInstance();

  KeywordDifficulty.prototype.initialize = function() {
    var _this = this;
    return this.user.on('change:isPro', function() {
      return _this.set({
        isPro: _this.user.get('isPro')
      });
    });
  };

  KeywordDifficulty.prototype.fetch = function() {
    this.serpResultsMetrics = SerpResultsMetrics.getInstance();
    this.listenTo(this.serpResultsMetrics, 'change', this.updateDifficulty);
    this.fetchDifficulty();
    return this.set({
      isLoaded: true,
      isPro: this.user.get('isPro')
    });
  };

  KeywordDifficulty.prototype.fetchDifficulty = function() {
    var start;
    start = Page.getStartIndex();
    if (start === 0 || start === 10) {
      this.addSearchResultUrls($(document));
    }
    if (start >= 10) {
      this.fetchSearchPage(0);
      if (start !== 10) {
        this.fetchSearchPage(10);
      }
    }
    if (start === 0 && this.searchResultUrls.length < 20) {
      this.fetchSearchPage(10);
      if (this.searchResultUrls.length < 10) {
        this.fetchSearchPage(20);
      }
    }
    return this.updateDifficulty();
  };

  KeywordDifficulty.prototype.updateDifficulty = function() {
    var metrics;
    if (!(this.searchResultUrls.length >= 20)) {
      return;
    }
    if (!this.serpResultsMetrics.isLoaded(this.searchResultUrls)) {
      return;
    }
    metrics = this.serpResultsMetrics.findMetricsByUrls(this.searchResultUrls);
    metrics = _.sortBy(metrics, function(model) {
      return model.get('upa') * -1;
    });
    return this.set({
      difficulty: metrics[5].get('niceUpa')
    });
  };

  KeywordDifficulty.prototype.fetchSearchPage = function(start) {
    var _this = this;
    return $.get("//www.google.com/search?q=" + (Page.getSearchTerm()) + "&start=" + start, function(results) {
      return _this.addSearchResultUrls($(results));
    });
  };

  KeywordDifficulty.prototype.addSearchResultUrls = function($doc) {
    var serpConfig,
      _this = this;
    serpConfig = Page.getSerpConfig();
    return $doc.find(serpConfig.selector).each(function(i, el) {
      var metrics, pageUrl;
      pageUrl = ($(el)).find(serpConfig.href).attr('href');
      _this.searchResultUrls.push(pageUrl);
      metrics = _this.serpResultsMetrics.getPageMetrics(pageUrl);
      if (!metrics.isValid()) {
        return metrics.fetch();
      }
    });
  };

  KeywordDifficulty.prototype.reset = function() {
    return this.set(_.extend(this.defaults, {
      isPro: this.user.get('isPro')
    }));
  };

  return KeywordDifficulty;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./page.coffee":18,"./serp_results_metrics.coffee":27,"./user.coffee":35}],15:[function(require,module,exports){
(function (global){
var _;

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = {
  flags: {
    ut: 1,
    uu: 4,
    ufq: 8,
    upl: 16,
    ueid: 32,
    feid: 64,
    peid: 128,
    ujid: 256,
    uifq: 512,
    uipl: 1024,
    uid: 2048,
    fid: 4096,
    pid: 8192,
    umrp: 16384,
    umrr: 16384,
    fmrp: 32768,
    fmrr: 32768,
    pmrp: 65536,
    pmrr: 65536,
    utrp: 131072,
    utrr: 131072,
    ftrp: 262144,
    ftrr: 262144,
    ptrp: 524288,
    ptrr: 524288,
    uemrp: 1048576,
    uemrr: 1048576,
    fejp: 2097152,
    fejr: 2097152,
    pejp: 4194304,
    pejr: 4194304,
    fjp: 8388608,
    fjr: 8388608,
    pjp: 16777216,
    pjr: 16777216,
    us: 536870912,
    fuid: 4294967296,
    puid: 8589934592,
    fipl: 17179869184,
    upa: 34359738368,
    pda: 68719476736,
    ulc: 144115188075855872,
    fspsc: 67108864
  },
  getBits: function(cols) {
    var col, val, _i, _len, _ref;
    val = 0;
    _ref = _.uniq(cols);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      col = _ref[_i];
      val += this.flags[col];
    }
    return val;
  }
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],16:[function(require,module,exports){
(function (global){
var Analytics, Dispatcher, Model, Onboarding, Page, Settings, User, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

Analytics = require('./analytics.coffee');

User = require('./user.coffee');

Page = require('./page.coffee');

Dispatcher = require('./../views/event_dispatcher.coffee');

Settings = require('./settings.coffee');

module.exports = Onboarding = (function(_super) {
  __extends(Onboarding, _super);

  function Onboarding() {
    _ref = Onboarding.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Onboarding.onboarding = null;

  Onboarding.getInstance = function() {
    return this.onboarding != null ? this.onboarding : this.onboarding = new Onboarding;
  };

  Onboarding.prototype.settings = Settings.getInstance();

  Onboarding.prototype.defaults = {
    pageStep: null,
    serpStep: null,
    pageHighlights: [],
    serpHighlights: [],
    pageTourComplete: false,
    serpTourComplete: false,
    viewedHighlights: [],
    sharedHighlights: []
  };

  Onboarding.prototype.serpSteps = ['serp-hotspots', 'serp-page-intro-address-bar', 'complete'];

  Onboarding.prototype.pageSteps = ['page-hotspots', 'page-serp-intro-address-bar', 'complete'];

  Onboarding.prototype.serpHighlights = ['link-analysis', 'export', 'lock', 'activate-keyword-difficulty', 'search-profile'];

  Onboarding.prototype.pageHighlights = ['show-info-panel', 'show-links-panel'];

  Onboarding.prototype.sharedHighlights = ['settings', 'help', 'close'];

  Onboarding.prototype.initialize = function() {
    var _this = this;
    this.dispatcher = Dispatcher.getInstance();
    this.user = User.getInstance();
    this.listenTo(this.settings, 'change:onboarding', this.fetch);
    this.listenTo(this.dispatcher, 'onboarding:hide-highlight', this.hideHighlight);
    this.listenTo(this, 'change:pageStep change:serpStep', this.stepChanged);
    return this.listenTo(this, 'change:pageHighlights change:serpHighlights', function() {
      return _this.highlightsChanged();
    });
  };

  Onboarding.prototype.sync = function(method) {
    switch (method) {
      case 'create':
      case 'update':
      case 'patch':
        this.settings.set('onboarding', this.toJSON());
        return this.settings.save();
      case 'read':
        return this.set(this.settings.get('onboarding'));
      default:
        throw new Error("" + method + " not implemented.");
    }
  };

  Onboarding.prototype.nextStep = function() {
    var currentIndex, nextStep, setting, step, steps;
    if (Page.isSerp()) {
      setting = 'serpStep';
      steps = this.serpSteps;
    } else {
      setting = 'pageStep';
      steps = this.pageSteps;
    }
    step = this.get(setting);
    currentIndex = steps.indexOf(step);
    if (currentIndex === steps.length - 1) {
      return;
    }
    nextStep = steps[currentIndex + 1];
    if (nextStep === 'page-serp-intro-address-bar') {
      this.set({
        pageTourComplete: true
      });
      if (this.get('serpTourComplete')) {
        nextStep = 'complete';
      }
    }
    if (nextStep === 'serp-page-intro-address-bar') {
      this.set({
        serpTourComplete: true
      });
      if (this.get('pageTourComplete')) {
        nextStep = 'complete';
      }
    }
    this.set(setting, nextStep);
    if (this.get('pageStep') === 'complete' && this.get('pageTourComplete') && this.get('serpStep') === 'complete' && this.get('serpTourComplete')) {
      Analytics.getInstance().trackOnboardingComplete();
    }
    return this.save();
  };

  Onboarding.prototype.stepChanged = function() {
    var step;
    step = Page.isSerp() ? this.get('serpStep') : this.get('pageStep');
    this.updateAddressBarHighlight(step);
    if (this.get('serpStep') === 'intro' && this.get('pageStep') === 'intro') {
      return this.restart();
    }
  };

  Onboarding.prototype.highlightsChanged = function() {
    var highlights;
    highlights = this.get('serpHighlights');
    if (_.isEqual(highlights, ['activate-keyword-difficulty']) && !this.user.get('isPro')) {
      this.nextStep();
    }
    return this.dispatcher.trigger('onboardingHighlights:change');
  };

  Onboarding.prototype.updateAddressBarHighlight = function(step) {
    var show;
    show = /address-bar/.test(step) ? 'show' : 'hide';
    return this.dispatcher.trigger("address-bar-highlight:" + show);
  };

  Onboarding.prototype.getHighlights = function() {
    var name;
    name = Page.isSerp() ? 'serp' : 'page';
    return this.get("" + name + "Highlights").concat(this.get('sharedHighlights'));
  };

  Onboarding.prototype.removeHighlights = function(highlights) {
    var allHighlights, name, visited;
    name = Page.isSerp() ? 'serp' : 'page';
    allHighlights = this.sharedHighlights.concat(this.serpHighlights, this.pageHighlights);
    highlights = _.intersection(highlights, allHighlights);
    visited = this.get('viewedHighlights');
    visited = visited.concat(highlights);
    this.set('viewedHighlights', _.uniq(visited));
    this.set("" + name + "Highlights", _.difference(this.get("" + name + "Highlights"), highlights));
    this.set('sharedHighlights', _.difference(this.get('sharedHighlights'), highlights));
    return this.save();
  };

  Onboarding.prototype.hasUserSeenHighlight = function(highlight) {
    return this.get('viewedHighlights').indexOf(highlight) !== -1;
  };

  Onboarding.prototype.isOnboardingComplete = function() {
    return this.get('pageStep') === 'complete' && this.get('pageTourComplete') && this.get('serpStep') === 'complete' && this.get('serpTourComplete');
  };

  Onboarding.prototype.hideHighlight = function() {
    var highlights, name, step;
    name = Page.isSerp() ? 'serp' : 'page';
    step = this.get("" + name + "Step");
    highlights = this.getHighlights();
    if (highlights.length === 0) {
      this.nextStep();
    }
    if (_.isEqual(highlights, ['lock']) && this.user.get('isPro')) {
      this.nextStep();
    }
    if (_.isEqual(highlights, ['activate-keyword-difficulty']) && !this.user.get('isPro')) {
      return this.nextStep();
    }
  };

  Onboarding.prototype.restart = function() {
    this.set({
      pageStep: this.pageSteps[0],
      serpStep: this.serpSteps[0],
      pageHighlights: this.pageHighlights,
      serpHighlights: this.serpHighlights,
      sharedHighlights: this.sharedHighlights,
      pageTourComplete: false,
      serpTourComplete: false
    });
    return this.save();
  };

  Onboarding.prototype.close = function() {
    this.set({
      pageStep: 'complete',
      serpStep: 'complete',
      pageHighlights: [],
      serpHighlights: [],
      sharedHighlights: []
    });
    return this.save();
  };

  return Onboarding;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../views/event_dispatcher.coffee":45,"./analytics.coffee":4,"./page.coffee":18,"./settings.coffee":29,"./user.coffee":35}],17:[function(require,module,exports){
(function (global){
var Backbone, OnboardingTipModel, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

module.exports = OnboardingTipModel = (function(_super) {
  __extends(OnboardingTipModel, _super);

  function OnboardingTipModel() {
    _ref = OnboardingTipModel.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  OnboardingTipModel.prototype.defaults = {
    text: '',
    top: 0,
    left: 0,
    placement: 'below'
  };

  return OnboardingTipModel;

})(Backbone.Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],18:[function(require,module,exports){
(function (global){
var $, BLACKLIST_URLS, Page, SERP_CONFIG, _;

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

SERP_CONFIG = {
  'google': {
    selector: '.g .rc',
    href: 'a.entryTitle[href], h3 a[href], a.l',
    searchBox: '.srp form[action="/search"] .sfsbc',
    description: 'div.s .st'
  },
  'yahoo': {
    selector: 'div#web > ol > li',
    href: 'span.url',
    description: 'div.abstr'
  },
  'bing': {
    selector: 'li.b_algo',
    href: 'h2 a[href]',
    description: 'p'
  }
};

BLACKLIST_URLS = [/\:\/\/.+\.google\..+\/maps/, /\:\/\/seomoz\.zendesk\.com/, /\:\/\/tools\.answerdash\.com/, /\:\/\/docs\.google\.com/, /\:\/\/drive\.google\.com/, /\:\/\/mail\.google\.com/, /\:\/\/.+\.myworkday\.com/, /\:\/\/moz.com\/researchtools\/ose/];

module.exports = Page = (function() {
  function Page() {}

  Page.el = null;

  Page.url = function() {
    var el, _ref;
    if (this.el !== null) {
      return this.el;
    }
    el = document.createElement('a');
    if ((_ref = window.location.protocol) === 'chrome-extension:' || _ref === 'data:') {
      el.href = window.location.hash.substr(1);
    } else {
      el.href = window.location.href;
    }
    return this.el = el;
  };

  Page.href = function() {
    return this.url().href;
  };

  Page.hostname = function() {
    return this.url().hostname;
  };

  Page.pathname = function() {
    return this.url().pathname;
  };

  Page.isSerp = function() {
    return this.getSerpEngine() != null;
  };

  Page.getSerpEngine = function() {
    switch (false) {
      case !(this.hostname() === 'www.bing.com' && this.pathname() === '/search'):
        return 'bing';
      case !/search\.yahoo\./.test(this.hostname()):
        return 'yahoo';
      case !(/(www|encrypted)\.google\..+/.test(this.hostname()) && /\/(search|webhp)?$/.test(this.pathname())):
        return 'google';
    }
  };

  Page.getSerpConfig = function() {
    return SERP_CONFIG[this.getSerpEngine()];
  };

  Page.getSearchTerm = function() {
    var term;
    term = this.getParameter('[qp]');
    if (!_.isUndefined(term)) {
      return decodeURIComponent(term).replace(/\+/g, ' ');
    }
  };

  Page.getStartIndex = function() {
    if (this.getSerpEngine() !== 'google') {
      return null;
    }
    return this.getParameter('start') || 0;
  };

  Page.getParameter = function(param) {
    var params, _ref;
    params = window.location.hash || window.location.search;
    return (_ref = (new RegExp("[\?\&\#]" + param + "\=([^&]*)")).exec(params)) != null ? _ref[1] : void 0;
  };

  Page.readMetaTag = function(name) {
    return ($("meta[name='" + name + "']")).prop('content') || ($("meta[property='" + name + "']")).prop('content') || ($("meta[name='" + name + "']")).attr('value') || ($("meta[property='" + name + "']")).attr('value');
  };

  Page.isBlacklisted = function() {
    var urlRe, _i, _len;
    for (_i = 0, _len = BLACKLIST_URLS.length; _i < _len; _i++) {
      urlRe = BLACKLIST_URLS[_i];
      if (urlRe.test(this.href())) {
        return true;
      }
    }
    return false;
  };

  return Page;

})();


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],19:[function(require,module,exports){
(function (global){
var $, Collection, Geolocation, PageAttributes, PageElement, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Collection = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Collection;

PageElement = require('./page_element.coffee');

Geolocation = require('./geolocation.coffee');

module.exports = PageAttributes = (function(_super) {
  __extends(PageAttributes, _super);

  function PageAttributes() {
    _ref = PageAttributes.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PageAttributes.prototype.geolocation = Geolocation.getInstance();

  PageAttributes.prototype.initialize = function() {
    return this.listenTo(this.geolocation, 'change', this.updateLocation);
  };

  PageAttributes.prototype.isValid = function() {
    return this.models.length > 0;
  };

  PageAttributes.prototype.sync = function(method) {
    var loadTime;
    if (method !== 'read') {
      throw new Error('Not implemented');
    }
    if (!this.geolocation.isValid()) {
      this.geolocation.fetch();
    }
    loadTime = (performance.timing.loadEventEnd - performance.timing.responseEnd) / 1000;
    this.reset([
      new PageElement({
        tag: 'Meta Robots',
        selector: 'meta[name="robots"]',
        attribute: 'content'
      }), new PageElement({
        tag: 'Rel="canonical"',
        selector: 'link[rel="canonical"]',
        attribute: 'href'
      }), new PageElement({
        tag: 'Page Load Time',
        content: "" + loadTime + " seconds",
        url: 'http://developers.google.com/speed/pagespeed/insights/?url=' + window.top.document.location.href
      }), new PageElement({
        tag: 'Google Cache URL',
        url: "http://google.com/search?q=cache:" + window.top.document.location.href
      }), new PageElement({
        tag: 'IP Address',
        content: ''
      }), new PageElement({
        tag: 'Country',
        content: ''
      })
    ]);
    return this.updateLocation();
  };

  PageAttributes.prototype.updateLocation = function() {
    var _ref1, _ref2;
    if ((_ref1 = this.findWhere({
      tag: 'Country'
    })) != null) {
      _ref1.set('content', this.geolocation.get('country_name'));
    }
    return (_ref2 = this.findWhere({
      tag: 'IP Address'
    })) != null ? _ref2.set('content', this.geolocation.get('ip')) : void 0;
  };

  return PageAttributes;

})(Collection);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./geolocation.coffee":9,"./page_element.coffee":20}],20:[function(require,module,exports){
(function (global){
var $, Model, PageElement, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

module.exports = PageElement = (function(_super) {
  __extends(PageElement, _super);

  function PageElement() {
    _ref = PageElement.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PageElement.prototype.defaults = {
    tag: '',
    content: '',
    contentClass: '',
    url: '',
    selector: null,
    metaName: null,
    length: '--',
    showLength: true,
    multipleError: false,
    shouldOnlyBeOne: false,
    attribute: null,
    truncate: null,
    concatenate: false
  };

  PageElement.prototype.initialize = function() {
    this.updateAttributes();
    return this.listenTo(this, 'change', this.updateAttributes);
  };

  PageElement.prototype.updateAttributes = function() {
    var $el, attrs, item, texts;
    attrs = _.clone(this.attributes);
    if (attrs.selector) {
      $el = $(attrs.selector);
    }
    if (attrs.metaName != null) {
      $el = ($('meta[name]')).filter(function() {
        return this.name.toLowerCase() === attrs.metaName;
      });
    }
    if ($el != null) {
      if (attrs.concatenate != null) {
        texts = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = $el.length; _i < _len; _i++) {
            item = $el[_i];
            if (attrs.attribute != null) {
              _results.push(($(item)).attr(attrs.attribute));
            } else {
              _results.push(($(item)).text());
            }
          }
          return _results;
        })();
        attrs.content = texts.join(' \u2022 ');
      } else if (attrs.attribute != null) {
        attrs.content = $el.attr(attrs.attribute);
      } else {
        attrs.content = $el.text();
      }
      attrs.content = $.trim(attrs.content);
      attrs.multipleError = attrs.shouldOnlyBeOne && $el.length > 1;
    }
    if (!attrs.content) {
      attrs.content = attrs.url;
    }
    attrs.content = attrs.content.replace(/\s+/g, ' ');
    attrs.length = attrs.content.length.toLocaleString();
    if (attrs.length === '0' || ($el != null ? $el.length : void 0) === 0) {
      attrs.length = '--';
    }
    if (($el != null ? $el.length : void 0) === 0) {
      attrs.content = 'Not found';
    }
    if ((attrs.truncate != null) && attrs.content.length > attrs.truncate) {
      attrs.content = attrs.content.substr(0, attrs.truncate) + '...';
    }
    return this.set(attrs);
  };

  return PageElement;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],21:[function(require,module,exports){
(function (global){
var $, Collection, Geolocation, PageElement, PageElements, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Collection = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Collection;

PageElement = require('./page_element.coffee');

Geolocation = require('./geolocation.coffee');

module.exports = PageElements = (function(_super) {
  __extends(PageElements, _super);

  function PageElements() {
    _ref = PageElements.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PageElements.prototype.geolocation = Geolocation.getInstance();

  PageElements.prototype.initialize = function() {
    return this.listenTo(this.geolocation, 'change', this.updateLocation);
  };

  PageElements.prototype.isValid = function() {
    return this.models.length > 0;
  };

  PageElements.prototype.sync = function(method) {
    var codeLen, doc, textToCodeRatio;
    if (method !== 'read') {
      throw new Error('Not implemented');
    }
    if (!this.geolocation.isValid()) {
      this.geolocation.fetch();
    }
    doc = window.top.document;
    codeLen = doc.getElementsByTagName('html')[0].innerHTML.length;
    textToCodeRatio = ((($('html')).text().length / codeLen) * 100).toFixed(2);
    this.reset([
      new PageElement({
        tag: 'URL',
        content: doc.location.href,
        contentClass: 'flag us'
      }), new PageElement({
        tag: 'Page Title',
        selector: 'title'
      }), new PageElement({
        tag: 'Meta Description',
        metaName: 'description',
        attribute: 'content',
        shouldOnlyBeOne: true
      }), new PageElement({
        tag: 'Meta Keywords',
        metaName: 'keywords',
        attribute: 'content',
        shouldOnlyBeOne: true
      }), new PageElement({
        tag: 'H1',
        selector: 'h1',
        concatenate: true
      }), new PageElement({
        tag: 'H2',
        selector: 'h2',
        concatenate: true
      }), new PageElement({
        tag: 'Bold/Strong',
        selector: 'b,strong',
        concatenate: true
      }), new PageElement({
        tag: 'Italic/em',
        selector: 'i,em',
        concatenate: true
      }), new PageElement({
        tag: 'Alt Text',
        selector: 'img[alt][alt!=""]',
        attribute: 'alt',
        concatenate: true
      })
    ]);
    return this.updateLocation();
  };

  PageElements.prototype.updateLocation = function() {
    var code, _ref1, _ref2;
    code = (_ref1 = this.geolocation.get('country_code')) != null ? _ref1.toLowerCase() : void 0;
    return (_ref2 = this.findWhere({
      tag: 'URL'
    })) != null ? _ref2.set('contentClass', "flag " + code) : void 0;
  };

  return PageElements;

})(Collection);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./geolocation.coffee":9,"./page_element.coffee":20}],22:[function(require,module,exports){
(function (global){
var Model, Profile, Settings, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

Settings = require('./settings.coffee');

module.exports = Profile = (function(_super) {
  __extends(Profile, _super);

  function Profile() {
    _ref = Profile.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Profile.prototype.settings = Settings.getInstance();

  Profile.prototype.defaults = {
    name: '',
    engine: 'google',
    disablePersonalization: false,
    country: 'US',
    region: '',
    city: ''
  };

  Profile.prototype.sync = function(method) {
    var maxId, p, profile, profiles,
      _this = this;
    profiles = _.clone(this.settings.get('profiles'));
    profile = _.find(profiles, function(p) {
      return p.id === _this.get('id');
    });
    switch (method) {
      case 'update':
        _.extend(profile, this.attributes);
        return this.saveProfiles(profiles);
      case 'create':
        maxId = _.max((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = profiles.length; _i < _len; _i++) {
            p = profiles[_i];
            _results.push(p.id);
          }
          return _results;
        })());
        this.set('id', maxId + 1);
        profiles.push(this.attributes);
        return this.saveProfiles(profiles);
      case 'delete':
        profiles = _.without(profiles, profile);
        return this.saveProfiles(profiles);
      default:
        throw new Error("{#method} not implemented");
    }
  };

  Profile.prototype.saveProfiles = function(profiles) {
    this.settings.set('profiles', profiles);
    return this.settings.save();
  };

  return Profile;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./settings.coffee":29}],23:[function(require,module,exports){
(function (global){
var Collection, Profile, Profiles, Settings, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Collection = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Collection;

Profile = require('./profile.coffee');

Settings = require('./settings.coffee');

module.exports = Profiles = (function(_super) {
  __extends(Profiles, _super);

  function Profiles() {
    _ref = Profiles.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Profiles.prototype.settings = Settings.getInstance();

  Profiles.prototype.model = Profile;

  Profiles.prototype.initialize = function() {
    this.fetch();
    return this.listenTo(this.settings, 'change:profiles', this.fetch);
  };

  Profiles.prototype.sync = function(method) {
    switch (method) {
      case 'read':
        return this.set(this.settings.get('profiles'));
    }
  };

  return Profiles;

})(Collection);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./profile.coffee":22,"./settings.coffee":29}],24:[function(require,module,exports){
(function (global){
var Backbone, Regions, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

module.exports = Regions = (function(_super) {
  __extends(Regions, _super);

  function Regions() {
    _ref = Regions.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Regions.prototype.country = 'US';

  Regions.prototype.url = function() {
    return "https://d2eeipcrcdle6.cloudfront.net/mozbar/regions/" + this.country + ".json";
  };

  return Regions;

})(Backbone.Collection);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],25:[function(require,module,exports){
(function (global){
var $, Model, Page, Semantics, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

Page = require('./page.coffee');

module.exports = Semantics = (function(_super) {
  var microformats2Classes;

  __extends(Semantics, _super);

  function Semantics() {
    _ref = Semantics.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  microformats2Classes = ['h-adr', 'h-card', 'h-entry', 'h-event', 'h-feed', 'h-geo', 'h-item', 'h-listing', 'h-product', 'h-recipe', 'h-resume', 'h-review', 'h-review-aggregate'];

  Semantics.prototype.defaults = {
    hasSchema: null,
    hasTwitter: null,
    pageUrl: Page.href(),
    richSnippetToolUrl: 'https://developers.google.com/webmasters/structured-data/testing-tool' + ("?url=" + (encodeURIComponent(Page.href()))),
    openGraphToolUrl: 'https://developers.facebook.com/tools/debug/og/object?q=' + encodeURIComponent(Page.href())
  };

  Semantics.prototype.url = function() {
    return this.get('richSnippetToolUrl');
  };

  Semantics.prototype.sync = function(method) {
    if (method !== 'read') {
      throw new Error('Not implemented');
    }
    return this.set({
      description: ($('meta[name="description"]')).prop('content'),
      hasSchema: ($('[itemscope][itemtype^="http://schema.org/"]')).length,
      hasOpenGraph: Page.readMetaTag('og:title') || Page.readMetaTag('og:type') || Page.readMetaTag('og:image') || Page.readMetaTag('og:url') || Page.readMetaTag('og:description') || Page.readMetaTag('og:audio') || Page.readMetaTag('og:video'),
      hasTwitter: Page.readMetaTag('twitter:card'),
      hasMicroformats: ($('.vcard')).length || _.find(this.microformats2Classes, function(className) {
        return ($("." + className)).length;
      })
    });
  };

  Semantics.prototype.validate = function(attrs) {
    if (_.isNull(attrs.hasSchema)) {
      return 'Data not loaded';
    }
  };

  return Semantics;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./page.coffee":18}],26:[function(require,module,exports){
(function (global){
var $, Model, Page, SerpAttributes, SerpResultsMetrics, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

Page = require('./page.coffee');

SerpResultsMetrics = require('./serp_results_metrics.coffee');

module.exports = SerpAttributes = (function(_super) {
  __extends(SerpAttributes, _super);

  function SerpAttributes() {
    _ref = SerpAttributes.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SerpAttributes.prototype.$el = null;

  SerpAttributes.prototype.defaults = {
    el: null,
    url: null,
    title: null,
    description: null,
    metrics: null
  };

  SerpAttributes.prototype.initialize = function(attributes) {
    var metrics, url;
    SerpAttributes.__super__.initialize.apply(this, arguments);
    if (!this.get('el')) {
      throw new Error('Required attribute $el not set!');
    }
    this.$el = $(this.get('el'));
    url = this.getUrl();
    metrics = SerpResultsMetrics.getInstance().getPageMetrics(url);
    metrics.set({
      position: attributes.position
    });
    return this.set({
      url: url,
      title: this.getTitle(),
      description: this.getDescription(),
      metrics: metrics
    });
  };

  SerpAttributes.prototype.getUrl = function() {
    var $href;
    $href = this.$el.find(Page.getSerpConfig().href);
    switch (Page.getSerpEngine()) {
      case 'google':
      case 'bing':
        return $href.attr('href');
      case 'yahoo':
        return $href.text();
    }
  };

  SerpAttributes.prototype.getTitle = function() {
    return this.$el.find(Page.getSerpConfig().href).text();
  };

  SerpAttributes.prototype.getDescription = function() {
    var $desc;
    $desc = this.$el.find(Page.getSerpConfig().description);
    switch (Page.getSerpEngine()) {
      case 'google':
        return $desc.clone().children('.f').remove().end().text();
      default:
        return $desc.text();
    }
  };

  return SerpAttributes;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./page.coffee":18,"./serp_results_metrics.coffee":27}],27:[function(require,module,exports){
(function (global){
var $, Collection, Page, SerpResultsMetrics, UrlMetrics, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Collection = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Collection;

Page = require('./page.coffee');

UrlMetrics = require('./url_metrics.coffee');

module.exports = SerpResultsMetrics = (function(_super) {
  __extends(SerpResultsMetrics, _super);

  function SerpResultsMetrics() {
    _ref = SerpResultsMetrics.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SerpResultsMetrics.serpResultsMetrics = null;

  SerpResultsMetrics.getInstance = function() {
    return this.serpResultsMetrics != null ? this.serpResultsMetrics : this.serpResultsMetrics = new SerpResultsMetrics;
  };

  SerpResultsMetrics.prototype.getPageMetrics = function(url) {
    var metrics;
    metrics = this.findWhere({
      pageUrl: url
    });
    return metrics != null ? metrics : metrics = this.add(new UrlMetrics({
      pageUrl: url
    }));
  };

  SerpResultsMetrics.prototype.isValid = function(urls) {
    var models;
    models = this.getMetricsForUrls(urls);
    return _.isUndefined(_.find(models, function(model) {
      return !model.isValid();
    }));
  };

  SerpResultsMetrics.prototype.isLoaded = function(urls) {
    var models;
    models = this.getMetricsForUrls(urls);
    return _.isUndefined(_.find(models, function(model) {
      return !model.isLoaded;
    }));
  };

  SerpResultsMetrics.prototype.getMetricsForUrls = function(urls) {
    var models;
    return models = urls ? this.findMetricsByUrls(urls) : this.models;
  };

  SerpResultsMetrics.prototype.findMetricsByUrls = function(urls) {
    var model, _i, _len, _ref1, _ref2, _results;
    _ref1 = this.models;
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      model = _ref1[_i];
      if (_ref2 = model.get('pageUrl'), __indexOf.call(urls, _ref2) >= 0) {
        _results.push(model);
      }
    }
    return _results;
  };

  return SerpResultsMetrics;

})(Collection);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./page.coffee":18,"./url_metrics.coffee":34}],28:[function(require,module,exports){
(function (global){
var Model, Profiles, SerpToobar, Settings, User, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

User = require('./user.coffee');

Settings = require('./settings.coffee');

Profiles = require('./profiles.coffee');

module.exports = SerpToobar = (function(_super) {
  __extends(SerpToobar, _super);

  function SerpToobar() {
    _ref = SerpToobar.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SerpToobar.prototype.settings = Settings.getInstance();

  SerpToobar.prototype.user = User.getInstance();

  SerpToobar.prototype.profiles = new Profiles;

  SerpToobar.prototype.initialize = function() {
    var _this = this;
    this.updateProfile();
    this.listenTo(this.settings, 'change:selectedProfileId', this.updateProfile);
    return this.listenTo(this.user, 'change', function() {
      return _this.trigger('change');
    });
  };

  SerpToobar.prototype.updateProfile = function() {
    var profile;
    profile = this.profiles.get(this.settings.get('selectedProfileId'));
    if (profile == null) {
      profile = this.profiles.at(0);
    }
    return this.set('profile', profile);
  };

  SerpToobar.prototype.toJSON = function() {
    return _.extend(_.clone(this.attributes), {
      user: this.user.toJSON(),
      profile: this.get('profile').toJSON()
    });
  };

  return SerpToobar;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./profiles.coffee":23,"./settings.coffee":29,"./user.coffee":35}],29:[function(require,module,exports){
(function (global){
var Backbone, SETTINGS_VERSION, Settings, SimpleStorage, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

SimpleStorage = require('sdk/simple-storage');

SETTINGS_VERSION = 1;

module.exports = Settings = (function(_super) {
  __extends(Settings, _super);

  function Settings() {
    _ref = Settings.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Settings.settings = null;

  Settings.savedAttributes = null;

  Settings.getInstance = function() {
    return this.settings != null ? this.settings : this.settings = new Settings;
  };

  Settings.prototype.defaults = {
    version: SETTINGS_VERSION,
    isMozbarOn: null,
    isButtonOn: null,
    isLightTheme: false,
    isDockedOnBottom: false,
    mixpanelId: null,
    lastMixpanelActiveUser: 0,
    selectedProfileId: 1,
    profiles: [
      {
        id: 1,
        name: 'Google US (non-personalized)',
        engine: 'google',
        disablePersonalization: true,
        country: 'US',
        region: '',
        city: ''
      }, {
        id: 2,
        name: 'Bing US',
        engine: 'bing',
        disablePersonalization: false,
        country: 'US',
        region: '',
        city: ''
      }, {
        id: 3,
        name: 'Yahoo US',
        engine: 'yahoo',
        disablePersonalization: false,
        country: 'US',
        region: '',
        city: ''
      }
    ],
    metricsCols: ['ftrp', 'fspsc'],
    user: {
      access_id: '',
      expires: 0,
      level: 'member'
    },
    onboarding: {
      pageStep: 'legacy-user',
      serpStep: 'legacy-user',
      pageHighlightButtons: [],
      serpHighlightButtons: []
    },
    isNewInstall: false
  };

  Settings.prototype.initialize = function() {
    var _ref1,
      _this = this;
    this.fetch();
    if (typeof chrome !== "undefined" && chrome !== null) {
      chrome.storage.onChanged.addListener(function() {
        return _this.fetch();
      });
    }
    return typeof self !== "undefined" && self !== null ? (_ref1 = self.port) != null ? _ref1.on('settingsChanged', function(attributes) {
      return _this.set(attributes);
    }) : void 0 : void 0;
  };

  Settings.prototype.onNewInstall = function() {
    this.set({
      isMozbarOn: true,
      isButtonOn: true,
      isLightTheme: true,
      onboarding: {
        pageStep: 'intro',
        serpStep: 'intro'
      }
    });
    return this.save();
  };

  Settings.prototype.toggleMozbar = function() {
    switch (false) {
      case !this.get('isMozbarOn'):
        this.set({
          isMozbarOn: false
        });
        break;
      case !this.get('isButtonOn'):
        this.set({
          isButtonOn: false
        });
        break;
      default:
        this.set({
          isButtonOn: true,
          isMozbarOn: true
        });
    }
    this.resetPanelState();
    return this.save();
  };

  Settings.prototype.toggleDockPosition = function() {
    this.set('isDockedOnBottom', !this.get('isDockedOnBottom'));
    return this.save();
  };

  Settings.prototype.resetPanelState = function() {
    return this.set({
      selectedPanel: '',
      highlightLinks: [],
      highlightKeyword: '',
      infoPanelTab: 'page-elements'
    });
  };

  Settings.prototype.sync = function(method) {
    var key, keys, value, _ref1, _ref2,
      _this = this;
    switch (method) {
      case 'create':
      case 'update':
      case 'patch':
        if (_.isEqual(this.attributes, this.savedAttributes)) {
          return;
        }
        if (typeof chrome !== "undefined" && chrome !== null) {
          chrome.storage.sync.set(this.attributes);
        }
        if ((SimpleStorage != null ? SimpleStorage.storage : void 0) != null) {
          _ref1 = this.attributes;
          for (key in _ref1) {
            value = _ref1[key];
            SimpleStorage.storage[key] = value;
          }
        }
        return typeof self !== "undefined" && self !== null ? (_ref2 = self.port) != null ? _ref2.emit('settingsChanged', this.attributes) : void 0 : void 0;
      case 'read':
        if (typeof chrome !== "undefined" && chrome !== null) {
          chrome.storage.sync.get(this.attributes, function(attrs) {
            return _this.updateAttributes(attrs);
          });
        }
        if (SimpleStorage.storage != null) {
          return this.updateAttributes(SimpleStorage.storage);
        }
        break;
      case 'delete':
        keys = (function() {
          var _results;
          _results = [];
          for (key in this.attributes) {
            _results.push(key);
          }
          return _results;
        }).call(this);
        return typeof chrome !== "undefined" && chrome !== null ? chrome.storage.sync.remove(keys) : void 0;
    }
  };

  Settings.prototype.updateAttributes = function(attrs) {
    this.savedAttributes = JSON.parse(JSON.stringify(attrs));
    this.set(this.updateSettings(attrs));
    if (!_.isEqual(this.attributes, this.savedAttributes)) {
      return this.save();
    }
  };

  Settings.prototype.updateSettings = function(attrs) {
    if (attrs.mixpanelId == null) {
      attrs.mixpanelId = this.generateUniqueId();
    }
    if (_.isNull(attrs.isButtonOn) || _.isUndefined(attrs.isButtonOn)) {
      attrs.isButtonOn = attrs.isMozbarOn;
    }
    if (_.isNull(attrs.version)) {
      attrs.metricsCols.push('fspsc');
    }
    attrs.version = SETTINGS_VERSION;
    return attrs;
  };

  Settings.prototype.generateUniqueId = function() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  return Settings;

})(Backbone.Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"sdk/simple-storage":113}],30:[function(require,module,exports){
(function (global){
var Browser, Model, TabSettings, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

Browser = require('./browser.coffee');

module.exports = TabSettings = (function(_super) {
  __extends(TabSettings, _super);

  function TabSettings() {
    _ref = TabSettings.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  TabSettings.prototype.defaults = {
    highlightLinks: null,
    highlightKeyword: ''
  };

  TabSettings.prototype.sync = function(method, model, options) {
    switch (method) {
      case 'create':
      case 'update':
      case 'patch':
        return Browser.sendMessage('setTabSettings', this.toJSON());
      case 'read':
        return Browser.sendMessage('getTabSettings', null, function(response) {
          if (response == null) {
            response = {
              highlightLinks: [],
              highlightKeyword: ''
            };
          }
          return options.success.call(model, response);
        });
    }
  };

  TabSettings.prototype.toggleHighlightLink = function(type, isOn) {
    var links;
    links = this.get('highlightLinks') || [];
    if (isOn && links.indexOf(type) === -1) {
      links = links.concat(type);
    }
    if (!isOn) {
      links = _.without(links, type);
    }
    return this.set('highlightLinks', links);
  };

  TabSettings.prototype.isValid = function() {
    return this.get('highlightLinks') !== null;
  };

  return TabSettings;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./browser.coffee":5}],31:[function(require,module,exports){
(function (global){
var Backbone, Tooltip, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

module.exports = Tooltip = (function(_super) {
  __extends(Tooltip, _super);

  function Tooltip() {
    _ref = Tooltip.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Tooltip.prototype.defaults = {
    text: '',
    top: 0,
    left: 0,
    placement: 'below'
  };

  return Tooltip;

})(Backbone.Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],32:[function(require,module,exports){
(function (global){
var $, Model, Page, Twitter, TwitterUser, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

Page = require('./page.coffee');

TwitterUser = require('./twitter_user.coffee');

module.exports = Twitter = (function(_super) {
  __extends(Twitter, _super);

  function Twitter() {
    _ref = Twitter.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Twitter.prototype.defaults = {
    isLoaded: false,
    isSupported: true,
    cardType: null,
    image: null,
    description: null,
    title: null
  };

  Twitter.prototype.creator = new TwitterUser;

  Twitter.prototype.site = new TwitterUser;

  Twitter.prototype.supportedCardTypes = ['summary', 'summary_large_image', 'product', 'photo', 'gallery', 'player'];

  Twitter.prototype.initialize = function() {
    var _this = this;
    this.listenTo(this.creator, 'change', function() {
      return _this.trigger('change');
    });
    return this.listenTo(this.site, 'change', function() {
      return _this.trigger('change');
    });
  };

  Twitter.prototype.sync = function(method, model, options) {
    var cardType, isSupported;
    if (method !== 'read') {
      throw new Error('Not supported');
    }
    this.site.set('id', Page.readMetaTag('twitter:site'));
    this.site.fetch();
    this.creator.set('id', Page.readMetaTag('twitter:creator'));
    this.creator.fetch();
    cardType = Page.readMetaTag('twitter:card');
    isSupported = __indexOf.call(this.supportedCardTypes, cardType) >= 0;
    return options.success({
      isLoaded: true,
      hasTwitter: Page.readMetaTag('twitter:card'),
      cardType: Page.readMetaTag('twitter:card'),
      image: Page.readMetaTag('twitter:image') || Page.readMetaTag('twitter:image:src') || Page.readMetaTag('og:image'),
      description: Page.readMetaTag('twitter:description') || Page.readMetaTag('og:description'),
      title: Page.readMetaTag('twitter:title') || Page.readMetaTag('og:title'),
      label1: Page.readMetaTag('twitter:label1'),
      data1: Page.readMetaTag('twitter:data1'),
      label2: Page.readMetaTag('twitter:label2'),
      data2: Page.readMetaTag('twitter:data2'),
      image0: Page.readMetaTag('twitter:image0'),
      image1: Page.readMetaTag('twitter:image1'),
      image2: Page.readMetaTag('twitter:image2'),
      image3: Page.readMetaTag('twitter:image3'),
      player: Page.readMetaTag('twitter:player')
    });
  };

  Twitter.prototype.validate = function(attrs) {
    if (!attrs.isLoaded) {
      return 'Data not loaded';
    }
  };

  Twitter.prototype.toJSON = function() {
    return _.clone(_.extend(this.attributes, {
      site: this.site.toJSON(),
      creator: this.creator.toJSON()
    }));
  };

  return Twitter;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./page.coffee":18,"./twitter_user.coffee":33}],33:[function(require,module,exports){
(function (global){
var $, Model, TwitterUser, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Model = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Model;

module.exports = TwitterUser = (function(_super) {
  __extends(TwitterUser, _super);

  function TwitterUser() {
    _ref = TwitterUser.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  TwitterUser.prototype.defaults = {
    handle: null,
    name: null,
    image: null
  };

  TwitterUser.prototype.urlRoot = 'https://twitter.com/';

  TwitterUser.prototype.initialize = function() {
    var _this = this;
    return this.listenTo(this, 'change:id', function() {
      var id;
      if (!_this.get('id')) {
        return;
      }
      id = _this.get('id').replace(/^\@/, '');
      return _this.set({
        id: id,
        handle: "@" + id
      });
    });
  };

  TwitterUser.prototype.fetch = function(options) {
    if (!this.has('id')) {
      return;
    }
    return TwitterUser.__super__.fetch.call(this, _.extend({
      dataType: 'html'
    }, options));
  };

  TwitterUser.prototype.parse = function(resp) {
    var $resp;
    $resp = $(resp);
    return {
      image: $resp.find('.profile-picture .avatar').prop('src'),
      name: $resp.find('.profile-card-inner .fullname .profile-field').text()
    };
  };

  return TwitterUser;

})(Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],34:[function(require,module,exports){
(function (global){
var Analytics, Backbone, Browser, Settings, UrlMetrics, User, mozCols, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

Analytics = require('./analytics.coffee');

Browser = require('./browser.coffee');

Settings = require('./settings.coffee');

User = require('./user.coffee');

mozCols = require('./moz_cols.coffee');

module.exports = UrlMetrics = (function(_super) {
  __extends(UrlMetrics, _super);

  function UrlMetrics() {
    _ref = UrlMetrics.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  UrlMetrics.urlMetrics = null;

  UrlMetrics.getInstance = function() {
    return this.urlMetrics != null ? this.urlMetrics : this.urlMetrics = new UrlMetrics();
  };

  UrlMetrics.prototype.user = User.getInstance();

  UrlMetrics.prototype.analytics = Analytics.getInstance();

  UrlMetrics.prototype.settings = Settings.getInstance();

  UrlMetrics.prototype.defaults = {
    rootDomain: document.location.hostname,
    pageUrl: document.location.href,
    upa: '--',
    umrp: '--',
    utrp: '--',
    niceUid: '--',
    niceUipl: '--',
    pda: '--',
    nicePuid: '--',
    nicePid: '--',
    niceFuid: '--',
    niceFipl: '--',
    niceFspsc: '--',
    position: null
  };

  UrlMetrics.prototype.initialize = function(opts) {
    var _this = this;
    this.updateRootDomain();
    this.listenTo(this, 'change:pageUrl', this.updateRootDomain);
    this.listenTo(this, 'error', function() {
      return _this.isLoaded = true;
    });
    UrlMetrics.__super__.initialize.apply(this, arguments);
    this.listenTo(this.user, 'change', function() {
      return _this.fetch();
    });
    this.listenTo(this.settings, 'change:metricsCols', function() {
      return _this.fetch();
    });
    return this.listenTo(this, 'change', function() {
      return Browser.sendMessage('metricsChanged', _this.toJSON());
    });
  };

  UrlMetrics.prototype.fetch = function(options) {
    if (!this.user.isValid()) {
      this.user.fetch(options);
      return;
    }
    if (this.isFetching || this.isLoaded) {
      return;
    }
    this.isFetching = true;
    return UrlMetrics.__super__.fetch.apply(this, arguments);
  };

  UrlMetrics.prototype.fetchRootSpamScore = function() {
    var cols,
      _this = this;
    cols = mozCols.getBits(['fspsc']);
    return $.get("https://lsapi.seomoz.com/linkscape/url-metrics/" + ("" + (this.get('rootDomain')) + "?Cols=" + cols + "&" + (this.user.authQS())), function(resp) {
      return _this.set({
        fspsc: resp.fspsc != null ? resp.fspsc - 1 : void 0,
        niceFspsc: resp.fspsc != null ? "" + (resp.fspsc - 1) + "/17" : void 0,
        noFspsc: resp.fspsc === 0
      });
    });
  };

  UrlMetrics.prototype.validate = function(attrs) {
    if (attrs.upa === this.defaults.upa) {
      return 'Data not loaded';
    }
  };

  UrlMetrics.prototype.updateRootDomain = function() {
    var el;
    el = document.createElement('a');
    el.href = this.get('pageUrl');
    return this.set('rootDomain', el.hostname);
  };

  UrlMetrics.prototype.url = function() {
    var pageUrl;
    pageUrl = encodeURIComponent(this.get('pageUrl').replace(/^http[s]*:\/\//, ''));
    return "https://lsapi.seomoz.com/linkscape/url-metrics/" + ("" + pageUrl + "?Cols=" + (this.getCols()) + "&" + (this.user.authQS()));
  };

  UrlMetrics.prototype.parse = function(resp) {
    var _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    this.isFetching = false;
    this.isLoaded = true;
    if (resp.fspsc === 0) {
      this.fetchRootSpamScore();
    }
    return _.extend(resp, {
      niceUeid: (_ref1 = resp.ueid) != null ? _ref1.toLocaleString() : void 0,
      niceFeid: (_ref2 = resp.feid) != null ? _ref2.toLocaleString() : void 0,
      nicePeid: (_ref3 = resp.peid) != null ? _ref3.toLocaleString() : void 0,
      niceUid: (_ref4 = resp.uid) != null ? _ref4.toLocaleString() : void 0,
      nicePid: (_ref5 = resp.pid) != null ? _ref5.toLocaleString() : void 0,
      niceUipl: (_ref6 = resp.uipl) != null ? _ref6.toLocaleString() : void 0,
      umrp: (_ref7 = resp.umrp) != null ? _ref7.toFixed(2) : void 0,
      fmrp: (_ref8 = resp.fmrp) != null ? _ref8.toFixed(2) : void 0,
      pmrp: (_ref9 = resp.pmrp) != null ? _ref9.toFixed(2) : void 0,
      pmrpPct: Math.round(resp.pmrp * 10),
      utrp: (_ref10 = resp.utrp) != null ? _ref10.toFixed(2) : void 0,
      ftrp: (_ref11 = resp.ftrp) != null ? _ref11.toFixed(2) : void 0,
      ptrp: (_ref12 = resp.ptrp) != null ? _ref12.toFixed(2) : void 0,
      ptrpPct: Math.round(resp.ptrp * 10),
      utrpPct: Math.round(resp.utrp * 10),
      umrpPct: Math.round(resp.umrp * 10),
      niceFipl: (_ref13 = resp.fipl) != null ? _ref13.toLocaleString() : void 0,
      niceFuid: (_ref14 = resp.fuid) != null ? _ref14.toLocaleString() : void 0,
      nicePuid: (_ref15 = resp.puid) != null ? _ref15.toLocaleString() : void 0,
      niceUpa: Math.round(resp.upa),
      nicePda: Math.round(resp.pda),
      fspsc: resp.fspsc != null ? resp.fspsc - 1 : void 0,
      niceFspsc: resp.fspsc != null ? "" + (resp.fspsc - 1) + "/17" : void 0,
      noFspsc: resp.fspsc === 0
    });
  };

  UrlMetrics.prototype.getCols = function() {
    var cols;
    cols = ['upa', 'uid', 'pda', 'ueid', 'fmrp'];
    if (this.user.get('isPro')) {
      cols = cols.concat(['uipl', 'puid', 'pid', 'fuid', 'fipl', 'feid', 'peid']);
    }
    cols = cols.concat(_.without(this.settings.get('metricsCols'), 'links'));
    return mozCols.getBits(cols);
  };

  UrlMetrics.prototype.toJSON = function() {
    return _.clone(_.extend(this.attributes, {
      user: this.user.toJSON(),
      bar1on: this.attributes.fspsc > 0 ? 'on' : void 0,
      bar2on: this.attributes.fspsc > 6 ? 'on' : void 0,
      bar3on: this.attributes.fspsc > 12 ? 'on' : void 0
    }));
  };

  return UrlMetrics;

})(Backbone.Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./analytics.coffee":4,"./browser.coffee":5,"./moz_cols.coffee":15,"./settings.coffee":29,"./user.coffee":35}],35:[function(require,module,exports){
(function (global){
var $, Backbone, Page, Settings, User, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

Page = require('./page.coffee');

Settings = require('./settings.coffee');

module.exports = User = (function(_super) {
  __extends(User, _super);

  function User() {
    _ref = User.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  User.user = null;

  User.getInstance = function() {
    return this.user != null ? this.user : this.user = new User;
  };

  User.prototype.settings = Settings.getInstance();

  User.prototype.url = 'https://moz.com/users/level?src=mozbar';

  User.prototype.fetched = false;

  User.prototype.initialize = function() {
    var _this = this;
    this.listenTo(this, 'change:level', this.updateProFlag);
    return this.listenTo(this.settings, 'change:user', function() {
      return _this.fetch();
    });
  };

  User.prototype.fetch = function(options) {
    var _this = this;
    if (!this.settings.get('isButtonOn')) {
      return;
    }
    this.set(this.settings.get('user'));
    if (this.isValid() && Page.hostname().indexOf('moz.com') === -1) {
      return;
    }
    if (this.fetched) {
      return;
    }
    this.fetched = true;
    if (options == null) {
      options = {};
    }
    options.success = function() {
      return _this.save();
    };
    return User.__super__.fetch.call(this, options);
  };

  User.prototype.save = function() {
    this.settings.set('user', this.toJSON());
    return this.settings.save();
  };

  User.prototype.updateProFlag = function() {
    return this.set('isPro', this.get('level') !== 'member');
  };

  User.prototype.parse = function(resp) {
    return _.extend(resp, {
      access_id: decodeURIComponent(resp.access_id),
      signature: decodeURIComponent(resp.signature),
      isPro: resp.level !== 'member'
    });
  };

  User.prototype.validate = function(attrs) {
    if (new Date((attrs.expires || 0) * 1000) < Date.now()) {
      return 'User expired';
    }
  };

  User.prototype.authQS = function() {
    return $.param({
      AccessID: this.get('access_id'),
      Expires: this.get('expires'),
      Signature: this.get('signature')
    });
  };

  return User;

})(Backbone.Model);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./page.coffee":18,"./settings.coffee":29}],36:[function(require,module,exports){
var AddressBarHighlight, BaseElement, Dispatcher, Page, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseElement = require('./base_element.coffee');

Page = require('./../models/page.coffee');

Dispatcher = require('./event_dispatcher.coffee');

template = require('./../../templates/address_bar_highlight.hbs');

module.exports = AddressBarHighlight = (function(_super) {
  __extends(AddressBarHighlight, _super);

  function AddressBarHighlight() {
    _ref = AddressBarHighlight.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  AddressBarHighlight.prototype.id = 'mozbar-address-bar-highlight-wGA7MhRhQ3WS';

  AddressBarHighlight.prototype.className = 'mozbar-address-bar-highlight-wGA7MhRhQ3WS';

  AddressBarHighlight.prototype.elementCssClass = 'address-bar-highlight';

  AddressBarHighlight.prototype.elementTemplate = template;

  AddressBarHighlight.prototype.initialize = function() {
    var dispatcher,
      _this = this;
    dispatcher = Dispatcher.getInstance();
    dispatcher.on('address-bar-highlight:show', function() {
      return _this.render();
    });
    return dispatcher.on('address-bar-highlight:hide', function() {
      return _this.remove();
    });
  };

  return AddressBarHighlight;

})(BaseElement);


},{"./../../templates/address_bar_highlight.hbs":80,"./../models/page.coffee":18,"./base_element.coffee":38,"./event_dispatcher.coffee":45}],37:[function(require,module,exports){
(function (global){
var $, BaseDialog, BaseElement, Overlay, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BaseElement = require('./base_element.coffee');

Overlay = require('./overlay.coffee');

module.exports = BaseDialog = (function(_super) {
  __extends(BaseDialog, _super);

  function BaseDialog() {
    _ref = BaseDialog.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BaseDialog.prototype.elementCssClass = 'dialog';

  BaseDialog.prototype.elementViewClass = null;

  BaseDialog.prototype.overlay = null;

  BaseDialog.prototype.id = 'mozbar-help-dialog-wGA7MhRhQ3WS';

  BaseDialog.prototype.initialize = function(options) {
    var _this = this;
    this.options = options;
    BaseDialog.__super__.initialize.apply(this, arguments);
    this.overlay = new Overlay();
    return this.overlay.on('clicked', function() {
      return _this.overlayClicked();
    });
  };

  BaseDialog.prototype.render = function() {
    BaseDialog.__super__.render.apply(this, arguments);
    return this.overlay.render();
  };

  BaseDialog.prototype.setElementRoot = function(elementRoot) {
    var _ref1;
    this.elementRoot = elementRoot;
    BaseDialog.__super__.setElementRoot.apply(this, arguments);
    if ((_ref1 = this.options) != null ? _ref1.arrow : void 0) {
      return this.$elementRoot.addClass("arrow-" + this.options.arrow);
    }
  };

  BaseDialog.prototype.overlayClicked = function() {
    return this.remove();
  };

  BaseDialog.prototype.remove = function() {
    BaseDialog.__super__.remove.apply(this, arguments);
    return this.overlay.remove();
  };

  return BaseDialog;

})(BaseElement);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./base_element.coffee":38,"./overlay.coffee":60}],38:[function(require,module,exports){
(function (global){
var $, BaseElement, BaseView, Browser, Handlebars, Settings, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Settings = require('./../models/settings.coffee');

Handlebars = require('handlebars');

Browser = require('./../models/browser.coffee');

BaseView = require('./base_view.coffee');

template = require('./../../templates/base_element.hbs');

module.exports = BaseElement = (function(_super) {
  __extends(BaseElement, _super);

  function BaseElement() {
    _ref = BaseElement.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BaseElement.prototype.settings = Settings.getInstance();

  BaseElement.prototype.tagName = 'iframe';

  BaseElement.prototype.className = 'mozbar-wGA7MhRhQ3WS';

  BaseElement.prototype.elementTemplate = null;

  BaseElement.prototype.elementCssClass = null;

  BaseElement.prototype.elementViewClass = null;

  BaseElement.prototype.elementViewModel = null;

  BaseElement.prototype.elementView = null;

  BaseElement.prototype.elementRoot = null;

  BaseElement.prototype.$elementRoot = null;

  BaseElement.prototype.initialize = function(options) {
    var _this = this;
    return this.settings.on('change:isLightTheme', function() {
      return _this.updateTheme();
    });
  };

  BaseElement.prototype.parentElement = function() {
    return $('body');
  };

  BaseElement.prototype.addToDOM = function() {
    return this.$el.appendTo(this.parentElement());
  };

  BaseElement.prototype.render = function() {
    var el, html,
      _this = this;
    if (this.isInDOM()) {
      return;
    }
    el = this.addToDOM();
    this.setElement(el);
    html = template({
      elementCssClass: this.elementCssClass,
      html: new Handlebars.SafeString(typeof this.elementTemplate === "function" ? this.elementTemplate(this.templateOptions()) : void 0)
    });
    this.el.onload = function() {
      return _this.frameLoaded();
    };
    return this.$el.prop({
      frameBorder: 0,
      scrolling: 'no',
      allowTransparency: true,
      srcdoc: html
    });
  };

  BaseElement.prototype.templateOptions = function() {};

  BaseElement.prototype.frameLoaded = function() {
    var _this = this;
    this.setElementRoot(this.el.contentDocument.body);
    this.updateTheme();
    Browser.get('styles/toolbar.css', function(css) {
      var style;
      style = _this.el.contentDocument.createElement('style');
      style.type = 'text/css';
      style.appendChild(_this.el.contentDocument.createTextNode(css));
      return ($('head', _this.el.contentDocument)).append(style);
    });
    if (this.elementViewClass != null) {
      this.elementView = new this.elementViewClass({
        el: this.elementRoot,
        model: this.elementViewModel,
        host: this
      });
      return this.elementView.render();
    }
  };

  BaseElement.prototype.setElementRoot = function(elementRoot) {
    this.elementRoot = elementRoot;
    return this.$elementRoot = $(this.elementRoot);
  };

  BaseElement.prototype.updateTheme = function() {
    var _ref1;
    return (_ref1 = this.$elementRoot) != null ? _ref1.toggleClass('light', this.settings.get('isLightTheme')) : void 0;
  };

  BaseElement.prototype.remove = function() {
    var _ref1,
      _this = this;
    if (((_ref1 = this.elementView) != null ? _ref1.remove : void 0) != null) {
      return this.elementView.remove(function() {
        _this;
        return BaseElement.__super__.remove.apply(_this, arguments);
      });
    } else {
      return BaseElement.__super__.remove.apply(this, arguments);
    }
  };

  return BaseElement;

})(BaseView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/base_element.hbs":81,"./../models/browser.coffee":5,"./../models/settings.coffee":29,"./base_view.coffee":40,"handlebars":160}],39:[function(require,module,exports){
(function (global){
var BasePanelTab, BaseView, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

BaseView = require('./base_view.coffee');

module.exports = BasePanelTab = (function(_super) {
  __extends(BasePanelTab, _super);

  function BasePanelTab() {
    _ref = BasePanelTab.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BasePanelTab.prototype.tableHeight = null;

  BasePanelTab.prototype.className = null;

  BasePanelTab.prototype.template = null;

  BasePanelTab.prototype.setTableHeight = function(height) {
    this.tableHeight = height;
    return this.$el.find('.scrollable').height(this.tableHeight).perfectScrollbar('update');
  };

  BasePanelTab.prototype.getTableHeight = function() {
    return this.tableHeight;
  };

  BasePanelTab.prototype.render = function() {
    if (!this.model.isValid()) {
      this.model.fetch();
    }
    this.$el.html(this.template(_.extend(this.model.toJSON(), {
      className: this.className
    })));
    if (this.tableHeight != null) {
      this.$el.find('.scrollable').height(this.tableHeight);
    }
    if (this.tableHeight == null) {
      this.tableHeight = this.$el.find('.scrollable').height();
    }
    return this.$el.find('.scrollable').perfectScrollbar();
  };

  return BasePanelTab;

})(BaseView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./base_view.coffee":40}],40:[function(require,module,exports){
(function (global){
var $, Backbone, BaseView, Dispatcher, Onboarding, Page, Settings, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

Backbone.$ = $;

Dispatcher = require('./event_dispatcher.coffee');

Onboarding = require('./../models/onboarding.coffee');

Settings = require('./../models/settings.coffee');

Page = require('./../models/page.coffee');

module.exports = BaseView = (function(_super) {
  __extends(BaseView, _super);

  function BaseView() {
    _ref = BaseView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BaseView.prototype.dispatcher = Dispatcher.getInstance();

  BaseView.prototype.settings = Settings.getInstance();

  BaseView.prototype.tooltipPlacement = 'below';

  BaseView.prototype.host = null;

  BaseView.prototype.timeout = null;

  BaseView.prototype.initialize = function(options) {
    var tipSelector,
      _this = this;
    if (options != null) {
      this.setHost(options.host);
    }
    tipSelector = '[data-tooltip]';
    this.$el.on("mouseenter.baseViewEvents" + this.cid, tipSelector, function(e) {
      return _this.startTooltipTimeout(e);
    });
    this.$el.on("mouseleave.baseViewEvents" + this.cid, tipSelector, function(e) {
      return _this.hideTooltip(e);
    });
    this.onboarding = Onboarding.getInstance();
    this.listenTo(this.onboarding, 'change:serpHighlights', this.showOnboardingHighlights);
    this.listenTo(this.onboarding, 'change:pageHighlights', this.showOnboardingHighlights);
    return this.listenTo(this.onboarding, 'change:sharedHighlights', this.showOnboardingHighlights);
  };

  BaseView.prototype.render = function() {
    return this.showOnboardingHighlights();
  };

  BaseView.prototype.setHost = function(host) {
    this.host = host;
  };

  BaseView.prototype.isInDOM = function() {
    return $.contains(document.documentElement, this.el);
  };

  BaseView.prototype.startTooltipTimeout = function(e) {
    var $container, $parent, $target, eventName, lean, left, offset, opts, parentOffset, showHighlight, text, top,
      _this = this;
    e.stopPropagation();
    $target = $(e.currentTarget);
    $container = $target.closest('.tooltip-container');
    $parent = $(e.currentTarget.ownerDocument.defaultView.frameElement);
    showHighlight = $target.hasClass('highlight');
    text = showHighlight ? $target.find('.onboarding-text').html() : $target.data('tooltip');
    if (!text) {
      return;
    }
    offset = $target.offset();
    parentOffset = $parent.offset();
    if (this.tooltipPlacement === 'below') {
      top = parentOffset.top;
      top += $container.length ? $container.height() : $parent.height();
    } else {
      top = parentOffset.top;
      if ($container.length) {
        top += $container.offset().top;
      }
    }
    top -= ($(window)).scrollTop();
    left = offset.left + parentOffset.left + ($target.outerWidth() / 2);
    if (showHighlight) {
      if (offset.left < 300) {
        left += 100;
        lean = 'lean-left';
      }
      if (offset.left > 600) {
        left -= 100;
        lean = 'lean-right';
      }
      if (offset.left > ($(window)).width() - 100) {
        left -= 50;
        lean = 'lean-far-right';
      }
    }
    opts = {
      top: top,
      left: left,
      text: text,
      placement: this.tooltipPlacement,
      lean: lean || ''
    };
    eventName = showHighlight ? 'onboarding:show-highlight' : 'tooltip:start-timeout';
    this.dispatcher.trigger(eventName, opts);
    if (showHighlight) {
      return this.timeout = setTimeout(function() {
        return _this.onboarding.removeHighlights($target.attr('class').split(' '));
      }, 50);
    }
  };

  BaseView.prototype.showOnboardingHighlights = function() {
    var button, buttons, _i, _len, _results;
    this.$el.find('.btn').removeClass('highlight');
    buttons = this.onboarding.getHighlights();
    if (!(buttons && buttons.length)) {
      return;
    }
    _results = [];
    for (_i = 0, _len = buttons.length; _i < _len; _i++) {
      button = buttons[_i];
      _results.push(this.$el.find(".btn." + button).addClass('highlight'));
    }
    return _results;
  };

  BaseView.prototype.hideTooltip = function() {
    this.dispatcher.trigger('tooltip:hide');
    return clearTimeout(this.timeout);
  };

  BaseView.prototype.remove = function(complete) {
    var _ref1;
    if ((_ref1 = this.$el) != null) {
      _ref1.off(".baseViewEvents" + this.cid);
    }
    if (this.$el) {
      BaseView.__super__.remove.apply(this, arguments);
    }
    return typeof complete === "function" ? complete() : void 0;
  };

  return BaseView;

})(Backbone.View);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/onboarding.coffee":16,"./../models/page.coffee":18,"./../models/settings.coffee":29,"./event_dispatcher.coffee":45}],41:[function(require,module,exports){
(function (global){
var Analytics, BAR_BORDER_PCT, BAR_HEIGHT_PCT, Browser, ChromeButton, Events, Settings, TabSettings, data, pageMod, ui;

Events = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).Events;

Analytics = require('./../models/analytics.coffee');

Browser = require('./../models/browser.coffee');

Settings = require('./../models/settings.coffee');

TabSettings = require('./../models/tab_settings.coffee');

data = require('sdk/self').data;

pageMod = require('sdk/page-mod');

ui = require('sdk/ui');

BAR_HEIGHT_PCT = 20;

BAR_BORDER_PCT = 5;

module.exports = ChromeButton = (function() {
  function ChromeButton() {}

  ChromeButton.settings = null;

  ChromeButton.tabs = {};

  ChromeButton.onIcons = {
    19: 'images/mozicon_19x19.png',
    38: 'images/mozicon_38x38.png'
  };

  ChromeButton.offIcons = {
    19: 'images/mozicon_off_19x19.png',
    38: 'images/mozicon_off_38x38.png'
  };

  ChromeButton.firefoxWidget = null;

  ChromeButton.firefoxWorkers = [];

  ChromeButton.initialize = function() {
    var _ref,
      _this = this;
    this.settings = Settings.getInstance();
    if (typeof chrome !== "undefined" && chrome !== null) {
      if ((_ref = chrome.runtime.onStartup) != null) {
        _ref.addListener(function() {
          _this.settings.resetPanelState();
          return _this.settings.save();
        });
      }
    }
    this.settings.on('change:isButtonOn change:isMozbarOn', function() {
      return _this.render();
    });
    if (ui.ActionButton != null) {
      this.settings.resetPanelState();
      this.settings.save();
      this.settings.on('change', function() {
        return _this.settingsChanged(null, _this.settings.toJSON());
      });
    }
    if (Browser.isChrome()) {
      this.initializeChromeListeners();
    }
    this.firefoxWidget = typeof ui.ActionButton === "function" ? ui.ActionButton({
      id: 'mozbar-button',
      label: 'Show/Hide Mozbar',
      icon: data != null ? data.url(this.offIcons['19']) : void 0,
      onClick: function() {
        return _this.settings.toggleMozbar();
      }
    }) : void 0;
    if (typeof pageMod.PageMod === "function") {
      pageMod.PageMod({
        include: '*',
        attachTo: ['existing', 'top'],
        contentScriptFile: [data.url('scripts/jquery.js'), data.url('scripts/underscore.js'), data.url('scripts/backbone.js'), data.url('scripts/perfect-scrollbar.js'), data.url('scripts/jquery.mousewheel.js'), data.url('scripts/jquery.highlight.js'), data.url('scripts/raven.js'), data.url('scripts/content_page.js')],
        contentStyleFile: [data.url('styles/content_page.css')],
        contentScriptOptions: {
          'styles/toolbar.css': data.load('styles/toolbar.css')
        },
        onAttach: function(worker) {
          return _this.attachWorker(worker);
        }
      });
    }
    return this;
  };

  ChromeButton.initializeChromeListeners = function() {
    var filter,
      _this = this;
    chrome.runtime.onInstalled.addListener(function(reason) {
      _this.settings.set({
        extensionVersion: chrome.app.getDetails().version
      });
      if (reason.reason === 'update') {
        return _this.settings.save();
      }
      _this.settings.onNewInstall();
      return Analytics.getInstance().trackNewInstall();
    });
    chrome.browserAction.onClicked.addListener(function() {
      return _this.settings.toggleMozbar();
    });
    chrome.runtime.onMessage.addListener(function(request, sender, response) {
      return _this.messageReceived(request, sender, response);
    });
    filter = {
      urls: ['<all_urls>'],
      types: ['main_frame']
    };
    chrome.webRequest.onBeforeRequest.addListener(function(details) {
      return _this.beforeRequest(details);
    }, filter);
    chrome.webRequest.onHeadersReceived.addListener(function(details) {
      return _this.headersReceived(details);
    }, filter);
    chrome.webRequest.onBeforeRedirect.addListener(function(details) {
      return _this.beforeRedirect(details);
    }, filter);
    return chrome.webRequest.onCompleted.addListener(function(details) {
      return _this.completed(details);
    }, filter);
  };

  ChromeButton.initializeTab = function(id) {
    var _base;
    return (_base = this.tabs)[id] != null ? (_base = this.tabs)[id] : _base[id] = {
      tabSettings: new TabSettings,
      redirect: false
    };
  };

  ChromeButton.attachWorker = function(worker) {
    var _this = this;
    this.firefoxWorkers.push(worker);
    this.initializeTab(worker.tab.id);
    worker.on('detach', function() {
      var i, w, _i, _len, _ref, _results;
      _ref = _this.firefoxWorkers;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        w = _ref[i];
        if (w === worker) {
          _results.push(_this.firefoxWorkers.splice(i, 1));
        }
      }
      return _results;
    });
    worker.port.emit('settingsChanged', this.settings.toJSON());
    worker.port.on('settingsChanged', function(attributes) {
      return _this.settingsChanged(worker, attributes);
    });
    worker.port.on('setTabSettings', function(data) {
      return _this.setTabSettings(worker.tab.id, data);
    });
    return worker.port.on('getTabSettings', function() {
      return worker.port.emit('getTabSettings:response', _this.getTabSettings(worker.tab.id));
    });
  };

  ChromeButton.settingsChanged = function(fromWorker, attributes) {
    var worker, _i, _len, _ref, _results;
    this.settings.set(attributes);
    this.settings.save();
    _ref = this.firefoxWorkers;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      worker = _ref[_i];
      if (worker !== fromWorker) {
        _results.push(worker.port.emit('settingsChanged', attributes));
      }
    }
    return _results;
  };

  ChromeButton.render = function() {
    var _this = this;
    return typeof chrome !== "undefined" && chrome !== null ? chrome.tabs.query({}, function(tabs) {
      var tab, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = tabs.length; _i < _len; _i++) {
        tab = tabs[_i];
        _results.push(_this.renderTabId(tab.id));
      }
      return _results;
    }) : void 0;
  };

  ChromeButton.renderTabId = function(tabId) {
    var icons, isButtonOn, isMozbarOn, title, _ref, _ref1;
    isMozbarOn = this.settings.get('isMozbarOn');
    isButtonOn = this.settings.get('isButtonOn');
    icons = isButtonOn ? {
      path: this.onIcons
    } : {
      path: this.offIcons
    };
    title = 'MozBar from Moz\n(Ctrl+Shift+Alt+M)';
    if ((_ref = this.firefoxWidget) != null) {
      _ref.icon = data != null ? data.url(icons.path['19']) : void 0;
    }
    if (isButtonOn && !isMozbarOn && !_.isUndefined((_ref1 = this.tabs[tabId]) != null ? _ref1.da : void 0)) {
      icons = {
        imageData: this.getNumberIcons(this.tabs[tabId].da)
      };
      title = 'Domain Authority for this domain';
    }
    if (typeof chrome !== "undefined" && chrome !== null) {
      chrome.browserAction.setIcon(_.extend(icons, {
        tabId: tabId
      }));
    }
    return typeof chrome !== "undefined" && chrome !== null ? chrome.browserAction.setTitle({
      tabId: tabId,
      title: title
    }) : void 0;
  };

  ChromeButton.messageReceived = function(request, sender, response) {
    switch (request.type) {
      case 'status-history':
        return response(this.tabs[sender.tab.id].statuses);
      case 'setTabSettings':
        return this.setTabSettings(sender.tab.id, request.data);
      case 'getTabSettings':
        return response(this.getTabSettings(sender.tab.id));
      case 'metricsChanged':
        this.initializeTab(sender.tab.id);
        this.tabs[sender.tab.id].da = request.data.nicePda;
        return this.renderTabId(sender.tab.id);
    }
  };

  ChromeButton.beforeRequest = function(details) {
    this.initializeTab(details.tabId);
    if (!this.tabs[details.tabId].redirect) {
      return this.tabs[details.tabId].statuses = [];
    }
  };

  ChromeButton.beforeRedirect = function(details) {
    return this.tabs[details.tabId].redirect = true;
  };

  ChromeButton.headersReceived = function(details) {
    this.initializeTab(details.tabId);
    if (!this.tabs[details.tabId].redirect) {
      this.tabs[details.tabId].statuses = [];
    }
    return this.tabs[details.tabId].statuses.push({
      status: details.statusLine,
      url: details.url
    });
  };

  ChromeButton.completed = function(details) {
    this.initializeTab(details.tabId);
    return this.tabs[details.tabId].redirect = false;
  };

  ChromeButton.setTabSettings = function(id, data) {
    var _ref;
    return (_ref = this.tabs[id]) != null ? _ref.tabSettings.set(data) : void 0;
  };

  ChromeButton.getTabSettings = function(id) {
    var _ref;
    return (_ref = this.tabs[id]) != null ? _ref.tabSettings.toJSON() : void 0;
  };

  ChromeButton.getNumberIcons = function(n) {
    return {
      19: this.createNumberIcon(n, 19, 19).getContext('2d').getImageData(0, 0, 19, 19),
      38: this.createNumberIcon(n, 38, 38).getContext('2d').getImageData(0, 0, 38, 38)
    };
  };

  ChromeButton.createNumberIcon = function(n, width, height) {
    var barHeight, barWidth, barX, barY, border, canvas, context, fontSize;
    border = Math.round(height * (BAR_BORDER_PCT / 100));
    barHeight = (BAR_HEIGHT_PCT / 100) * height;
    barX = border;
    barY = height - barHeight - border;
    barWidth = width - (border * 2);
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    context = canvas.getContext('2d');
    context.fillStyle = '#4e5c5f';
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#e6e8e8';
    context.fillRect(barX, barY, barWidth, barHeight);
    context.fillStyle = '#4dbdeb';
    context.fillRect(barX, barY, barWidth * (n / 100), barHeight);
    fontSize = width === 19 ? 10 : 20;
    context.font = "bold " + fontSize + "px Open Sans, sans-serif";
    context.fillStyle = '#e6e8e8';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(n, width / 2, (height - barHeight) / 2);
    return canvas;
  };

  return ChromeButton;

})();


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/analytics.coffee":4,"./../models/browser.coffee":5,"./../models/settings.coffee":29,"./../models/tab_settings.coffee":30,"sdk/page-mod":113,"sdk/self":113,"sdk/ui":113}],42:[function(require,module,exports){
var BaseView, ButtonNotification, UrlMetrics, browserButton, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('./base_view.coffee');

template = require('./../../templates/button_notification.hbs');

browserButton = require('./browser_button.coffee');

UrlMetrics = require('./../models/url_metrics.coffee');

module.exports = ButtonNotification = (function(_super) {
  __extends(ButtonNotification, _super);

  function ButtonNotification() {
    _ref = ButtonNotification.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ButtonNotification.prototype.events = {
    'click .close': 'close'
  };

  ButtonNotification.prototype.render = function() {
    var icon, img, pda, urlMetrics;
    this.$el.html(template());
    urlMetrics = UrlMetrics.getInstance();
    pda = urlMetrics.get('nicePda');
    if (pda == null) {
      pda = 100;
    }
    img = this.$el.find('.icon')[0];
    icon = browserButton.createNumberIcon(pda, 19, 19);
    return img.src = icon.toDataURL();
  };

  ButtonNotification.prototype.close = function() {
    this.host.remove();
    return false;
  };

  return ButtonNotification;

})(BaseView);


},{"./../../templates/button_notification.hbs":82,"./../models/url_metrics.coffee":34,"./base_view.coffee":40,"./browser_button.coffee":41}],43:[function(require,module,exports){
(function (global){
var $, BaseElement, ButtonNotification, ButtonNotificationElement, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BaseElement = require('./base_element.coffee');

ButtonNotification = require('./button_notification.coffee');

module.exports = ButtonNotificationElement = (function(_super) {
  __extends(ButtonNotificationElement, _super);

  function ButtonNotificationElement() {
    _ref = ButtonNotificationElement.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ButtonNotificationElement.prototype.DISPLAY_MS = 2500;

  ButtonNotificationElement.prototype.elementCssClass = 'button-notification';

  ButtonNotificationElement.prototype.elementViewClass = ButtonNotification;

  ButtonNotificationElement.prototype.id = 'mozbar-button-notification-wGA7MhRhQ3WS';

  ButtonNotificationElement.prototype.render = function() {
    var _this = this;
    ButtonNotificationElement.__super__.render.apply(this, arguments);
    return setTimeout(function() {
      return _this.$elementRoot.closest('html, body').animate({
        opacity: 0
      }, 500, function() {
        return _this.remove();
      });
    }, this.DISPLAY_MS);
  };

  return ButtonNotificationElement;

})(BaseElement);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./base_element.coffee":38,"./button_notification.coffee":42}],44:[function(require,module,exports){
(function (global){
var $, AddressBarHighlight, Analytics, ButtonMetrics, ButtonNotificationElement, ContentPage, Dispatcher, Highlighter, KeywordDifficultyElement, MozbarElement, OnboardingDialog, OnboardingTipElement, Page, SerpAttributes, SerpElement, Settings, TooltipElement, User;

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Analytics = require('./../models/analytics.coffee');

AddressBarHighlight = require('./address_bar_highlight.coffee');

ButtonNotificationElement = require('./button_notification_element.coffee');

Dispatcher = require('./event_dispatcher.coffee');

Highlighter = require('./highlighter.coffee');

MozbarElement = require('./mozbar_element.coffee');

Page = require('./../models/page.coffee');

User = require('./../models/user.coffee');

SerpAttributes = require('./../models/serp_attributes.coffee');

SerpElement = require('./serp_element.coffee');

TooltipElement = require('./tooltip_element.coffee');

OnboardingTipElement = require('./onboarding_tip_element.coffee');

OnboardingDialog = require('./onboarding_dialog.coffee');

KeywordDifficultyElement = require('./keyword_difficulty_element.coffee');

Settings = require('./../models/settings.coffee');

ButtonMetrics = require('./../models/button_metrics.coffee');

require('./../helpers/handlebars_helpers.coffee');

require('./../helpers/handlebars_partials.coffee');

module.exports = ContentPage = (function() {
  function ContentPage() {}

  ContentPage.settings = Settings.getInstance();

  ContentPage.analytics = Analytics.getInstance();

  ContentPage.dispatcher = Dispatcher.getInstance();

  ContentPage.mozbar = null;

  ContentPage.serpItems = [];

  ContentPage.domChangedTimer = null;

  ContentPage.tooltip = new TooltipElement;

  ContentPage.onboardingTip = new OnboardingTipElement;

  ContentPage.keywordDifficulty = null;

  ContentPage.user = null;

  ContentPage.buttonMetrics = null;

  ContentPage.wasButtonOn = null;

  ContentPage.wasMozbarOn = null;

  ContentPage.initialize = function() {
    var _this = this;
    Highlighter.initialize();
    ($(document)).on('keydown', function(e) {
      return _this.keydown(e);
    });
    this.mozbarOnChanged();
    this.settings.on('change:isMozbarOn', function() {
      return _this.mozbarOnChanged();
    });
    if (Page.isSerp()) {
      document.addEventListener('DOMNodeInserted', function() {
        return _this.domNodeInserted();
      });
    }
    this.user = User.getInstance();
    this.user.on('change', function() {
      return _this.userChanged();
    });
    return this;
  };

  ContentPage.mozbarOnChanged = function() {
    var isMozbarOn;
    isMozbarOn = this.settings.get('isMozbarOn');
    if (this.wasMozbarOn == null) {
      this.wasMozbarOn = isMozbarOn;
    }
    if (this.wasMozbarOn !== isMozbarOn && !isMozbarOn) {
      setTimeout(function() {
        return (new ButtonNotificationElement).render();
      }, 200);
    }
    if (this.settings.get('isButtonOn') && !isMozbarOn) {
      if (this.buttonMetrics == null) {
        this.buttonMetrics = new ButtonMetrics();
      }
      this.buttonMetrics.fetch();
    }
    this.wasMozbarOn = isMozbarOn;
    return this.render();
  };

  ContentPage.keydown = function(e) {
    if (e.which === 77 && e.ctrlKey && e.shiftKey && e.altKey) {
      return this.settings.toggleMozbar();
    }
  };

  ContentPage.domNodeInserted = function() {
    var _this = this;
    clearTimeout(this.domChangedTimer);
    if (!this.settings.get('isMozbarOn') || Page.isBlacklisted()) {
      return;
    }
    return this.domChangedTimer = setTimeout(function() {
      _this.renderSerpItems();
      if (Page.getSerpEngine() === 'google') {
        return _this.renderKeywordDifficulty();
      }
    }, 100);
  };

  ContentPage.render = function() {
    if (this.settings.get('isButtonOn')) {
      this.analytics.trackActiveUser();
    }
    if (!this.settings.get('isMozbarOn') || Page.isBlacklisted()) {
      this.remove();
      return;
    }
    if (this.mozbar == null) {
      this.mozbar = new MozbarElement({
        id: 'mozbar-wGA7MhRhQ3WS'
      });
    }
    this.mozbar.render();
    this.addressBarHighlight = new AddressBarHighlight();
    this.onboardingDialog = new OnboardingDialog();
    if (Page.isSerp()) {
      this.renderSerpItems();
    }
    this.renderKeywordDifficulty();
    return this.analytics.trackActiveUser();
  };

  ContentPage.renderSerpItems = function() {
    var item,
      _this = this;
    this.serpItems = (function() {
      var _i, _len, _ref, _results;
      _ref = this.serpItems;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item.isInDOM()) {
          _results.push(item);
        }
      }
      return _results;
    }).call(this);
    return ($(Page.getSerpConfig().selector)).not(':has(.mozbar-serp-item-wGA7MhRhQ3WS)').each(function(i, el) {
      var model, serpElement;
      model = new SerpAttributes({
        el: el,
        position: i + 1
      });
      serpElement = new SerpElement({
        model: model
      });
      serpElement.render();
      return _this.serpItems.push(serpElement);
    });
  };

  ContentPage.renderKeywordDifficulty = function() {
    if (!this.settings.get('isMozbarOn')) {
      return;
    }
    if (Page.getSerpEngine() !== 'google') {
      return;
    }
    if (this.keywordDifficulty == null) {
      this.keywordDifficulty = new KeywordDifficultyElement;
    }
    if (this.keywordDifficulty.isInDOM()) {
      return;
    }
    if (!this.keywordDifficulty.parentElement().length) {
      return;
    }
    return this.keywordDifficulty.render();
  };

  ContentPage.userChanged = function() {
    var _ref;
    if (this.user.get('isPro')) {
      return this.renderKeywordDifficulty();
    } else {
      return (_ref = this.keywordDifficulty) != null ? _ref.remove() : void 0;
    }
  };

  ContentPage.remove = function() {
    var item, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4;
    if ((_ref = this.mozbar) != null) {
      _ref.remove();
    }
    this.mozbar = null;
    _ref1 = this.serpItems;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      item = _ref1[_i];
      item.remove();
    }
    this.serpItems = [];
    if ((_ref2 = this.keywordDifficulty) != null) {
      _ref2.remove();
    }
    if ((_ref3 = this.addressBarHighlight) != null) {
      _ref3.remove();
    }
    return (_ref4 = this.onboardingDialog) != null ? _ref4.remove() : void 0;
  };

  return ContentPage;

})();


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../helpers/handlebars_helpers.coffee":2,"./../helpers/handlebars_partials.coffee":3,"./../models/analytics.coffee":4,"./../models/button_metrics.coffee":6,"./../models/page.coffee":18,"./../models/serp_attributes.coffee":26,"./../models/settings.coffee":29,"./../models/user.coffee":35,"./address_bar_highlight.coffee":36,"./button_notification_element.coffee":43,"./event_dispatcher.coffee":45,"./highlighter.coffee":48,"./keyword_difficulty_element.coffee":53,"./mozbar_element.coffee":55,"./onboarding_dialog.coffee":56,"./onboarding_tip_element.coffee":58,"./serp_element.coffee":70,"./tooltip_element.coffee":78}],45:[function(require,module,exports){
(function (global){
var Backbone, EventDispatcher, _;

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

module.exports = EventDispatcher = (function() {
  function EventDispatcher() {}

  EventDispatcher.eventDispatcher = null;

  EventDispatcher.getInstance = function() {
    return this.eventDispatcher != null ? this.eventDispatcher : this.eventDispatcher = new EventDispatcher();
  };

  _.extend(EventDispatcher.prototype, Backbone.Events);

  return EventDispatcher;

})();


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],46:[function(require,module,exports){
var BaseDialog, HelpDialog, HelpView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

HelpView = require('./help_view.coffee');

BaseDialog = require('./base_dialog.coffee');

module.exports = HelpDialog = (function(_super) {
  __extends(HelpDialog, _super);

  function HelpDialog() {
    _ref = HelpDialog.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  HelpDialog.prototype.elementCssClass = 'dialog help-dialog';

  HelpDialog.prototype.elementViewClass = HelpView;

  HelpDialog.prototype.overlay = null;

  HelpDialog.prototype.id = 'mozbar-help-dialog-wGA7MhRhQ3WS';

  HelpDialog.prototype.render = function() {
    HelpDialog.__super__.render.apply(this, arguments);
    return this.$el.css({
      top: this.options.top,
      bottom: this.options.bottom,
      left: this.options.left - this.$el.width() + 20
    });
  };

  return HelpDialog;

})(BaseDialog);


},{"./base_dialog.coffee":37,"./help_view.coffee":47}],47:[function(require,module,exports){
(function (global){
var $, Analytics, BaseView, HelpView, Onboarding, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Analytics = require('./../models/analytics.coffee');

BaseView = require('./base_view.coffee');

Onboarding = require('./../models/onboarding.coffee');

template = require('./../../templates/help_dialog.hbs');

module.exports = HelpView = (function(_super) {
  __extends(HelpView, _super);

  function HelpView() {
    _ref = HelpView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  HelpView.prototype.events = {
    'click .tour': 'showTour'
  };

  HelpView.prototype.render = function() {
    this.$el.html(template);
    return ($('#mozbar-help-dialog-wGA7MhRhQ3WS')).hide().slideDown('fast');
  };

  HelpView.prototype.showTour = function() {
    this.close();
    Onboarding.getInstance().restart();
    return Analytics.getInstance().trackInitiateOnboarding();
  };

  HelpView.prototype.close = function() {
    this.host.remove();
    return false;
  };

  HelpView.prototype.remove = function(callback) {
    var _this = this;
    return ($('#mozbar-help-dialog-wGA7MhRhQ3WS')).slideUp('fast', function() {
      HelpView.__super__.remove.apply(_this, arguments);
      return callback != null ? callback.apply(_this) : void 0;
    });
  };

  return HelpView;

})(BaseView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/help_dialog.hbs":83,"./../models/analytics.coffee":4,"./../models/onboarding.coffee":16,"./base_view.coffee":40}],48:[function(require,module,exports){
(function (global){
var $, Dispatcher, Highlighter;

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Dispatcher = require('./event_dispatcher.coffee');

module.exports = Highlighter = (function() {
  function Highlighter() {}

  Highlighter.dispatcher = Dispatcher.getInstance();

  Highlighter.highlightOpts = {
    className: 'mozbar-highlight-keyword-wGA7MhRhQ3WS'
  };

  Highlighter.initialize = function() {
    var _this = this;
    this.dispatcher.on('highlight-links:change', function(type, isOn) {
      return _this.highlightLinksChange(type, isOn);
    });
    return this.dispatcher.on('highlight-keyword:change', function(keyword) {
      return _this.highlightKeyword(keyword);
    });
  };

  Highlighter.highlightLinksChange = function(type, isOn) {
    if (isOn) {
      return this.highlight(type);
    } else {
      return this.unhighlight(type);
    }
  };

  Highlighter.highlight = function(type) {
    if (type !== 'keyword') {
      return this.getElements(type).addClass("mozbar-highlight-" + type + "-wGA7MhRhQ3WS");
    }
  };

  Highlighter.unhighlight = function(type) {
    if (type === 'keyword') {
      return this.unhighlightKeyword();
    } else {
      return this.getElements(type).removeClass("mozbar-highlight-" + type + "-wGA7MhRhQ3WS");
    }
  };

  Highlighter.getElements = function(type) {
    var links;
    links = [];
    switch (type) {
      case 'followed':
        links = this.hasMetaNoFollow() ? $() : $('a:not([rel*=follow])');
        break;
      case 'no-followed':
        links = this.hasMetaNoFollow() ? $('a') : $('a[rel*=nofollow]');
        break;
      case 'external':
        links = ($('a[href^="http"]')).not("a[href*='" + document.location.host + "']");
        break;
      case 'internal':
        links = ($("a[href*='" + document.location.host + "']")).add('a:not([href^="http"])');
    }
    return links;
  };

  Highlighter.hasMetaNoFollow = function() {
    var meta;
    meta = ($('meta[name]')).filter(function() {
      return this.name.toLowerCase() === 'robots' && this.content.toLowerCase().indexOf('nofollow') > -1;
    });
    return meta.length > 0;
  };

  Highlighter.highlightKeyword = function(keyword) {
    this.unhighlightKeyword();
    ($('body')).highlight(keyword, this.highlightOpts);
    return ($('#mozbar-wGA7MhRhQ3WS')).unhighlight(this.highlightOpts);
  };

  Highlighter.unhighlightKeyword = function() {
    return ($('body')).unhighlight(this.highlightOpts);
  };

  return Highlighter;

})();


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./event_dispatcher.coffee":45}],49:[function(require,module,exports){
(function (global){
var BasePanelTab, HttpStatus, View, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null).View;

BasePanelTab = require('./base_panel_tab.coffee');

template = require('./../../templates/http_status_tab.hbs');

module.exports = HttpStatus = (function(_super) {
  __extends(HttpStatus, _super);

  function HttpStatus() {
    _ref = HttpStatus.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  HttpStatus.prototype.template = template;

  return HttpStatus;

})(BasePanelTab);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/http_status_tab.hbs":84,"./base_panel_tab.coffee":39}],50:[function(require,module,exports){
var BasePanelTab, InboundLinks, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BasePanelTab = require('./base_panel_tab.coffee');

template = require('./../../templates/inbound_links.hbs');

module.exports = InboundLinks = (function(_super) {
  __extends(InboundLinks, _super);

  function InboundLinks() {
    _ref = InboundLinks.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  InboundLinks.prototype.className = 'inbound-links';

  InboundLinks.prototype.template = template;

  return InboundLinks;

})(BasePanelTab);


},{"./../../templates/inbound_links.hbs":85,"./base_panel_tab.coffee":39}],51:[function(require,module,exports){
(function (global){
var $, Analytics, Browser, HttpStatus, HttpStatusList, InboundLinks, InfoPanel, PageAttributes, PageAttributesModel, PageElements, PageElementsModel, PanelView, Semantics, SemanticsModel, UrlMetrics, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Analytics = require('./../models/analytics.coffee');

Browser = require('./../models/browser.coffee');

PanelView = require('./panel_view.coffee');

PageAttributes = require('./page_attributes.coffee');

PageElements = require('./page_elements.coffee');

HttpStatus = require('./http_status.coffee');

HttpStatusList = require('./../models/http_status_list.coffee');

InboundLinks = require('./inbound_links.coffee');

Semantics = require('./semantics.coffee');

PageElementsModel = require('./../models/page_elements.coffee');

PageAttributesModel = require('./../models/page_attributes.coffee');

UrlMetrics = require('./../models/url_metrics.coffee');

SemanticsModel = require('./../models/semantics.coffee');

template = require('./../../templates/info_panel.hbs');

module.exports = InfoPanel = (function(_super) {
  __extends(InfoPanel, _super);

  function InfoPanel() {
    _ref = InfoPanel.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  InfoPanel.prototype.PANEL_HEIGHT = 350;

  InfoPanel.prototype.EXPANDED_PANEL_MARGIN = 50;

  InfoPanel.prototype.className = 'info-panel';

  InfoPanel.prototype.analytics = Analytics.getInstance();

  InfoPanel.prototype.isFullScreen = false;

  InfoPanel.prototype.selectedTab = 'page-elements';

  InfoPanel.prototype.tabs = {};

  InfoPanel.prototype.tableHeight = 0;

  InfoPanel.prototype.events = {
    'click .tabs li': 'tabClicked',
    'click .expand': 'toggleFullScreen',
    'mousedown .gutter': 'startDrag'
  };

  InfoPanel.prototype.initialize = function(options) {
    var k, tab, _ref1, _results;
    InfoPanel.__super__.initialize.apply(this, arguments);
    this.tabs = {
      'page-elements': new PageElements({
        model: new PageElementsModel
      }),
      'general-attributes': new PageAttributes({
        model: new PageAttributesModel
      }),
      'inbound-links': new InboundLinks({
        model: UrlMetrics.getInstance()
      }),
      'semantics': new Semantics({
        model: new SemanticsModel
      }),
      'http-status': new HttpStatus({
        model: new HttpStatusList
      })
    };
    this.listenTo(this.model, 'change', this.render);
    _ref1 = this.tabs;
    _results = [];
    for (k in _ref1) {
      tab = _ref1[k];
      _results.push(this.listenTo(tab.model, 'change sync', this.render));
    }
    return _results;
  };

  InfoPanel.prototype.tabClicked = function(event) {
    this.selectedTab = ($(event.currentTarget)).data('tab');
    this.trackPanelView();
    return this.render();
  };

  InfoPanel.prototype.trackPanelView = function() {
    return this.analytics.trackPanelView(this.selectedTab);
  };

  InfoPanel.prototype.render = function() {
    var _ref1, _ref2;
    if (!this.isOpen) {
      return;
    }
    if (!this.model.isValid()) {
      this.model.fetch();
    }
    this.$el.html(template((_ref1 = this.model.at(0)) != null ? _ref1.toJSON() : void 0));
    this.$el.find(".tabs li[data-tab=" + this.selectedTab + "]").addClass('active');
    if (Browser.browserName() === 'firefox') {
      this.$el.find('li[data-tab="http-status"]').hide();
    }
    this.tabs[this.selectedTab].setElement(this.$el.find('.tab'));
    this.tabs[this.selectedTab].render();
    if (!this.tableHeight) {
      this.tableHeight = (_ref2 = this.tabs[this.selectedTab]) != null ? _ref2.getTableHeight() : void 0;
    }
    this.tabs[this.selectedTab].setTableHeight(this.tableHeight);
    return this.$el.find('.scrollable').perfectScrollbar();
  };

  InfoPanel.prototype.open = function(complete) {
    InfoPanel.__super__.open.apply(this, arguments);
    return this.render();
  };

  InfoPanel.prototype.toggleFullScreen = function() {
    var $tbody, change, newHeight,
      _this = this;
    this.isFullScreen = !this.isFullScreen;
    newHeight = this.isFullScreen ? ($(window)).innerHeight() - this.EXPANDED_PANEL_MARGIN : this.PANEL_HEIGHT;
    change = (this.$el.height() - newHeight).toString();
    change = change.replace(/-/, '+=').replace(/^\d/, '-=$&');
    $tbody = this.$el.find('table tbody');
    $tbody.animate({
      height: change
    }, this.host.PANEL_SWING_DURATION, 'swing', function() {
      return _this.tabs[_this.selectedTab].setTableHeight($tbody.height());
    });
    return this.updatePanelHeight(newHeight);
  };

  InfoPanel.prototype.startDrag = function(e) {
    var $documents, startingHeight, startingTableHeight, startingY,
      _this = this;
    startingHeight = this.$el.height();
    startingTableHeight = this.tabs[this.selectedTab].getTableHeight();
    startingY = e.pageY;
    $documents = ($(document)).add(($('#mozbar-wGA7MhRhQ3WS')).contents());
    return $documents.on('mousemove', function(e) {
      var delta;
      delta = e.pageY - startingY;
      _this.$el.height(startingHeight + delta);
      _this.tabs[_this.selectedTab].setTableHeight(startingTableHeight + delta);
      _this.host.setPanelHeight(startingHeight + delta);
      return $documents.on('mouseup', function(e) {
        return $documents.off('mousemove');
      });
    });
  };

  return InfoPanel;

})(PanelView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/info_panel.hbs":86,"./../models/analytics.coffee":4,"./../models/browser.coffee":5,"./../models/http_status_list.coffee":13,"./../models/page_attributes.coffee":19,"./../models/page_elements.coffee":21,"./../models/semantics.coffee":25,"./../models/url_metrics.coffee":34,"./http_status.coffee":49,"./inbound_links.coffee":50,"./page_attributes.coffee":61,"./page_elements.coffee":62,"./panel_view.coffee":64,"./semantics.coffee":69}],52:[function(require,module,exports){
(function (global){
var $, Analytics, BaseView, Dispatcher, KeywordDifficulty, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Analytics = require('./../models/analytics.coffee');

Dispatcher = require('./event_dispatcher.coffee');

BaseView = require('./base_view.coffee');

template = require('./../../templates/keyword_difficulty.hbs');

module.exports = KeywordDifficulty = (function(_super) {
  __extends(KeywordDifficulty, _super);

  function KeywordDifficulty() {
    _ref = KeywordDifficulty.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  KeywordDifficulty.prototype.analytics = Analytics.getInstance();

  KeywordDifficulty.prototype.events = {
    'click .activate-keyword-difficulty': 'showDifficulty'
  };

  KeywordDifficulty.prototype.initialize = function(options) {
    var _this = this;
    KeywordDifficulty.__super__.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change', this.render);
    return ($(window)).on('hashchange', function() {
      return _this.model.reset();
    });
  };

  KeywordDifficulty.prototype.render = function() {
    var _this = this;
    this.$el.html(template(this.model.toJSON()));
    this.$el.find('.logged-out').click(function() {
      return _this.analytics.trackEvent('KWD/Trial CTA Clicked');
    });
    return KeywordDifficulty.__super__.render.apply(this, arguments);
  };

  KeywordDifficulty.prototype.showDifficulty = function() {
    this.hideTooltip();
    this.model.fetch();
    return this.analytics.trackKeywordDifficulty();
  };

  return KeywordDifficulty;

})(BaseView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/keyword_difficulty.hbs":87,"./../models/analytics.coffee":4,"./base_view.coffee":40,"./event_dispatcher.coffee":45}],53:[function(require,module,exports){
(function (global){
var $, BaseElement, KeywordDifficulty, KeywordDifficultyElement, KeywordDifficultyModel, Page, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BaseElement = require('./base_element.coffee');

template = require('./../../templates/keyword_difficulty.hbs');

KeywordDifficulty = require('./keyword_difficulty.coffee');

KeywordDifficultyModel = require('./../models/keyword_difficulty.coffee');

Page = require('./../models/page.coffee');

module.exports = KeywordDifficultyElement = (function(_super) {
  __extends(KeywordDifficultyElement, _super);

  function KeywordDifficultyElement() {
    _ref = KeywordDifficultyElement.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  KeywordDifficultyElement.prototype.id = 'mozbar-keyword-difficulty-wGA7MhRhQ3WS';

  KeywordDifficultyElement.prototype.elementTemplate = template;

  KeywordDifficultyElement.prototype.elementCssClass = 'keyword-difficulty';

  KeywordDifficultyElement.prototype.elementViewClass = KeywordDifficulty;

  KeywordDifficultyElement.prototype.elementViewModel = new KeywordDifficultyModel;

  KeywordDifficultyElement.prototype.parentElement = function() {
    return $(Page.getSerpConfig().searchBox);
  };

  KeywordDifficultyElement.prototype.addToDOM = function() {
    this.parentElement().css({
      width: 190,
      position: 'relative'
    });
    return this.$el.appendTo(this.parentElement());
  };

  return KeywordDifficultyElement;

})(BaseElement);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/keyword_difficulty.hbs":87,"./../models/keyword_difficulty.coffee":14,"./../models/page.coffee":18,"./base_element.coffee":38,"./keyword_difficulty.coffee":52}],54:[function(require,module,exports){
(function (global){
var $, Analytics, Dispatcher, LinksPanel, PanelView, linksPanel, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Analytics = require('./../models/analytics.coffee');

PanelView = require('./panel_view.coffee');

linksPanel = require('./../../templates/links_panel.hbs');

Dispatcher = require('./event_dispatcher.coffee');

module.exports = LinksPanel = (function(_super) {
  __extends(LinksPanel, _super);

  function LinksPanel() {
    _ref = LinksPanel.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  LinksPanel.prototype.PANEL_HEIGHT = 50;

  LinksPanel.prototype.analytics = Analytics.getInstance();

  LinksPanel.prototype.dispatcher = Dispatcher.getInstance();

  LinksPanel.prototype.isOpen = false;

  LinksPanel.prototype.el = linksPanel();

  LinksPanel.prototype.events = {
    'click .link-type': 'toggleHighlight',
    'keyup .search input': 'highlightKeyword'
  };

  LinksPanel.prototype.initialize = function(options) {
    LinksPanel.__super__.initialize.apply(this, arguments);
    return this.listenTo(this.model, 'change', this.updateFromTabSettings);
  };

  LinksPanel.prototype.updateFromTabSettings = function() {
    var $keywordEl, keyword, links, type, _i, _len;
    links = this.model.get('highlightLinks') || [];
    for (_i = 0, _len = links.length; _i < _len; _i++) {
      type = links[_i];
      this.toggleState(type, true);
    }
    $keywordEl = this.$el.find('.search input');
    keyword = this.model.get('highlightKeyword');
    if ($keywordEl.val() === '' && keyword !== '') {
      $keywordEl.val(keyword);
      if (links.indexOf('keyword') > -1) {
        return this.highlightKeyword();
      }
    }
  };

  LinksPanel.prototype.toggleHighlight = function(e) {
    var $input, $target, isOn, type;
    $target = $(e.currentTarget);
    type = $target.data('type');
    isOn = !$target.hasClass('active');
    this.toggleState(type, isOn);
    this.model.toggleHighlightLink(type, isOn);
    this.model.save();
    if (isOn && type === 'keyword') {
      $input = this.$el.find('.search input');
      if ($input.val() === '') {
        $input.focus();
      }
      return this.highlightKeyword();
    }
  };

  LinksPanel.prototype.toggleState = function(type, isOn) {
    this.$el.find(".link-type." + type).toggleClass('active', isOn);
    return this.dispatcher.trigger('highlight-links:change', type, isOn);
  };

  LinksPanel.prototype.highlightKeyword = function() {
    var isOn, keyword;
    isOn = this.$el.find('.link-type.keyword').hasClass('active');
    if (!isOn) {
      this.toggleState('keyword', true);
    }
    keyword = this.$el.find('.search input').val();
    this.dispatcher.trigger('highlight-keyword:change', keyword);
    this.model.toggleHighlightLink('keyword', isOn);
    this.model.set('highlightKeyword', keyword);
    return this.model.save();
  };

  LinksPanel.prototype.trackPanelView = function() {
    return this.analytics.trackPanelView('links-panel');
  };

  LinksPanel.prototype.getLinkTypes = function() {
    return this.$el.find('.link-type').map(function() {
      return ($(this)).attr('data-type');
    });
  };

  return LinksPanel;

})(PanelView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/links_panel.hbs":88,"./../models/analytics.coffee":4,"./event_dispatcher.coffee":45,"./panel_view.coffee":64}],55:[function(require,module,exports){
(function (global){
var $, BaseElement, HelpDialog, MozbarElement, ProfilesDropDown, SettingsDialog, Toolbar, User, toolbarTemplate, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BaseElement = require('./base_element.coffee');

ProfilesDropDown = require('./profiles_drop_down.coffee');

SettingsDialog = require('./settings_dialog.coffee');

HelpDialog = require('./help_dialog.coffee');

Toolbar = require('./toolbar.coffee');

toolbarTemplate = require('./../../templates/toolbar.hbs');

User = require('./../models/user.coffee');

module.exports = MozbarElement = (function(_super) {
  __extends(MozbarElement, _super);

  function MozbarElement() {
    _ref = MozbarElement.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  MozbarElement.prototype.TOOLBAR_HEIGHT = 43;

  MozbarElement.prototype.PANEL_SWING_DURATION = 300;

  MozbarElement.prototype.elementViewClass = Toolbar;

  MozbarElement.prototype.elementTemplate = toolbarTemplate;

  MozbarElement.prototype.profilesDropDown = null;

  MozbarElement.prototype.profilesDialog = null;

  MozbarElement.prototype.settingsDialog = null;

  MozbarElement.prototype.helpDialog = null;

  MozbarElement.prototype.user = null;

  MozbarElement.prototype.topElements = null;

  MozbarElement.prototype.initialize = function() {
    var _this = this;
    MozbarElement.__super__.initialize.apply(this, arguments);
    this.settings.on('change:isDockedOnBottom', function() {
      return _this.toggleDockPosition();
    });
    this.user = User.getInstance();
    return this.listenTo(this.user, 'change:isPro', this.render);
  };

  MozbarElement.prototype.render = function() {
    var isDockedOnBottom,
      _this = this;
    MozbarElement.__super__.render.apply(this, arguments);
    isDockedOnBottom = this.settings.get('isDockedOnBottom');
    this.$el.toggleClass('bottom', isDockedOnBottom);
    if (!isDockedOnBottom) {
      ($('body')).addClass('mozbar-margin-wGA7MhRhQ3WS');
      return setTimeout(function() {
        return _this.updateFixedTop(_this.TOOLBAR_HEIGHT);
      }, 20);
    }
  };

  MozbarElement.prototype.templateOptions = function() {
    return {
      user: User.getInstance()
    };
  };

  MozbarElement.prototype.setElementRoot = function() {
    MozbarElement.__super__.setElementRoot.apply(this, arguments);
    return this.updatePanelOrder();
  };

  MozbarElement.prototype.updateFixedTop = function(height) {
    if (this.topElements == null) {
      this.topElements = ($('body *')).filter(function() {
        var style;
        style = window.getComputedStyle(this);
        return style.position === 'fixed' && style.top === '0px' && !/^mozbar/.test(this.id);
      });
    }
    return this.topElements.each(function() {
      return this.style.setProperty('top', "" + height + "px", 'important');
    });
  };

  MozbarElement.prototype.updatePanelHeight = function(panelHeight, complete) {
    var newHeight;
    newHeight = this.calculateMobarHeight(panelHeight);
    if (this.$el.height() === newHeight) {
      if (complete != null) {
        complete.apply(this.el);
      }
      return;
    }
    ($('.mozbar-margin-wGA7MhRhQ3WS')).animate({
      'margin-top': newHeight
    }, this.PANEL_SWING_DURATION);
    return this.$el.animate({
      height: newHeight
    }, this.PANEL_SWING_DURATION, 'swing', complete);
  };

  MozbarElement.prototype.setPanelHeight = function(panelHeight) {
    var newHeight;
    newHeight = this.calculateMobarHeight(panelHeight);
    ($('.mozbar-margin-wGA7MhRhQ3WS')).css({
      'margin-top': newHeight
    });
    return this.$el.height(newHeight);
  };

  MozbarElement.prototype.calculateMobarHeight = function(panelHeight) {
    return panelHeight + this.elementView.toolbarHeight();
  };

  MozbarElement.prototype.toggleProfilesDropDown = function(options) {
    var _ref1;
    if ((_ref1 = this.profilesDropDown) != null ? _ref1.isInDOM() : void 0) {
      this.profilesDropDown.remove();
      this.profilesDropDown = null;
      return;
    }
    this.profilesDropDown = new ProfilesDropDown(options);
    return this.profilesDropDown.render();
  };

  MozbarElement.prototype.toggleSettingsDialog = function(options) {
    var _ref1;
    if ((_ref1 = this.settingsDialog) != null ? _ref1.isInDOM() : void 0) {
      this.settingsDialog.remove();
      this.settingsDialog = null;
      return;
    }
    this.settingsDialog = new SettingsDialog(options);
    return this.settingsDialog.render();
  };

  MozbarElement.prototype.toggleHelpDialog = function(options) {
    var _ref1;
    if ((_ref1 = this.helpDialog) != null ? _ref1.isInDOM() : void 0) {
      this.helpDialog.remove();
      this.helpDialog = null;
      return;
    }
    this.helpDialog = new HelpDialog(options);
    return this.helpDialog.render();
  };

  MozbarElement.prototype.toggleDockPosition = function() {
    var isDockedOnBottom, margin, top,
      _this = this;
    isDockedOnBottom = this.settings.get('isDockedOnBottom');
    if (isDockedOnBottom) {
      top = ($(window)).height() - this.TOOLBAR_HEIGHT;
      margin = 0;
    } else {
      top = 0;
      margin = this.TOOLBAR_HEIGHT;
    }
    return this.elementView.closeAllPanels(function() {
      _this.$el.css({
        top: _this.$el.position().top,
        bottom: 'auto'
      }).animate({
        top: top
      }, function() {
        return _this.$el.css({
          top: '',
          bottom: ''
        }).toggleClass('bottom', isDockedOnBottom);
      });
      ($('body')).animate({
        'margin-top': margin
      }, function() {
        ($('body')).css('margin-top', '').toggleClass('mozbar-margin-wGA7MhRhQ3WS', !isDockedOnBottom);
        return _this.updateFixedTop(0);
      });
      return _this.updatePanelOrder();
    });
  };

  MozbarElement.prototype.updatePanelOrder = function() {
    if (this.settings.get('isDockedOnBottom')) {
      return this.$elementRoot.find('.toolbar').before(this.$elementRoot.find('.panel'));
    } else {
      return this.$elementRoot.find('.toolbar').after(this.$elementRoot.find('.panel'));
    }
  };

  MozbarElement.prototype.remove = function() {
    ($('body')).removeClass('mozbar-margin-wGA7MhRhQ3WS').css({
      'margin-top': ''
    });
    this.updateFixedTop(0);
    return MozbarElement.__super__.remove.apply(this, arguments);
  };

  return MozbarElement;

})(BaseElement);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/toolbar.hbs":110,"./../models/user.coffee":35,"./base_element.coffee":38,"./help_dialog.coffee":46,"./profiles_drop_down.coffee":67,"./settings_dialog.coffee":73,"./toolbar.coffee":76}],56:[function(require,module,exports){
(function (global){
var $, BaseDialog, OnboardingDialog, OnboardingModel, OnbordingView, Page, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BaseDialog = require('./base_dialog.coffee');

OnbordingView = require('./onboarding_view.coffee');

OnboardingModel = require('./../models/onboarding.coffee');

Page = require('./../models/page.coffee');

module.exports = OnboardingDialog = (function(_super) {
  __extends(OnboardingDialog, _super);

  function OnboardingDialog() {
    _ref = OnboardingDialog.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  OnboardingDialog.prototype.elementCssClass = 'dialog onboarding-dialog';

  OnboardingDialog.prototype.elementViewClass = OnbordingView;

  OnboardingDialog.prototype.id = 'mozbar-onboarding-dialog-wGA7MhRhQ3WS';

  OnboardingDialog.prototype.initialize = function() {
    var _this = this;
    OnboardingDialog.__super__.initialize.apply(this, arguments);
    this.model = this.elementViewModel = OnboardingModel.getInstance();
    this.model.on('change:pageStep change:serpStep', function() {
      return _this.onboardingStepChanged();
    });
    this.model.fetch();
    return this.render();
  };

  OnboardingDialog.prototype.render = function() {
    if (!this.isInOnboarding()) {
      return this.remove();
    }
    OnboardingDialog.__super__.render.apply(this, arguments);
    return this.onboardingStepChanged();
  };

  OnboardingDialog.prototype.isInOnboarding = function() {
    var setting, step;
    setting = Page.isSerp() ? 'serpStep' : 'pageStep';
    step = this.model.get(setting);
    return step !== 'legacy-user' && step !== 'closed' && step !== 'complete';
  };

  OnboardingDialog.prototype.onboardingStepChanged = function() {
    var setting, step;
    setting = Page.isSerp() ? 'serpStep' : 'pageStep';
    step = this.model.get(setting);
    this.$el.css({
      top: '',
      right: ''
    });
    switch (step) {
      case 'page-hotspots-intro':
      case 'serp-hotspots-intro':
        this.show();
        return this.overlay.setOpacity(0);
      case 'page-hotspots':
      case 'serp-hotspots':
        this.overlay.$el.hide();
        return this.$el.css({
          top: ($(window)).height() - 100,
          right: -80
        });
      case 'legacy-user':
      case 'closed':
      case 'complete':
        return this.remove();
      default:
        return this.show();
    }
  };

  OnboardingDialog.prototype.hide = function() {
    this.$el.hide();
    return this.overlay.$el.hide();
  };

  OnboardingDialog.prototype.show = function() {
    if (!this.isInDOM()) {
      return this.render();
    }
    this.$el.css({
      top: '',
      left: ''
    });
    this.$el.show();
    return this.overlay.$el.show();
  };

  OnboardingDialog.prototype.overlayClicked = function() {
    return this.model.nextStep();
  };

  OnboardingDialog.prototype.frameLoaded = function() {
    var isHidden;
    isHidden = this.$el.is(':hidden');
    OnboardingDialog.__super__.frameLoaded.apply(this, arguments);
    if (isHidden) {
      return this.hide();
    }
  };

  return OnboardingDialog;

})(BaseDialog);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/onboarding.coffee":16,"./../models/page.coffee":18,"./base_dialog.coffee":37,"./onboarding_view.coffee":59}],57:[function(require,module,exports){
var BaseView, OnboardingTip, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('./base_view.coffee');

template = require('./../../templates/onboarding_tip.hbs');

module.exports = OnboardingTip = (function(_super) {
  __extends(OnboardingTip, _super);

  function OnboardingTip() {
    _ref = OnboardingTip.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  OnboardingTip.prototype.initialize = function(opts) {
    OnboardingTip.__super__.initialize.apply(this, arguments);
    return this.listenTo(this.model, 'change', this.render);
  };

  OnboardingTip.prototype.render = function() {
    return this.$el.html(template(this.model.toJSON()));
  };

  return OnboardingTip;

})(BaseView);


},{"./../../templates/onboarding_tip.hbs":90,"./base_view.coffee":40}],58:[function(require,module,exports){
(function (global){
var $, BaseElement, Dispatcher, OnboardingTip, OnboardingTipElement, OnboardingTipModel, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BaseElement = require('./base_element.coffee');

Dispatcher = require('./event_dispatcher.coffee');

OnboardingTip = require('./onboarding_tip.coffee');

OnboardingTipModel = require('./../models/onboarding_tip.coffee');

module.exports = OnboardingTipElement = (function(_super) {
  __extends(OnboardingTipElement, _super);

  function OnboardingTipElement() {
    _ref = OnboardingTipElement.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  OnboardingTipElement.prototype.ONBOARDING_TIP_WIDTH = 610;

  OnboardingTipElement.prototype.ONBOARDING_TIP_HEIGHT = 210;

  OnboardingTipElement.prototype.dispatcher = Dispatcher.getInstance();

  OnboardingTipElement.prototype.elementCssClass = 'onboarding-tip';

  OnboardingTipElement.prototype.elementViewClass = OnboardingTip;

  OnboardingTipElement.prototype.elementViewModel = new OnboardingTipModel;

  OnboardingTipElement.prototype.top = 0;

  OnboardingTipElement.prototype.left = 0;

  OnboardingTipElement.prototype.id = 'mozbar-onboarding-tip-wGA7MhRhQ3WS';

  OnboardingTipElement.prototype.initialize = function() {
    OnboardingTipElement.__super__.initialize.apply(this, arguments);
    this.listenTo(this.dispatcher, 'onboarding:show-highlight', this.show);
    return this.listenTo(this.dispatcher, 'tooltip:hide', this.tooltipHide);
  };

  OnboardingTipElement.prototype.show = function(opts) {
    var _this = this;
    this.elementViewModel.set(opts);
    this.top = opts.top;
    if (opts.placement === 'above') {
      this.top -= this.ONBOARDING_TIP_HEIGHT;
    }
    this.left = opts.left;
    this.render();
    this.$el.show();
    this.updatePosition();
    this.hideReceived = false;
    clearTimeout(this.timeout);
    return this.timeout = setTimeout((function() {
      return _this.timeoutExpired();
    }), 2000);
  };

  OnboardingTipElement.prototype.renderShadow = function(shadow, css) {
    OnboardingTipElement.__super__.renderShadow.apply(this, arguments);
    return this.updatePosition();
  };

  OnboardingTipElement.prototype.updatePosition = function() {
    return this.$el.css({
      top: this.top,
      left: this.left - this.$el.width() / 2
    });
  };

  OnboardingTipElement.prototype.tooltipHide = function() {
    this.hideReceived = true;
    if (!this.timeout) {
      return this.hide();
    }
  };

  OnboardingTipElement.prototype.timeoutExpired = function() {
    this.timeout = null;
    if (this.hideReceived) {
      return this.hide();
    }
  };

  OnboardingTipElement.prototype.hide = function() {
    var _this = this;
    clearTimeout(this.timeout);
    return this.$el.fadeOut('fast', function() {
      return _this.dispatcher.trigger('onboarding:hide-highlight');
    });
  };

  return OnboardingTipElement;

})(BaseElement);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/onboarding_tip.coffee":17,"./base_element.coffee":38,"./event_dispatcher.coffee":45,"./onboarding_tip.coffee":57}],59:[function(require,module,exports){
(function (global){
var $, Analytics, BaseView, Dispatcher, OnboardingView, Page, Settings, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Analytics = require('./../models/analytics.coffee');

BaseView = require('./base_view.coffee');

Page = require('./../models/page.coffee');

Settings = require('./../models/settings.coffee');

template = require('./../../templates/onboarding_dialog.hbs');

Dispatcher = require('./event_dispatcher.coffee');

module.exports = OnboardingView = (function(_super) {
  __extends(OnboardingView, _super);

  function OnboardingView() {
    _ref = OnboardingView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  OnboardingView.prototype.events = {
    'click .close': 'close',
    'click .next-step': 'nextStep',
    'click .content': 'contentClicked',
    'click': 'nextStep'
  };

  OnboardingView.prototype.render = function() {
    this.analytics = Analytics.getInstance();
    this.dispatcher = Dispatcher.getInstance();
    this.settings = Settings.getInstance();
    this.listenTo(this.model, 'change:pageStep change:serpStep', this.updateStep);
    this.$el.html(template);
    this.updateStep();
    return ($('#mozbar-onboarding-dialog-wGA7MhRhQ3WS')).hide().fadeIn('fast');
  };

  OnboardingView.prototype.updateStep = function() {
    var setting, step;
    setting = Page.isSerp() ? 'serpStep' : 'pageStep';
    step = this.model.get(setting);
    if (this.host.isInDOM()) {
      this.$el.find('.content').hide();
      this.$el.find("." + step).show();
    }
    return false;
  };

  OnboardingView.prototype.nextStep = function() {
    this.model.nextStep();
    return false;
  };

  OnboardingView.prototype.contentClicked = function(e) {
    if (e.target.href && e.target.href !== '#') {
      top.window.location.href = e.target.href;
    }
    return false;
  };

  OnboardingView.prototype.remove = function(callback) {
    var _this = this;
    this.stopListening(this.settings);
    this.stopListening(this.dispatcher);
    return ($('#mozbar-onboarding-dialog-wGA7MhRhQ3WS')).fadeOut('fast', function() {
      OnboardingView.__super__.remove.apply(_this, arguments);
      return callback != null ? callback.apply(_this) : void 0;
    });
  };

  OnboardingView.prototype.close = function() {
    this.model.close();
    this.analytics.trackCloseOnboarding();
    return false;
  };

  return OnboardingView;

})(BaseView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/onboarding_dialog.hbs":89,"./../models/analytics.coffee":4,"./../models/page.coffee":18,"./../models/settings.coffee":29,"./base_view.coffee":40,"./event_dispatcher.coffee":45}],60:[function(require,module,exports){
(function (global){
var $, BaseView, Overlay, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BaseView = require('./base_view.coffee');

module.exports = Overlay = (function(_super) {
  __extends(Overlay, _super);

  function Overlay() {
    _ref = Overlay.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Overlay.prototype.id = 'mozbar-dialog-overlay-wGA7MhRhQ3WS';

  Overlay.prototype.opacity = 0.6;

  Overlay.prototype.render = function() {
    var _this = this;
    if (this.isInDOM()) {
      return;
    }
    this.$el.appendTo('body').css({
      width: ($(window)).width(),
      height: ($(window)).height(),
      opacity: this.opacity
    });
    return this.$el.on('click', function() {
      return _this.clicked();
    });
  };

  Overlay.prototype.setOpacity = function(opacity) {
    return this.$el.css({
      opacity: opacity
    });
  };

  Overlay.prototype.clicked = function() {
    return this.trigger('clicked');
  };

  return Overlay;

})(BaseView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./base_view.coffee":40}],61:[function(require,module,exports){
var BasePanelTab, PageAttributes, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BasePanelTab = require('./base_panel_tab.coffee');

template = require('./../../templates/page_elements.hbs');

module.exports = PageAttributes = (function(_super) {
  __extends(PageAttributes, _super);

  function PageAttributes() {
    _ref = PageAttributes.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PageAttributes.prototype.className = 'page-attributes';

  PageAttributes.prototype.template = template;

  return PageAttributes;

})(BasePanelTab);


},{"./../../templates/page_elements.hbs":91,"./base_panel_tab.coffee":39}],62:[function(require,module,exports){
var BasePanelTab, PageElements, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BasePanelTab = require('./base_panel_tab.coffee');

template = require('./../../templates/page_elements.hbs');

module.exports = PageElements = (function(_super) {
  __extends(PageElements, _super);

  function PageElements() {
    _ref = PageElements.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PageElements.prototype.className = 'page-elements';

  PageElements.prototype.template = template;

  return PageElements;

})(BasePanelTab);


},{"./../../templates/page_elements.hbs":91,"./base_panel_tab.coffee":39}],63:[function(require,module,exports){
(function (global){
var $, Analytics, BaseView, FacebookStats, GooglePlusStats, HttpStatusList, InfoPanel, LinksPanel, PageToolbar, Settings, SocialStats, TabSettings, template, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Analytics = require('./../models/analytics.coffee');

Settings = require('./../models/settings.coffee');

TabSettings = require('./../models/tab_settings.coffee');

BaseView = require('./base_view.coffee');

HttpStatusList = require('./../models/http_status_list.coffee');

InfoPanel = require('./info_panel.coffee');

LinksPanel = require('./links_panel.coffee');

SocialStats = require('./social_stats.coffee');

FacebookStats = require('./../models/facebook_stats.coffee');

GooglePlusStats = require('./../models/google_plus_stats.coffee');

template = require('./../../templates/page_toolbar.hbs');

module.exports = PageToolbar = (function(_super) {
  __extends(PageToolbar, _super);

  function PageToolbar() {
    _ref = PageToolbar.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PageToolbar.prototype.START_SCROLL_LENGTH = 40;

  PageToolbar.prototype.START_SCROLL_TIME = 100;

  PageToolbar.prototype.KEEP_SROLLING_LENGTH = 50;

  PageToolbar.prototype.KEEP_SCROLLING_TIME = 10;

  PageToolbar.prototype.KEEP_SCROLLING_DELAY = 300;

  PageToolbar.prototype.analytics = Analytics.getInstance();

  PageToolbar.prototype.settings = Settings.getInstance();

  PageToolbar.prototype.tabSettings = new TabSettings();

  PageToolbar.prototype.statusList = null;

  PageToolbar.prototype.scrollPos = 0;

  PageToolbar.prototype.overflow = 0;

  PageToolbar.prototype.timer = null;

  PageToolbar.prototype.intervalTimer = null;

  PageToolbar.prototype.currentPanel = null;

  PageToolbar.prototype.selectedPanel = null;

  PageToolbar.prototype.panels = null;

  PageToolbar.prototype.socialStats = null;

  PageToolbar.prototype.events = {
    'click .show-info-panel': 'toggleInfoPanel',
    'click .show-links-panel': 'toggleLinksPanel',
    'mousedown .left-arrow.enabled': 'scrollRight',
    'mousedown .right-arrow.enabled': 'scrollLeft',
    'mouseup .scroll-arrows': 'stopScrolling'
  };

  PageToolbar.prototype.initialize = function(opts) {
    var name, panel, panelEl, stats, _i, _len, _ref1, _ref2, _results,
      _this = this;
    PageToolbar.__super__.initialize.apply(this, arguments);
    this.statusList = new HttpStatusList;
    this.panels = {
      'info-panel': new InfoPanel({
        host: this.host,
        model: this.statusList
      }),
      'links-panel': new LinksPanel({
        host: this.host,
        model: this.tabSettings
      })
    };
    panelEl = this.$el.closest('.toolbar').siblings('.panel');
    _ref1 = this.panels;
    for (name in _ref1) {
      panel = _ref1[name];
      panelEl.append(panel.el);
    }
    this.socialStats = [
      new SocialStats({
        model: new FacebookStats
      }), new SocialStats({
        model: new GooglePlusStats
      })
    ];
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.statusList, 'sync', this.render);
    this.listenTo(this.tabSettings, 'change', this.updateLinksButton);
    this.listenTo(this.settings, 'change:metricsCols', this.render);
    ($(window)).on('resize', function() {
      return _this.resize();
    });
    _ref2 = this.socialStats;
    _results = [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      stats = _ref2[_i];
      _results.push(this.listenTo(stats, 'render', this.resize));
    }
    return _results;
  };

  PageToolbar.prototype.render = function() {
    var $social, stats, _i, _len, _ref1, _ref2,
      _this = this;
    if (!this.model.isValid()) {
      this.model.fetch();
    }
    if (!this.statusList.isValid()) {
      this.statusList.fetch();
    }
    if (!this.tabSettings.isValid()) {
      this.tabSettings.fetch();
    }
    this.$el.html(template(_.extend({
      isOk: true,
      showLinks: __indexOf.call(this.settings.get('metricsCols'), 'links') >= 0
    }, this.model.toJSON(), (_ref1 = this.statusList.at(0)) != null ? _ref1.toJSON() : void 0)));
    this.$el.find('.learn-more').click(function() {
      return _this.analytics.trackEvent('Page Toolbar/Trial CTA Clicked');
    });
    $social = this.$el.find('.social-stats');
    _ref2 = this.socialStats;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      stats = _ref2[_i];
      stats.$el.appendTo($social);
      stats.render();
    }
    this.updateLinksButton();
    this.resize();
    return PageToolbar.__super__.render.apply(this, arguments);
  };

  PageToolbar.prototype.resize = function() {
    var $arrows, $contents, $rightPanelWidth, $viewport, margin, showArrows;
    $viewport = this.$el.find('.viewport');
    $contents = $viewport.find('.viewport-contents');
    $arrows = this.$el.find('.scroll-arrows');
    $rightPanelWidth = this.$el.find('.right-panel').width();
    if (typeof $viewport.width === "function") {
      $viewport.width(0);
    }
    margin = $viewport.offset().left - this.$el.offset().left;
    showArrows = $contents.width() + $rightPanelWidth > this.$el.width() - margin;
    $arrows.css({
      display: showArrows ? 'flex' : 'none'
    });
    if (showArrows) {
      margin += $arrows.outerWidth(true);
    }
    if (typeof $viewport.width === "function") {
      $viewport.width(this.$el.width() - margin - $rightPanelWidth);
    }
    return this.overflow = Math.max(0, $contents.width() - $viewport.width());
  };

  PageToolbar.prototype.scrollLeft = function() {
    return this.startScrolling(-1);
  };

  PageToolbar.prototype.scrollRight = function() {
    return this.startScrolling(1);
  };

  PageToolbar.prototype.startScrolling = function(direction) {
    var _this = this;
    this.scrollPos += this.START_SCROLL_LENGTH * direction;
    this.timer = setTimeout(function() {
      return _this.keepScrolling(direction);
    }, this.KEEP_SCROLLING_DELAY);
    return this.$el.find('.viewport-contents').animate({
      'margin-left': this.scrollPos
    }, {
      duration: this.START_SCROLL_TIME
    });
  };

  PageToolbar.prototype.keepScrolling = function(direction) {
    var $contents,
      _this = this;
    $contents = this.$el.find('.viewport-contents');
    return this.intervalTimer = setInterval(function() {
      if ((direction === 1 && _this.scrollPos >= 0) || (direction === -1 && _this.scrollPos <= _this.overflow * -1)) {
        _this.stopScrolling();
        return;
      }
      _this.scrollPos += direction * 2;
      return $contents.css({
        'margin-left': _this.scrollPos
      });
    }, this.KEEP_SCROLLING_TIME);
  };

  PageToolbar.prototype.stopScrolling = function() {
    clearInterval(this.intervalTimer);
    this.intervalTimer = null;
    clearTimeout(this.timer);
    this.timer = null;
    return this.updateScrollArrows();
  };

  PageToolbar.prototype.updateScrollArrows = function() {
    var $contents, margin;
    $contents = this.$el.find('.viewport-contents');
    margin = parseInt($contents.css('margin-left'));
    this.$el.find('.left-arrow').toggleClass('enabled', this.scrollPos < 0);
    this.$el.find('.right-arrow').toggleClass('enabled', this.scrollPos > this.overflow * -1);
    this.$el.find('.fade-out').toggle(margin < 0);
    return this.$el.find('.fade-in').toggle(margin > this.overflow * -1);
  };

  PageToolbar.prototype.toggleInfoPanel = function() {
    return this.togglePanel('info-panel');
  };

  PageToolbar.prototype.toggleLinksPanel = function() {
    return this.togglePanel('links-panel');
  };

  PageToolbar.prototype.togglePanel = function(name) {
    this.hideTooltip();
    if (this.selectedPanel === name) {
      this.closePanel(name);
      return;
    }
    this.openPanel(name);
    return this.panels[name].trackPanelView();
  };

  PageToolbar.prototype.openPanel = function(name) {
    var _this = this;
    this.clearPanelSelections();
    this.$el.find(".show-" + name).addClass('active');
    this.selectedPanel = name;
    if (this.currentPanel && this.currentPanel !== this.selectedPanel) {
      this.transitionStarted();
      this.panels[this.currentPanel].close(function() {
        return _this.openSelectedPanel();
      });
      return;
    }
    return this.openSelectedPanel();
  };

  PageToolbar.prototype.openSelectedPanel = function() {
    var _ref1,
      _this = this;
    this.transitionStarted();
    if ((_ref1 = this.panels[this.selectedPanel]) != null) {
      _ref1.open(function() {
        return _this.transitionComplete();
      });
    }
    return this.currentPanel = this.selectedPanel;
  };

  PageToolbar.prototype.closePanel = function(name) {
    var _ref1,
      _this = this;
    this.clearPanelSelections();
    this.selectedPanel = null;
    return (_ref1 = this.panels[name]) != null ? _ref1.close(function() {
      _this.currentPanel = null;
      return _this.transitionComplete();
    }) : void 0;
  };

  PageToolbar.prototype.closeAllPanels = function(done) {
    var _this = this;
    this.clearPanelSelections();
    return this.transitionComplete(function() {
      var _ref1;
      if (!_this.currentPanel) {
        done();
      }
      return (_ref1 = _this.panels[_this.currentPanel]) != null ? _ref1.close(function() {
        _this.currentPanel = _this.selectedPanel = null;
        return done();
      }) : void 0;
    });
  };

  PageToolbar.prototype.transitionStarted = function() {
    return this.inTransition = true;
  };

  PageToolbar.prototype.transitionComplete = function(done) {
    if (done) {
      if (this.inTransition) {
        this.transitionCompleteCallback = done;
      } else {
        done();
      }
      return;
    }
    if (typeof this.transitionCompleteCallback === "function") {
      this.transitionCompleteCallback();
    }
    this.transitionCompleteCallback = null;
    return this.inTransition = false;
  };

  PageToolbar.prototype.updateLinksButton = function() {
    var $button, links, type, types, _i, _len, _results;
    types = this.panels['links-panel'].getLinkTypes();
    links = this.tabSettings.get('highlightLinks') || [];
    $button = this.$el.find('.show-links-panel');
    _results = [];
    for (_i = 0, _len = types.length; _i < _len; _i++) {
      type = types[_i];
      _results.push($button.toggleClass(type, links.indexOf(type) > -1));
    }
    return _results;
  };

  PageToolbar.prototype.clearPanelSelections = function() {
    return this.$el.find('.btn').removeClass('active');
  };

  return PageToolbar;

})(BaseView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/page_toolbar.hbs":92,"./../models/analytics.coffee":4,"./../models/facebook_stats.coffee":8,"./../models/google_plus_stats.coffee":11,"./../models/http_status_list.coffee":13,"./../models/settings.coffee":29,"./../models/tab_settings.coffee":30,"./base_view.coffee":40,"./info_panel.coffee":51,"./links_panel.coffee":54,"./social_stats.coffee":75}],64:[function(require,module,exports){
var BaseView, PanelView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('./base_view.coffee');

module.exports = PanelView = (function(_super) {
  __extends(PanelView, _super);

  function PanelView() {
    _ref = PanelView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PanelView.prototype.PANEL_HEIGHT = 50;

  PanelView.prototype.isOpen = false;

  PanelView.prototype.open = function(complete) {
    this.isOpen = true;
    return this.updatePanelHeight(this.PANEL_HEIGHT, complete);
  };

  PanelView.prototype.close = function(complete) {
    this.isOpen = false;
    return this.updatePanelHeight(0, complete);
  };

  PanelView.prototype.toggleOpen = function(complete) {
    if (this.isOpen) {
      return this.close(complete);
    } else {
      return this.open(complete);
    }
  };

  PanelView.prototype.updatePanelHeight = function(height, complete) {
    this.$el.animate({
      height: height
    }, this.host.PANEL_SWING_DURATION);
    return this.host.updatePanelHeight(height, complete);
  };

  return PanelView;

})(BaseView);


},{"./base_view.coffee":40}],65:[function(require,module,exports){
(function (global){
var $, BaseElement, Overlay, ProfileDialog, ProfileEdit, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BaseElement = require('./base_element.coffee');

ProfileEdit = require('./profile_edit.coffee');

Overlay = require('./overlay.coffee');

module.exports = ProfileDialog = (function(_super) {
  __extends(ProfileDialog, _super);

  function ProfileDialog() {
    _ref = ProfileDialog.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ProfileDialog.prototype.elementCssClass = 'profile-dialog';

  ProfileDialog.prototype.elementViewClass = ProfileEdit;

  ProfileDialog.prototype.overlay = null;

  ProfileDialog.prototype.id = 'mozbar-profile-dialog-wGA7MhRhQ3WS';

  ProfileDialog.prototype.initialize = function(opts) {
    var _this = this;
    this.elementViewModel = opts.model;
    this.overlay = new Overlay({
      onRemove: function() {
        return _this.remove();
      }
    });
    return ProfileDialog.__super__.initialize.apply(this, arguments);
  };

  ProfileDialog.prototype.render = function() {
    ProfileDialog.__super__.render.apply(this, arguments);
    return this.overlay.render();
  };

  ProfileDialog.prototype.remove = function() {
    ProfileDialog.__super__.remove.apply(this, arguments);
    return this.overlay.remove();
  };

  return ProfileDialog;

})(BaseElement);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./base_element.coffee":38,"./overlay.coffee":60,"./profile_edit.coffee":66}],66:[function(require,module,exports){
(function (global){
var BaseView, Cities, ProfileEdit, Regions, cityTemplate, regionTemplate, template, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

BaseView = require('./base_view.coffee');

Regions = require('./../models/regions.coffee');

Cities = require('./../models/cities.coffee');

template = require('./../../templates/profile_edit.hbs');

regionTemplate = require('./../../templates/profile_edit_regions.hbs');

cityTemplate = require('./../../templates/profile_edit_cities.hbs');

module.exports = ProfileEdit = (function(_super) {
  __extends(ProfileEdit, _super);

  function ProfileEdit() {
    _ref = ProfileEdit.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ProfileEdit.prototype.regions = new Regions;

  ProfileEdit.prototype.cities = new Cities;

  ProfileEdit.prototype.events = {
    'click .cancel': 'close',
    'click .save': 'save',
    'click .delete': 'delete',
    'change .country': 'updateRegions',
    'change .region': 'updateCities',
    'keydown .profile-edit': 'dialogKeyDown'
  };

  ProfileEdit.prototype.initialize = function(options) {
    ProfileEdit.__super__.initialize.apply(this, arguments);
    this.listenTo(this.regions, 'reset', this.renderRegions);
    return this.listenTo(this.cities, 'reset', this.renderCities);
  };

  ProfileEdit.prototype.render = function() {
    this.$el.html(template(this.model.toJSON()));
    return this.updateRegions();
  };

  ProfileEdit.prototype.renderRegions = function() {
    this.$el.find('.region').html(regionTemplate(_.extend(this.model.toJSON(), {
      regions: this.regions.toJSON()
    }))).val(this.model.get('region'));
    return this.updateCities();
  };

  ProfileEdit.prototype.renderCities = function() {
    this.$el.find('.city').html(cityTemplate(_.extend(this.model.toJSON(), {
      cities: this.cities.toJSON()
    }))).val(this.model.get('city'));
    return this.updateFieldState();
  };

  ProfileEdit.prototype.updateRegions = function() {
    var country;
    country = this.$el.find('.country').val();
    this.regions.country = country;
    return this.regions.fetch({
      reset: true
    });
  };

  ProfileEdit.prototype.updateCities = function() {
    var region;
    region = this.$el.find('.region').val();
    this.cities.region = region;
    this.cities.fetch({
      reset: true
    });
    return this.updateFieldState();
  };

  ProfileEdit.prototype.updateFieldState = function() {
    var region;
    return region = this.$el.find('.city').get(0).disabled = !this.$el.find('.region').val();
  };

  ProfileEdit.prototype.dialogKeyDown = function(e) {
    return e.stopImmediatePropagation();
  };

  ProfileEdit.prototype.save = function() {
    this.model.set({
      engine: this.$el.find('.engine').val(),
      country: this.$el.find('.country').val(),
      region: this.$el.find('.region').val(),
      city: this.$el.find('.city').val(),
      name: this.$el.find('.name').val(),
      disablePersonalization: this.$el.find('.disable-personalization').is(':checked')
    });
    this.model.save();
    return this.close();
  };

  ProfileEdit.prototype["delete"] = function() {
    if (!confirm('Are you sure you want to delete this profile?')) {
      return;
    }
    this.model.destroy();
    return this.close();
  };

  ProfileEdit.prototype.close = function() {
    return this.host.remove();
  };

  return ProfileEdit;

})(BaseView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/profile_edit.hbs":101,"./../../templates/profile_edit_cities.hbs":102,"./../../templates/profile_edit_regions.hbs":103,"./../models/cities.coffee":7,"./../models/regions.coffee":24,"./base_view.coffee":40}],67:[function(require,module,exports){
(function (global){
var $, BaseElement, Profile, ProfileDialog, Profiles, ProfilesDropDown, ProfilesList, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BaseElement = require('./base_element.coffee');

ProfilesList = require('./profiles_list.coffee');

ProfileDialog = require('./profile_dialog.coffee');

Profiles = require('./../models/profiles.coffee');

Profile = require('./../models/profile.coffee');

module.exports = ProfilesDropDown = (function(_super) {
  __extends(ProfilesDropDown, _super);

  function ProfilesDropDown() {
    _ref = ProfilesDropDown.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ProfilesDropDown.prototype.elementCssClass = 'profiles-drop-down';

  ProfilesDropDown.prototype.elementViewClass = ProfilesList;

  ProfilesDropDown.prototype.elementViewModel = new Profiles;

  ProfilesDropDown.prototype.id = 'mozbar-profiles-drop-down-wGA7MhRhQ3WS';

  ProfilesDropDown.prototype.initialize = function(options) {
    this.options = options;
  };

  ProfilesDropDown.prototype.render = function() {
    var height, _ref1,
      _this = this;
    ProfilesDropDown.__super__.render.apply(this, arguments);
    height = ($(window)).height() - (this.options.top || this.options.bottom);
    this.$el.css({
      top: this.options.top,
      bottom: this.options.bottom,
      left: this.options.left,
      height: height
    });
    if ((_ref1 = this.options.opened) != null) {
      _ref1.apply(this);
    }
    return ($(window)).on('click.profiles-drop-down', function(e) {
      if (!_this.$el.is(e.target) && _this.$el.has(e.target).length === 0) {
        return _this.remove();
      }
    });
  };

  ProfilesDropDown.prototype.remove = function() {
    var _ref1;
    ProfilesDropDown.__super__.remove.apply(this, arguments);
    ($(window)).off('click.profiles-drop-down');
    return (_ref1 = this.options.closed) != null ? _ref1.apply(this) : void 0;
  };

  ProfilesDropDown.prototype.editProfile = function(profile) {
    var dialog;
    dialog = new ProfileDialog({
      model: profile || new Profile
    });
    return dialog.render();
  };

  return ProfilesDropDown;

})(BaseElement);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/profile.coffee":22,"./../models/profiles.coffee":23,"./base_element.coffee":38,"./profile_dialog.coffee":65,"./profiles_list.coffee":68}],68:[function(require,module,exports){
(function (global){
var $, BaseView, Page, ProfilesList, Settings, googleDomains, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BaseView = require('./base_view.coffee');

Settings = require('./../models/settings.coffee');

template = require('./../../templates/profiles_list.hbs');

Page = require('./../models/page.coffee');

googleDomains = require('./../models/google_domains.coffee');

module.exports = ProfilesList = (function(_super) {
  __extends(ProfilesList, _super);

  function ProfilesList() {
    _ref = ProfilesList.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ProfilesList.prototype.settings = Settings.getInstance();

  ProfilesList.prototype.events = {
    'click li[data-id]': 'selectProfile',
    'click .edit-profile, .add-new': 'editProfile'
  };

  ProfilesList.prototype.initialize = function(opts) {
    ProfilesList.__super__.initialize.apply(this, arguments);
    return this.listenTo(this.model, 'change', this.render);
  };

  ProfilesList.prototype.render = function() {
    this.$el.html(template(this.model.toJSON()));
    return this.$el.toggleClass('bottom', this.settings.get('isDockedOnBottom'));
  };

  ProfilesList.prototype.selectProfile = function(e) {
    var $target, id;
    $target = $(e.currentTarget);
    id = $target.data('id');
    this.settings.set({
      selectedProfileId: id
    });
    this.runProfile(this.model.get(id));
    this.settings.save();
    return this.host.remove();
  };

  ProfilesList.prototype.runProfile = function(profile) {
    var city, country, engine, key, params, place, qs, searchTerm, secret, url, uule;
    engine = profile.get('engine');
    country = profile.get('country');
    searchTerm = Page.getSearchTerm();
    params = {};
    url = '';
    qs = '';
    switch (engine) {
      case 'google':
        url = googleDomains.getDomain(country);
        place = '';
        city = profile.get('city');
        if (city) {
          place = "" + city + ",";
        }
        place += profile.get('region');
        params = {
          q: searchTerm,
          ie: 'UTF-8',
          oe: 'UTF-8',
          ip: '0.0.0.0',
          pws: profile.get('disablePersonalization') ? 0 : void 0
        };
        key = 'ABCDEFGHIJKLMNOPQRSTUVWKYZ';
        key += key.toLowerCase();
        key += '0123456789- ';
        secret = key.substr(place.length, 1);
        uule = "w+CAIQICI" + secret + (btoa(place));
        qs = "" + ($.param(params)) + "&uule=" + uule;
        break;
      case 'bing':
        url = "http://www.bing.com/search?";
        params.q = searchTerm;
        if (country) {
          params[' loc:'] = country;
        }
        break;
      case 'yahoo':
        url = 'http://search.yahoo.com/search?';
        params.p = searchTerm;
        if (country) {
          params.vc = country;
        }
    }
    if (!qs) {
      qs = $.param(params);
    }
    url += url.indexOf('?' > 0) ? '&' : '?';
    url += qs;
    if (Page.getSerpEngine() === engine) {
      return window.top.location.href = url;
    } else {
      return window.open(url);
    }
  };

  ProfilesList.prototype.editProfile = function(e) {
    var id;
    id = ($(e.currentTarget)).parent().data('id');
    this.host.editProfile(this.model.get(id));
    this.host.remove();
    return e.stopImmediatePropagation();
  };

  return ProfilesList;

})(BaseView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/profiles_list.hbs":104,"./../models/google_domains.coffee":10,"./../models/page.coffee":18,"./../models/settings.coffee":29,"./base_view.coffee":40}],69:[function(require,module,exports){
(function (global){
var $, BasePanelTab, Semantics, Twitter, TwitterCards, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BasePanelTab = require('./base_panel_tab.coffee');

TwitterCards = require('./twitter_cards.coffee');

Twitter = require('./../models/twitter.coffee');

template = require('./../../templates/semantics.hbs');

module.exports = Semantics = (function(_super) {
  __extends(Semantics, _super);

  function Semantics() {
    _ref = Semantics.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Semantics.prototype.className = 'semantics';

  Semantics.prototype.template = template;

  Semantics.prototype.twitterCards = null;

  Semantics.prototype.activeSnippet = 'schema';

  Semantics.prototype.events = {
    'click .snippet .content': 'snippetClicked'
  };

  Semantics.prototype.snippetClicked = function(e) {
    var $target;
    $target = $(e.currentTarget);
    this.activeSnippet = $target.data('show');
    return this.selectActiveSnippet();
  };

  Semantics.prototype.selectActiveSnippet = function() {
    this.$el.find('.content').removeClass('active');
    this.$el.find(".content." + this.activeSnippet).addClass('active');
    this.$el.find(".content[data-show='" + this.activeSnippet + "']").addClass('active');
    if (this.activeSnippet === 'twitter') {
      if (this.twitterCards == null) {
        this.twitterCards = new TwitterCards({
          model: new Twitter,
          el: this.$el.find('.preview .twitter')
        });
      }
      return this.twitterCards.render();
    }
  };

  Semantics.prototype.render = function() {
    Semantics.__super__.render.apply(this, arguments);
    return this.selectActiveSnippet();
  };

  return Semantics;

})(BasePanelTab);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/semantics.hbs":105,"./../models/twitter.coffee":32,"./base_panel_tab.coffee":39,"./twitter_cards.coffee":79}],70:[function(require,module,exports){
(function (global){
var $, BaseElement, Page, SerpElement, SerpItem, SerpResultsMetrics, serpItemTemplate, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BaseElement = require('./base_element.coffee');

SerpItem = require('./serp_item.coffee');

Page = require('./../models/page.coffee');

SerpResultsMetrics = require('./../models/serp_results_metrics.coffee');

serpItemTemplate = require('./../../templates/serp_item.hbs');

module.exports = SerpElement = (function(_super) {
  __extends(SerpElement, _super);

  function SerpElement() {
    _ref = SerpElement.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SerpElement.prototype.className = 'mozbar-serp-item-wGA7MhRhQ3WS';

  SerpElement.prototype.elementTemplate = serpItemTemplate;

  SerpElement.prototype.elementCssClass = 'serp-item';

  SerpElement.prototype.elementViewClass = SerpItem;

  SerpElement.prototype.initialize = function(opts) {
    SerpElement.__super__.initialize.apply(this, arguments);
    return this.elementViewModel = this.model.get('metrics');
  };

  SerpElement.prototype.parentElement = function() {
    return this.model.get('el');
  };

  return SerpElement;

})(BaseElement);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/serp_item.hbs":106,"./../models/page.coffee":18,"./../models/serp_results_metrics.coffee":27,"./base_element.coffee":38,"./serp_item.coffee":71}],71:[function(require,module,exports){
(function (global){
var $, BaseView, SerpItem, serpItem, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BaseView = require('./base_view.coffee');

serpItem = require('./../../templates/serp_item.hbs');

module.exports = SerpItem = (function(_super) {
  __extends(SerpItem, _super);

  function SerpItem() {
    _ref = SerpItem.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SerpItem.prototype.tooltipPlacement = 'above';

  SerpItem.prototype.initialize = function(opts) {
    SerpItem.__super__.initialize.apply(this, arguments);
    return this.listenTo(this.model, 'change', this.render);
  };

  SerpItem.prototype.render = function() {
    if (!this.model.isValid()) {
      this.model.fetch();
    }
    this.$el.html(serpItem(this.model.toJSON()));
    return this.showOnboardingHighlights();
  };

  return SerpItem;

})(BaseView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/serp_item.hbs":106,"./base_view.coffee":40}],72:[function(require,module,exports){
(function (global){
var $, Analytics, BaseView, Page, SerpAttributes, SerpToolbar, Settings, googleDomains, serpToolbar, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

Analytics = require('./../models/analytics.coffee');

Page = require('./../models/page.coffee');

BaseView = require('./base_view.coffee');

serpToolbar = require('./../../templates/serp_toolbar.hbs');

googleDomains = require('./../models/google_domains.coffee');

SerpAttributes = require('./../models/serp_attributes.coffee');

Settings = require('./../models/settings.coffee');

module.exports = SerpToolbar = (function(_super) {
  __extends(SerpToolbar, _super);

  function SerpToolbar() {
    _ref = SerpToolbar.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SerpToolbar.prototype.analytics = Analytics.getInstance();

  SerpToolbar.prototype.settings = Settings.getInstance();

  SerpToolbar.prototype.events = {
    'click .search-profile': 'showProfileDropDown',
    'click .export': 'exportSerpResults'
  };

  SerpToolbar.prototype.initialize = function() {
    SerpToolbar.__super__.initialize.apply(this, arguments);
    return this.listenTo(this.model, 'change', this.render);
  };

  SerpToolbar.prototype.render = function() {
    var _this = this;
    this.$el.html(serpToolbar(this.model.toJSON()));
    return this.$el.find('.learn-more').click(function() {
      return _this.analytics.trackEvent('SERP Toolbar/Trial CTA Clicked');
    });
  };

  SerpToolbar.prototype.showProfileDropDown = function(e) {
    var $selectBox, isDockedOnBottom, offset;
    isDockedOnBottom = this.settings.get('isDockedOnBottom');
    $selectBox = this.$el.find('.search-profile');
    offset = $selectBox.offset();
    this.host.toggleProfilesDropDown({
      top: !isDockedOnBottom ? offset.top + $selectBox.height() : void 0,
      bottom: isDockedOnBottom ? offset.top + $selectBox.height() : void 0,
      left: offset.left,
      opened: function() {
        return $selectBox.find('.arrow').removeClass('arrow-down').addClass('arrow-up');
      },
      closed: function() {
        return $selectBox.find('.arrow').removeClass('arrow-up').addClass('arrow-down');
      }
    });
    return e.stopImmediatePropagation();
  };

  SerpToolbar.prototype.exportSerpResults = function() {
    var a, blob, data, doc, line, now, url, _i, _len,
      _this = this;
    now = new Date();
    data = ['---------------------------------------', 'Moz Toolbar SERP Report', "Keyword: " + (Page.getSearchTerm()), "Search Engine: " + (Page.getSerpEngine()), "Report Created: " + (now.toLocaleString()), '---------------------------------------', '', ['Position', 'URL', 'Title', 'Description', 'Page Authority', 'Total Links to Page', 'Total Linking Root Domains to Page', 'Domain Authority', 'Total Links to Root Domain', 'Total Linking Root Domains to Root Domains']];
    ($(Page.getSerpConfig().selector)).each(function(i, el) {
      var metrics, model;
      model = new SerpAttributes({
        el: el
      });
      metrics = model.get('metrics');
      return data.push([i, model.get('url'), _this.csvEncode(model.get('title')), _this.csvEncode(model.get('description')), metrics.get('upa'), metrics.get('uid'), metrics.get('uipl'), metrics.get('pda'), metrics.get('puid'), metrics.get('pid')]);
    });
    doc = '';
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      line = data[_i];
      doc += "" + (_.isArray(line) ? line.join(',') : line) + "\n";
    }
    a = document.createElement('a');
    blob = new Blob([doc], {
      type: 'text/csv'
    });
    url = URL.createObjectURL(blob);
    a.setAttribute('href', url);
    a.setAttribute('download', this.getCsvFilename());
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return this.analytics.trackExport();
  };

  SerpToolbar.prototype.csvEncode = function(str) {
    str = str.replace(/\"/g, '""');
    if (str.indexOf(',') > -1 || str.indexOf('"') > -1) {
      str = '"' + str + '"';
    }
    return str;
  };

  SerpToolbar.prototype.getCsvFilename = function() {
    var filename, now;
    now = new Date();
    filename = "" + (Page.getSearchTerm()) + "-" + (Page.getSerpEngine()) + "-";
    filename += now.getFullYear() + '-';
    filename += this.twoDigits(now.getMonth() + 1) + '-';
    return filename += this.twoDigits(now.getDay() + 1) + '.csv';
  };

  SerpToolbar.prototype.twoDigits = function(num) {
    return (num < 10 ? '0' : '') + num;
  };

  return SerpToolbar;

})(BaseView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/serp_toolbar.hbs":107,"./../models/analytics.coffee":4,"./../models/google_domains.coffee":10,"./../models/page.coffee":18,"./../models/serp_attributes.coffee":26,"./../models/settings.coffee":29,"./base_view.coffee":40}],73:[function(require,module,exports){
var BaseDialog, SettingsDialog, SettingsEdit, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseDialog = require('./base_dialog.coffee');

SettingsEdit = require('./settings_edit.coffee');

module.exports = SettingsDialog = (function(_super) {
  __extends(SettingsDialog, _super);

  function SettingsDialog() {
    _ref = SettingsDialog.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SettingsDialog.prototype.elementCssClass = 'dialog settings-dialog';

  SettingsDialog.prototype.elementViewClass = SettingsEdit;

  SettingsDialog.prototype.id = 'mozbar-settings-dialog-wGA7MhRhQ3WS';

  SettingsDialog.prototype.render = function() {
    SettingsDialog.__super__.render.apply(this, arguments);
    return this.$el.css({
      top: this.options.top,
      bottom: this.options.bottom,
      left: this.options.left - this.$el.width() + 20
    });
  };

  return SettingsDialog;

})(BaseDialog);


},{"./base_dialog.coffee":37,"./settings_edit.coffee":74}],74:[function(require,module,exports){
(function (global){
var $, BaseView, Page, Settings, SettingsEdit, User, template, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BaseView = require('./base_view.coffee');

Page = require('./../models/page.coffee');

User = require('./../models/user.coffee');

Settings = require('./../models/settings.coffee');

template = require('./../../templates/settings_dialog.hbs');

module.exports = SettingsEdit = (function(_super) {
  __extends(SettingsEdit, _super);

  function SettingsEdit() {
    _ref = SettingsEdit.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SettingsEdit.prototype.settings = Settings.getInstance();

  SettingsEdit.prototype.user = User.getInstance();

  SettingsEdit.prototype.events = {
    'click .metrics :checkbox': 'toggleCol',
    'click #lightdarkswitch': 'toggleLightDark'
  };

  SettingsEdit.prototype.render = function() {
    var cols, pageUrl;
    pageUrl = encodeURIComponent(Page.href().replace(/^http[s]*:\/\//, ''));
    this.$el.html(template(_.extend({
      pageUrl: pageUrl
    }, this.user.toJSON())));
    cols = this.settings.get('metricsCols');
    this.$el.find('.metrics :checkbox').each(function() {
      var $el;
      $el = $(this);
      return $el.prop('checked', cols.indexOf($el.data('col')) !== -1);
    });
    this.$el.find('#lightdarkswitch').prop('checked', this.settings.get('isLightTheme'));
    return ($('#mozbar-settings-dialog-wGA7MhRhQ3WS')).hide().slideDown('fast');
  };

  SettingsEdit.prototype.toggleCol = function() {
    var cols;
    cols = $.map(this.$el.find(':checked'), function(el) {
      return ($(el)).data('col');
    });
    this.settings.set('metricsCols', cols);
    return this.settings.save();
  };

  SettingsEdit.prototype.toggleLightDark = function() {
    this.settings.set('isLightTheme', this.$el.find('#lightdarkswitch').is(':checked'));
    return this.settings.save();
  };

  SettingsEdit.prototype.remove = function(complete) {
    var _this = this;
    return ($('#mozbar-settings-dialog-wGA7MhRhQ3WS')).slideUp('fast', function() {
      _this;
      return SettingsEdit.__super__.remove.call(_this, complete);
    });
  };

  return SettingsEdit;

})(BaseView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/settings_dialog.hbs":108,"./../models/page.coffee":18,"./../models/settings.coffee":29,"./../models/user.coffee":35,"./base_view.coffee":40}],75:[function(require,module,exports){
(function (global){
var BaseView, SocialStats, template, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

BaseView = require('./base_view.coffee');

template = require('./../../templates/social.hbs');

module.exports = SocialStats = (function(_super) {
  __extends(SocialStats, _super);

  function SocialStats() {
    _ref = SocialStats.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SocialStats.prototype.initialize = function(opts) {
    SocialStats.__super__.initialize.apply(this, arguments);
    return this.listenTo(this.model, 'change', this.render);
  };

  SocialStats.prototype.render = function() {
    if (!this.model.isValid()) {
      this.model.fetch();
    }
    this.$el.html(template(this.model.toJSON()));
    return this.trigger('render');
  };

  return SocialStats;

})(BaseView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/social.hbs":109,"./base_view.coffee":40}],76:[function(require,module,exports){
(function (global){
var $, Analytics, BaseView, ButtonNotificationElement, Page, PageToolbar, SerpToolbar, SerpToolbarModel, Settings, Toolbar, UrlMetrics, _, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

Analytics = require('./../models/analytics.coffee');

BaseView = require('./base_view.coffee');

ButtonNotificationElement = require('./button_notification_element.coffee');

Page = require('./../models/page.coffee');

PageToolbar = require('./page_toolbar.coffee');

SerpToolbar = require('./serp_toolbar.coffee');

SerpToolbarModel = require('./../models/serp_toolbar.coffee');

Settings = require('./../models/settings.coffee');

UrlMetrics = require('./../models/url_metrics.coffee');

module.exports = Toolbar = (function(_super) {
  __extends(Toolbar, _super);

  function Toolbar() {
    _ref = Toolbar.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Toolbar.prototype.analytics = Analytics.getInstance();

  Toolbar.prototype.settings = Settings.getInstance();

  Toolbar.prototype.contentPage = null;

  Toolbar.prototype.tooltipPlacement = 'below';

  Toolbar.prototype.events = {
    'click .settings': 'toggleSettingsDialog',
    'click .help': 'toggleHelpDialog',
    'click .dock': 'toggleDockPosition',
    'click .close': 'close'
  };

  Toolbar.prototype.initialize = function(options) {
    var $toolbarPanel, opts, position;
    Toolbar.__super__.initialize.apply(this, arguments);
    $toolbarPanel = this.$el.find('.toolbar-panel');
    position = $toolbarPanel.offset();
    opts = {
      host: options.host,
      el: $toolbarPanel,
      margin: position.left + this.$el.find('right-panel').outerWidth()
    };
    return this.childView = Page.isSerp() ? new SerpToolbar(_.extend(opts, {
      model: new SerpToolbarModel
    })) : new PageToolbar(_.extend(opts, {
      model: UrlMetrics.getInstance()
    }));
  };

  Toolbar.prototype.render = function() {
    this.childView.render();
    this.updateTooltipPlacement();
    return Toolbar.__super__.render.apply(this, arguments);
  };

  Toolbar.prototype.toolbarHeight = function() {
    return this.$el.find('.toolbar').height();
  };

  Toolbar.prototype.toggleSettingsDialog = function(e) {
    this.hideTooltip();
    return this.host.toggleSettingsDialog(this.getDialogOptions(e));
  };

  Toolbar.prototype.toggleHelpDialog = function(e) {
    this.hideTooltip();
    return this.host.toggleHelpDialog(this.getDialogOptions(e));
  };

  Toolbar.prototype.getDialogOptions = function(e) {
    var $target, height, isDockedOnBottom, position;
    $target = $(e.currentTarget);
    position = $target.offset();
    isDockedOnBottom = this.settings.get('isDockedOnBottom');
    height = this.$el.find('.toolbar-panel').height();
    return {
      left: position.left + ($target.width() / 2),
      top: !isDockedOnBottom ? height : void 0,
      bottom: isDockedOnBottom ? height : void 0,
      arrow: isDockedOnBottom ? 'bottom' : 'top'
    };
  };

  Toolbar.prototype.toggleDockPosition = function(e) {
    this.hideTooltip();
    this.settings.toggleDockPosition();
    this.updateTooltipPlacement();
    return this.analytics.trackToggleDockPosition();
  };

  Toolbar.prototype.updateTooltipPlacement = function() {
    var isDockedOnBottom;
    isDockedOnBottom = this.settings.get('isDockedOnBottom');
    this.tooltipPlacement = isDockedOnBottom ? 'above' : 'below';
    return this.childView.tooltipPlacement = this.tooltipPlacement;
  };

  Toolbar.prototype.closeAllPanels = function(done) {
    if (this.childView.closeAllPanels) {
      return this.childView.closeAllPanels(done);
    } else {
      return done();
    }
  };

  Toolbar.prototype.close = function() {
    this.settings.toggleMozbar();
    return this.hideTooltip();
  };

  return Toolbar;

})(BaseView);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/analytics.coffee":4,"./../models/page.coffee":18,"./../models/serp_toolbar.coffee":28,"./../models/settings.coffee":29,"./../models/url_metrics.coffee":34,"./base_view.coffee":40,"./button_notification_element.coffee":43,"./page_toolbar.coffee":63,"./serp_toolbar.coffee":72}],77:[function(require,module,exports){
var BaseView, Tooltip, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('./base_view.coffee');

template = require('./../../templates/tooltip.hbs');

module.exports = Tooltip = (function(_super) {
  __extends(Tooltip, _super);

  function Tooltip() {
    _ref = Tooltip.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Tooltip.prototype.initialize = function(opts) {
    Tooltip.__super__.initialize.apply(this, arguments);
    return this.listenTo(this.model, 'change', this.render);
  };

  Tooltip.prototype.render = function() {
    return this.$el.html(template(this.model.toJSON()));
  };

  return Tooltip;

})(BaseView);


},{"./../../templates/tooltip.hbs":111,"./base_view.coffee":40}],78:[function(require,module,exports){
(function (global){
var $, BaseElement, Dispatcher, Tooltip, TooltipElement, TooltipModel, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BaseElement = require('./base_element.coffee');

Dispatcher = require('./event_dispatcher.coffee');

Tooltip = require('./tooltip.coffee');

TooltipModel = require('./../models/tooltip.coffee');

module.exports = TooltipElement = (function(_super) {
  __extends(TooltipElement, _super);

  function TooltipElement() {
    _ref = TooltipElement.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  TooltipElement.prototype.TOOLTIP_DELAY = 250;

  TooltipElement.prototype.TOOLTIP_WIDTH = 200;

  TooltipElement.prototype.TOOLTIP_HEIGHT = 200;

  TooltipElement.prototype.dispatcher = Dispatcher.getInstance();

  TooltipElement.prototype.elementCssClass = 'tooltip';

  TooltipElement.prototype.elementViewClass = Tooltip;

  TooltipElement.prototype.elementViewModel = new TooltipModel;

  TooltipElement.prototype.top = 0;

  TooltipElement.prototype.left = 0;

  TooltipElement.prototype.id = 'mozbar-tooltip-wGA7MhRhQ3WS';

  TooltipElement.prototype.timeout = null;

  TooltipElement.prototype.initialize = function(opts) {
    TooltipElement.__super__.initialize.apply(this, arguments);
    this.listenTo(this.dispatcher, 'tooltip:start-timeout', this.startTimeout);
    return this.listenTo(this.dispatcher, 'tooltip:hide', this.hide);
  };

  TooltipElement.prototype.startTimeout = function(opts) {
    var _this = this;
    this.elementViewModel.set(opts);
    this.top = opts.top;
    if (opts.placement === 'above') {
      this.top -= this.TOOLTIP_HEIGHT;
    }
    this.left = opts.left;
    clearTimeout(this.timeout);
    return this.timeout = setTimeout((function() {
      return _this.show();
    }), this.TOOLTIP_DELAY);
  };

  TooltipElement.prototype.show = function() {
    this.render();
    this.$el.show();
    return this.updatePosition();
  };

  TooltipElement.prototype.renderShadow = function(shadow, css) {
    TooltipElement.__super__.renderShadow.apply(this, arguments);
    return this.updatePosition();
  };

  TooltipElement.prototype.updatePosition = function() {
    return this.$el.css({
      top: this.top,
      left: this.left - this.$el.width() / 2
    });
  };

  TooltipElement.prototype.hide = function() {
    clearTimeout(this.timeout);
    return this.$el.hide();
  };

  return TooltipElement;

})(BaseElement);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../models/tooltip.coffee":31,"./base_element.coffee":38,"./event_dispatcher.coffee":45,"./tooltip.coffee":77}],79:[function(require,module,exports){
(function (global){
var $, BasePanelTab, TwitterCards, template, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

BasePanelTab = require('./base_panel_tab.coffee');

template = require('./../../templates/twitter_cards.hbs');

module.exports = TwitterCards = (function(_super) {
  __extends(TwitterCards, _super);

  function TwitterCards() {
    _ref = TwitterCards.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  TwitterCards.prototype.className = 'twitter';

  TwitterCards.prototype.template = template;

  return TwitterCards;

})(BasePanelTab);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../templates/twitter_cards.hbs":112,"./base_panel_tab.coffee":39}],80:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"bar bar1\"></div>\n<div class=\"bar bar2\"></div>\n<div class=\"bar bar3\"></div>\n";
  });

},{"hbsfy/runtime":162}],81:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<html class=\"";
  if (helper = helpers.elementCssClass) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.elementCssClass); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n  <base target='_parent'>\n  <head>\n    <style>\n      body { display: none; }\n    </style>\n  </head>\n  <body class=\"";
  if (helper = helpers.elementCssClass) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.elementCssClass); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n    ";
  if (helper = helpers.html) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.html); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n  </body>\n</html>\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],82:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<a href=\"#\" class=\"close\">x</a>\n<p>\n  <em>MozBar is now in DA mode.</em>\n  To turn it off completely, click the <img class=\"icon\"></img> to the\n  right of the address bar\n</p>\n";
  });

},{"hbsfy/runtime":162}],83:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"arrow-up\"></div>\n<div class=\"content\">\n\n  <h2>Help</h2>\n  <a href=\"#\" class=\"tour\">Turn on Tutorial</a>\n  <a href=\"http://moz.com/help/guides/research-tools/mozbar\" target=\"_blank\">MozBar Help</a>\n  <a href=\"https://seomoz.zendesk.com/forums/293194-Moz-Feature-Requests\" target=\"_blank\">Request a Feature</a>\n  <a href=\"http://moz.com/academy\" target=\"_blank\">Moz Academy</a>\n\n</div>\n<div class=\"arrow-down\"></div>\n";
  });

},{"hbsfy/runtime":162}],84:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this, functionType="function", escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n    <tr>\n      <td class=\"tag ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isOk), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"><p>";
  if (helper = helpers.status) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.status); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n      <td class=\"url\"><a href=\"";
  if (helper = helpers.url) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.url); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">";
  if (helper = helpers.url) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.url); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</a></td>\n    </tr>\n    ";
  return buffer;
  }
function program2(depth0,data) {
  
  
  return "ok";
  }

  buffer += "<table class=\"http-status\">\n  <thead>\n    <tr>\n      <td class=\"tag\">Status Code</td>\n      <td class=\"url\">URL</td>\n    </tr>\n  </thead>\n  <tbody class=\"scrollable\">\n    ";
  stack1 = helpers.each.call(depth0, depth0, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</table>\n\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],85:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, self=this, functionType="function", escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  return "\n          <div class=\"login\">\n            <div class=\"premium pull-left\"></div>\n            <p>Metrics are available with a paid\n              subscription to Moz.  <a href=\"http://moz.com/products\" target=\"_blank\">Learn more</a>\n              or <a href=\"http://moz.com/login\" target=\"_blank\">Login</a>\n            </p>\n          </div>\n          ";
  }

  buffer += "<table class=\"inbound-links\">\n  <thead>\n    <tr>\n      <td class=\"tag\">Page Attributes</td>\n      <td class=\"url\">URL</td>\n      <td class=\"subdomain\">Subdomain</td>\n      <td class=\"rootdomain\">\n        <div class=\"rootdomain\">\n          Root Domain\n\n          ";
  stack1 = helpers.unless.call(depth0, ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.isPro), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </div>\n      </td>\n    </tr>\n  </thead>\n  <tbody class=\"scrollable "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.level)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\">\n    <tr>\n      <td class=\"tag\"><p>Page Authority (PA)</p></td>\n      <td class=\"url\"><p>";
  if (helper = helpers.niceUpa) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceUpa); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n      <td class=\"subdomain\"><p>--</p></td>\n      <td class=\"rootdomain\"><p>--</p></td>\n    </tr>\n    <tr>\n      <td class=\"tag\"><p>Domain Authority</p></td>\n      <td class=\"url\"><p>--</p></td>\n      <td class=\"subdomain\"><p>--</p></td>\n      <td class=\"rootdomain\"><p>";
  if (helper = helpers.wholePda) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.wholePda); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n    </tr>\n    <tr>\n      <td class=\"tag\"><p>External Followed Links</p></td>\n      <td class=\"url\"><p>";
  if (helper = helpers.niceUeid) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceUeid); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n      <td class=\"subdomain premium\"><p>";
  if (helper = helpers.niceFeid) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceFeid); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n      <td class=\"rootdomain premium\"><p>";
  if (helper = helpers.nicePeid) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.nicePeid); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n    </tr>\n    <tr>\n      <td class=\"tag\"><p>Linking Root Domains</p></td>\n      <td class=\"url premium\"><p>";
  if (helper = helpers.niceUipl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceUipl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n      <td class=\"subdomain premium\"><p>";
  if (helper = helpers.niceFipl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceFipl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n      <td class=\"rootdomain premium\"><p>";
  if (helper = helpers.nicePid) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.nicePid); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n    </tr>\n    <tr>\n      <td class=\"tag\"><p>MozRank (mR)</p></td>\n      <td class=\"url\"><p>";
  if (helper = helpers.umrp) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.umrp); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n      <td class=\"subdomain\"><p>";
  if (helper = helpers.fmrp) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.fmrp); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " (DmR)</p></td>\n      <td class=\"rootdomain premium\"><p>";
  if (helper = helpers.pmrp) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.pmrp); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n    </tr>\n    <tr>\n      <td class=\"tag\"><p>MozTrust (mT)</p></td>\n      <td class=\"url\"><p>";
  if (helper = helpers.utrp) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.utrp); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n      <td class=\"subdomain premium\"><p>";
  if (helper = helpers.ftrp) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.ftrp); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n      <td class=\"rootdomain premium\"><p>";
  if (helper = helpers.ptrp) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.ptrp); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n    </tr>\n    <tr>\n      <td class=\"tag\"><p>Total Links</p></td>\n      <td class=\"url\"><p>";
  if (helper = helpers.niceUid) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceUid); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n      <td class=\"subdomain premium\"><p>";
  if (helper = helpers.niceFuid) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceFuid); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n      <td class=\"rootdomain premium\"><p>";
  if (helper = helpers.nicePuid) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.nicePuid); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p></td>\n    </tr>\n  </tbody>\n</table>\n\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],86:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "(<span class='status-code'>";
  if (helper = helpers.statusCode) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.statusCode); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</span>)";
  return buffer;
  }

  buffer += "<ul class=\"tabs\">\n  <li data-tab=\"page-elements\">On-Page Elements</li>\n  <li data-tab=\"general-attributes\">General Attributes</li>\n  <li data-tab=\"inbound-links\">Link Metrics</li>\n  <li data-tab=\"semantics\">Markup</li>\n  <li data-tab=\"http-status\">\n    Http Status\n    ";
  stack1 = helpers.unless.call(depth0, (depth0 && depth0.isOk), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  </li>\n</ul>\n\n<div class=\"tab\"></div>\n\n<div class=\"btn expand\"></div>\n<div class=\"gutter\"></div>\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],87:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n      ";
  stack1 = helpers.unless.call(depth0, (depth0 && depth0.isLoaded), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n      ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isLoaded), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n      <a href=\"https://moz.com/researchtools/keyword-difficulty\" target=\"_blank\">\n        <div class=\"btn key\" data-tooltip=\"Run Keyword Analysis\"/>\n      </a>\n    ";
  return buffer;
  }
function program2(depth0,data) {
  
  
  return "\n      <div class=\"btn activate-keyword-difficulty\"\n        data-tooltip=\"Obtain % and Estimated Volume<br>of keyword entered\">\n        <p>Get Keyword Difficulty</p>\n        <div class=\"onboarding-text\">\n          Get the Moz <em>Keyword Difficulty Score</em> for this keyword.\n        </div>\n      </div>\n      ";
  }

function program4(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n        <div class=\"loaded\">\n          <div class=\"difficulty\"\n            data-tooltip=\"Keyword Difficulty Score Highly Competitive!\">\n            <p>";
  if (helper = helpers.difficulty) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.difficulty); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "%</p>\n          </div>\n        </div>\n      ";
  return buffer;
  }

function program6(depth0,data) {
  
  
  return "\n      <a class=\"logged-out\" href=\"https://moz.com/pro/mozbar?utm_source=mozbar_toolbar&utm_medium=mozbar&utm_campaign=mozbar_get_premium\" target=\"_blank\">\n        Get Keyword Difficulty\n        with MozBar Premium\n        <div class=\"cta\">\n          Try Free\n        </div>\n      </a>\n    ";
  }

  buffer += "<style>\n";
  if (helper = helpers.css) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.css); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n</style>\n<div class=\"mozbar-css-wGA7MhRhQ3WS\">\n  <div class=\"keyword-difficulty\">\n    ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isPro), {hash:{},inverse:self.program(6, program6, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  </div>\n</div>\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],88:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"links-panel\">\n  <div class=\"link-type followed\" data-type=\"followed\">\n    Followed\n    <div class=\"bar\"></div>\n  </div>\n  <div class=\"link-type no-followed\" data-type=\"no-followed\">\n    No-Followed\n    <div class=\"bar\"></div>\n  </div>\n  <div class=\"link-type external\" data-type=\"external\">\n    External\n    <div class=\"bar\"></div>\n  </div>\n  <div class=\"link-type internal\" data-type=\"internal\">\n    Internal\n    <div class=\"bar\"></div>\n  </div>\n\n  <div class=\"search\">\n    <input name=\"search\" />\n  </div>\n\n  <div class=\"link-type keyword\" data-type=\"keyword\">\n    Highlight\n    <div class=\"bar\"></div>\n  </div>\n</div>\n";
  });

},{"hbsfy/runtime":162}],89:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n<div class=\"content page-serp-intro-address-bar\">\n  <div class=\"close\">x</div>\n  <p>The MozBar also helps you analyze SERPs. Search for a Keyword to learn how.</p>\n  <p>\n    For example - search for\n    <a href=\"https://google.com/search?q=seo%20tools\" target=\"_top\">SEO Tools</a>\n  </p>\n  <div class=\"footer\">\n    <a href='#' class='close'>No thanks - close this tutorial.</a>\n  </div>\n</div>\n\n<div class=\"content serp-page-intro-address-bar\">\n  <div class=\"close\">x</div>\n  <p>The MozBar also helps you analyze pages. Enter a URL to learn how.</p>\n\n  <p>\n    For example - analyze\n    <a href=\"http://moz.com\" target=\"_top\">moz.com</a>\n  </p>\n  <div class=\"footer\">\n    <a href='#' class='close'>\n      No thanks - close this tutorial.\n    </a>\n  </div>\n</div>\n\n<div class=\"content serp-hotspots page-hotspots\">\n  <p>Turn off hotspots.</p>\n  <a href=\"#\" class=\"close\">\n    <span class=\"close x\">x</span>\n    Close this tutorial.\n  </a>\n</div>\n";
  });

},{"hbsfy/runtime":162}],90:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"";
  if (helper = helpers.placement) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.placement); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n  <div class=\"arrow-up ";
  if (helper = helpers.lean) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.lean); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></div>\n  <div class=\"content\"><p>";
  if (helper = helpers.text) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.text); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</p></div>\n  <div class=\"arrow-down ";
  if (helper = helpers.lean) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.lean); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></div>\n</div>\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],91:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n    <tr>\n      <td class=\"tag\">";
  if (helper = helpers.tag) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.tag); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td>\n      <td class=\"content ";
  if (helper = helpers.contentClass) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.contentClass); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n        <p>\n        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.url), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  if (helper = helpers.content) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.content); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.url), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.multipleError), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </p>\n      </td>\n      ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.showLength), {hash:{},inverse:self.noop,fn:self.program(8, program8, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </tr>\n    ";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n          <a href=\"";
  if (helper = helpers.url) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.url); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" target=\"_blank\">\n        ";
  return buffer;
  }

function program4(depth0,data) {
  
  
  return "\n          </a>\n        ";
  }

function program6(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n          <p class=\"error\">Multiple ";
  if (helper = helpers.tag) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.tag); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " tags found!</p>\n        ";
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n        <td class=\"characters\">";
  if (helper = helpers.length) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.length); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</td>\n      ";
  return buffer;
  }

  buffer += "<table class=\"";
  if (helper = helpers.className) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.className); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n  <thead>\n    <tr>\n      <td class=\"tag\">Tag/Location</td>\n      <td class=\"content ";
  if (helper = helpers.contentClass) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.contentClass); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">Content</td>\n      <td class=\"characters\"># of Characters</td>\n    </tr>\n  </thead>\n  <tbody class=\"scrollable\">\n    ";
  stack1 = helpers.each.call(depth0, depth0, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  </tbody>\n</div>\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],92:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n  <div class=\"badge\">";
  if (helper = helpers.statusCode) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.statusCode); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n  ";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n        <div class=\"stat\">\n          <div class=\"title\">mR: ";
  if (helper = helpers.umrp) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.umrp); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n          <div class=\"scale-outer\">\n            <div class=\"scale-inner\" style=\"width: ";
  if (helper = helpers.umrpPct) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.umrpPct); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "%\"></div>\n          </div>\n        </div>\n        ";
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n      <div class=\"stat\">\n        <div class=\"title\">mT: ";
  if (helper = helpers.utrp) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.utrp); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n        <div class=\"scale-outer\">\n          <div class=\"scale-inner\" style=\"width: ";
  if (helper = helpers.utrpPct) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.utrpPct); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "%\"></div>\n        </div>\n      </div>\n      ";
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n      <div class=\"links\">\n        <a href=\"http://moz.com/researchtools/ose/links?site=";
  if (helper = helpers.pageUrl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.pageUrl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "&src=mb\" target=\"_blank\">\n          <p class=\"line\">";
  if (helper = helpers.niceUid) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceUid); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " links";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.isPro), {hash:{},inverse:self.noop,fn:self.program(8, program8, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</p>\n          ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.isPro), {hash:{},inverse:self.noop,fn:self.program(10, program10, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </a>\n      </div>\n      ";
  return buffer;
  }
function program8(depth0,data) {
  
  
  return " from";
  }

function program10(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n          <p class=\"line\">";
  if (helper = helpers.niceUipl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceUipl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " Root Domains</p>\n          ";
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n      <div class=\"stat\">\n        <div class=\"title\">DmR: ";
  if (helper = helpers.pmrp) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.pmrp); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n        <div class=\"scale-outer alt\">\n          <div class=\"scale-inner alt\" style=\"width: ";
  if (helper = helpers.pmrpPct) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.pmrpPct); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "%\"></div>\n        </div>\n      </div>\n      ";
  return buffer;
  }

function program14(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n      <div class=\"stat\">\n        <div class=\"title\">DmT: ";
  if (helper = helpers.ptrp) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.ptrp); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n        <div class=\"scale-outer alt\">\n          <div class=\"scale-inner alt\" style=\"width: ";
  if (helper = helpers.ptrpPct) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.ptrpPct); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "%\"></div>\n        </div>\n      </div>\n      ";
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n      ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.isPro), {hash:{},inverse:self.noop,fn:self.program(17, program17, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      ";
  return buffer;
  }
function program17(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n      <div class=\"links\">\n        <a href=\"http://moz.com/researchtools/ose/links?site=";
  if (helper = helpers.rootDomain) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.rootDomain); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "&src=mb\" target=\"_blank\">\n          <p class=\"line\">";
  if (helper = helpers.nicePuid) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.nicePuid); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " links from</p>\n          <p class=\"line\">";
  if (helper = helpers.nicePid) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.nicePid); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " Root Domains</p>\n        </a>\n      </div>\n      <h3>Subdomain:</h3>\n      <div class=\"links\">\n        <a href=\"http://moz.com/researchtools/ose/links?site=";
  if (helper = helpers.pageUrl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.pageUrl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "&src=mb\" target=\"_blank\">\n          <p class=\"line\">";
  if (helper = helpers.niceFuid) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceFuid); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " links from</p>\n          <p class=\"line\">";
  if (helper = helpers.niceFipl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceFipl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " Root Domains</p>\n        </a>\n      </div>\n      ";
  return buffer;
  }

function program19(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n      <div class=\"stat\">\n        <div class=\"title\">Spam<br />Score:</div>\n        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.noFspsc), {hash:{},inverse:self.program(22, program22, data),fn:self.program(20, program20, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      </div>\n      ";
  return buffer;
  }
function program20(depth0,data) {
  
  
  return "\n          <div class='line' data-tooltip=\"Spam score not yet determined for this domain\">--</div>\n        ";
  }

function program22(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n          <div class=\"score\">\n            <a href=\"https://moz.com/researchtools/ose/spam-analysis?site=";
  if (helper = helpers.rootDomain) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.rootDomain); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "&target=subdomain&source=subdomain&page=1&sort=spam_score\" target=\"_blank\">\n              <p class=\"line\">";
  if (helper = helpers.niceFspsc) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceFspsc); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</p>\n            </a>\n          </div>\n          <div class=\"meter\">\n            <a href=\"https://moz.com/researchtools/ose/spam-analysis?site=";
  if (helper = helpers.rootDomain) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.rootDomain); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "&target=subdomain&source=subdomain&page=1&sort=spam_score\" target=\"_blank\">\n              <div class=\"bar bar1 ";
  if (helper = helpers.bar1on) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.bar1on); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></div>\n              <div class=\"bar bar2 ";
  if (helper = helpers.bar2on) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.bar2on); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></div>\n              <div class=\"bar bar3 ";
  if (helper = helpers.bar3on) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.bar3on); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></div>\n            </a>\n          </div>\n        ";
  return buffer;
  }

function program24(depth0,data) {
  
  
  return "\n  <div class=\"right-panel\">\n    Get full access to MozBar Premium with Moz Pro\n    <a class=\"cta learn-more\" href=\"https://moz.com/pro/mozbar?utm_source=mozbar_toolbar&utm_medium=mozbar&utm_campaign=mozbar_get_premium\" target=\"_blank\">\n      Try Free\n    </a>\n    or\n    <a href=\"http://moz.com/login\" target=\"_blank\">\n      Log in\n    </a>\n  </div>\n";
  }

  buffer += "<div class=\"btn show-info-panel\" data-tooltip=\"Page Analysis\">\n  ";
  stack1 = self.invokePartial(partials['page-info-icon'], 'page-info-icon', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n  <div class=\"onboarding-text\">\n    <p>Open the <em>Page Analysis Drawer</em>.</p>\n    <p>\n      Get information and analysis about the page structure and markup as well as backlink data.\n    </p>\n  </div>\n  ";
  stack1 = helpers.unless.call(depth0, (depth0 && depth0.isOk), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n\n<div class=\"btn show-links-panel\" data-tooltip=\"Highlight Links\">\n  ";
  stack1 = self.invokePartial(partials['highlight-icon'], 'highlight-icon', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  <div class=\"onboarding-text\">\n    <p>Open the <em>Highlighter Tool</em>.</p>\n    <p>\n      Show followed or external links, even custom text.  Click again to put it away.\n    </p>\n  </div>\n</div>\n<div class=\"divider\"></div>\n<div class=\"viewport\">\n  <div class=\"fade-out\"></div>\n  <div class=\"viewport-contents\">\n    <div class=\"page-stats\">\n      <div class=\"stat-stack\">\n        <div class=\"stat\">\n          <div class=\"title\">PA: ";
  if (helper = helpers.niceUpa) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceUpa); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n          <div class=\"scale-outer\">\n            <div class=\"scale-inner\" style=\"width: ";
  if (helper = helpers.niceUpa) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceUpa); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "%\"></div>\n          </div>\n        </div>\n        ";
  stack1 = (helper = helpers.ifDefined || (depth0 && depth0.ifDefined),options={hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.umrp), options) : helperMissing.call(depth0, "ifDefined", (depth0 && depth0.umrp), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      </div>\n      ";
  stack1 = (helper = helpers.ifDefined || (depth0 && depth0.ifDefined),options={hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.utrp), options) : helperMissing.call(depth0, "ifDefined", (depth0 && depth0.utrp), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.showLinks), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      <div class=\"stat\">\n        <div class=\"title\">DA: ";
  if (helper = helpers.nicePda) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.nicePda); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n        <div class=\"scale-outer alt\">\n          <div class=\"scale-inner alt\" style=\"width: ";
  if (helper = helpers.nicePda) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.nicePda); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "%\"></div>\n        </div>\n      </div>\n      ";
  stack1 = (helper = helpers.ifDefined || (depth0 && depth0.ifDefined),options={hash:{},inverse:self.noop,fn:self.program(12, program12, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.pmrp), options) : helperMissing.call(depth0, "ifDefined", (depth0 && depth0.pmrp), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      ";
  stack1 = (helper = helpers.ifDefined || (depth0 && depth0.ifDefined),options={hash:{},inverse:self.noop,fn:self.program(14, program14, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.ptrp), options) : helperMissing.call(depth0, "ifDefined", (depth0 && depth0.ptrp), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.showLinks), {hash:{},inverse:self.noop,fn:self.program(16, program16, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n      ";
  stack1 = (helper = helpers.ifDefined || (depth0 && depth0.ifDefined),options={hash:{},inverse:self.noop,fn:self.program(19, program19, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.fspsc), options) : helperMissing.call(depth0, "ifDefined", (depth0 && depth0.fspsc), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </div>\n\n    <div class=\"social-stats\"></div>\n\n  </div>\n  <div class=\"fade-in\"></div>\n</div>\n<div class=\"scroll-arrows\">\n  <div class=\"left-arrow\">&lt;</div>\n  <div class=\"right-arrow enabled\">&gt;</div>\n</div>\n\n";
  stack1 = helpers.unless.call(depth0, ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.isPro), {hash:{},inverse:self.noop,fn:self.program(24, program24, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],93:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\">\n  <circle cx=\"12\" cy=\"12\" r=\"12\"/>\n  <text x=\"9.5\" y=\"8.75\" transform=\"rotate(45)\" font-size=\"26\" font-weight=\"bold\" font-family=\"Open Sans, sans-serif\">\n    <tspan>+</tspan>\n  </text>\n</svg>\n";
  });

},{"hbsfy/runtime":162}],94:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 21 48\">\n  <path d=\"M24.112 21.112h-24v-12h48v12h-24zm0-18h-24v-3h48v3h-24z\"/>\n</svg>\n";
  });

},{"hbsfy/runtime":162}],95:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 60\">\n  <path d=\"M40 48.407H20v-14h4v10h32v-30H44v-10H24v15h-4v-19h32.544l3.728 3.073L60 6.552v41.855H40zm12-38c2.2 0 4-.247 4-.548 0-.304-1.237-1.64-2.75-2.97-1.513-1.33-3.313-2.435-4-2.453L48 4.407v6h4zm-40.788 27H9.425l-4.713-4.785L0 27.838v-2.606l4.75-4.373 4.75-4.375 1.75-.04 1.75-.04v3.425l-2.75 2.25-2.75 2.253 14.69.036 14.692.036.645 1.044.645 1.044-1.208 1.457-1.21 1.458H7.73l2.635 2.072L13 33.55v3.854h-1.788z\"/>\n</svg>\n";
  });

},{"hbsfy/runtime":162}],96:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 69.287 72.44\">\n  <path d=\"M2.933 69.22l-1.782.067-.574-1.5-.576-1.5 3.357-9.863 3.357-9.864 23.328-22.386L53.37 1.787l2.28-.893L57.934 0l2.622.658 2.622.658 3.395 2.98 3.395 2.982 1.237 2.985 1.236 2.985-.596 2.27-.597 2.27-24.108 23-24.11 23-9.158 2.683c-5.037 1.476-9.96 2.714-10.94 2.75zm8.3-7.938c1.788-.513 3.415-1.095 3.613-1.293.198-.2-.76-1.415-2.132-2.703C11.344 56 10 55.167 9.728 55.44c-.27.27-.776 1.907-1.12 3.634l-.63 3.14 3.254-.932zm9.934-4.046c.3-.028 8.872-8.115 19.047-17.97l18.5-17.922-4.173-4.186-4.17-4.186-18.58 17.835c-10.216 9.81-18.576 18.074-18.576 18.366 0 .29 1.666 2.236 3.703 4.322 2.036 2.086 3.95 3.77 4.25 3.74zm42.127-40.95c.37 0 1.233-.67 1.916-1.494l1.24-1.495-1.67-2.55-1.672-2.55-2.417-1.102-2.417-1.102L56.697 7.3l-1.575 1.31 3.75 3.838c2.06 2.112 4.05 3.84 4.422 3.84z\"/>\n</svg>\n";
  });

},{"hbsfy/runtime":162}],97:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 28.071 21.2\">\n  <path d=\"M2.435 27.42l-1.192-.578-.62-1.364L0 24.114V12.53l1.255-.178 1.256-.18.325-3.775.324-3.777 1.604-1.675L6.37 1.268 8.484.634 10.6 0l2.115.634 2.116.634 1.606 1.675 1.605 1.675.325 3.777.324 3.776 1.255.18 1.255.178v11.587l-.62 1.36-.62 1.36-1.358.618-1.36.62-6.808-.038-6.808-.038-1.19-.577zM18.3 25.17l.668-.67V14.125H2.232v10.378l.67.668.67.67H17.63l.67-.67zM8.136 22.545l-.963-1.064.18-1.847.178-1.848 1.534-.854 1.534-.853 1.534.854 1.534.855.18 1.848.178 1.848-.963 1.065-.962 1.063h-3l-.963-1.063zm3.827-1.676l.313-.508-.34-.888-.34-.887H9.603l-.34.887-.34.888.312.507.314.507h2.1l.314-.508zm4.683-10.362l.19-1.664-.622-2.072-.62-2.072-1.457-1.146-1.457-1.146H8.618l-1.3.91-1.298.91-.78 1.862-.777 1.86v1.88c0 1.032.176 2.052.39 2.267l.39.39 5.608-.158 5.608-.16.19-1.662z\"/>\n</svg>\n";
  });

},{"hbsfy/runtime":162}],98:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 62 62\">\n  <path d=\"M29.316 59.378l-.897-2.36-3.908-.625-3.906-.624-4.168-3.02-4.168-3.02-3.02-4.168-3.02-4.168-.623-3.906-.625-3.907-2.36-.896-2.36-.897v-2.1l2.36-.896 2.36-.897.625-3.906.624-3.907 3.02-4.167 3.02-4.168 4.168-3.02 4.168-3.02 3.906-.624 3.907-.623.896-2.36.897-2.36h2.1l.896 2.36.897 2.36 3.906.624 3.906.626 4.167 3.02 4.168 3.02 3.02 4.167 3.02 4.167.624 3.907.623 3.906 2.36.898 2.36.898v2.1l-2.36.896-2.36.897-.624 3.908-.626 3.906-3.02 4.168-3.02 4.168-4.167 3.02-4.168 3.02-3.907.623-3.906.625-.898 2.36-.898 2.36h-2.1l-.896-2.36zm10.967-10.166c5.713-2.92 10.206-9.063 11.32-15.475l.61-3.5-.882-3.8-.88-3.802-2.253-3.29-2.254-3.288-3.29-2.255-3.292-2.255-4.048-.91-4.05-.91-4.048.91-4.05.91-3.29 2.255-3.292 2.255-2.255 3.29-2.255 3.292-.91 4.048-.91 4.05.91 4.048.91 4.05 2.255 3.29 2.255 3.292 3.335 2.285c1.834 1.256 4.8 2.642 6.59 3.08l3.256.793 4-.538c2.2-.295 5.134-1.117 6.52-1.826zm-20.02-6.334c0-.472 1.537-4.185 3.417-8.25l3.417-7.39 6.474-4.75c6.266-4.597 8.693-5.683 8.693-3.892 0 .473-1.538 4.185-3.417 8.25l-3.417 7.39-6.476 4.75c-6.265 4.598-8.69 5.684-8.69 3.892zM35.31 27.652l1.115-2.086-.575-.575-.575-.574-1.983 1.794-1.982 1.795.535.866c.902 1.46 2.292.97 3.464-1.218z\"/>\n  </svg>\n";
  });

},{"hbsfy/runtime":162}],99:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 28 28\">\n  <path d=\"M27.084 27.874l-.458-.003-2.472-2.245-2.47-2.246-1.416.7-1.416.7h-4.084l-1.6-.775-1.6-.774H0V0h21.444v11.412l.68.363.68.364L23.73 14l.928 1.864v3.208l-.737 1.524-.738 1.523 2.407 2.282L28 26.682l-.23.598-.228.597-.458-.003zM17.5 23.017c.68-.113 1.667-.427 2.19-.698.525-.272 1.37-.986 1.876-1.59l.922-1.094.24-1.275.238-1.274-.408-1.362-.408-1.362-1.242-1.09-1.242-1.09-1.434-.387-1.434-.386-1.435.385-1.434.387-1.243 1.09-1.24 1.09-.41 1.362-.408 1.362.246 1.314.246 1.314 1.14 1.237 1.14 1.238 1.43.518 1.43.517 1.238-.206zM5.88 21.444h4.09l-.517-1.24c-.285-.68-.518-1.646-.518-2.144v-.905H4.29v-1.073h4.568l.217-.566c.12-.31.217-.713.217-.893v-.328H4.29v-.715H9.98l.35-.65c.19-.36.966-1.08 1.723-1.605l1.377-.954 1.678-.313 1.678-.313 1.434.262 1.435.262v-8.48H1.787v19.657H5.88zM9.29 8.934H4.29V5.004h10.006v3.93H9.292z\"/>\n  </svg>\n";
  });

},{"hbsfy/runtime":162}],100:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24.142 24\">\n  <path d=\"M9.504 23.087c-.245-.613-.547-1.4-.67-1.745-.24-.676-.573-.646-2.61.237l-1.215.525-1.56-1.588-1.562-1.587.67-1.494c.37-.822.623-1.64.563-1.82-.06-.18-.785-.576-1.614-.882L0 14.178V9.822l1.52-.568c1.687-.63 1.8-1.004.908-3.03l-.533-1.215 1.588-1.56L5.07 1.887l1.494.67c.822.37 1.64.623 1.82.563.18-.06.576-.785.882-1.614L9.822 0h4.356l.556 1.506c.306.83.703 1.555.882 1.615.18.06.998-.192 1.82-.56l1.494-.672 1.587 1.56 1.588 1.56-.533 1.215c-.89 2.027-.78 2.402.907 3.03l1.52.57v4.355l-1.52.568c-1.687.63-1.8 1.004-.908 3.03l.533 1.215-1.588 1.56-1.587 1.562-1.494-.67c-.822-.37-1.64-.623-1.82-.563-.18.06-.575.785-.88 1.614L14.18 24l-2.114.1c-2.11.102-2.116.1-2.562-1.013zm3.812-2.312c.304-1.012.697-1.503 1.52-1.895 1.035-.494 1.196-.483 2.463.163 1.24.634 1.4.646 1.895.152.494-.494.484-.65-.122-1.837-.602-1.18-.618-1.402-.175-2.46.38-.91.788-1.256 1.865-1.578 1.167-.35 1.378-.552 1.378-1.32s-.21-.97-1.377-1.32c-1.077-.322-1.485-.668-1.865-1.577-.443-1.06-.427-1.282.175-2.46.606-1.19.616-1.344.122-1.838s-.654-.482-1.896.152c-1.268.646-1.43.657-2.465.163-.822-.392-1.215-.883-1.52-1.895C12.97 2.07 12.768 1.86 12 1.86c-.767 0-.97.21-1.316 1.365-.304 1.012-.697 1.503-1.52 1.895-1.035.494-1.196.483-2.463-.163-1.24-.634-1.4-.646-1.895-.152-.494.494-.482.654.152 1.896.646 1.268.657 1.43.163 2.465-.392.822-.883 1.215-1.895 1.52C2.07 11.03 1.86 11.232 1.86 12c0 .768.21.97 1.377 1.32 1.077.322 1.485.668 1.865 1.577.443 1.06.427 1.282-.175 2.46-.606 1.19-.616 1.344-.122 1.838s.654.482 1.896-.152c1.268-.646 1.43-.657 2.465-.163.822.392 1.215.883 1.52 1.895.345 1.155.548 1.366 1.315 1.366.767 0 .97-.21 1.316-1.365zM10.48 15.75c-1.506-.66-2.367-2.033-2.367-3.77 0-1.42.157-1.815 1.105-2.762 1.6-1.602 3.963-1.602 5.564 0 .95.95 1.105 1.34 1.105 2.782 0 1.424-.157 1.835-1.045 2.723-1.116 1.116-3.1 1.583-4.363 1.028zm2.872-2.398c.372-.372.676-.98.676-1.352 0-.87-1.157-2.028-2.028-2.028-.372 0-.98.304-1.352.676-.372.372-.676.98-.676 1.352 0 .372.304.98.676 1.352.372.372.98.676 1.352.676.372 0 .98-.304 1.352-.676z\"/>\n</svg>\n";
  });

},{"hbsfy/runtime":162}],101:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, self=this, helperMissing=helpers.helperMissing, functionType="function", escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  return "\n      <option value=\"google\">Google</option>\n      <option value=\"bing\">Bing</option>\n      <option value=\"yahoo\">Yahoo</option>\n    ";
  }

function program3(depth0,data) {
  
  
  return "checked";
  }

function program5(depth0,data) {
  
  
  return "\n        <option value=\"US\">United States</option>\n        <option value=\"GB\">United Kingdom</option>\n        <option value=\"IN\">India</option>\n        <option value=\"CA\">Canada</option>\n        <option value=\"DE\">Germany</option>\n        <optgroup label=\"----------\"></optgroup>\n        <option value=\"\">Country</option>\n        <option value=\"AF\">Afghanistan</option>\n        <option value=\"AL\">Albania</option>\n        <option value=\"DZ\">Algeria</option>\n        <option value=\"AS\">American Samoa</option>\n        <option value=\"AD\">Andorra</option>\n        <option value=\"AO\">Angola</option>\n        <option value=\"AI\">Anguilla</option>\n        <option value=\"AQ\">Antarctica</option>\n        <option value=\"AG\">Antigua and Barbuda</option>\n        <option value=\"AR\">Argentina</option>\n        <option value=\"AM\">Armenia</option>\n        <option value=\"AW\">Aruba</option>\n        <option value=\"AU\">Australia</option>\n        <option value=\"AT\">Austria</option>\n        <option value=\"AZ\">Azerbaijan</option>\n        <option value=\"BS\">Bahamas</option>\n        <option value=\"BH\">Bahrain</option>\n        <option value=\"BD\">Bangladesh</option>\n        <option value=\"BB\">Barbados</option>\n        <option value=\"BY\">Belarus</option>\n        <option value=\"BE\">Belgium</option>\n        <option value=\"BZ\">Belize</option>\n        <option value=\"BJ\">Benin</option>\n        <option value=\"BM\">Bermuda</option>\n        <option value=\"BT\">Bhutan</option>\n        <option value=\"BO\">Bolivia</option>\n        <option value=\"BA\">Bosnia and Herzegovina</option>\n        <option value=\"BW\">Botswana</option>\n        <option value=\"BV\">Bouvet Island</option>\n        <option value=\"BR\">Brazil</option>\n        <option value=\"IO\">British Indian Ocean Territory</option>\n        <option value=\"VG\">British Virgin Islands</option>\n        <option value=\"BN\">Brunei</option>\n        <option value=\"BG\">Bulgaria</option>\n        <option value=\"BF\">Burkina Faso</option>\n        <option value=\"BI\">Burundi</option>\n        <option value=\"KH\">Cambodia</option>\n        <option value=\"CM\">Cameroon</option>\n        <option value=\"CA\">Canada</option>\n        <option value=\"CV\">Cape Verde</option>\n        <option value=\"KY\">Cayman Islands</option>\n        <option value=\"CF\">Central African Republic</option>\n        <option value=\"TD\">Chad</option>\n        <option value=\"CL\">Chile</option>\n        <option value=\"CN\">China</option>\n        <option value=\"CX\">Christmas Island</option>\n        <option value=\"CC\">Cocos [Keeling] Islands</option>\n        <option value=\"CO\">Colombia</option>\n        <option value=\"KM\">Comoros</option>\n        <option value=\"CD\">Congo [DRC]</option>\n        <option value=\"CG\">Congo [Republic]</option>\n        <option value=\"CK\">Cook Islands</option>\n        <option value=\"CR\">Costa Rica</option>\n        <option value=\"CI\">Cote d'Ivoire</option>\n        <option value=\"HR\">Croatia</option>\n        <option value=\"CU\">Cuba</option>\n        <option value=\"CY\">Cyprus</option>\n        <option value=\"CZ\">Czech Republic</option>\n        <option value=\"DK\">Denmark</option>\n        <option value=\"DJ\">Djibouti</option>\n        <option value=\"DM\">Dominica</option>\n        <option value=\"DO\">Dominican Republic</option>\n        <option value=\"EC\">Ecuador</option>\n        <option value=\"EG\">Egypt</option>\n        <option value=\"SV\">El Salvador</option>\n        <option value=\"GQ\">Equatorial Guinea</option>\n        <option value=\"ER\">Eritrea</option>\n        <option value=\"EE\">Estonia</option>\n        <option value=\"ET\">Ethiopia</option>\n        <option value=\"FK\">Falkland Islands [Islas Malvinas]</option>\n        <option value=\"FO\">Faroe Islands</option>\n        <option value=\"FJ\">Fiji</option>\n        <option value=\"FI\">Finland</option>\n        <option value=\"FR\">France</option>\n        <option value=\"GF\">French Guiana</option>\n        <option value=\"PF\">French Polynesia</option>\n        <option value=\"TF\">French Southern Territories</option>\n        <option value=\"GA\">Gabon</option>\n        <option value=\"GM\">Gambia</option>\n        <option value=\"GE\">Georgia</option>\n        <option value=\"DE\">Germany</option>\n        <option value=\"GH\">Ghana</option>\n        <option value=\"GI\">Gibraltar</option>\n        <option value=\"GR\">Greece</option>\n        <option value=\"GL\">Greenland</option>\n        <option value=\"GD\">Grenada</option>\n        <option value=\"GP\">Guadeloupe</option>\n        <option value=\"GU\">Guam</option>\n        <option value=\"GT\">Guatemala</option>\n        <option value=\"GN\">Guinea</option>\n        <option value=\"GW\">Guinea-Bissau</option>\n        <option value=\"GY\">Guyana</option>\n        <option value=\"HT\">Haiti</option>\n        <option value=\"HM\">Heard Island and McDonald Islands</option>\n        <option value=\"HN\">Honduras</option>\n        <option value=\"HK\">Hong Kong</option>\n        <option value=\"HU\">Hungary</option>\n        <option value=\"IS\">Iceland</option>\n        <option value=\"IN\">India</option>\n        <option value=\"ID\">Indonesia</option>\n        <option value=\"IR\">Iran</option>\n        <option value=\"IQ\">Iraq</option>\n        <option value=\"IE\">Ireland</option>\n        <option value=\"IL\">Israel</option>\n        <option value=\"IT\">Italy</option>\n        <option value=\"JM\">Jamaica</option>\n        <option value=\"JP\">Japan</option>\n        <option value=\"JO\">Jordan</option>\n        <option value=\"KZ\">Kazakhstan</option>\n        <option value=\"KE\">Kenya</option>\n        <option value=\"KI\">Kiribati</option>\n        <option value=\"KW\">Kuwait</option>\n        <option value=\"KG\">Kyrgyzstan</option>\n        <option value=\"LA\">Laos</option>\n        <option value=\"LV\">Latvia</option>\n        <option value=\"LB\">Lebanon</option>\n        <option value=\"LS\">Lesotho</option>\n        <option value=\"LR\">Liberia</option>\n        <option value=\"LY\">Libya</option>\n        <option value=\"LI\">Liechtenstein</option>\n        <option value=\"LT\">Lithuania</option>\n        <option value=\"LU\">Luxembourg</option>\n        <option value=\"MO\">Macau</option>\n        <option value=\"MK\">Macedonia [FYROM]</option>\n        <option value=\"MG\">Madagascar</option>\n        <option value=\"MW\">Malawi</option>\n        <option value=\"MY\">Malaysia</option>\n        <option value=\"MV\">Maldives</option>\n        <option value=\"ML\">Mali</option>\n        <option value=\"MT\">Malta</option>\n        <option value=\"MH\">Marshall Islands</option>\n        <option value=\"MQ\">Martinique</option>\n        <option value=\"MR\">Mauritania</option>\n        <option value=\"MU\">Mauritius</option>\n        <option value=\"YT\">Mayotte</option>\n        <option value=\"MX\">Mexico</option>\n        <option value=\"FM\">Micronesia</option>\n        <option value=\"MD\">Moldova</option>\n        <option value=\"MC\">Monaco</option>\n        <option value=\"MN\">Mongolia</option>\n        <option value=\"MS\">Montserrat</option>\n        <option value=\"MA\">Morocco</option>\n        <option value=\"MZ\">Mozambique</option>\n        <option value=\"MM\">Myanmar [Burma]</option>\n        <option value=\"NA\">Namibia</option>\n        <option value=\"NR\">Nauru</option>\n        <option value=\"NP\">Nepal</option>\n        <option value=\"NL\">Netherlands</option>\n        <option value=\"AN\">Netherlands Antilles</option>\n        <option value=\"NC\">New Caledonia</option>\n        <option value=\"NZ\">New Zealand</option>\n        <option value=\"NI\">Nicaragua</option>\n        <option value=\"NE\">Niger</option>\n        <option value=\"NG\">Nigeria</option>\n        <option value=\"NU\">Niue</option>\n        <option value=\"NF\">Norfolk Island</option>\n        <option value=\"KP\">North Korea</option>\n        <option value=\"MP\">Northern Mariana Islands</option>\n        <option value=\"NO\">Norway</option>\n        <option value=\"OM\">Oman</option>\n        <option value=\"PK\">Pakistan</option>\n        <option value=\"PW\">Palau</option>\n        <option value=\"PS\">Palestinian Territories</option>\n        <option value=\"PA\">Panama</option>\n        <option value=\"PG\">Papua New Guinea</option>\n        <option value=\"PY\">Paraguay</option>\n        <option value=\"PE\">Peru</option>\n        <option value=\"PH\">Philippines</option>\n        <option value=\"PN\">Pitcairn Islands</option>\n        <option value=\"PL\">Poland</option>\n        <option value=\"PT\">Portugal</option>\n        <option value=\"PR\">Puerto Rico</option>\n        <option value=\"QA\">Qatar</option>\n        <option value=\"RE\">Reunion</option>\n        <option value=\"RO\">Romania</option>\n        <option value=\"RU\">Russia</option>\n        <option value=\"RW\">Rwanda</option>\n        <option value=\"SH\">Saint Helena</option>\n        <option value=\"KN\">Saint Kitts and Nevis</option>\n        <option value=\"LC\">Saint Lucia</option>\n        <option value=\"PM\">Saint Pierre and Miquelon</option>\n        <option value=\"VC\">Saint Vincent and the Grenadines</option>\n        <option value=\"WS\">Samoa</option>\n        <option value=\"SM\">San Marino</option>\n        <option value=\"ST\">Sao Tome and Príncipe</option>\n        <option value=\"SA\">Saudi Arabia</option>\n        <option value=\"SN\">Senegal</option>\n        <option value=\"YU\">Serbia</option>\n        <option value=\"SC\">Seychelles</option>\n        <option value=\"SL\">Sierra Leone</option>\n        <option value=\"SG\">Singapore</option>\n        <option value=\"SK\">Slovakia</option>\n        <option value=\"SI\">Slovenia</option>\n        <option value=\"SB\">Solomon Islands</option>\n        <option value=\"SO\">Somalia</option>\n        <option value=\"ZA\">South Africa</option>\n        <option value=\"GS\">South Georgia and the South Sandwich Islands</option>\n        <option value=\"KR\">South Korea</option>\n        <option value=\"ES\">Spain</option>\n        <option value=\"LK\">Sri Lanka</option>\n        <option value=\"SD\">Sudan</option>\n        <option value=\"SR\">Suriname</option>\n        <option value=\"SJ\">Svalbard and Jan Mayen</option>\n        <option value=\"SZ\">Swaziland</option>\n        <option value=\"SE\">Sweden</option>\n        <option value=\"CH\">Switzerland</option>\n        <option value=\"SY\">Syria</option>\n        <option value=\"TW\">Taiwan</option>\n        <option value=\"TJ\">Tajikistan</option>\n        <option value=\"TZ\">Tanzania</option>\n        <option value=\"TH\">Thailand</option>\n        <option value=\"TG\">Togo</option>\n        <option value=\"TK\">Tokelau</option>\n        <option value=\"TO\">Tonga</option>\n        <option value=\"TT\">Trinidad and Tobago</option>\n        <option value=\"TN\">Tunisia</option>\n        <option value=\"TR\">Turkey</option>\n        <option value=\"TM\">Turkmenistan</option>\n        <option value=\"TC\">Turks and Caicos Islands</option>\n        <option value=\"TV\">Tuvalu</option>\n        <option value=\"UM\">U.S. Minor Outlying Islands</option>\n        <option value=\"VI\">U.S. Virgin Islands</option>\n        <option value=\"UG\">Uganda</option>\n        <option value=\"UA\">Ukraine</option>\n        <option value=\"AE\">United Arab Emirates</option>\n        <option value=\"GB\">United Kingdom</option>\n        <option value=\"US\">United States</option>\n        <option value=\"UY\">Uruguay</option>\n        <option value=\"UZ\">Uzbekistan</option>\n        <option value=\"VU\">Vanuatu</option>\n        <option value=\"VA\">Vatican City</option>\n        <option value=\"VE\">Venezuela</option>\n        <option value=\"VN\">Vietnam</option>\n        <option value=\"WF\">Wallis and Futuna</option>\n        <option value=\"EH\">Western Sahara</option>\n        <option value=\"YE\">Yemen</option>\n        <option value=\"ZM\">Zambia</option>\n        <option value=\"ZW\">Zimbabwe</option>\n      ";
  }

function program7(depth0,data) {
  
  
  return "\n        Update Profile\n      ";
  }

function program9(depth0,data) {
  
  
  return "\n        Create Profile\n      ";
  }

function program11(depth0,data) {
  
  
  return "\n    <button class=\"delete\">\n      Delete Profile\n    </button>\n   ";
  }

  buffer += "  <div class=\"profile-edit\">\n  <h1>Add Profile</h1>\n\n  <p>Create a profile so you can quickly rerun custom, targeted search results.</p>\n\n  <div>\n  <select name=\"engine\" class=\"engine\">\n    ";
  stack1 = (helper = helpers.select || (depth0 && depth0.select),options={hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.engine), options) : helperMissing.call(depth0, "select", (depth0 && depth0.engine), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  </select>\n  </div>\n  <div>\n  <label>\n    <input type=\"checkbox\" class=\"disable-personalization\"\n      ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.disablePersonalization), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">\n      Show non-personalized results</input>\n  </label>\n  </div>\n  <div>\n    <select name=\"country\" class=\"country\">\n      ";
  stack1 = (helper = helpers.select || (depth0 && depth0.select),options={hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.country), options) : helperMissing.call(depth0, "select", (depth0 && depth0.country), options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </select>\n  </div>\n\n  <div>\n  <select name=\"region\" class=\"region\">\n  </select>\n  </div>\n\n  <div>\n  <select name=\"city\" class=\"city\">\n  </select>\n  </div>\n\n  <div>\n  <input type=\"text\" name=\"name\" placeholder=\"Name\" value=\"";
  if (helper = helpers.name) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.name); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" class=\"name\"/>\n  </div>\n\n  <div class=\"actions\">\n    <button class=\"save\">\n      ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.id), {hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </button>\n    ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.id), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    <button class=\"cancel\">Cancel</button>\n  </div>\n</div>\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],102:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", helper, options;
  buffer += "\n  "
    + escapeExpression((helper = helpers.option || (depth0 && depth0.option),options={hash:{
    'value': ((depth0 && depth0.name)),
    'text': ((depth0 && depth0.name))
  },data:data},helper ? helper.call(depth0, (depth1 && depth1.city), options) : helperMissing.call(depth0, "option", (depth1 && depth1.city), options)))
    + "\n";
  return buffer;
  }

  buffer += "<option value=\"\">City</option>\n";
  options={hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data}
  if (helper = helpers.cities) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0.cities); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers.cities) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],103:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", helper, options;
  buffer += "\n  "
    + escapeExpression((helper = helpers.option || (depth0 && depth0.option),options={hash:{
    'value': ((depth0 && depth0.code)),
    'text': ((depth0 && depth0.name))
  },data:data},helper ? helper.call(depth0, (depth1 && depth1.region), options) : helperMissing.call(depth0, "option", (depth1 && depth1.region), options)))
    + "\n";
  return buffer;
  }

  buffer += "<option value=\"\">Region</option>\n";
  options={hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data}
  if (helper = helpers.regions) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0.regions); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers.regions) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(1, program1, data, depth0),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],104:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n      <li class=\"search-profile\" data-engine=\"";
  if (helper = helpers.engine) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.engine); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" data-id=\"";
  if (helper = helpers.id) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.id); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n        ";
  if (helper = helpers.name) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.name); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n        <div class=\"edit-profile\"></div>\n      </li>\n    ";
  return buffer;
  }

  buffer += "<div class=\"content\">\n  <div class=\"divider divider-top\"></div>\n  <ul>\n    ";
  stack1 = helpers.each.call(depth0, depth0, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    <li class=\"search-profile add-new\">\n      Add New Profile\n      <div class=\"edit-profile\"></div>\n    </li>\n  </ul>\n  <div class=\"divider divider-bottom\"></div>\n</div>\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],105:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "check";
  }

function program3(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n          <p>Schema.org found on this page.</p>\n          <div class=\"cta\">\n          Preview in\n            <a href=\"";
  if (helper = helpers.richSnippetToolUrl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.richSnippetToolUrl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" target=\"_blank\">\n              Structured Data Testing Tool\n            </a>\n          </div>\n        ";
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n          <p>Schema.org not found on this page.</p>\n\n          <p>Implementing schema.org structured data in a page lets search engines understand more about the content—and can allow pages to be shown in different search features, such as Reviews and Recipes. This can increase click-through!</p>\n\n          <p>Google provides a\n            <a href=\"";
  if (helper = helpers.richSnippetToolUrl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.richSnippetToolUrl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" target=\"_blank\">\n              Structured Data Testing Tool\n            </a>\n            that allows you to test and validate markup.\n          </p>\n\n          <p>\n          To learn more about schema.org, visit\n          <a href=\"https://support.google.com/webmasters/answer/1211158?hl=en\" target=\"_blank\">\n          Google's Schema.org FAQ.\n          </a>\n          </p>\n        ";
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n        <p>Open Graph protocol found on this page.</p>\n        <div class=\"cta\">\n          Preview in\n          <a href=\"";
  if (helper = helpers.openGraphToolUrl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.openGraphToolUrl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" target=\"_blank\">\n            Facebook Open Graph Object Debugger.\n          </a>\n        </div>\n        ";
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n          <p>Open Graph protocol not found on this page.</p>\n\n          <p>\n            Implementing Open Graph protocol structured data determines how a page appears when it is shared on Facebook—and on other social media sites. This can increase engagement.\n          </p>\n\n          <p>\n            Facebook provides an\n            <a href=\"";
  if (helper = helpers.openGraphToolUrl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.openGraphToolUrl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" target=\"_blank\">\n              Open Graph Object Debugger\n            </a>\n            that allows you to test and validate your markup.\n          </p>\n\n          <p>\n            Visit this page to learn more about\n            <a href=\"http://ogp.me/\" target=\"_blank\">\n              Open Graph protocol\n            </a>\n          </p>\n        ";
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n          Microformats found on this page.\n\n          Preview in\n          <a href=\"";
  if (helper = helpers.richSnippetToolUrl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.richSnippetToolUrl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"  target=\"_blank\">\n            Google Structured Data Testing Tool\n          </a>.\n        ";
  return buffer;
  }

function program13(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n          <p>Microformats not found on this page.</p>\n\n          <p>\n          Implementing microformats structured data on a page lets search engines understand more about the content—and allows pages to be shown in different search features, such as Reviews and Recipes. These can increase click-through.\n          </p>\n\n          <p>\n          Google provides a\n          <a href=\"";
  if (helper = helpers.richSnippetToolUrl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.richSnippetToolUrl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" target=\"_blank\">\n            Structured Data Testing Tool\n          </a>.\n          that allows you to test and validate markup.\n          </p>\n\n          <p>\n            To learn more about microformats, visit\n            <a href=\"http://microformats.org/\" target=\"_blank\">\n            the microformats documentation page</a>.\n          </p>\n        ";
  return buffer;
  }

  buffer += "\n\n<div class=\"semantics\">\n  <div class=\"column snippet-column\">\n    <div class=\"header\">Type</div>\n    <div class=\"snippet scrollable\">\n      <div class=\"content ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.hasSchema), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"\n        data-show=\"schema\">Schema.org</div>\n      <div class=\"content ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.hasOpenGraph), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"\n        data-show=\"open-graph\">Open Graph Protocol</div>\n      <div class=\"content ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.hasTwitter), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"\n        data-show=\"twitter\">Twitter Cards</div>\n      <div class=\"content ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.hasMicroformats), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"\n        data-show=\"microformats\">Microformats</div>\n    </div>\n  </div>\n\n  <div class=\"column preview-column\">\n    <div class=\"header\">Preview</div>\n    <div class=\"preview scrollable\">\n      <div class=\"content schema\">\n        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.hasSchema), {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      </div>\n\n      <div class=\"content open-graph\">\n        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.hasOpenGraph), {hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      </div>\n      <div class=\"content twitter\">\n      </div>\n\n      <div class=\"content microformats\">\n        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.hasMicroformats), {hash:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      </div>\n    </div>\n  </div>\n</div>\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],106:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "/";
  }

function program3(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "<p class=\"line\">";
  if (helper = helpers.niceUipl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceUipl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " RDs</p>";
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n            <p class=\"line\">";
  if (helper = helpers.nicePuid) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.nicePuid); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " links /</p>\n            <p class=\"line\">";
  if (helper = helpers.nicePid) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.nicePid); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " RDs</p>\n          ";
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n      <a href=\"http://moz.com/login\" target=\"_blank\">\n        <div class=\"btn lock\" data-tooltip=\"Get more metrics<br><span class=cta>Log in with Moz</span>\">\n          ";
  stack1 = self.invokePartial(partials['locked-icon'], 'locked-icon', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n          <div class=\"onboarding-text\">\n            Log in to your <em>Moz Pro</em> account for more features, like Keyword Difficulty and enhanced link metrics.\n          </div>\n        </div>\n      </a>\n    ";
  return buffer;
  }

  buffer += "<style>\n";
  if (helper = helpers.css) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.css); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n</style>\n<div class=\"mozbar-css-wGA7MhRhQ3WS\">\n  <div class=\"serp-item\">\n    <div class=\"page-stats\">\n      <div class=\"stat\">\n        <div class=\"position\">";
  if (helper = helpers.position) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.position); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + ")</div>\n        <div class=\"title\">PA: ";
  if (helper = helpers.niceUpa) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceUpa); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n        <div class=\"scale-outer\">\n          <div class=\"scale-inner\" style=\"width: ";
  if (helper = helpers.niceUpa) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceUpa); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "%\"></div>\n        </div>\n      </div>\n      <div class=\"links\">\n        <a href=\"http://moz.com/researchtools/ose/links?site=";
  if (helper = helpers.pageUrl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.pageUrl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "&src=mb\" target=\"_blank\">\n          <p class=\"line\">";
  if (helper = helpers.niceUid) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.niceUid); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " links ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.isPro), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</p>\n          ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.isPro), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </a>\n      </div>\n\n      <div class=\"divider\"></div>\n\n      <div class=\"stat\">\n        <div class=\"title\">DA: ";
  if (helper = helpers.nicePda) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.nicePda); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n        <div class=\"scale-outer\">\n          <div class=\"scale-inner alt\" style=\"width: ";
  if (helper = helpers.nicePda) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.nicePda); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "%\"></div>\n        </div>\n      </div>\n\n      <div class=\"links\">\n        <a href=\"http://moz.com/researchtools/ose/links?site=";
  if (helper = helpers.rootDomain) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.rootDomain); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "&src=mb\" target=\"_blank\">\n          ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.isPro), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </a>\n      </div>\n    </div>\n\n    ";
  stack1 = helpers.unless.call(depth0, ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.isPro), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n\n    <div class=\"right-panel\">\n      <div class=\"divider\"></div>\n\n      <a href=\"http://moz.com/researchtools/ose/links?site=";
  if (helper = helpers.pageUrl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.pageUrl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "&src=mb\" target=\"_blank\">\n        <div class=\"btn link-analysis\" data-tooltip=\"Link Analysis with OSE\">\n          ";
  stack1 = self.invokePartial(partials['ose-icon'], 'ose-icon', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n          <p>Link Analysis</p>\n          <div class=\"onboarding-text\">\n            Do a deeper link analysis by opening this page in <em>Open Site Explorer</em>.\n          </div>\n        </div>\n      </a>\n    </div>\n  </div>\n</div>\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],107:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "\n    <div class=\"right-panel\">\n      <a href=\"http://moz.com/login\" target='_blank'>\n        Log in\n      </a>\n    </div>\n  ";
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n    <div class=\"right-panel\">\n      <a href=\"http://moz.com/community/users/"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.display_name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" target=\"_blank\">\n        "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.display_name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n      </a>\n\n      <a href=\"http://moz.com/logout\" target=\"_blank\" class=\"logout\">\n        Logout\n      </a>\n  ";
  return buffer;
  }

  buffer += "<div class=\"serp-toolbar\">\n  <div class=\"btn export\" data-tooltip=\"Export SERP Analysis to CSV\">\n    ";
  stack1 = self.invokePartial(partials['export-icon'], 'export-icon', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    <div class=\"onboarding-text\">\n      <em>Export this SERP to a CSV.</em>\n    </div>\n  </div>\n\n  <div class=\"divider\"></div>\n\n  <h3>Search Profiles</h3>\n\n  <div class=\"btn search-profile selected\" data-engine=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.profile)),stack1 == null || stack1 === false ? stack1 : stack1.engine)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"\n    data-tooltip=\"\">\n      "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.profile)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n      <div class=\"arrow arrow-down\" />\n      <div class=\"onboarding-text\">\n        <p>Open <em>Search Profiles</em>.</p>\n        <p>Use the MozBar to perform geo-located searches.</p>\n      </div>\n  </div>\n\n  ";
  stack1 = helpers.unless.call(depth0, ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.isPro), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n  ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.user)),stack1 == null || stack1 === false ? stack1 : stack1.isPro), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],108:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "\n      <div class=\"col\">\n        <p>\n          Connecting your Moz Pro subscription gets you access to more\n          link metrics and functionality within the Mozbar.\n          <a href=\"http://moz.com/pro/mozbar\" target=\"_blank\">Learn more</a>\n        </p>\n      </div>\n      <div class=\"col\">\n        <a class=\"login-button\" href=\"http://moz.com/login\" target=\"_blank\">\n          Login with Moz Pro\n        </a>\n      </div>\n    ";
  }

function program3(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n      <div class=\"col\">\n        <div class=\"pro\">\n          <p>Logged in as:</p>\n          <div class=\"username\">";
  if (helper = helpers.display_name) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.display_name); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n        </div>\n      </div>\n      <div class=\"col \">\n        <div class=\"logout\">\n          <a href=\"http://moz.com/logout\" target=\"_blank\">(X) Logout</a>\n        </div>\n      </div>\n    ";
  return buffer;
  }

  buffer += "<div class=\"arrow-up\"></div>\n<div class=\"content\">\n  <div class=\"padded\">\n    <div class=\"row full\">\n      <div class=\"col\">\n        <h2>MozBar Settings</h2>\n      </div>\n      <div class=\"col switch-container\">\n        <span class=\"title\">Theme:</span>\n        <label class=\"switch-label light on\">Dark</label>\n        <div class=\"onoffswitch\">\n          <input type=\"checkbox\" name=\"onoffswitch\" class=\"checkbox\" id=\"lightdarkswitch\">\n          <label for=\"lightdarkswitch\">\n            <span class=\"inner\"></span>\n            <span class=\"switch\"></span>\n          </label>\n        </div>\n        <label class=\"switch-label light\">Light</label>\n      </div>\n    </div>\n\n    <div class=\"divider\" />\n\n    <div class=\"row metrics\">\n      <div class=\"col\">\n        <label>\n          <input type=\"checkbox\" data-col=\"umrp\">MozRank (MR)</input>\n        </label>\n        <label>\n          <input type=\"checkbox\" data-col=\"pmrp\">Domain MozRank (DMR)</input>\n        </label>\n      </div>\n      <div class=\"col\">\n        <label>\n          <input type=\"checkbox\" data-col=\"utrp\">MozTrust (MT)</input>\n        </label>\n        <label>\n          <input type=\"checkbox\" data-col=\"ptrp\">Domain MozTrust (DMT)</input>\n        </label>\n      </div>\n      <div class=\"col\">\n        <label>\n          <input type=\"checkbox\" data-col=\"links\">Link Metrics</input>\n        </label>\n        <label>\n          <input type=\"checkbox\" data-col=\"fspsc\">Spam Score</input>\n        </label>\n      </div>\n    </div>\n\n    <div class=\"row\">\n      <div class=\"col\">\n        <span class=\"tip\">\n          <em>TIP: Easily toggle the MozBar between modes</em> (without disabling the extension)\n        </span>\n      </div>\n    </div>\n\n    <div class=\"row\">\n      <div class=\"col shortcut\">\n        <p><b>OSX:</b> Cmd+Option+Ctrl+M</p>\n      </div>\n      <div class=\"col shortcut\">\n        <p><em>Windows:</em> Shift+Ctrl+Alt+M</p>\n      </div>\n    </div>\n\n    <div class=\"row\">\n      <div class=\"col\">\n        <h2>More by Moz</h2>\n        <div class=\"divider\"></div>\n      </div>\n    </div>\n\n    <div class=\"row\">\n      <div class=\"col\">\n        <a href=\"http://analytics.moz.com/pro/home\" target=\"_blank\">Moz Campaign Dashboard</a>\n        <a href=\"http://moz.com\" target=\"_blank\">Moz.com</a>\n        <div class=\"spacer\"></div>\n        <a href=\"http://moz.com/blog\" target=\"_blank\">The Moz Blog</a>\n        <a href=\"http://moz.com/community/q\" taret=\"_blank\">Q&amp;A</a>\n      </div>\n\n      <div class=\"col\">\n        <a href=\"http://moz.com/researchtools/ose/links?site=";
  if (helper = helpers.pageUrl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.pageUrl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "&src=mb\">Open Site Explorer</a>\n        <a href=\"http://moz.com/researchtools/ose/pages?site=";
  if (helper = helpers.pageUrl) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.pageUrl); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "&src=mb\">Top Pages</a>\n        <a href=\"http://pro.moz.com/tools/keyword-difficulty/\">Keyword Analysis</a>\n        <a href=\"http://getlisted.org?src=mb\">GetListed</a>\n        <a href=\"http://freshwebexplorer.moz.com\">Fresh Web Explorer</a>\n      </div>\n\n      <div class=\"col\">\n        <a href=\"http://ranktracker.moz.com/?src=mb\">Rank Tracker</a>\n        <a href=\"http://pro.moz.com/tools/on-page-keyword-optimization/new\">On Page Grader</a>\n        <a href=\"https://followerwonk.com?src=mb\">Followerwonk</a>\n        <a href=\"http://mozcast.com?src=mb\">MozCast</a>\n      </div>\n    </div>\n  </div>\n  <div class=\"row full login\">\n    ";
  stack1 = helpers.unless.call(depth0, (depth0 && depth0.isPro), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n    ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.isPro), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n  </div>\n\n</div>\n<div class=\"arrow-down\"></div>\n\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],109:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"social\" data-tooltip=\"";
  if (helper = helpers.tooltip) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.tooltip); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n  <div class=\"icon ";
  if (helper = helpers.site) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.site); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></div>\n  <div class=\"count\">";
  if (helper = helpers.count) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.count); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n</div>\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],110:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
  var buffer = "", stack1, self=this;


  buffer += "<div class=\"toolbar tooltip-container\">\n  <div class=\"logo\"></div>\n\n  <div class=\"toolbar-panel\"></div>\n\n  <div class=\"right-panel\">\n    <div class=\"btn help\" data-tooltip=\"Help\">\n      <p>?</p>\n\n      <div class=\"onboarding-text\">\n        <p>Get <em>Help</em>.</p>\n\n        <p>Find help on the MozBar and request features, and get back to this tutorial.</p>\n      </div>\n    </div>\n\n    <div class=\"divider\"></div>\n\n    <div class=\"btn settings\" data-tooltip=\"Tools &amp; Settings\">\n      ";
  stack1 = self.invokePartial(partials['settings-icon'], 'settings-icon', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n      <div class=\"onboarding-text\">\n        <p>Open <em>Tool and Settings</em>.\n\n        <p>Customize your MozBar to fit your needs and look as well as access helpful links.</p>\n      </div>\n    </div>\n    <div class=\"btn dock\" data-tooltip=\"Dock to Bottom of Browser\">\n      ";
  stack1 = self.invokePartial(partials['dock-icon'], 'dock-icon', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </div>\n    <div class=\"btn close\" data-tooltip=\"Turn Off<br />MozBar\" >\n      ";
  stack1 = self.invokePartial(partials['close-icon'], 'close-icon', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      <div class=\"onboarding-text\">\n        <p><em>Turn off the MozBar</em>.</p>\n\n        <p>You can turn it on at any time by clicking the <span class=\"icon off\"></span> icon to the right of the address bar.</p>\n      </div>\n    </div>\n  </div>\n</div>\n<div class=\"panel\"></div>\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],111:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"";
  if (helper = helpers.placement) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.placement); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\">\n  <div class=\"arrow-up\"></div>\n  <div class=\"text\"><p>";
  if (helper = helpers.text) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.text); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</p></div>\n  <div class=\"arrow-down\"></div>\n</div>\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],112:[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  return "\n  Twitter cards found on this page.\n";
  }

function program3(depth0,data) {
  
  
  return "\n  <p>Twitter Cards not found on this page.</p>\n\n  <p>\n    Implementing Twitter Cards metadata determines how a page appears when it is shared on Twitter. This can increase engagement.\n  </p>\n\n  <p>\n    To learn more about Twitter Cards, visit the\n      <a href=\"https://dev.twitter.com/docs/cards\" target=\"_blank\">\n        Twitter card\n      </a>\n    documentation.\n  </p>\n";
  }

function program5(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n  <div class=\"summary\">\n    <h3>Summary Card</h3>\n    <div class=\"site\">\n      ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.image), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n    </div>\n    <div class=\"container\">\n      <div class=\"col1\">\n        <h4>";
  if (helper = helpers.title) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.title); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</h4>\n        <div class=\"byline\">"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.creator)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.creator)),stack1 == null || stack1 === false ? stack1 : stack1.handle)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " </div>\n        <div class=\"blurb\">";
  if (helper = helpers.description) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.description); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n      </div>\n      <div class=\"col2\">\n        <div class=\"card-image\" style=\"background-image: url('";
  if (helper = helpers.image) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.image); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\"></div>\n      </div>\n    </div>\n  </div>\n";
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<img src=\""
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.image)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" />";
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n  <div class=\"summary-large-image\">\n    <h3>Summary Large Image Card</h3>\n    <div class=\"site\">\n      ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.image), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n    </div>\n    <div class=\"card-image\"><img src=\"";
  if (helper = helpers.image) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.image); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" /></div>\n    <h4>";
  if (helper = helpers.title) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.title); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</h4>\n    <div class=\"byline\">"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.creator)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.creator)),stack1 == null || stack1 === false ? stack1 : stack1.handle)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " </div>\n    <div class=\"blurb\">";
  if (helper = helpers.description) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.description); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n  </div>\n";
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n  <div class=\"product\">\n    <h3>Product Card</h3>\n    <div class=\"site\">\n      ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.image), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n    </div>\n    <h4>";
  if (helper = helpers.title) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.title); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</h4>\n    By <div class=\"byline\">"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.creator)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.creator)),stack1 == null || stack1 === false ? stack1 : stack1.handle)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " </div>\n    <div class=\"container\">\n      <div class=\"col1\">\n        <div class=\"card-image\" style=\"background-image: url('";
  if (helper = helpers.image) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.image); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\"></div>\n      </div>\n      <div class=\"col2\">\n        <div class=\"divider\"></div>\n        <div class=\"data\">";
  if (helper = helpers.data1) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.data1); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n        <div class=\"label\">";
  if (helper = helpers.label1) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.label1); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n        <div class=\"divider\"></div>\n        <div class=\"data\">";
  if (helper = helpers.data2) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.data2); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n        <div class=\"label\">";
  if (helper = helpers.label2) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.label2); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n        <div class=\"divider\"></div>\n      </div>\n    </div>\n    <div class=\"blurb\">";
  if (helper = helpers.description) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.description); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n  </div>\n";
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n  <div class=\"photo\">\n    <h3>Photo Card</h3>\n    <div class=\"card-image\"><img src=\"";
  if (helper = helpers.image) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.image); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" /></div>\n    <h4>";
  if (helper = helpers.title) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.title); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</h4>\n    <div class=\"byline\">"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.creator)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.creator)),stack1 == null || stack1 === false ? stack1 : stack1.handle)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " </div>\n    <div class=\"blurb\">";
  if (helper = helpers.description) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.description); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n    <div class=\"site\">\n      ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.image), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n    </div>\n  </div>\n";
  return buffer;
  }

function program14(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n  <div class=\"gallery\">\n    <h3>Gallery Card</h3>\n    <div class=\"site\">\n      ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.image), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n    </div>\n    <div class=\"card-image\" style=\"background-image: url('";
  if (helper = helpers.image0) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.image0); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\"></div>\n    <div class=\"card-image\" style=\"background-image: url('";
  if (helper = helpers.image1) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.image1); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\"></div>\n    <div class=\"card-image\" style=\"background-image: url('";
  if (helper = helpers.image2) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.image2); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\"></div>\n    <div class=\"card-image\" style=\"background-image: url('";
  if (helper = helpers.image3) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.image3); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "')\"></div>\n    <h4>";
  if (helper = helpers.title) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.title); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</h4>\n    <div class=\"byline\">"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.creator)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.creator)),stack1 == null || stack1 === false ? stack1 : stack1.handle)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " </div>\n    <div class=\"blurb\">";
  if (helper = helpers.description) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.description); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n    <div class=\"site\">\n      ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.image), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n    </div>\n  </div>\n";
  return buffer;
  }

function program16(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n  <div class=\"player\">\n    <h3>Player Card</h3>\n    <div class=\"site\">\n      ";
  stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.image), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n      "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.site)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n    </div>\n    <iframe width=\"500\" height=\"375\" src=\"";
  if (helper = helpers.player) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.player); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"\n      frameborder=\"0\" allowfullscreen></iframe>\n\n    <h4>";
  if (helper = helpers.title) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.title); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</h4>\n    <div class=\"byline\">"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.creator)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " "
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.creator)),stack1 == null || stack1 === false ? stack1 : stack1.handle)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + " </div>\n    <div class=\"blurb\">";
  if (helper = helpers.description) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.description); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</div>\n  </div>\n";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.hasTwitter), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = (helper = helpers.ifEqual || (depth0 && depth0.ifEqual),options={hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.cardType), "summary", options) : helperMissing.call(depth0, "ifEqual", (depth0 && depth0.cardType), "summary", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = (helper = helpers.ifEqual || (depth0 && depth0.ifEqual),options={hash:{},inverse:self.noop,fn:self.program(8, program8, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.cardType), "summary_large_image", options) : helperMissing.call(depth0, "ifEqual", (depth0 && depth0.cardType), "summary_large_image", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = (helper = helpers.ifEqual || (depth0 && depth0.ifEqual),options={hash:{},inverse:self.noop,fn:self.program(10, program10, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.cardType), "product", options) : helperMissing.call(depth0, "ifEqual", (depth0 && depth0.cardType), "product", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = (helper = helpers.ifEqual || (depth0 && depth0.ifEqual),options={hash:{},inverse:self.noop,fn:self.program(12, program12, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.cardType), "photo", options) : helperMissing.call(depth0, "ifEqual", (depth0 && depth0.cardType), "photo", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = (helper = helpers.ifEqual || (depth0 && depth0.ifEqual),options={hash:{},inverse:self.noop,fn:self.program(14, program14, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.cardType), "gallery", options) : helperMissing.call(depth0, "ifEqual", (depth0 && depth0.cardType), "gallery", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  stack1 = (helper = helpers.ifEqual || (depth0 && depth0.ifEqual),options={hash:{},inverse:self.noop,fn:self.program(16, program16, data),data:data},helper ? helper.call(depth0, (depth0 && depth0.cardType), "player", options) : helperMissing.call(depth0, "ifEqual", (depth0 && depth0.cardType), "player", options));
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  });

},{"hbsfy/runtime":162}],113:[function(require,module,exports){

},{}],114:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length, 2)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length, unitSize) {
  if (unitSize) length -= length % unitSize;
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":115,"ieee754":116,"is-array":117}],115:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],116:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],117:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],118:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],119:[function(require,module,exports){
var http = module.exports;
var EventEmitter = require('events').EventEmitter;
var Request = require('./lib/request');
var url = require('url')

http.request = function (params, cb) {
    if (typeof params === 'string') {
        params = url.parse(params)
    }
    if (!params) params = {};
    if (!params.host && !params.port) {
        params.port = parseInt(window.location.port, 10);
    }
    if (!params.host && params.hostname) {
        params.host = params.hostname;
    }

    if (!params.protocol) {
        if (params.scheme) {
            params.protocol = params.scheme + ':';
        } else {
            params.protocol = window.location.protocol;
        }
    }

    if (!params.host) {
        params.host = window.location.hostname || window.location.host;
    }
    if (/:/.test(params.host)) {
        if (!params.port) {
            params.port = params.host.split(':')[1];
        }
        params.host = params.host.split(':')[0];
    }
    if (!params.port) params.port = params.protocol == 'https:' ? 443 : 80;
    
    var req = new Request(new xhrHttp, params);
    if (cb) req.on('response', cb);
    return req;
};

http.get = function (params, cb) {
    params.method = 'GET';
    var req = http.request(params, cb);
    req.end();
    return req;
};

http.Agent = function () {};
http.Agent.defaultMaxSockets = 4;

var xhrHttp = (function () {
    if (typeof window === 'undefined') {
        throw new Error('no window object present');
    }
    else if (window.XMLHttpRequest) {
        return window.XMLHttpRequest;
    }
    else if (window.ActiveXObject) {
        var axs = [
            'Msxml2.XMLHTTP.6.0',
            'Msxml2.XMLHTTP.3.0',
            'Microsoft.XMLHTTP'
        ];
        for (var i = 0; i < axs.length; i++) {
            try {
                var ax = new(window.ActiveXObject)(axs[i]);
                return function () {
                    if (ax) {
                        var ax_ = ax;
                        ax = null;
                        return ax_;
                    }
                    else {
                        return new(window.ActiveXObject)(axs[i]);
                    }
                };
            }
            catch (e) {}
        }
        throw new Error('ajax not supported in this browser')
    }
    else {
        throw new Error('ajax not supported in this browser');
    }
})();

http.STATUS_CODES = {
    100 : 'Continue',
    101 : 'Switching Protocols',
    102 : 'Processing',                 // RFC 2518, obsoleted by RFC 4918
    200 : 'OK',
    201 : 'Created',
    202 : 'Accepted',
    203 : 'Non-Authoritative Information',
    204 : 'No Content',
    205 : 'Reset Content',
    206 : 'Partial Content',
    207 : 'Multi-Status',               // RFC 4918
    300 : 'Multiple Choices',
    301 : 'Moved Permanently',
    302 : 'Moved Temporarily',
    303 : 'See Other',
    304 : 'Not Modified',
    305 : 'Use Proxy',
    307 : 'Temporary Redirect',
    400 : 'Bad Request',
    401 : 'Unauthorized',
    402 : 'Payment Required',
    403 : 'Forbidden',
    404 : 'Not Found',
    405 : 'Method Not Allowed',
    406 : 'Not Acceptable',
    407 : 'Proxy Authentication Required',
    408 : 'Request Time-out',
    409 : 'Conflict',
    410 : 'Gone',
    411 : 'Length Required',
    412 : 'Precondition Failed',
    413 : 'Request Entity Too Large',
    414 : 'Request-URI Too Large',
    415 : 'Unsupported Media Type',
    416 : 'Requested Range Not Satisfiable',
    417 : 'Expectation Failed',
    418 : 'I\'m a teapot',              // RFC 2324
    422 : 'Unprocessable Entity',       // RFC 4918
    423 : 'Locked',                     // RFC 4918
    424 : 'Failed Dependency',          // RFC 4918
    425 : 'Unordered Collection',       // RFC 4918
    426 : 'Upgrade Required',           // RFC 2817
    428 : 'Precondition Required',      // RFC 6585
    429 : 'Too Many Requests',          // RFC 6585
    431 : 'Request Header Fields Too Large',// RFC 6585
    500 : 'Internal Server Error',
    501 : 'Not Implemented',
    502 : 'Bad Gateway',
    503 : 'Service Unavailable',
    504 : 'Gateway Time-out',
    505 : 'HTTP Version Not Supported',
    506 : 'Variant Also Negotiates',    // RFC 2295
    507 : 'Insufficient Storage',       // RFC 4918
    509 : 'Bandwidth Limit Exceeded',
    510 : 'Not Extended',               // RFC 2774
    511 : 'Network Authentication Required' // RFC 6585
};
},{"./lib/request":120,"events":118,"url":143}],120:[function(require,module,exports){
var Stream = require('stream');
var Response = require('./response');
var Base64 = require('Base64');
var inherits = require('inherits');

var Request = module.exports = function (xhr, params) {
    var self = this;
    self.writable = true;
    self.xhr = xhr;
    self.body = [];
    
    self.uri = (params.protocol || 'http:') + '//'
        + params.host
        + (params.port ? ':' + params.port : '')
        + (params.path || '/')
    ;
    
    if (typeof params.withCredentials === 'undefined') {
        params.withCredentials = true;
    }

    try { xhr.withCredentials = params.withCredentials }
    catch (e) {}
    
    if (params.responseType) try { xhr.responseType = params.responseType }
    catch (e) {}
    
    xhr.open(
        params.method || 'GET',
        self.uri,
        true
    );

    xhr.onerror = function(event) {
        self.emit('error', new Error('Network error'));
    };

    self._headers = {};
    
    if (params.headers) {
        var keys = objectKeys(params.headers);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (!self.isSafeRequestHeader(key)) continue;
            var value = params.headers[key];
            self.setHeader(key, value);
        }
    }
    
    if (params.auth) {
        //basic auth
        this.setHeader('Authorization', 'Basic ' + Base64.btoa(params.auth));
    }

    var res = new Response;
    res.on('close', function () {
        self.emit('close');
    });
    
    res.on('ready', function () {
        self.emit('response', res);
    });

    res.on('error', function (err) {
        self.emit('error', err);
    });
    
    xhr.onreadystatechange = function () {
        // Fix for IE9 bug
        // SCRIPT575: Could not complete the operation due to error c00c023f
        // It happens when a request is aborted, calling the success callback anyway with readyState === 4
        if (xhr.__aborted) return;
        res.handle(xhr);
    };
};

inherits(Request, Stream);

Request.prototype.setHeader = function (key, value) {
    this._headers[key.toLowerCase()] = value
};

Request.prototype.getHeader = function (key) {
    return this._headers[key.toLowerCase()]
};

Request.prototype.removeHeader = function (key) {
    delete this._headers[key.toLowerCase()]
};

Request.prototype.write = function (s) {
    this.body.push(s);
};

Request.prototype.destroy = function (s) {
    this.xhr.__aborted = true;
    this.xhr.abort();
    this.emit('close');
};

Request.prototype.end = function (s) {
    if (s !== undefined) this.body.push(s);

    var keys = objectKeys(this._headers);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = this._headers[key];
        if (isArray(value)) {
            for (var j = 0; j < value.length; j++) {
                this.xhr.setRequestHeader(key, value[j]);
            }
        }
        else this.xhr.setRequestHeader(key, value)
    }

    if (this.body.length === 0) {
        this.xhr.send('');
    }
    else if (typeof this.body[0] === 'string') {
        this.xhr.send(this.body.join(''));
    }
    else if (isArray(this.body[0])) {
        var body = [];
        for (var i = 0; i < this.body.length; i++) {
            body.push.apply(body, this.body[i]);
        }
        this.xhr.send(body);
    }
    else if (/Array/.test(Object.prototype.toString.call(this.body[0]))) {
        var len = 0;
        for (var i = 0; i < this.body.length; i++) {
            len += this.body[i].length;
        }
        var body = new(this.body[0].constructor)(len);
        var k = 0;
        
        for (var i = 0; i < this.body.length; i++) {
            var b = this.body[i];
            for (var j = 0; j < b.length; j++) {
                body[k++] = b[j];
            }
        }
        this.xhr.send(body);
    }
    else if (isXHR2Compatible(this.body[0])) {
        this.xhr.send(this.body[0]);
    }
    else {
        var body = '';
        for (var i = 0; i < this.body.length; i++) {
            body += this.body[i].toString();
        }
        this.xhr.send(body);
    }
};

// Taken from http://dxr.mozilla.org/mozilla/mozilla-central/content/base/src/nsXMLHttpRequest.cpp.html
Request.unsafeHeaders = [
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "cookie",
    "cookie2",
    "content-transfer-encoding",
    "date",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "user-agent",
    "via"
];

Request.prototype.isSafeRequestHeader = function (headerName) {
    if (!headerName) return false;
    return indexOf(Request.unsafeHeaders, headerName.toLowerCase()) === -1;
};

var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var indexOf = function (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (xs[i] === x) return i;
    }
    return -1;
};

var isXHR2Compatible = function (obj) {
    if (typeof Blob !== 'undefined' && obj instanceof Blob) return true;
    if (typeof ArrayBuffer !== 'undefined' && obj instanceof ArrayBuffer) return true;
    if (typeof FormData !== 'undefined' && obj instanceof FormData) return true;
};

},{"./response":121,"Base64":122,"inherits":123,"stream":141}],121:[function(require,module,exports){
var Stream = require('stream');
var util = require('util');

var Response = module.exports = function (res) {
    this.offset = 0;
    this.readable = true;
};

util.inherits(Response, Stream);

var capable = {
    streaming : true,
    status2 : true
};

function parseHeaders (res) {
    var lines = res.getAllResponseHeaders().split(/\r?\n/);
    var headers = {};
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line === '') continue;
        
        var m = line.match(/^([^:]+):\s*(.*)/);
        if (m) {
            var key = m[1].toLowerCase(), value = m[2];
            
            if (headers[key] !== undefined) {
            
                if (isArray(headers[key])) {
                    headers[key].push(value);
                }
                else {
                    headers[key] = [ headers[key], value ];
                }
            }
            else {
                headers[key] = value;
            }
        }
        else {
            headers[line] = true;
        }
    }
    return headers;
}

Response.prototype.getResponse = function (xhr) {
    var respType = String(xhr.responseType).toLowerCase();
    if (respType === 'blob') return xhr.responseBlob || xhr.response;
    if (respType === 'arraybuffer') return xhr.response;
    return xhr.responseText;
}

Response.prototype.getHeader = function (key) {
    return this.headers[key.toLowerCase()];
};

Response.prototype.handle = function (res) {
    if (res.readyState === 2 && capable.status2) {
        try {
            this.statusCode = res.status;
            this.headers = parseHeaders(res);
        }
        catch (err) {
            capable.status2 = false;
        }
        
        if (capable.status2) {
            this.emit('ready');
        }
    }
    else if (capable.streaming && res.readyState === 3) {
        try {
            if (!this.statusCode) {
                this.statusCode = res.status;
                this.headers = parseHeaders(res);
                this.emit('ready');
            }
        }
        catch (err) {}
        
        try {
            this._emitData(res);
        }
        catch (err) {
            capable.streaming = false;
        }
    }
    else if (res.readyState === 4) {
        if (!this.statusCode) {
            this.statusCode = res.status;
            this.emit('ready');
        }
        this._emitData(res);
        
        if (res.error) {
            this.emit('error', this.getResponse(res));
        }
        else this.emit('end');
        
        this.emit('close');
    }
};

Response.prototype._emitData = function (res) {
    var respBody = this.getResponse(res);
    if (respBody.toString().match(/ArrayBuffer/)) {
        this.emit('data', new Uint8Array(respBody, this.offset));
        this.offset = respBody.byteLength;
        return;
    }
    if (respBody.length > this.offset) {
        this.emit('data', respBody.slice(this.offset));
        this.offset = respBody.length;
    }
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

},{"stream":141,"util":145}],122:[function(require,module,exports){
;(function () {

  var object = typeof exports != 'undefined' ? exports : this; // #8: web workers
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error;
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa || (
  object.btoa = function (input) {
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next input index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      input.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = input.charCodeAt(idx += 3/4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  });

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  object.atob || (
  object.atob = function (input) {
    input = input.replace(/=+$/, '');
    if (input.length % 4 == 1) {
      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = input.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  });

}());

},{}],123:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],124:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],125:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],126:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],127:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],128:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],129:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":127,"./encode":128}],130:[function(require,module,exports){
module.exports = require("./lib/_stream_duplex.js")

},{"./lib/_stream_duplex.js":131}],131:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

module.exports = Duplex;

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}
/*</replacement>*/


/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

forEach(objectKeys(Writable.prototype), function(method) {
  if (!Duplex.prototype[method])
    Duplex.prototype[method] = Writable.prototype[method];
});

function Duplex(options) {
  if (!(this instanceof Duplex))
    return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false)
    this.readable = false;

  if (options && options.writable === false)
    this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false)
    this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended)
    return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  process.nextTick(this.end.bind(this));
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

}).call(this,require('_process'))

},{"./_stream_readable":133,"./_stream_writable":135,"_process":125,"core-util-is":136,"inherits":123}],132:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough))
    return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};

},{"./_stream_transform":134,"core-util-is":136,"inherits":123}],133:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/


/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Readable.ReadableState = ReadableState;

var EE = require('events').EventEmitter;

/*<replacement>*/
if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

var Stream = require('stream');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var StringDecoder;

util.inherits(Readable, Stream);

function ReadableState(options, stream) {
  options = options || {};

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.buffer = [];
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = false;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // In streams that never have any data, and do push(null) right away,
  // the consumer can miss the 'end' event if they do some I/O before
  // consuming the stream.  So, we don't emit('end') until some reading
  // happens.
  this.calledRead = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;


  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder)
      StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  if (!(this instanceof Readable))
    return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function(chunk, encoding) {
  var state = this._readableState;

  if (typeof chunk === 'string' && !state.objectMode) {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = new Buffer(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function(chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null || chunk === undefined) {
    state.reading = false;
    if (!state.ended)
      onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var e = new Error('stream.unshift() after end event');
      stream.emit('error', e);
    } else {
      if (state.decoder && !addToFront && !encoding)
        chunk = state.decoder.write(chunk);

      // update the buffer info.
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront) {
        state.buffer.unshift(chunk);
      } else {
        state.reading = false;
        state.buffer.push(chunk);
      }

      if (state.needReadable)
        emitReadable(stream);

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}



// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended &&
         (state.needReadable ||
          state.length < state.highWaterMark ||
          state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function(enc) {
  if (!StringDecoder)
    StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
};

// Don't raise the hwm > 128MB
var MAX_HWM = 0x800000;
function roundUpToNextPowerOf2(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2
    n--;
    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
    n++;
  }
  return n;
}

function howMuchToRead(n, state) {
  if (state.length === 0 && state.ended)
    return 0;

  if (state.objectMode)
    return n === 0 ? 0 : 1;

  if (n === null || isNaN(n)) {
    // only flow one buffer at a time
    if (state.flowing && state.buffer.length)
      return state.buffer[0].length;
    else
      return state.length;
  }

  if (n <= 0)
    return 0;

  // If we're asking for more than the target buffer level,
  // then raise the water mark.  Bump up to the next highest
  // power of 2, to prevent increasing it excessively in tiny
  // amounts.
  if (n > state.highWaterMark)
    state.highWaterMark = roundUpToNextPowerOf2(n);

  // don't have that much.  return null, unless we've ended.
  if (n > state.length) {
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    } else
      return state.length;
  }

  return n;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function(n) {
  var state = this._readableState;
  state.calledRead = true;
  var nOrig = n;
  var ret;

  if (typeof n !== 'number' || n > 0)
    state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 &&
      state.needReadable &&
      (state.length >= state.highWaterMark || state.ended)) {
    emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    ret = null;

    // In cases where the decoder did not receive enough data
    // to produce a full chunk, then immediately received an
    // EOF, state.buffer will contain [<Buffer >, <Buffer 00 ...>].
    // howMuchToRead will see this and coerce the amount to
    // read to zero (because it's looking at the length of the
    // first <Buffer > in state.buffer), and we'll end up here.
    //
    // This can only happen via state.decoder -- no other venue
    // exists for pushing a zero-length chunk into state.buffer
    // and triggering this behavior. In this case, we return our
    // remaining data and end the stream, if appropriate.
    if (state.length > 0 && state.decoder) {
      ret = fromList(n, state);
      state.length -= ret.length;
    }

    if (state.length === 0)
      endReadable(this);

    return ret;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;

  // if we currently have less than the highWaterMark, then also read some
  if (state.length - n <= state.highWaterMark)
    doRead = true;

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading)
    doRead = false;

  if (doRead) {
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0)
      state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
  }

  // If _read called its callback synchronously, then `reading`
  // will be false, and we need to re-evaluate how much data we
  // can return to the user.
  if (doRead && !state.reading)
    n = howMuchToRead(nOrig, state);

  if (n > 0)
    ret = fromList(n, state);
  else
    ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  }

  state.length -= n;

  // If we have nothing in the buffer, then we want to know
  // as soon as we *do* get something into the buffer.
  if (state.length === 0 && !state.ended)
    state.needReadable = true;

  // If we happened to read() exactly the remaining amount in the
  // buffer, and the EOF has been seen at this point, then make sure
  // that we emit 'end' on the very next tick.
  if (state.ended && !state.endEmitted && state.length === 0)
    endReadable(this);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}


function onEofChunk(stream, state) {
  if (state.decoder && !state.ended) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // if we've ended and we have some data left, then emit
  // 'readable' now to make sure it gets picked up.
  if (state.length > 0)
    emitReadable(stream);
  else
    endReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (state.emittedReadable)
    return;

  state.emittedReadable = true;
  if (state.sync)
    process.nextTick(function() {
      emitReadable_(stream);
    });
  else
    emitReadable_(stream);
}

function emitReadable_(stream) {
  stream.emit('readable');
}


// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(function() {
      maybeReadMore_(stream, state);
    });
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended &&
         state.length < state.highWaterMark) {
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
    else
      len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function(n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function(dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;

  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted)
    process.nextTick(endFn);
  else
    src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    if (readable !== src) return;
    cleanup();
  }

  function onend() {
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  function cleanup() {
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (!dest._writableState || dest._writableState.needDrain)
      ondrain();
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    unpipe();
    dest.removeListener('error', onerror);
    if (EE.listenerCount(dest, 'error') === 0)
      dest.emit('error', er);
  }
  // This is a brutally ugly hack to make sure that our error handler
  // is attached before any userland ones.  NEVER DO THIS.
  if (!dest._events || !dest._events.error)
    dest.on('error', onerror);
  else if (isArray(dest._events.error))
    dest._events.error.unshift(onerror);
  else
    dest._events.error = [onerror, dest._events.error];



  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    // the handler that waits for readable events after all
    // the data gets sucked out in flow.
    // This would be easier to follow with a .once() handler
    // in flow(), but that is too slow.
    this.on('readable', pipeOnReadable);

    state.flowing = true;
    process.nextTick(function() {
      flow(src);
    });
  }

  return dest;
};

function pipeOnDrain(src) {
  return function() {
    var dest = this;
    var state = src._readableState;
    state.awaitDrain--;
    if (state.awaitDrain === 0)
      flow(src);
  };
}

function flow(src) {
  var state = src._readableState;
  var chunk;
  state.awaitDrain = 0;

  function write(dest, i, list) {
    var written = dest.write(chunk);
    if (false === written) {
      state.awaitDrain++;
    }
  }

  while (state.pipesCount && null !== (chunk = src.read())) {

    if (state.pipesCount === 1)
      write(state.pipes, 0, null);
    else
      forEach(state.pipes, write);

    src.emit('data', chunk);

    // if anyone needs a drain, then we have to wait for that.
    if (state.awaitDrain > 0)
      return;
  }

  // if every destination was unpiped, either before entering this
  // function, or in the while loop, then stop flowing.
  //
  // NB: This is a pretty rare edge case.
  if (state.pipesCount === 0) {
    state.flowing = false;

    // if there were data event listeners added, then switch to old mode.
    if (EE.listenerCount(src, 'data') > 0)
      emitDataEvents(src);
    return;
  }

  // at this point, no one needed a drain, so we just ran out of data
  // on the next readable event, start it over again.
  state.ranOut = true;
}

function pipeOnReadable() {
  if (this._readableState.ranOut) {
    this._readableState.ranOut = false;
    flow(this);
  }
}


Readable.prototype.unpipe = function(dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0)
    return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes)
      return this;

    if (!dest)
      dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    this.removeListener('readable', pipeOnReadable);
    state.flowing = false;
    if (dest)
      dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    this.removeListener('readable', pipeOnReadable);
    state.flowing = false;

    for (var i = 0; i < len; i++)
      dests[i].emit('unpipe', this);
    return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1)
    return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1)
    state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function(ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data' && !this._readableState.flowing)
    emitDataEvents(this);

  if (ev === 'readable' && this.readable) {
    var state = this._readableState;
    if (!state.readableListening) {
      state.readableListening = true;
      state.emittedReadable = false;
      state.needReadable = true;
      if (!state.reading) {
        this.read(0);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function() {
  emitDataEvents(this);
  this.read(0);
  this.emit('resume');
};

Readable.prototype.pause = function() {
  emitDataEvents(this, true);
  this.emit('pause');
};

function emitDataEvents(stream, startPaused) {
  var state = stream._readableState;

  if (state.flowing) {
    // https://github.com/isaacs/readable-stream/issues/16
    throw new Error('Cannot switch to old mode now.');
  }

  var paused = startPaused || false;
  var readable = false;

  // convert to an old-style stream.
  stream.readable = true;
  stream.pipe = Stream.prototype.pipe;
  stream.on = stream.addListener = Stream.prototype.on;

  stream.on('readable', function() {
    readable = true;

    var c;
    while (!paused && (null !== (c = stream.read())))
      stream.emit('data', c);

    if (c === null) {
      readable = false;
      stream._readableState.needReadable = true;
    }
  });

  stream.pause = function() {
    paused = true;
    this.emit('pause');
  };

  stream.resume = function() {
    paused = false;
    if (readable)
      process.nextTick(function() {
        stream.emit('readable');
      });
    else
      this.read(0);
    this.emit('resume');
  };

  // now make it start, just in case it hadn't already.
  stream.emit('readable');
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function(stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function() {
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length)
        self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function(chunk) {
    if (state.decoder)
      chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    //if (state.objectMode && util.isNullOrUndefined(chunk))
    if (state.objectMode && (chunk === null || chunk === undefined))
      return;
    else if (!state.objectMode && (!chunk || !chunk.length))
      return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (typeof stream[i] === 'function' &&
        typeof this[i] === 'undefined') {
      this[i] = function(method) { return function() {
        return stream[method].apply(stream, arguments);
      }}(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function(ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function(n) {
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};



// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
function fromList(n, state) {
  var list = state.buffer;
  var length = state.length;
  var stringMode = !!state.decoder;
  var objectMode = !!state.objectMode;
  var ret;

  // nothing in the list, definitely empty.
  if (list.length === 0)
    return null;

  if (length === 0)
    ret = null;
  else if (objectMode)
    ret = list.shift();
  else if (!n || n >= length) {
    // read it all, truncate the array.
    if (stringMode)
      ret = list.join('');
    else
      ret = Buffer.concat(list, length);
    list.length = 0;
  } else {
    // read just some of it.
    if (n < list[0].length) {
      // just take a part of the first list item.
      // slice is the same for buffers and strings.
      var buf = list[0];
      ret = buf.slice(0, n);
      list[0] = buf.slice(n);
    } else if (n === list[0].length) {
      // first list is a perfect match
      ret = list.shift();
    } else {
      // complex case.
      // we have enough to cover it, but it spans past the first buffer.
      if (stringMode)
        ret = '';
      else
        ret = new Buffer(n);

      var c = 0;
      for (var i = 0, l = list.length; i < l && c < n; i++) {
        var buf = list[0];
        var cpy = Math.min(n - c, buf.length);

        if (stringMode)
          ret += buf.slice(0, cpy);
        else
          buf.copy(ret, c, 0, cpy);

        if (cpy < buf.length)
          list[0] = buf.slice(cpy);
        else
          list.shift();

        c += cpy;
      }
    }
  }

  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0)
    throw new Error('endReadable called on non-empty stream');

  if (!state.endEmitted && state.calledRead) {
    state.ended = true;
    process.nextTick(function() {
      // Check that we didn't get one last unshift.
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit('end');
      }
    });
  }
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf (xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

}).call(this,require('_process'))

},{"_process":125,"buffer":114,"core-util-is":136,"events":118,"inherits":123,"isarray":124,"stream":141,"string_decoder/":142}],134:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.


// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);


function TransformState(options, stream) {
  this.afterTransform = function(er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb)
    return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined)
    stream.push(data);

  if (cb)
    cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}


function Transform(options) {
  if (!(this instanceof Transform))
    return new Transform(options);

  Duplex.call(this, options);

  var ts = this._transformState = new TransformState(options, this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  this.once('finish', function() {
    if ('function' === typeof this._flush)
      this._flush(function(er) {
        done(stream, er);
      });
    else
      done(stream);
  });
}

Transform.prototype.push = function(chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function(chunk, encoding, cb) {
  throw new Error('not implemented');
};

Transform.prototype._write = function(chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform ||
        rs.needReadable ||
        rs.length < rs.highWaterMark)
      this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function(n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};


function done(stream, er) {
  if (er)
    return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var rs = stream._readableState;
  var ts = stream._transformState;

  if (ws.length)
    throw new Error('calling transform done when ws.length != 0');

  if (ts.transforming)
    throw new Error('calling transform done when still transforming');

  return stream.push(null);
}

},{"./_stream_duplex":131,"core-util-is":136,"inherits":123}],135:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, cb), and it'll handle all
// the drain event emission and buffering.

module.exports = Writable;

/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Writable.WritableState = WritableState;


/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Stream = require('stream');

util.inherits(Writable, Stream);

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
}

function WritableState(options, stream) {
  options = options || {};

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function(er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.buffer = [];

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;
}

function Writable(options) {
  var Duplex = require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex))
    return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function() {
  this.emit('error', new Error('Cannot pipe. Not readable.'));
};


function writeAfterEnd(stream, state, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  process.nextTick(function() {
    cb(er);
  });
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode) {
    var er = new TypeError('Invalid non-string/buffer chunk');
    stream.emit('error', er);
    process.nextTick(function() {
      cb(er);
    });
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function(chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  else if (!encoding)
    encoding = state.defaultEncoding;

  if (typeof cb !== 'function')
    cb = function() {};

  if (state.ended)
    writeAfterEnd(this, state, cb);
  else if (validChunk(this, state, chunk, cb))
    ret = writeOrBuffer(this, state, chunk, encoding, cb);

  return ret;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode &&
      state.decodeStrings !== false &&
      typeof chunk === 'string') {
    chunk = new Buffer(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);
  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret)
    state.needDrain = true;

  if (state.writing)
    state.buffer.push(new WriteReq(chunk, encoding, cb));
  else
    doWrite(stream, state, len, chunk, encoding, cb);

  return ret;
}

function doWrite(stream, state, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  if (sync)
    process.nextTick(function() {
      cb(er);
    });
  else
    cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er)
    onwriteError(stream, state, sync, er, cb);
  else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(stream, state);

    if (!finished && !state.bufferProcessing && state.buffer.length)
      clearBuffer(stream, state);

    if (sync) {
      process.nextTick(function() {
        afterWrite(stream, state, finished, cb);
      });
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished)
    onwriteDrain(stream, state);
  cb();
  if (finished)
    finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}


// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;

  for (var c = 0; c < state.buffer.length; c++) {
    var entry = state.buffer[c];
    var chunk = entry.chunk;
    var encoding = entry.encoding;
    var cb = entry.callback;
    var len = state.objectMode ? 1 : chunk.length;

    doWrite(stream, state, len, chunk, encoding, cb);

    // if we didn't call the onwrite immediately, then
    // it means that we need to wait until it does.
    // also, that means that the chunk and cb are currently
    // being processed, so move the buffer counter past them.
    if (state.writing) {
      c++;
      break;
    }
  }

  state.bufferProcessing = false;
  if (c < state.buffer.length)
    state.buffer = state.buffer.slice(c);
  else
    state.buffer.length = 0;
}

Writable.prototype._write = function(chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype.end = function(chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (typeof chunk !== 'undefined' && chunk !== null)
    this.write(chunk, encoding);

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished)
    endWritable(this, state, cb);
};


function needFinish(stream, state) {
  return (state.ending &&
          state.length === 0 &&
          !state.finished &&
          !state.writing);
}

function finishMaybe(stream, state) {
  var need = needFinish(stream, state);
  if (need) {
    state.finished = true;
    stream.emit('finish');
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished)
      process.nextTick(cb);
    else
      stream.once('finish', cb);
  }
  state.ended = true;
}

}).call(this,require('_process'))

},{"./_stream_duplex":131,"_process":125,"buffer":114,"core-util-is":136,"inherits":123,"stream":141}],136:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return Buffer.isBuffer(arg);
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}
}).call(this,require("buffer").Buffer)

},{"buffer":114}],137:[function(require,module,exports){
module.exports = require("./lib/_stream_passthrough.js")

},{"./lib/_stream_passthrough.js":132}],138:[function(require,module,exports){
var Stream = require('stream'); // hack to fix a circular dependency issue when used with browserify
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = Stream;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":131,"./lib/_stream_passthrough.js":132,"./lib/_stream_readable.js":133,"./lib/_stream_transform.js":134,"./lib/_stream_writable.js":135,"stream":141}],139:[function(require,module,exports){
module.exports = require("./lib/_stream_transform.js")

},{"./lib/_stream_transform.js":134}],140:[function(require,module,exports){
module.exports = require("./lib/_stream_writable.js")

},{"./lib/_stream_writable.js":135}],141:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":118,"inherits":123,"readable-stream/duplex.js":130,"readable-stream/passthrough.js":137,"readable-stream/readable.js":138,"readable-stream/transform.js":139,"readable-stream/writable.js":140}],142:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = require('buffer').Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

},{"buffer":114}],143:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":126,"querystring":129}],144:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],145:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":144,"_process":125,"inherits":123}],146:[function(require,module,exports){
"use strict";
/*globals Handlebars: true */
var Handlebars = require("./handlebars.runtime")["default"];

// Compiler imports
var AST = require("./handlebars/compiler/ast")["default"];
var Parser = require("./handlebars/compiler/base").parser;
var parse = require("./handlebars/compiler/base").parse;
var Compiler = require("./handlebars/compiler/compiler").Compiler;
var compile = require("./handlebars/compiler/compiler").compile;
var precompile = require("./handlebars/compiler/compiler").precompile;
var JavaScriptCompiler = require("./handlebars/compiler/javascript-compiler")["default"];

var _create = Handlebars.create;
var create = function() {
  var hb = _create();

  hb.compile = function(input, options) {
    return compile(input, options, hb);
  };
  hb.precompile = function (input, options) {
    return precompile(input, options, hb);
  };

  hb.AST = AST;
  hb.Compiler = Compiler;
  hb.JavaScriptCompiler = JavaScriptCompiler;
  hb.Parser = Parser;
  hb.parse = parse;

  return hb;
};

Handlebars = create();
Handlebars.create = create;

exports["default"] = Handlebars;
},{"./handlebars.runtime":147,"./handlebars/compiler/ast":149,"./handlebars/compiler/base":150,"./handlebars/compiler/compiler":151,"./handlebars/compiler/javascript-compiler":152}],147:[function(require,module,exports){
"use strict";
/*globals Handlebars: true */
var base = require("./handlebars/base");

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
var SafeString = require("./handlebars/safe-string")["default"];
var Exception = require("./handlebars/exception")["default"];
var Utils = require("./handlebars/utils");
var runtime = require("./handlebars/runtime");

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
var create = function() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = SafeString;
  hb.Exception = Exception;
  hb.Utils = Utils;

  hb.VM = runtime;
  hb.template = function(spec) {
    return runtime.template(spec, hb);
  };

  return hb;
};

var Handlebars = create();
Handlebars.create = create;

exports["default"] = Handlebars;
},{"./handlebars/base":148,"./handlebars/exception":156,"./handlebars/runtime":157,"./handlebars/safe-string":158,"./handlebars/utils":159}],148:[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];

var VERSION = "1.3.0";
exports.VERSION = VERSION;var COMPILER_REVISION = 4;
exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '>= 1.0.0'
};
exports.REVISION_CHANGES = REVISION_CHANGES;
var isArray = Utils.isArray,
    isFunction = Utils.isFunction,
    toString = Utils.toString,
    objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials) {
  this.helpers = helpers || {};
  this.partials = partials || {};

  registerDefaultHelpers(this);
}

exports.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: logger,
  log: log,

  registerHelper: function(name, fn, inverse) {
    if (toString.call(name) === objectType) {
      if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
      Utils.extend(this.helpers, name);
    } else {
      if (inverse) { fn.not = inverse; }
      this.helpers[name] = fn;
    }
  },

  registerPartial: function(name, str) {
    if (toString.call(name) === objectType) {
      Utils.extend(this.partials,  name);
    } else {
      this.partials[name] = str;
    }
  }
};

function registerDefaultHelpers(instance) {
  instance.registerHelper('helperMissing', function(arg) {
    if(arguments.length === 2) {
      return undefined;
    } else {
      throw new Exception("Missing helper: '" + arg + "'");
    }
  });

  instance.registerHelper('blockHelperMissing', function(context, options) {
    var inverse = options.inverse || function() {}, fn = options.fn;

    if (isFunction(context)) { context = context.call(this); }

    if(context === true) {
      return fn(this);
    } else if(context === false || context == null) {
      return inverse(this);
    } else if (isArray(context)) {
      if(context.length > 0) {
        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      return fn(context);
    }
  });

  instance.registerHelper('each', function(context, options) {
    var fn = options.fn, inverse = options.inverse;
    var i = 0, ret = "", data;

    if (isFunction(context)) { context = context.call(this); }

    if (options.data) {
      data = createFrame(options.data);
    }

    if(context && typeof context === 'object') {
      if (isArray(context)) {
        for(var j = context.length; i<j; i++) {
          if (data) {
            data.index = i;
            data.first = (i === 0);
            data.last  = (i === (context.length-1));
          }
          ret = ret + fn(context[i], { data: data });
        }
      } else {
        for(var key in context) {
          if(context.hasOwnProperty(key)) {
            if(data) { 
              data.key = key; 
              data.index = i;
              data.first = (i === 0);
            }
            ret = ret + fn(context[key], {data: data});
            i++;
          }
        }
      }
    }

    if(i === 0){
      ret = inverse(this);
    }

    return ret;
  });

  instance.registerHelper('if', function(conditional, options) {
    if (isFunction(conditional)) { conditional = conditional.call(this); }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function(conditional, options) {
    return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
  });

  instance.registerHelper('with', function(context, options) {
    if (isFunction(context)) { context = context.call(this); }

    if (!Utils.isEmpty(context)) return options.fn(context);
  });

  instance.registerHelper('log', function(context, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, context);
  });
}

var logger = {
  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

  // State enum
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  level: 3,

  // can be overridden in the host environment
  log: function(level, obj) {
    if (logger.level <= level) {
      var method = logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};
exports.logger = logger;
function log(level, obj) { logger.log(level, obj); }

exports.log = log;var createFrame = function(object) {
  var obj = {};
  Utils.extend(obj, object);
  return obj;
};
exports.createFrame = createFrame;
},{"./exception":156,"./utils":159}],149:[function(require,module,exports){
"use strict";
var Exception = require("../exception")["default"];

function LocationInfo(locInfo){
  locInfo = locInfo || {};
  this.firstLine   = locInfo.first_line;
  this.firstColumn = locInfo.first_column;
  this.lastColumn  = locInfo.last_column;
  this.lastLine    = locInfo.last_line;
}

var AST = {
  ProgramNode: function(statements, inverseStrip, inverse, locInfo) {
    var inverseLocationInfo, firstInverseNode;
    if (arguments.length === 3) {
      locInfo = inverse;
      inverse = null;
    } else if (arguments.length === 2) {
      locInfo = inverseStrip;
      inverseStrip = null;
    }

    LocationInfo.call(this, locInfo);
    this.type = "program";
    this.statements = statements;
    this.strip = {};

    if(inverse) {
      firstInverseNode = inverse[0];
      if (firstInverseNode) {
        inverseLocationInfo = {
          first_line: firstInverseNode.firstLine,
          last_line: firstInverseNode.lastLine,
          last_column: firstInverseNode.lastColumn,
          first_column: firstInverseNode.firstColumn
        };
        this.inverse = new AST.ProgramNode(inverse, inverseStrip, inverseLocationInfo);
      } else {
        this.inverse = new AST.ProgramNode(inverse, inverseStrip);
      }
      this.strip.right = inverseStrip.left;
    } else if (inverseStrip) {
      this.strip.left = inverseStrip.right;
    }
  },

  MustacheNode: function(rawParams, hash, open, strip, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "mustache";
    this.strip = strip;

    // Open may be a string parsed from the parser or a passed boolean flag
    if (open != null && open.charAt) {
      // Must use charAt to support IE pre-10
      var escapeFlag = open.charAt(3) || open.charAt(2);
      this.escaped = escapeFlag !== '{' && escapeFlag !== '&';
    } else {
      this.escaped = !!open;
    }

    if (rawParams instanceof AST.SexprNode) {
      this.sexpr = rawParams;
    } else {
      // Support old AST API
      this.sexpr = new AST.SexprNode(rawParams, hash);
    }

    this.sexpr.isRoot = true;

    // Support old AST API that stored this info in MustacheNode
    this.id = this.sexpr.id;
    this.params = this.sexpr.params;
    this.hash = this.sexpr.hash;
    this.eligibleHelper = this.sexpr.eligibleHelper;
    this.isHelper = this.sexpr.isHelper;
  },

  SexprNode: function(rawParams, hash, locInfo) {
    LocationInfo.call(this, locInfo);

    this.type = "sexpr";
    this.hash = hash;

    var id = this.id = rawParams[0];
    var params = this.params = rawParams.slice(1);

    // a mustache is an eligible helper if:
    // * its id is simple (a single part, not `this` or `..`)
    var eligibleHelper = this.eligibleHelper = id.isSimple;

    // a mustache is definitely a helper if:
    // * it is an eligible helper, and
    // * it has at least one parameter or hash segment
    this.isHelper = eligibleHelper && (params.length || hash);

    // if a mustache is an eligible helper but not a definite
    // helper, it is ambiguous, and will be resolved in a later
    // pass or at runtime.
  },

  PartialNode: function(partialName, context, strip, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type         = "partial";
    this.partialName  = partialName;
    this.context      = context;
    this.strip = strip;
  },

  BlockNode: function(mustache, program, inverse, close, locInfo) {
    LocationInfo.call(this, locInfo);

    if(mustache.sexpr.id.original !== close.path.original) {
      throw new Exception(mustache.sexpr.id.original + " doesn't match " + close.path.original, this);
    }

    this.type = 'block';
    this.mustache = mustache;
    this.program  = program;
    this.inverse  = inverse;

    this.strip = {
      left: mustache.strip.left,
      right: close.strip.right
    };

    (program || inverse).strip.left = mustache.strip.right;
    (inverse || program).strip.right = close.strip.left;

    if (inverse && !program) {
      this.isInverse = true;
    }
  },

  ContentNode: function(string, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "content";
    this.string = string;
  },

  HashNode: function(pairs, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "hash";
    this.pairs = pairs;
  },

  IdNode: function(parts, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "ID";

    var original = "",
        dig = [],
        depth = 0;

    for(var i=0,l=parts.length; i<l; i++) {
      var part = parts[i].part;
      original += (parts[i].separator || '') + part;

      if (part === ".." || part === "." || part === "this") {
        if (dig.length > 0) {
          throw new Exception("Invalid path: " + original, this);
        } else if (part === "..") {
          depth++;
        } else {
          this.isScoped = true;
        }
      } else {
        dig.push(part);
      }
    }

    this.original = original;
    this.parts    = dig;
    this.string   = dig.join('.');
    this.depth    = depth;

    // an ID is simple if it only has one part, and that part is not
    // `..` or `this`.
    this.isSimple = parts.length === 1 && !this.isScoped && depth === 0;

    this.stringModeValue = this.string;
  },

  PartialNameNode: function(name, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "PARTIAL_NAME";
    this.name = name.original;
  },

  DataNode: function(id, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "DATA";
    this.id = id;
  },

  StringNode: function(string, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "STRING";
    this.original =
      this.string =
      this.stringModeValue = string;
  },

  IntegerNode: function(integer, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "INTEGER";
    this.original =
      this.integer = integer;
    this.stringModeValue = Number(integer);
  },

  BooleanNode: function(bool, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "BOOLEAN";
    this.bool = bool;
    this.stringModeValue = bool === "true";
  },

  CommentNode: function(comment, locInfo) {
    LocationInfo.call(this, locInfo);
    this.type = "comment";
    this.comment = comment;
  }
};

// Must be exported as an object rather than the root of the module as the jison lexer
// most modify the object to operate properly.
exports["default"] = AST;
},{"../exception":156}],150:[function(require,module,exports){
"use strict";
var parser = require("./parser")["default"];
var AST = require("./ast")["default"];

exports.parser = parser;

function parse(input) {
  // Just return if an already-compile AST was passed in.
  if(input.constructor === AST.ProgramNode) { return input; }

  parser.yy = AST;
  return parser.parse(input);
}

exports.parse = parse;
},{"./ast":149,"./parser":153}],151:[function(require,module,exports){
"use strict";
var Exception = require("../exception")["default"];

function Compiler() {}

exports.Compiler = Compiler;// the foundHelper register will disambiguate helper lookup from finding a
// function in a context. This is necessary for mustache compatibility, which
// requires that context functions in blocks are evaluated by blockHelperMissing,
// and then proceed as if the resulting value was provided to blockHelperMissing.

Compiler.prototype = {
  compiler: Compiler,

  disassemble: function() {
    var opcodes = this.opcodes, opcode, out = [], params, param;

    for (var i=0, l=opcodes.length; i<l; i++) {
      opcode = opcodes[i];

      if (opcode.opcode === 'DECLARE') {
        out.push("DECLARE " + opcode.name + "=" + opcode.value);
      } else {
        params = [];
        for (var j=0; j<opcode.args.length; j++) {
          param = opcode.args[j];
          if (typeof param === "string") {
            param = "\"" + param.replace("\n", "\\n") + "\"";
          }
          params.push(param);
        }
        out.push(opcode.opcode + " " + params.join(" "));
      }
    }

    return out.join("\n");
  },

  equals: function(other) {
    var len = this.opcodes.length;
    if (other.opcodes.length !== len) {
      return false;
    }

    for (var i = 0; i < len; i++) {
      var opcode = this.opcodes[i],
          otherOpcode = other.opcodes[i];
      if (opcode.opcode !== otherOpcode.opcode || opcode.args.length !== otherOpcode.args.length) {
        return false;
      }
      for (var j = 0; j < opcode.args.length; j++) {
        if (opcode.args[j] !== otherOpcode.args[j]) {
          return false;
        }
      }
    }

    len = this.children.length;
    if (other.children.length !== len) {
      return false;
    }
    for (i = 0; i < len; i++) {
      if (!this.children[i].equals(other.children[i])) {
        return false;
      }
    }

    return true;
  },

  guid: 0,

  compile: function(program, options) {
    this.opcodes = [];
    this.children = [];
    this.depths = {list: []};
    this.options = options;

    // These changes will propagate to the other compiler components
    var knownHelpers = this.options.knownHelpers;
    this.options.knownHelpers = {
      'helperMissing': true,
      'blockHelperMissing': true,
      'each': true,
      'if': true,
      'unless': true,
      'with': true,
      'log': true
    };
    if (knownHelpers) {
      for (var name in knownHelpers) {
        this.options.knownHelpers[name] = knownHelpers[name];
      }
    }

    return this.accept(program);
  },

  accept: function(node) {
    var strip = node.strip || {},
        ret;
    if (strip.left) {
      this.opcode('strip');
    }

    ret = this[node.type](node);

    if (strip.right) {
      this.opcode('strip');
    }

    return ret;
  },

  program: function(program) {
    var statements = program.statements;

    for(var i=0, l=statements.length; i<l; i++) {
      this.accept(statements[i]);
    }
    this.isSimple = l === 1;

    this.depths.list = this.depths.list.sort(function(a, b) {
      return a - b;
    });

    return this;
  },

  compileProgram: function(program) {
    var result = new this.compiler().compile(program, this.options);
    var guid = this.guid++, depth;

    this.usePartial = this.usePartial || result.usePartial;

    this.children[guid] = result;

    for(var i=0, l=result.depths.list.length; i<l; i++) {
      depth = result.depths.list[i];

      if(depth < 2) { continue; }
      else { this.addDepth(depth - 1); }
    }

    return guid;
  },

  block: function(block) {
    var mustache = block.mustache,
        program = block.program,
        inverse = block.inverse;

    if (program) {
      program = this.compileProgram(program);
    }

    if (inverse) {
      inverse = this.compileProgram(inverse);
    }

    var sexpr = mustache.sexpr;
    var type = this.classifySexpr(sexpr);

    if (type === "helper") {
      this.helperSexpr(sexpr, program, inverse);
    } else if (type === "simple") {
      this.simpleSexpr(sexpr);

      // now that the simple mustache is resolved, we need to
      // evaluate it by executing `blockHelperMissing`
      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);
      this.opcode('emptyHash');
      this.opcode('blockValue');
    } else {
      this.ambiguousSexpr(sexpr, program, inverse);

      // now that the simple mustache is resolved, we need to
      // evaluate it by executing `blockHelperMissing`
      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);
      this.opcode('emptyHash');
      this.opcode('ambiguousBlockValue');
    }

    this.opcode('append');
  },

  hash: function(hash) {
    var pairs = hash.pairs, pair, val;

    this.opcode('pushHash');

    for(var i=0, l=pairs.length; i<l; i++) {
      pair = pairs[i];
      val  = pair[1];

      if (this.options.stringParams) {
        if(val.depth) {
          this.addDepth(val.depth);
        }
        this.opcode('getContext', val.depth || 0);
        this.opcode('pushStringParam', val.stringModeValue, val.type);

        if (val.type === 'sexpr') {
          // Subexpressions get evaluated and passed in
          // in string params mode.
          this.sexpr(val);
        }
      } else {
        this.accept(val);
      }

      this.opcode('assignToHash', pair[0]);
    }
    this.opcode('popHash');
  },

  partial: function(partial) {
    var partialName = partial.partialName;
    this.usePartial = true;

    if(partial.context) {
      this.ID(partial.context);
    } else {
      this.opcode('push', 'depth0');
    }

    this.opcode('invokePartial', partialName.name);
    this.opcode('append');
  },

  content: function(content) {
    this.opcode('appendContent', content.string);
  },

  mustache: function(mustache) {
    this.sexpr(mustache.sexpr);

    if(mustache.escaped && !this.options.noEscape) {
      this.opcode('appendEscaped');
    } else {
      this.opcode('append');
    }
  },

  ambiguousSexpr: function(sexpr, program, inverse) {
    var id = sexpr.id,
        name = id.parts[0],
        isBlock = program != null || inverse != null;

    this.opcode('getContext', id.depth);

    this.opcode('pushProgram', program);
    this.opcode('pushProgram', inverse);

    this.opcode('invokeAmbiguous', name, isBlock);
  },

  simpleSexpr: function(sexpr) {
    var id = sexpr.id;

    if (id.type === 'DATA') {
      this.DATA(id);
    } else if (id.parts.length) {
      this.ID(id);
    } else {
      // Simplified ID for `this`
      this.addDepth(id.depth);
      this.opcode('getContext', id.depth);
      this.opcode('pushContext');
    }

    this.opcode('resolvePossibleLambda');
  },

  helperSexpr: function(sexpr, program, inverse) {
    var params = this.setupFullMustacheParams(sexpr, program, inverse),
        name = sexpr.id.parts[0];

    if (this.options.knownHelpers[name]) {
      this.opcode('invokeKnownHelper', params.length, name);
    } else if (this.options.knownHelpersOnly) {
      throw new Exception("You specified knownHelpersOnly, but used the unknown helper " + name, sexpr);
    } else {
      this.opcode('invokeHelper', params.length, name, sexpr.isRoot);
    }
  },

  sexpr: function(sexpr) {
    var type = this.classifySexpr(sexpr);

    if (type === "simple") {
      this.simpleSexpr(sexpr);
    } else if (type === "helper") {
      this.helperSexpr(sexpr);
    } else {
      this.ambiguousSexpr(sexpr);
    }
  },

  ID: function(id) {
    this.addDepth(id.depth);
    this.opcode('getContext', id.depth);

    var name = id.parts[0];
    if (!name) {
      this.opcode('pushContext');
    } else {
      this.opcode('lookupOnContext', id.parts[0]);
    }

    for(var i=1, l=id.parts.length; i<l; i++) {
      this.opcode('lookup', id.parts[i]);
    }
  },

  DATA: function(data) {
    this.options.data = true;
    if (data.id.isScoped || data.id.depth) {
      throw new Exception('Scoped data references are not supported: ' + data.original, data);
    }

    this.opcode('lookupData');
    var parts = data.id.parts;
    for(var i=0, l=parts.length; i<l; i++) {
      this.opcode('lookup', parts[i]);
    }
  },

  STRING: function(string) {
    this.opcode('pushString', string.string);
  },

  INTEGER: function(integer) {
    this.opcode('pushLiteral', integer.integer);
  },

  BOOLEAN: function(bool) {
    this.opcode('pushLiteral', bool.bool);
  },

  comment: function() {},

  // HELPERS
  opcode: function(name) {
    this.opcodes.push({ opcode: name, args: [].slice.call(arguments, 1) });
  },

  declare: function(name, value) {
    this.opcodes.push({ opcode: 'DECLARE', name: name, value: value });
  },

  addDepth: function(depth) {
    if(depth === 0) { return; }

    if(!this.depths[depth]) {
      this.depths[depth] = true;
      this.depths.list.push(depth);
    }
  },

  classifySexpr: function(sexpr) {
    var isHelper   = sexpr.isHelper;
    var isEligible = sexpr.eligibleHelper;
    var options    = this.options;

    // if ambiguous, we can possibly resolve the ambiguity now
    if (isEligible && !isHelper) {
      var name = sexpr.id.parts[0];

      if (options.knownHelpers[name]) {
        isHelper = true;
      } else if (options.knownHelpersOnly) {
        isEligible = false;
      }
    }

    if (isHelper) { return "helper"; }
    else if (isEligible) { return "ambiguous"; }
    else { return "simple"; }
  },

  pushParams: function(params) {
    var i = params.length, param;

    while(i--) {
      param = params[i];

      if(this.options.stringParams) {
        if(param.depth) {
          this.addDepth(param.depth);
        }

        this.opcode('getContext', param.depth || 0);
        this.opcode('pushStringParam', param.stringModeValue, param.type);

        if (param.type === 'sexpr') {
          // Subexpressions get evaluated and passed in
          // in string params mode.
          this.sexpr(param);
        }
      } else {
        this[param.type](param);
      }
    }
  },

  setupFullMustacheParams: function(sexpr, program, inverse) {
    var params = sexpr.params;
    this.pushParams(params);

    this.opcode('pushProgram', program);
    this.opcode('pushProgram', inverse);

    if (sexpr.hash) {
      this.hash(sexpr.hash);
    } else {
      this.opcode('emptyHash');
    }

    return params;
  }
};

function precompile(input, options, env) {
  if (input == null || (typeof input !== 'string' && input.constructor !== env.AST.ProgramNode)) {
    throw new Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
  }

  options = options || {};
  if (!('data' in options)) {
    options.data = true;
  }

  var ast = env.parse(input);
  var environment = new env.Compiler().compile(ast, options);
  return new env.JavaScriptCompiler().compile(environment, options);
}

exports.precompile = precompile;function compile(input, options, env) {
  if (input == null || (typeof input !== 'string' && input.constructor !== env.AST.ProgramNode)) {
    throw new Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
  }

  options = options || {};

  if (!('data' in options)) {
    options.data = true;
  }

  var compiled;

  function compileInput() {
    var ast = env.parse(input);
    var environment = new env.Compiler().compile(ast, options);
    var templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
    return env.template(templateSpec);
  }

  // Template is only compiled on first use and cached after that point.
  return function(context, options) {
    if (!compiled) {
      compiled = compileInput();
    }
    return compiled.call(this, context, options);
  };
}

exports.compile = compile;
},{"../exception":156}],152:[function(require,module,exports){
"use strict";
var COMPILER_REVISION = require("../base").COMPILER_REVISION;
var REVISION_CHANGES = require("../base").REVISION_CHANGES;
var log = require("../base").log;
var Exception = require("../exception")["default"];

function Literal(value) {
  this.value = value;
}

function JavaScriptCompiler() {}

JavaScriptCompiler.prototype = {
  // PUBLIC API: You can override these methods in a subclass to provide
  // alternative compiled forms for name lookup and buffering semantics
  nameLookup: function(parent, name /* , type*/) {
    var wrap,
        ret;
    if (parent.indexOf('depth') === 0) {
      wrap = true;
    }

    if (/^[0-9]+$/.test(name)) {
      ret = parent + "[" + name + "]";
    } else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
      ret = parent + "." + name;
    }
    else {
      ret = parent + "['" + name + "']";
    }

    if (wrap) {
      return '(' + parent + ' && ' + ret + ')';
    } else {
      return ret;
    }
  },

  compilerInfo: function() {
    var revision = COMPILER_REVISION,
        versions = REVISION_CHANGES[revision];
    return "this.compilerInfo = ["+revision+",'"+versions+"'];\n";
  },

  appendToBuffer: function(string) {
    if (this.environment.isSimple) {
      return "return " + string + ";";
    } else {
      return {
        appendToBuffer: true,
        content: string,
        toString: function() { return "buffer += " + string + ";"; }
      };
    }
  },

  initializeBuffer: function() {
    return this.quotedString("");
  },

  namespace: "Handlebars",
  // END PUBLIC API

  compile: function(environment, options, context, asObject) {
    this.environment = environment;
    this.options = options || {};

    log('debug', this.environment.disassemble() + "\n\n");

    this.name = this.environment.name;
    this.isChild = !!context;
    this.context = context || {
      programs: [],
      environments: [],
      aliases: { }
    };

    this.preamble();

    this.stackSlot = 0;
    this.stackVars = [];
    this.registers = { list: [] };
    this.hashes = [];
    this.compileStack = [];
    this.inlineStack = [];

    this.compileChildren(environment, options);

    var opcodes = environment.opcodes, opcode;

    this.i = 0;

    for(var l=opcodes.length; this.i<l; this.i++) {
      opcode = opcodes[this.i];

      if(opcode.opcode === 'DECLARE') {
        this[opcode.name] = opcode.value;
      } else {
        this[opcode.opcode].apply(this, opcode.args);
      }

      // Reset the stripNext flag if it was not set by this operation.
      if (opcode.opcode !== this.stripNext) {
        this.stripNext = false;
      }
    }

    // Flush any trailing content that might be pending.
    this.pushSource('');

    if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
      throw new Exception('Compile completed with content left on stack');
    }

    return this.createFunctionContext(asObject);
  },

  preamble: function() {
    var out = [];

    if (!this.isChild) {
      var namespace = this.namespace;

      var copies = "helpers = this.merge(helpers, " + namespace + ".helpers);";
      if (this.environment.usePartial) { copies = copies + " partials = this.merge(partials, " + namespace + ".partials);"; }
      if (this.options.data) { copies = copies + " data = data || {};"; }
      out.push(copies);
    } else {
      out.push('');
    }

    if (!this.environment.isSimple) {
      out.push(", buffer = " + this.initializeBuffer());
    } else {
      out.push("");
    }

    // track the last context pushed into place to allow skipping the
    // getContext opcode when it would be a noop
    this.lastContext = 0;
    this.source = out;
  },

  createFunctionContext: function(asObject) {
    var locals = this.stackVars.concat(this.registers.list);

    if(locals.length > 0) {
      this.source[1] = this.source[1] + ", " + locals.join(", ");
    }

    // Generate minimizer alias mappings
    if (!this.isChild) {
      for (var alias in this.context.aliases) {
        if (this.context.aliases.hasOwnProperty(alias)) {
          this.source[1] = this.source[1] + ', ' + alias + '=' + this.context.aliases[alias];
        }
      }
    }

    if (this.source[1]) {
      this.source[1] = "var " + this.source[1].substring(2) + ";";
    }

    // Merge children
    if (!this.isChild) {
      this.source[1] += '\n' + this.context.programs.join('\n') + '\n';
    }

    if (!this.environment.isSimple) {
      this.pushSource("return buffer;");
    }

    var params = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"];

    for(var i=0, l=this.environment.depths.list.length; i<l; i++) {
      params.push("depth" + this.environment.depths.list[i]);
    }

    // Perform a second pass over the output to merge content when possible
    var source = this.mergeSource();

    if (!this.isChild) {
      source = this.compilerInfo()+source;
    }

    if (asObject) {
      params.push(source);

      return Function.apply(this, params);
    } else {
      var functionSource = 'function ' + (this.name || '') + '(' + params.join(',') + ') {\n  ' + source + '}';
      log('debug', functionSource + "\n\n");
      return functionSource;
    }
  },
  mergeSource: function() {
    // WARN: We are not handling the case where buffer is still populated as the source should
    // not have buffer append operations as their final action.
    var source = '',
        buffer;
    for (var i = 0, len = this.source.length; i < len; i++) {
      var line = this.source[i];
      if (line.appendToBuffer) {
        if (buffer) {
          buffer = buffer + '\n    + ' + line.content;
        } else {
          buffer = line.content;
        }
      } else {
        if (buffer) {
          source += 'buffer += ' + buffer + ';\n  ';
          buffer = undefined;
        }
        source += line + '\n  ';
      }
    }
    return source;
  },

  // [blockValue]
  //
  // On stack, before: hash, inverse, program, value
  // On stack, after: return value of blockHelperMissing
  //
  // The purpose of this opcode is to take a block of the form
  // `{{#foo}}...{{/foo}}`, resolve the value of `foo`, and
  // replace it on the stack with the result of properly
  // invoking blockHelperMissing.
  blockValue: function() {
    this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

    var params = ["depth0"];
    this.setupParams(0, params);

    this.replaceStack(function(current) {
      params.splice(1, 0, current);
      return "blockHelperMissing.call(" + params.join(", ") + ")";
    });
  },

  // [ambiguousBlockValue]
  //
  // On stack, before: hash, inverse, program, value
  // Compiler value, before: lastHelper=value of last found helper, if any
  // On stack, after, if no lastHelper: same as [blockValue]
  // On stack, after, if lastHelper: value
  ambiguousBlockValue: function() {
    this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

    var params = ["depth0"];
    this.setupParams(0, params);

    var current = this.topStack();
    params.splice(1, 0, current);

    this.pushSource("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
  },

  // [appendContent]
  //
  // On stack, before: ...
  // On stack, after: ...
  //
  // Appends the string value of `content` to the current buffer
  appendContent: function(content) {
    if (this.pendingContent) {
      content = this.pendingContent + content;
    }
    if (this.stripNext) {
      content = content.replace(/^\s+/, '');
    }

    this.pendingContent = content;
  },

  // [strip]
  //
  // On stack, before: ...
  // On stack, after: ...
  //
  // Removes any trailing whitespace from the prior content node and flags
  // the next operation for stripping if it is a content node.
  strip: function() {
    if (this.pendingContent) {
      this.pendingContent = this.pendingContent.replace(/\s+$/, '');
    }
    this.stripNext = 'strip';
  },

  // [append]
  //
  // On stack, before: value, ...
  // On stack, after: ...
  //
  // Coerces `value` to a String and appends it to the current buffer.
  //
  // If `value` is truthy, or 0, it is coerced into a string and appended
  // Otherwise, the empty string is appended
  append: function() {
    // Force anything that is inlined onto the stack so we don't have duplication
    // when we examine local
    this.flushInline();
    var local = this.popStack();
    this.pushSource("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
    if (this.environment.isSimple) {
      this.pushSource("else { " + this.appendToBuffer("''") + " }");
    }
  },

  // [appendEscaped]
  //
  // On stack, before: value, ...
  // On stack, after: ...
  //
  // Escape `value` and append it to the buffer
  appendEscaped: function() {
    this.context.aliases.escapeExpression = 'this.escapeExpression';

    this.pushSource(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
  },

  // [getContext]
  //
  // On stack, before: ...
  // On stack, after: ...
  // Compiler value, after: lastContext=depth
  //
  // Set the value of the `lastContext` compiler value to the depth
  getContext: function(depth) {
    if(this.lastContext !== depth) {
      this.lastContext = depth;
    }
  },

  // [lookupOnContext]
  //
  // On stack, before: ...
  // On stack, after: currentContext[name], ...
  //
  // Looks up the value of `name` on the current context and pushes
  // it onto the stack.
  lookupOnContext: function(name) {
    this.push(this.nameLookup('depth' + this.lastContext, name, 'context'));
  },

  // [pushContext]
  //
  // On stack, before: ...
  // On stack, after: currentContext, ...
  //
  // Pushes the value of the current context onto the stack.
  pushContext: function() {
    this.pushStackLiteral('depth' + this.lastContext);
  },

  // [resolvePossibleLambda]
  //
  // On stack, before: value, ...
  // On stack, after: resolved value, ...
  //
  // If the `value` is a lambda, replace it on the stack by
  // the return value of the lambda
  resolvePossibleLambda: function() {
    this.context.aliases.functionType = '"function"';

    this.replaceStack(function(current) {
      return "typeof " + current + " === functionType ? " + current + ".apply(depth0) : " + current;
    });
  },

  // [lookup]
  //
  // On stack, before: value, ...
  // On stack, after: value[name], ...
  //
  // Replace the value on the stack with the result of looking
  // up `name` on `value`
  lookup: function(name) {
    this.replaceStack(function(current) {
      return current + " == null || " + current + " === false ? " + current + " : " + this.nameLookup(current, name, 'context');
    });
  },

  // [lookupData]
  //
  // On stack, before: ...
  // On stack, after: data, ...
  //
  // Push the data lookup operator
  lookupData: function() {
    this.pushStackLiteral('data');
  },

  // [pushStringParam]
  //
  // On stack, before: ...
  // On stack, after: string, currentContext, ...
  //
  // This opcode is designed for use in string mode, which
  // provides the string value of a parameter along with its
  // depth rather than resolving it immediately.
  pushStringParam: function(string, type) {
    this.pushStackLiteral('depth' + this.lastContext);

    this.pushString(type);

    // If it's a subexpression, the string result
    // will be pushed after this opcode.
    if (type !== 'sexpr') {
      if (typeof string === 'string') {
        this.pushString(string);
      } else {
        this.pushStackLiteral(string);
      }
    }
  },

  emptyHash: function() {
    this.pushStackLiteral('{}');

    if (this.options.stringParams) {
      this.push('{}'); // hashContexts
      this.push('{}'); // hashTypes
    }
  },
  pushHash: function() {
    if (this.hash) {
      this.hashes.push(this.hash);
    }
    this.hash = {values: [], types: [], contexts: []};
  },
  popHash: function() {
    var hash = this.hash;
    this.hash = this.hashes.pop();

    if (this.options.stringParams) {
      this.push('{' + hash.contexts.join(',') + '}');
      this.push('{' + hash.types.join(',') + '}');
    }

    this.push('{\n    ' + hash.values.join(',\n    ') + '\n  }');
  },

  // [pushString]
  //
  // On stack, before: ...
  // On stack, after: quotedString(string), ...
  //
  // Push a quoted version of `string` onto the stack
  pushString: function(string) {
    this.pushStackLiteral(this.quotedString(string));
  },

  // [push]
  //
  // On stack, before: ...
  // On stack, after: expr, ...
  //
  // Push an expression onto the stack
  push: function(expr) {
    this.inlineStack.push(expr);
    return expr;
  },

  // [pushLiteral]
  //
  // On stack, before: ...
  // On stack, after: value, ...
  //
  // Pushes a value onto the stack. This operation prevents
  // the compiler from creating a temporary variable to hold
  // it.
  pushLiteral: function(value) {
    this.pushStackLiteral(value);
  },

  // [pushProgram]
  //
  // On stack, before: ...
  // On stack, after: program(guid), ...
  //
  // Push a program expression onto the stack. This takes
  // a compile-time guid and converts it into a runtime-accessible
  // expression.
  pushProgram: function(guid) {
    if (guid != null) {
      this.pushStackLiteral(this.programExpression(guid));
    } else {
      this.pushStackLiteral(null);
    }
  },

  // [invokeHelper]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of helper invocation
  //
  // Pops off the helper's parameters, invokes the helper,
  // and pushes the helper's return value onto the stack.
  //
  // If the helper is not found, `helperMissing` is called.
  invokeHelper: function(paramSize, name, isRoot) {
    this.context.aliases.helperMissing = 'helpers.helperMissing';
    this.useRegister('helper');

    var helper = this.lastHelper = this.setupHelper(paramSize, name, true);
    var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');

    var lookup = 'helper = ' + helper.name + ' || ' + nonHelper;
    if (helper.paramsInit) {
      lookup += ',' + helper.paramsInit;
    }

    this.push(
      '('
        + lookup
        + ',helper '
          + '? helper.call(' + helper.callParams + ') '
          + ': helperMissing.call(' + helper.helperMissingParams + '))');

    // Always flush subexpressions. This is both to prevent the compounding size issue that
    // occurs when the code has to be duplicated for inlining and also to prevent errors
    // due to the incorrect options object being passed due to the shared register.
    if (!isRoot) {
      this.flushInline();
    }
  },

  // [invokeKnownHelper]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of helper invocation
  //
  // This operation is used when the helper is known to exist,
  // so a `helperMissing` fallback is not required.
  invokeKnownHelper: function(paramSize, name) {
    var helper = this.setupHelper(paramSize, name);
    this.push(helper.name + ".call(" + helper.callParams + ")");
  },

  // [invokeAmbiguous]
  //
  // On stack, before: hash, inverse, program, params..., ...
  // On stack, after: result of disambiguation
  //
  // This operation is used when an expression like `{{foo}}`
  // is provided, but we don't know at compile-time whether it
  // is a helper or a path.
  //
  // This operation emits more code than the other options,
  // and can be avoided by passing the `knownHelpers` and
  // `knownHelpersOnly` flags at compile-time.
  invokeAmbiguous: function(name, helperCall) {
    this.context.aliases.functionType = '"function"';
    this.useRegister('helper');

    this.emptyHash();
    var helper = this.setupHelper(0, name, helperCall);

    var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

    var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');
    var nextStack = this.nextStack();

    if (helper.paramsInit) {
      this.pushSource(helper.paramsInit);
    }
    this.pushSource('if (helper = ' + helperName + ') { ' + nextStack + ' = helper.call(' + helper.callParams + '); }');
    this.pushSource('else { helper = ' + nonHelper + '; ' + nextStack + ' = typeof helper === functionType ? helper.call(' + helper.callParams + ') : helper; }');
  },

  // [invokePartial]
  //
  // On stack, before: context, ...
  // On stack after: result of partial invocation
  //
  // This operation pops off a context, invokes a partial with that context,
  // and pushes the result of the invocation back.
  invokePartial: function(name) {
    var params = [this.nameLookup('partials', name, 'partial'), "'" + name + "'", this.popStack(), "helpers", "partials"];

    if (this.options.data) {
      params.push("data");
    }

    this.context.aliases.self = "this";
    this.push("self.invokePartial(" + params.join(", ") + ")");
  },

  // [assignToHash]
  //
  // On stack, before: value, hash, ...
  // On stack, after: hash, ...
  //
  // Pops a value and hash off the stack, assigns `hash[key] = value`
  // and pushes the hash back onto the stack.
  assignToHash: function(key) {
    var value = this.popStack(),
        context,
        type;

    if (this.options.stringParams) {
      type = this.popStack();
      context = this.popStack();
    }

    var hash = this.hash;
    if (context) {
      hash.contexts.push("'" + key + "': " + context);
    }
    if (type) {
      hash.types.push("'" + key + "': " + type);
    }
    hash.values.push("'" + key + "': (" + value + ")");
  },

  // HELPERS

  compiler: JavaScriptCompiler,

  compileChildren: function(environment, options) {
    var children = environment.children, child, compiler;

    for(var i=0, l=children.length; i<l; i++) {
      child = children[i];
      compiler = new this.compiler();

      var index = this.matchExistingProgram(child);

      if (index == null) {
        this.context.programs.push('');     // Placeholder to prevent name conflicts for nested children
        index = this.context.programs.length;
        child.index = index;
        child.name = 'program' + index;
        this.context.programs[index] = compiler.compile(child, options, this.context);
        this.context.environments[index] = child;
      } else {
        child.index = index;
        child.name = 'program' + index;
      }
    }
  },
  matchExistingProgram: function(child) {
    for (var i = 0, len = this.context.environments.length; i < len; i++) {
      var environment = this.context.environments[i];
      if (environment && environment.equals(child)) {
        return i;
      }
    }
  },

  programExpression: function(guid) {
    this.context.aliases.self = "this";

    if(guid == null) {
      return "self.noop";
    }

    var child = this.environment.children[guid],
        depths = child.depths.list, depth;

    var programParams = [child.index, child.name, "data"];

    for(var i=0, l = depths.length; i<l; i++) {
      depth = depths[i];

      if(depth === 1) { programParams.push("depth0"); }
      else { programParams.push("depth" + (depth - 1)); }
    }

    return (depths.length === 0 ? "self.program(" : "self.programWithDepth(") + programParams.join(", ") + ")";
  },

  register: function(name, val) {
    this.useRegister(name);
    this.pushSource(name + " = " + val + ";");
  },

  useRegister: function(name) {
    if(!this.registers[name]) {
      this.registers[name] = true;
      this.registers.list.push(name);
    }
  },

  pushStackLiteral: function(item) {
    return this.push(new Literal(item));
  },

  pushSource: function(source) {
    if (this.pendingContent) {
      this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent)));
      this.pendingContent = undefined;
    }

    if (source) {
      this.source.push(source);
    }
  },

  pushStack: function(item) {
    this.flushInline();

    var stack = this.incrStack();
    if (item) {
      this.pushSource(stack + " = " + item + ";");
    }
    this.compileStack.push(stack);
    return stack;
  },

  replaceStack: function(callback) {
    var prefix = '',
        inline = this.isInline(),
        stack,
        createdStack,
        usedLiteral;

    // If we are currently inline then we want to merge the inline statement into the
    // replacement statement via ','
    if (inline) {
      var top = this.popStack(true);

      if (top instanceof Literal) {
        // Literals do not need to be inlined
        stack = top.value;
        usedLiteral = true;
      } else {
        // Get or create the current stack name for use by the inline
        createdStack = !this.stackSlot;
        var name = !createdStack ? this.topStackName() : this.incrStack();

        prefix = '(' + this.push(name) + ' = ' + top + '),';
        stack = this.topStack();
      }
    } else {
      stack = this.topStack();
    }

    var item = callback.call(this, stack);

    if (inline) {
      if (!usedLiteral) {
        this.popStack();
      }
      if (createdStack) {
        this.stackSlot--;
      }
      this.push('(' + prefix + item + ')');
    } else {
      // Prevent modification of the context depth variable. Through replaceStack
      if (!/^stack/.test(stack)) {
        stack = this.nextStack();
      }

      this.pushSource(stack + " = (" + prefix + item + ");");
    }
    return stack;
  },

  nextStack: function() {
    return this.pushStack();
  },

  incrStack: function() {
    this.stackSlot++;
    if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
    return this.topStackName();
  },
  topStackName: function() {
    return "stack" + this.stackSlot;
  },
  flushInline: function() {
    var inlineStack = this.inlineStack;
    if (inlineStack.length) {
      this.inlineStack = [];
      for (var i = 0, len = inlineStack.length; i < len; i++) {
        var entry = inlineStack[i];
        if (entry instanceof Literal) {
          this.compileStack.push(entry);
        } else {
          this.pushStack(entry);
        }
      }
    }
  },
  isInline: function() {
    return this.inlineStack.length;
  },

  popStack: function(wrapped) {
    var inline = this.isInline(),
        item = (inline ? this.inlineStack : this.compileStack).pop();

    if (!wrapped && (item instanceof Literal)) {
      return item.value;
    } else {
      if (!inline) {
        if (!this.stackSlot) {
          throw new Exception('Invalid stack pop');
        }
        this.stackSlot--;
      }
      return item;
    }
  },

  topStack: function(wrapped) {
    var stack = (this.isInline() ? this.inlineStack : this.compileStack),
        item = stack[stack.length - 1];

    if (!wrapped && (item instanceof Literal)) {
      return item.value;
    } else {
      return item;
    }
  },

  quotedString: function(str) {
    return '"' + str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\u2028/g, '\\u2028')   // Per Ecma-262 7.3 + 7.8.4
      .replace(/\u2029/g, '\\u2029') + '"';
  },

  setupHelper: function(paramSize, name, missingParams) {
    var params = [],
        paramsInit = this.setupParams(paramSize, params, missingParams);
    var foundHelper = this.nameLookup('helpers', name, 'helper');

    return {
      params: params,
      paramsInit: paramsInit,
      name: foundHelper,
      callParams: ["depth0"].concat(params).join(", "),
      helperMissingParams: missingParams && ["depth0", this.quotedString(name)].concat(params).join(", ")
    };
  },

  setupOptions: function(paramSize, params) {
    var options = [], contexts = [], types = [], param, inverse, program;

    options.push("hash:" + this.popStack());

    if (this.options.stringParams) {
      options.push("hashTypes:" + this.popStack());
      options.push("hashContexts:" + this.popStack());
    }

    inverse = this.popStack();
    program = this.popStack();

    // Avoid setting fn and inverse if neither are set. This allows
    // helpers to do a check for `if (options.fn)`
    if (program || inverse) {
      if (!program) {
        this.context.aliases.self = "this";
        program = "self.noop";
      }

      if (!inverse) {
        this.context.aliases.self = "this";
        inverse = "self.noop";
      }

      options.push("inverse:" + inverse);
      options.push("fn:" + program);
    }

    for(var i=0; i<paramSize; i++) {
      param = this.popStack();
      params.push(param);

      if(this.options.stringParams) {
        types.push(this.popStack());
        contexts.push(this.popStack());
      }
    }

    if (this.options.stringParams) {
      options.push("contexts:[" + contexts.join(",") + "]");
      options.push("types:[" + types.join(",") + "]");
    }

    if(this.options.data) {
      options.push("data:data");
    }

    return options;
  },

  // the params and contexts arguments are passed in arrays
  // to fill in
  setupParams: function(paramSize, params, useRegister) {
    var options = '{' + this.setupOptions(paramSize, params).join(',') + '}';

    if (useRegister) {
      this.useRegister('options');
      params.push('options');
      return 'options=' + options;
    } else {
      params.push(options);
      return '';
    }
  }
};

var reservedWords = (
  "break else new var" +
  " case finally return void" +
  " catch for switch while" +
  " continue function this with" +
  " default if throw" +
  " delete in try" +
  " do instanceof typeof" +
  " abstract enum int short" +
  " boolean export interface static" +
  " byte extends long super" +
  " char final native synchronized" +
  " class float package throws" +
  " const goto private transient" +
  " debugger implements protected volatile" +
  " double import public let yield"
).split(" ");

var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

for(var i=0, l=reservedWords.length; i<l; i++) {
  compilerWords[reservedWords[i]] = true;
}

JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
  if(!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name)) {
    return true;
  }
  return false;
};

exports["default"] = JavaScriptCompiler;
},{"../base":148,"../exception":156}],153:[function(require,module,exports){
"use strict";
/* jshint ignore:start */
/* Jison generated parser */
var handlebars = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"root":3,"statements":4,"EOF":5,"program":6,"simpleInverse":7,"statement":8,"openInverse":9,"closeBlock":10,"openBlock":11,"mustache":12,"partial":13,"CONTENT":14,"COMMENT":15,"OPEN_BLOCK":16,"sexpr":17,"CLOSE":18,"OPEN_INVERSE":19,"OPEN_ENDBLOCK":20,"path":21,"OPEN":22,"OPEN_UNESCAPED":23,"CLOSE_UNESCAPED":24,"OPEN_PARTIAL":25,"partialName":26,"partial_option0":27,"sexpr_repetition0":28,"sexpr_option0":29,"dataName":30,"param":31,"STRING":32,"INTEGER":33,"BOOLEAN":34,"OPEN_SEXPR":35,"CLOSE_SEXPR":36,"hash":37,"hash_repetition_plus0":38,"hashSegment":39,"ID":40,"EQUALS":41,"DATA":42,"pathSegments":43,"SEP":44,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"CLOSE_UNESCAPED",25:"OPEN_PARTIAL",32:"STRING",33:"INTEGER",34:"BOOLEAN",35:"OPEN_SEXPR",36:"CLOSE_SEXPR",40:"ID",41:"EQUALS",42:"DATA",44:"SEP"},
productions_: [0,[3,2],[3,1],[6,2],[6,3],[6,2],[6,1],[6,1],[6,0],[4,1],[4,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,4],[7,2],[17,3],[17,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,3],[37,1],[39,3],[26,1],[26,1],[26,1],[30,2],[21,1],[43,3],[43,1],[27,0],[27,1],[28,0],[28,2],[29,0],[29,1],[38,1],[38,2]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: return new yy.ProgramNode($$[$0-1], this._$); 
break;
case 2: return new yy.ProgramNode([], this._$); 
break;
case 3:this.$ = new yy.ProgramNode([], $$[$0-1], $$[$0], this._$);
break;
case 4:this.$ = new yy.ProgramNode($$[$0-2], $$[$0-1], $$[$0], this._$);
break;
case 5:this.$ = new yy.ProgramNode($$[$0-1], $$[$0], [], this._$);
break;
case 6:this.$ = new yy.ProgramNode($$[$0], this._$);
break;
case 7:this.$ = new yy.ProgramNode([], this._$);
break;
case 8:this.$ = new yy.ProgramNode([], this._$);
break;
case 9:this.$ = [$$[$0]];
break;
case 10: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]; 
break;
case 11:this.$ = new yy.BlockNode($$[$0-2], $$[$0-1].inverse, $$[$0-1], $$[$0], this._$);
break;
case 12:this.$ = new yy.BlockNode($$[$0-2], $$[$0-1], $$[$0-1].inverse, $$[$0], this._$);
break;
case 13:this.$ = $$[$0];
break;
case 14:this.$ = $$[$0];
break;
case 15:this.$ = new yy.ContentNode($$[$0], this._$);
break;
case 16:this.$ = new yy.CommentNode($$[$0], this._$);
break;
case 17:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
break;
case 18:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
break;
case 19:this.$ = {path: $$[$0-1], strip: stripFlags($$[$0-2], $$[$0])};
break;
case 20:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
break;
case 21:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], stripFlags($$[$0-2], $$[$0]), this._$);
break;
case 22:this.$ = new yy.PartialNode($$[$0-2], $$[$0-1], stripFlags($$[$0-3], $$[$0]), this._$);
break;
case 23:this.$ = stripFlags($$[$0-1], $$[$0]);
break;
case 24:this.$ = new yy.SexprNode([$$[$0-2]].concat($$[$0-1]), $$[$0], this._$);
break;
case 25:this.$ = new yy.SexprNode([$$[$0]], null, this._$);
break;
case 26:this.$ = $$[$0];
break;
case 27:this.$ = new yy.StringNode($$[$0], this._$);
break;
case 28:this.$ = new yy.IntegerNode($$[$0], this._$);
break;
case 29:this.$ = new yy.BooleanNode($$[$0], this._$);
break;
case 30:this.$ = $$[$0];
break;
case 31:$$[$0-1].isHelper = true; this.$ = $$[$0-1];
break;
case 32:this.$ = new yy.HashNode($$[$0], this._$);
break;
case 33:this.$ = [$$[$0-2], $$[$0]];
break;
case 34:this.$ = new yy.PartialNameNode($$[$0], this._$);
break;
case 35:this.$ = new yy.PartialNameNode(new yy.StringNode($$[$0], this._$), this._$);
break;
case 36:this.$ = new yy.PartialNameNode(new yy.IntegerNode($$[$0], this._$));
break;
case 37:this.$ = new yy.DataNode($$[$0], this._$);
break;
case 38:this.$ = new yy.IdNode($$[$0], this._$);
break;
case 39: $$[$0-2].push({part: $$[$0], separator: $$[$0-1]}); this.$ = $$[$0-2]; 
break;
case 40:this.$ = [{part: $$[$0]}];
break;
case 43:this.$ = [];
break;
case 44:$$[$0-1].push($$[$0]);
break;
case 47:this.$ = [$$[$0]];
break;
case 48:$$[$0-1].push($$[$0]);
break;
}
},
table: [{3:1,4:2,5:[1,3],8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],25:[1,15]},{1:[3]},{5:[1,16],8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],25:[1,15]},{1:[2,2]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],25:[2,9]},{4:20,6:18,7:19,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,8],22:[1,13],23:[1,14],25:[1,15]},{4:20,6:22,7:19,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,8],22:[1,13],23:[1,14],25:[1,15]},{5:[2,13],14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],25:[2,13]},{5:[2,14],14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],25:[2,14]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],25:[2,15]},{5:[2,16],14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],25:[2,16]},{17:23,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:29,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:30,21:24,30:25,40:[1,28],42:[1,27],43:26},{17:31,21:24,30:25,40:[1,28],42:[1,27],43:26},{21:33,26:32,32:[1,34],33:[1,35],40:[1,28],43:26},{1:[2,1]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],25:[2,10]},{10:36,20:[1,37]},{4:38,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,7],22:[1,13],23:[1,14],25:[1,15]},{7:39,8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,6],22:[1,13],23:[1,14],25:[1,15]},{17:23,18:[1,40],21:24,30:25,40:[1,28],42:[1,27],43:26},{10:41,20:[1,37]},{18:[1,42]},{18:[2,43],24:[2,43],28:43,32:[2,43],33:[2,43],34:[2,43],35:[2,43],36:[2,43],40:[2,43],42:[2,43]},{18:[2,25],24:[2,25],36:[2,25]},{18:[2,38],24:[2,38],32:[2,38],33:[2,38],34:[2,38],35:[2,38],36:[2,38],40:[2,38],42:[2,38],44:[1,44]},{21:45,40:[1,28],43:26},{18:[2,40],24:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],40:[2,40],42:[2,40],44:[2,40]},{18:[1,46]},{18:[1,47]},{24:[1,48]},{18:[2,41],21:50,27:49,40:[1,28],43:26},{18:[2,34],40:[2,34]},{18:[2,35],40:[2,35]},{18:[2,36],40:[2,36]},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],25:[2,11]},{21:51,40:[1,28],43:26},{8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,3],22:[1,13],23:[1,14],25:[1,15]},{4:52,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,5],22:[1,13],23:[1,14],25:[1,15]},{14:[2,23],15:[2,23],16:[2,23],19:[2,23],20:[2,23],22:[2,23],23:[2,23],25:[2,23]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],25:[2,12]},{14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],25:[2,18]},{18:[2,45],21:56,24:[2,45],29:53,30:60,31:54,32:[1,57],33:[1,58],34:[1,59],35:[1,61],36:[2,45],37:55,38:62,39:63,40:[1,64],42:[1,27],43:26},{40:[1,65]},{18:[2,37],24:[2,37],32:[2,37],33:[2,37],34:[2,37],35:[2,37],36:[2,37],40:[2,37],42:[2,37]},{14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],25:[2,17]},{5:[2,20],14:[2,20],15:[2,20],16:[2,20],19:[2,20],20:[2,20],22:[2,20],23:[2,20],25:[2,20]},{5:[2,21],14:[2,21],15:[2,21],16:[2,21],19:[2,21],20:[2,21],22:[2,21],23:[2,21],25:[2,21]},{18:[1,66]},{18:[2,42]},{18:[1,67]},{8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,4],22:[1,13],23:[1,14],25:[1,15]},{18:[2,24],24:[2,24],36:[2,24]},{18:[2,44],24:[2,44],32:[2,44],33:[2,44],34:[2,44],35:[2,44],36:[2,44],40:[2,44],42:[2,44]},{18:[2,46],24:[2,46],36:[2,46]},{18:[2,26],24:[2,26],32:[2,26],33:[2,26],34:[2,26],35:[2,26],36:[2,26],40:[2,26],42:[2,26]},{18:[2,27],24:[2,27],32:[2,27],33:[2,27],34:[2,27],35:[2,27],36:[2,27],40:[2,27],42:[2,27]},{18:[2,28],24:[2,28],32:[2,28],33:[2,28],34:[2,28],35:[2,28],36:[2,28],40:[2,28],42:[2,28]},{18:[2,29],24:[2,29],32:[2,29],33:[2,29],34:[2,29],35:[2,29],36:[2,29],40:[2,29],42:[2,29]},{18:[2,30],24:[2,30],32:[2,30],33:[2,30],34:[2,30],35:[2,30],36:[2,30],40:[2,30],42:[2,30]},{17:68,21:24,30:25,40:[1,28],42:[1,27],43:26},{18:[2,32],24:[2,32],36:[2,32],39:69,40:[1,70]},{18:[2,47],24:[2,47],36:[2,47],40:[2,47]},{18:[2,40],24:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],40:[2,40],41:[1,71],42:[2,40],44:[2,40]},{18:[2,39],24:[2,39],32:[2,39],33:[2,39],34:[2,39],35:[2,39],36:[2,39],40:[2,39],42:[2,39],44:[2,39]},{5:[2,22],14:[2,22],15:[2,22],16:[2,22],19:[2,22],20:[2,22],22:[2,22],23:[2,22],25:[2,22]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],25:[2,19]},{36:[1,72]},{18:[2,48],24:[2,48],36:[2,48],40:[2,48]},{41:[1,71]},{21:56,30:60,31:73,32:[1,57],33:[1,58],34:[1,59],35:[1,61],40:[1,28],42:[1,27],43:26},{18:[2,31],24:[2,31],32:[2,31],33:[2,31],34:[2,31],35:[2,31],36:[2,31],40:[2,31],42:[2,31]},{18:[2,33],24:[2,33],36:[2,33],40:[2,33]}],
defaultActions: {3:[2,2],16:[2,1],50:[2,42]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == "undefined")
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === "function")
        this.parseError = this.yy.parseError;
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || 1;
        if (typeof token !== "number") {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == "undefined") {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
            var errStr = "";
            if (!recovering) {
                expected = [];
                for (p in table[state])
                    if (this.terminals_[p] && p > 2) {
                        expected.push("'" + this.terminals_[p] + "'");
                    }
                if (this.lexer.showPosition) {
                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                } else {
                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                }
                this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }
        }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0)
                    recovering--;
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
            if (ranges) {
                yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== "undefined") {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}
};


function stripFlags(open, close) {
  return {
    left: open.charAt(2) === '~',
    right: close.charAt(0) === '~' || close.charAt(1) === '~'
  };
}

/* Jison generated lexer */
var lexer = (function(){
var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        if (this.options.ranges) this.yylloc.range = [0,0];
        this.offset = 0;
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) this.yylloc.range[1]++;

        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length-1);
        this.matched = this.matched.substr(0, this.matched.length-1);

        if (lines.length-1) this.yylineno -= lines.length-1;
        var r = this.yylloc.range;

        this.yylloc = {first_line: this.yylloc.first_line,
          last_line: this.yylineno+1,
          first_column: this.yylloc.first_column,
          last_column: lines ?
              (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
              this.yylloc.first_column - len
          };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
less:function (n) {
        this.unput(this.match.slice(n));
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            tempMatch,
            index,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (!this.options.flex) break;
            }
        }
        if (match) {
            lines = match[0].match(/(?:\r\n?|\n).*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
            this.yytext += match[0];
            this.match += match[0];
            this.matches = match;
            this.yyleng = this.yytext.length;
            if (this.options.ranges) {
                this.yylloc.range = [this.offset, this.offset += this.yyleng];
            }
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
            if (this.done && this._input) this.done = false;
            if (token) return token;
            else return;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.options = {};
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {


function strip(start, end) {
  return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng-end);
}


var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0:
                                   if(yy_.yytext.slice(-2) === "\\\\") {
                                     strip(0,1);
                                     this.begin("mu");
                                   } else if(yy_.yytext.slice(-1) === "\\") {
                                     strip(0,1);
                                     this.begin("emu");
                                   } else {
                                     this.begin("mu");
                                   }
                                   if(yy_.yytext) return 14;
                                 
break;
case 1:return 14;
break;
case 2:
                                   this.popState();
                                   return 14;
                                 
break;
case 3:strip(0,4); this.popState(); return 15;
break;
case 4:return 35;
break;
case 5:return 36;
break;
case 6:return 25;
break;
case 7:return 16;
break;
case 8:return 20;
break;
case 9:return 19;
break;
case 10:return 19;
break;
case 11:return 23;
break;
case 12:return 22;
break;
case 13:this.popState(); this.begin('com');
break;
case 14:strip(3,5); this.popState(); return 15;
break;
case 15:return 22;
break;
case 16:return 41;
break;
case 17:return 40;
break;
case 18:return 40;
break;
case 19:return 44;
break;
case 20:// ignore whitespace
break;
case 21:this.popState(); return 24;
break;
case 22:this.popState(); return 18;
break;
case 23:yy_.yytext = strip(1,2).replace(/\\"/g,'"'); return 32;
break;
case 24:yy_.yytext = strip(1,2).replace(/\\'/g,"'"); return 32;
break;
case 25:return 42;
break;
case 26:return 34;
break;
case 27:return 34;
break;
case 28:return 33;
break;
case 29:return 40;
break;
case 30:yy_.yytext = strip(1,2); return 40;
break;
case 31:return 'INVALID';
break;
case 32:return 5;
break;
}
};
lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{(~)?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:-?[0-9]+(?=([~}\s)])))/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:$)/];
lexer.conditions = {"mu":{"rules":[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],"inclusive":false},"emu":{"rules":[2],"inclusive":false},"com":{"rules":[3],"inclusive":false},"INITIAL":{"rules":[0,1,32],"inclusive":true}};
return lexer;})()
parser.lexer = lexer;
function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();exports["default"] = handlebars;
/* jshint ignore:end */
},{}],154:[function(require,module,exports){
"use strict";
var Visitor = require("./visitor")["default"];

function print(ast) {
  return new PrintVisitor().accept(ast);
}

exports.print = print;function PrintVisitor() {
  this.padding = 0;
}

exports.PrintVisitor = PrintVisitor;PrintVisitor.prototype = new Visitor();

PrintVisitor.prototype.pad = function(string, newline) {
  var out = "";

  for(var i=0,l=this.padding; i<l; i++) {
    out = out + "  ";
  }

  out = out + string;

  if(newline !== false) { out = out + "\n"; }
  return out;
};

PrintVisitor.prototype.program = function(program) {
  var out = "",
      statements = program.statements,
      i, l;

  for(i=0, l=statements.length; i<l; i++) {
    out = out + this.accept(statements[i]);
  }

  this.padding--;

  return out;
};

PrintVisitor.prototype.block = function(block) {
  var out = "";

  out = out + this.pad("BLOCK:");
  this.padding++;
  out = out + this.accept(block.mustache);
  if (block.program) {
    out = out + this.pad("PROGRAM:");
    this.padding++;
    out = out + this.accept(block.program);
    this.padding--;
  }
  if (block.inverse) {
    if (block.program) { this.padding++; }
    out = out + this.pad("{{^}}");
    this.padding++;
    out = out + this.accept(block.inverse);
    this.padding--;
    if (block.program) { this.padding--; }
  }
  this.padding--;

  return out;
};

PrintVisitor.prototype.sexpr = function(sexpr) {
  var params = sexpr.params, paramStrings = [], hash;

  for(var i=0, l=params.length; i<l; i++) {
    paramStrings.push(this.accept(params[i]));
  }

  params = "[" + paramStrings.join(", ") + "]";

  hash = sexpr.hash ? " " + this.accept(sexpr.hash) : "";

  return this.accept(sexpr.id) + " " + params + hash;
};

PrintVisitor.prototype.mustache = function(mustache) {
  return this.pad("{{ " + this.accept(mustache.sexpr) + " }}");
};

PrintVisitor.prototype.partial = function(partial) {
  var content = this.accept(partial.partialName);
  if(partial.context) { content = content + " " + this.accept(partial.context); }
  return this.pad("{{> " + content + " }}");
};

PrintVisitor.prototype.hash = function(hash) {
  var pairs = hash.pairs;
  var joinedPairs = [], left, right;

  for(var i=0, l=pairs.length; i<l; i++) {
    left = pairs[i][0];
    right = this.accept(pairs[i][1]);
    joinedPairs.push( left + "=" + right );
  }

  return "HASH{" + joinedPairs.join(", ") + "}";
};

PrintVisitor.prototype.STRING = function(string) {
  return '"' + string.string + '"';
};

PrintVisitor.prototype.INTEGER = function(integer) {
  return "INTEGER{" + integer.integer + "}";
};

PrintVisitor.prototype.BOOLEAN = function(bool) {
  return "BOOLEAN{" + bool.bool + "}";
};

PrintVisitor.prototype.ID = function(id) {
  var path = id.parts.join("/");
  if(id.parts.length > 1) {
    return "PATH:" + path;
  } else {
    return "ID:" + path;
  }
};

PrintVisitor.prototype.PARTIAL_NAME = function(partialName) {
    return "PARTIAL:" + partialName.name;
};

PrintVisitor.prototype.DATA = function(data) {
  return "@" + this.accept(data.id);
};

PrintVisitor.prototype.content = function(content) {
  return this.pad("CONTENT[ '" + content.string + "' ]");
};

PrintVisitor.prototype.comment = function(comment) {
  return this.pad("{{! '" + comment.comment + "' }}");
};
},{"./visitor":155}],155:[function(require,module,exports){
"use strict";
function Visitor() {}

Visitor.prototype = {
  constructor: Visitor,

  accept: function(object) {
    return this[object.type](object);
  }
};

exports["default"] = Visitor;
},{}],156:[function(require,module,exports){
"use strict";

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var line;
  if (node && node.firstLine) {
    line = node.firstLine;

    message += ' - ' + line + ':' + node.firstColumn;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  if (line) {
    this.lineNumber = line;
    this.column = node.firstColumn;
  }
}

Exception.prototype = new Error();

exports["default"] = Exception;
},{}],157:[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];
var COMPILER_REVISION = require("./base").COMPILER_REVISION;
var REVISION_CHANGES = require("./base").REVISION_CHANGES;

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = REVISION_CHANGES[currentRevision],
          compilerVersions = REVISION_CHANGES[compilerRevision];
      throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
            "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
            "Please update your runtime to a newer version ("+compilerInfo[1]+").");
    }
  }
}

exports.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

function template(templateSpec, env) {
  if (!env) {
    throw new Exception("No environment passed to template");
  }

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
    var result = env.VM.invokePartial.apply(this, arguments);
    if (result != null) { return result; }

    if (env.compile) {
      var options = { helpers: helpers, partials: partials, data: data };
      partials[name] = env.compile(partial, { data: data !== undefined }, env);
      return partials[name](context, options);
    } else {
      throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    }
  };

  // Just add water
  var container = {
    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,
    programs: [],
    program: function(i, fn, data) {
      var programWrapper = this.programs[i];
      if(data) {
        programWrapper = program(i, fn, data);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = program(i, fn);
      }
      return programWrapper;
    },
    merge: function(param, common) {
      var ret = param || common;

      if (param && common && (param !== common)) {
        ret = {};
        Utils.extend(ret, common);
        Utils.extend(ret, param);
      }
      return ret;
    },
    programWithDepth: env.VM.programWithDepth,
    noop: env.VM.noop,
    compilerInfo: null
  };

  return function(context, options) {
    options = options || {};
    var namespace = options.partial ? options : env,
        helpers,
        partials;

    if (!options.partial) {
      helpers = options.helpers;
      partials = options.partials;
    }
    var result = templateSpec.call(
          container,
          namespace, context,
          helpers,
          partials,
          options.data);

    if (!options.partial) {
      env.VM.checkRevision(container.compilerInfo);
    }

    return result;
  };
}

exports.template = template;function programWithDepth(i, fn, data /*, $depth */) {
  var args = Array.prototype.slice.call(arguments, 3);

  var prog = function(context, options) {
    options = options || {};

    return fn.apply(this, [context, options.data || data].concat(args));
  };
  prog.program = i;
  prog.depth = args.length;
  return prog;
}

exports.programWithDepth = programWithDepth;function program(i, fn, data) {
  var prog = function(context, options) {
    options = options || {};

    return fn(context, options.data || data);
  };
  prog.program = i;
  prog.depth = 0;
  return prog;
}

exports.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
  var options = { partial: true, helpers: helpers, partials: partials, data: data };

  if(partial === undefined) {
    throw new Exception("The partial " + name + " could not be found");
  } else if(partial instanceof Function) {
    return partial(context, options);
  }
}

exports.invokePartial = invokePartial;function noop() { return ""; }

exports.noop = noop;
},{"./base":148,"./exception":156,"./utils":159}],158:[function(require,module,exports){
"use strict";
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = function() {
  return "" + this.string;
};

exports["default"] = SafeString;
},{}],159:[function(require,module,exports){
"use strict";
/*jshint -W004 */
var SafeString = require("./safe-string")["default"];

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

function escapeChar(chr) {
  return escape[chr] || "&amp;";
}

function extend(obj, value) {
  for(var key in value) {
    if(Object.prototype.hasOwnProperty.call(value, key)) {
      obj[key] = value[key];
    }
  }
}

exports.extend = extend;var toString = Object.prototype.toString;
exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
var isFunction = function(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
if (isFunction(/x/)) {
  isFunction = function(value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
var isFunction;
exports.isFunction = isFunction;
var isArray = Array.isArray || function(value) {
  return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
};
exports.isArray = isArray;

function escapeExpression(string) {
  // don't escape SafeStrings, since they're already safe
  if (string instanceof SafeString) {
    return string.toString();
  } else if (!string && string !== 0) {
    return "";
  }

  // Force a string conversion as this will be done by the append regardless and
  // the regex test will do this transparently behind the scenes, causing issues if
  // an object's to string has escaped characters in it.
  string = "" + string;

  if(!possible.test(string)) { return string; }
  return string.replace(badChars, escapeChar);
}

exports.escapeExpression = escapeExpression;function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

exports.isEmpty = isEmpty;
},{"./safe-string":158}],160:[function(require,module,exports){
// USAGE:
// var handlebars = require('handlebars');

// var local = handlebars.create();

var handlebars = require('../dist/cjs/handlebars')["default"];

handlebars.Visitor = require('../dist/cjs/handlebars/compiler/visitor')["default"];

var printer = require('../dist/cjs/handlebars/compiler/printer');
handlebars.PrintVisitor = printer.PrintVisitor;
handlebars.print = printer.print;

module.exports = handlebars;

// Publish a Node.js require() handler for .handlebars and .hbs files
if (typeof require !== 'undefined' && require.extensions) {
  var extension = function(module, filename) {
    var fs = require("fs");
    var templateString = fs.readFileSync(filename, "utf8");
    module.exports = handlebars.compile(templateString);
  };
  require.extensions[".handlebars"] = extension;
  require.extensions[".hbs"] = extension;
}

},{"../dist/cjs/handlebars":146,"../dist/cjs/handlebars/compiler/printer":154,"../dist/cjs/handlebars/compiler/visitor":155,"fs":113}],161:[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime');

},{"./dist/cjs/handlebars.runtime":147}],162:[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":161}],163:[function(require,module,exports){
/*
    Heavily inspired by the original js library copyright Mixpanel, Inc.
    (http://mixpanel.com/)

    Copyright (c) 2012 Carl Sverre

    Released under the MIT license.
*/

var http            = require('http'),
    querystring     = require('querystring'),
    Buffer          = require('buffer').Buffer,
    util            = require('util');

var create_client = function(token, config) {
    var metrics = {};

    if(!token) {
        throw new Error("The Mixpanel Client needs a Mixpanel token: `init(token)`");
    }

    metrics.config = {
        test: false,
        debug: false,
        verbose: false
    };

    metrics.token = token;

    /**
        send_request(data)
        ---
        this function sends an async GET request to mixpanel

        data:object                     the data to send in the request
        callback:function(err:Error)    callback is called when the request is
                                        finished or an error occurs
    */
    metrics.send_request = function(endpoint, data, callback) {
        callback = callback || function() {};
        var event_data = new Buffer(JSON.stringify(data));
        var request_data = {
            'data': event_data.toString('base64'),
            'ip': 0,
            'verbose': metrics.config.verbose ? 1 : 0
        };

        if (endpoint === '/import') {
            var key = metrics.config.key;
            if (!key) {
                throw new Error("The Mixpanel Client needs a Mixpanel api key when importing old events: `init(token, { key: ... })`");
            }
            request_data.api_key = key;
        }

        var request_options = {
            host: 'api.mixpanel.com', 
            headers: {}
        };

        request_options = _extend(request_options, metrics.config.request_options);

        if (metrics.config.test) { request_data.test = 1; }

        var query = querystring.stringify(request_data);

        request_options.path = [endpoint,"?",query].join("");

        http.get(request_options, function(res) {
            var data = "";
            res.on('data', function(chunk) {
               data += chunk;
            });

            res.on('end', function() {
                var e;
                if(metrics.config.verbose) {
                    try {
                        var result = JSON.parse(data);
                        if(result.status != 1) {
                            e = new Error("Mixpanel Server Error: " + result.error);
                        }
                    }
                    catch(ex) {
                        e = new Error("Could not parse response from Mixpanel");
                    }
                }
                else {
                    e = (data !== '1') ? new Error("Mixpanel Server Error: " + data) : undefined;
                }

                callback(e);
            });
        }).on('error', function(e) {
            if(metrics.config.debug) {
                console.log("Got Error: " + e.message);
            }
            callback(e);
        });
    };

    /**
        track(event, properties, callback)
        ---
        this function sends an event to mixpanel.

        event:string                    the event name
        properties:object               additional event properties to send
        callback:function(err:Error)    callback is called when the request is
                                        finished or an error occurs
    */
    metrics.track = function(event, properties, callback) {
        if (typeof(properties) === 'function' || !properties) {
            callback = properties;
            properties = {};
        }

        // if properties.time exists, use import endpoint
        var endpoint = (typeof(properties.time) === 'number') ? '/import' : '/track';

        properties.token = metrics.token;
        properties.mp_lib = "node";

        var data = {
            'event' : event,
            'properties' : properties
        };

        if (metrics.config.debug) {
            console.log("Sending the following event to Mixpanel:");
            console.log(data);
        }

        metrics.send_request(endpoint, data, callback);
    };

    /**
        import(event, properties, callback)
        ---
        This function sends an event to mixpanel using the import
        endpoint.  The time argument should be either a Date or Number,
        and should signify the time the event occurred.

        It is highly recommended that you specify the distinct_id
        property for each event you import, otherwise the events will be
        tied to the IP address of the sending machine.

        For more information look at:
        https://mixpanel.com/docs/api-documentation/importing-events-older-than-31-days

        event:string                    the event name
        time:date|number                the time of the event
        properties:object               additional event properties to send
        callback:function(err:Error)    callback is called when the request is
                                        finished or an error occurs
    */
    metrics.import = function(event, time, properties, callback) {
        if (typeof(properties) === 'function' || !properties) {
            callback = properties;
            properties = {};
        }

        if (time === void 0) {
            throw new Error("The import method requires you to specify the time of the event");
        } else if (Object.prototype.toString.call(time) === '[object Date]') {
            time = Math.floor(time.getTime() / 1000);
        }

        properties.time = time;

        metrics.track(event, properties, callback);
    };

    /**
        alias(distinct_id, alias)
        ---
        This function creates an alias for distinct_id

        For more information look at:
        https://mixpanel.com/docs/integration-libraries/using-mixpanel-alias

        distinct_id:string              the current identifier
        alias:string                    the future alias
    */
    metrics.alias = function(distinct_id, alias, callback) {
        var properties = {
            distinct_id: distinct_id,
            alias: alias
        };

        metrics.track('$create_alias', properties, callback);
    };

    metrics.people = {
        /** people.set_once(distinct_id, prop, to, callback)
            ---
            The same as people.set but in the words of mixpanel:
            mixpanel.people.set_once

            " This method allows you to set a user attribute, only if
             it is not currently set. It can be called multiple times
             safely, so is perfect for storing things like the first date
             you saw a user, or the referrer that brought them to your
             website for the first time. "

        */
        set_once: function(distinct_id, prop, to, callback) {
            var $set = {}, data = {};

            if (typeof(prop) === 'object') {
                callback = to;
                $set = prop;
            } else {
                $set[prop] = to;
            }

            this._set(distinct_id, $set, callback, { set_once: true });
        },

        /**
            people.set(distinct_id, prop, to, callback)
            ---
            set properties on an user record in engage

            usage:

                mixpanel.people.set('bob', 'gender', 'm');

                mixpanel.people.set('joe', {
                    'company': 'acme',
                    'plan': 'premium'
                });
        */
        set: function(distinct_id, prop, to, callback) {
            var $set = {}, data = {};

            if (typeof(prop) === 'object') {
                callback = to;
                $set = prop;
            } else {
                $set[prop] = to;
            }

            this._set(distinct_id, $set, callback);
        },

        // used internally by set and set_once
        _set: function(distinct_id, $set, callback, options) {
            var set_key = (options && options.set_once) ? "$set_once" : "$set";

            var data = {
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };
            data[set_key] = $set;

            if ('ip' in $set) {
                data.$ip = $set.ip;
                delete $set.ip;
            }

            if ($set.$ignore_time) {
                data.$ignore_time = $set.$ignore_time;
                delete $set.$ignore_time;
            }

            if(metrics.config.debug) {
                console.log("Sending the following data to Mixpanel (Engage):");
                console.log(data);
            }

            metrics.send_request('/engage', data, callback);
        },

        /**
            people.increment(distinct_id, prop, to, callback)
            ---
            increment/decrement properties on an user record in engage

            usage:

                mixpanel.people.increment('bob', 'page_views', 1);

                // or, for convenience, if you're just incrementing a counter by 1, you can
                // simply do
                mixpanel.people.increment('bob', 'page_views');

                // to decrement a counter, pass a negative number
                mixpanel.people.increment('bob', 'credits_left', -1);

                // like mixpanel.people.set(), you can increment multiple properties at once:
                mixpanel.people.increment('bob', {
                    counter1: 1,
                    counter2: 3,
                    counter3: -2
                });
        */
        increment: function(distinct_id, prop, by, callback) {
            var $add = {};

            if (typeof(prop) === 'object') {
                callback = by;
                Object.keys(prop).forEach(function(key) {
                    var val = prop[key];

                    if (isNaN(parseFloat(val))) {
                        if (metrics.config.debug) {
                            console.error("Invalid increment value passed to mixpanel.people.increment - must be a number");
                            console.error("Passed " + key + ":" + val);
                        }
                        return;
                    } else {
                        $add[key] = val;
                    }
                });
            } else {
                if (!by) { by = 1; }
                $add[prop] = by;
            }

            var data = {
                '$add': $add,
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };

            if(metrics.config.debug) {
                console.log("Sending the following data to Mixpanel (Engage):");
                console.log(data);
            }

            metrics.send_request('/engage', data, callback);
        },

        /**
            people.append(distinct_id, prop, value, callback)
            ---
            Append a value to a list-valued people analytics property.

            usage:

                // append a value to a list, creating it if needed
                mixpanel.people.append('pages_visited', 'homepage');

                // like mixpanel.people.set(), you can append multiple properties at once:
                mixpanel.people.append({
                    list1: 'bob',
                    list2: 123
                });
        */
        append: function(distinct_id, prop, value, callback) {
            var $append = {};

            if (typeof(prop) === 'object') {
                callback = value;
                Object.keys(prop).forEach(function(key) {
                    $append[key] = prop[key];
                });
            } else {
                $append[prop] = value;
            }

            var data = {
                '$append': $append,
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };

            if(metrics.config.debug) {
                console.log("Sending the following data to Mixpanel (Engage):");
                console.log(data);
            }

            metrics.send_request('/engage', data, callback);
        },

        /**
            people.track_charge(distinct_id, amount, properties, callback)
            ---
            Record that you have charged the current user a certain
            amount of money.

            usage:

                // charge a user $29.99
                mixpanel.people.track_charge('bob', 29.99);

                // charge a user $19 on the 1st of february
                mixpanel.people.track_charge('bob', 19, { '$time': new Date('feb 1 2012') });
        */
        track_charge: function(distinct_id, amount, properties, callback) {
            var $append = {};

            if (!properties) { properties = {}; }

            if (typeof(amount) !== 'number') {
                amount = parseFloat(amount);
                if (isNaN(amount)) {
                    console.error("Invalid value passed to mixpanel.people.track_charge - must be a number");
                    return;
                }
            }

            properties.$amount = amount;

            if (properties.hasOwnProperty('$time')) {
                var time = properties.$time;
                if (Object.prototype.toString.call(time) === '[object Date]') {
                    properties.$time = time.toISOString();
                }
            }

            var data = {
                '$append': { '$transactions': properties },
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };

            if(metrics.config.debug) {
                console.log("Sending the following data to Mixpanel (Engage):");
                console.log(data);
            }

            metrics.send_request('/engage', data, callback);
        },

        /**
            people.clear_charges(distinct_id, callback)
            ---
            Clear all the current user's transactions.

            usage:

                mixpanel.people.clear_charges('bob');
        */
        clear_charges: function(distinct_id, callback) {
            var data = {
                '$set': { '$transactions': [] },
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };

            if(metrics.config.debug) {
                console.log("Clearing this user's charges:", distinct_id);
            }

            metrics.send_request('/engage', data, callback);
        },

        /**
            people.delete_user(distinct_id, callback)
            ---
            delete an user record in engage

            usage:

                mixpanel.people.delete_user('bob');
        */
        delete_user: function(distinct_id, callback) {
            var data = {
                '$delete': distinct_id,
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };

            if(metrics.config.debug) {
                console.log("Deleting the user from engage:", distinct_id);
            }

            metrics.send_request('/engage', data, callback);
        },

        /**
         people.unset(distinct_id, prop, callback)
         ---
         delete a property on an user record in engage

         usage:

            mixpanel.people.unset('bob', 'page_views');

            mixpanel.people.unset('bob', ['page_views', 'last_login']);
         */
        unset: function(distinct_id, prop, callback) {
            var $unset = [];

            if (util.isArray(prop)) {
                $unset = prop;
            } else if (typeof(prop) === 'string') {
                $unset = [prop];
            } else {
                if (metrics.config.debug) {
                    console.error("Invalid argument passed to mixpanel.people.unset - must be a string or array");
                    console.error("Passed: " + prop);
                }
                return;
            }

            data = {
                '$unset': $unset,
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };

            if(metrics.config.debug) {
                console.log("Sending the following data to Mixpanel (Engage):");
                console.log(data);
            }

            metrics.send_request('/engage', data, callback);
        }
    };

    /**
        set_config(config)
        ---
        Modifies the mixpanel config

        config:object       an object with properties to override in the
                            mixpanel client config
    */
    metrics.set_config = function(config) {
        metrics.config = _extend(metrics.config, config);
    };

    /**
        _extend(obj1, obj2)
        ---
        Copies properties from obj2 to obj1
    */

    _extend = function(obj1, obj2) {
        for (var prop in obj2) {
            if (obj2.hasOwnProperty(prop)) {
                obj1[prop] = obj2[prop];
            }
        }

        return obj1;
    };


    if (config) {
        metrics.set_config(config);
    }

    return metrics;
};

// module exporting
module.exports = {
    Client: function(token) {
        console.warn("The function `Client(token)` is deprecated.  It is now called `init(token)`.");
        return create_client(token);
    },
    init: create_client
};

},{"buffer":114,"http":119,"querystring":129,"util":145}]},{},[1])