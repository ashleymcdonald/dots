(function() {
  var bg,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  bg = chrome.extension.getBackgroundPage();

  this.Trends = (function(_super) {
    __extends(Trends, _super);

    function Trends() {
      this.getTrends = __bind(this.getTrends, this);
      this.disable = __bind(this.disable, this);
      this.enable = __bind(this.enable, this);
      var defaults, _ref;
      this.api = bg.extension.api;
      this.prefs = Store.get('note_preferences');
      if (!this.prefs) {
        defaults = {
          enabled: true,
          threshold: 20,
          interval: 1,
          interval_type: 'hour'
        };
        Store.set('note_preferences', defaults);
        this.prefs = defaults;
      }
      this.active = Boolean((_ref = Store.get('note_preferences')) != null ? _ref.enabled : void 0);
      if (this.active) {
        this.start();
      }
    }

    Trends.prototype.mins = 60 * 1000;

    Trends.prototype.notifications = [];

    Trends.prototype.enable = function() {
      var prefs;
      Trends.__super__.enable.apply(this, arguments);
      prefs = Store.get('note_preferences');
      prefs.enabled = true;
      Store.set('note_preferences', prefs);
      this.prefs.enabled = true;
      return this.start();
    };

    Trends.prototype.disable = function() {
      var prefs;
      Trends.__super__.disable.apply(this, arguments);
      prefs = Store.get('note_preferences');
      prefs.enabled = false;
      Store.set('note_preferences', prefs);
      this.prefs.enabled = false;
      return this.stop();
    };

    Trends.prototype.start = function() {
      bg.extension.trigger('Trends:start', this);
      this.getTrends();
      return this.realtime_poller = setInterval(this.getTrends, 5 * this.mins);
    };

    Trends.prototype.stop = function() {
      bg.extension.trigger('Trends:stop', this);
      clearInterval(this.realtime_poller);
      return this.realtime_poller = null;
    };

    Trends.prototype.setThreshold = function(rate) {
      var prefs;
      prefs = Store.get('note_preferences');
      prefs.threshold = rate;
      Store.set('note_preferences', prefs);
      return this.prefs.threshold = rate;
    };

    Trends.prototype.getTrends = function() {
      var _this = this;
      return (this.api.User.getPopularLinks({
        unit: this.prefs.interval_type,
        units: this.prefs.interval
      })).done(function(res) {
        var now, result, update, _i, _len, _ref;
        _this.recent = Store.get('recent_notifications') || {};
        now = +(new Date);
        update = false;
        _ref = res.data.popular_links;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          result = _ref[_i];
          if (result.clicks >= _this.prefs.threshold) {
            if (!_this.recent[result.link] || now - _this.recent[result.link] > 60 * _this.mins) {
              _this.recent[result.link] = now;
              _this.notify(result);
              update = true;
            }
          }
        }
        if (update) {
          return Store.set('recent_notifications', _this.recent);
        }
      });
    };

    Trends.prototype.notify = function(result) {
      var _this = this;
      return $.when(this.api.Bitmark.getInfo({
        shortUrl: result.link
      }), this.api.Bitmark.expandLink({
        shortUrl: result.link
      })).done(function(info, expand) {
        result.title = info[0].data.info[0].title;
        result.long_url = expand[0].data.expand[0].long_url;
        _this.notifications.push(result);
        return chrome.notifications.create('', {
          type: 'basic',
          iconUrl: '/icons/puffer_48.png',
          title: "" + result.clicks + " clicks on " + (result.title || result.long_url.replace(/^https?:\/\//, "")),
          message: "" + result.long_url
        }, function() {});
      });
    };

    return Trends;

  })(this.Plugin);

}).call(this);
