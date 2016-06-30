(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.V3API = (function() {
    function V3API() {
      this.auth = __bind(this.auth, this);
      this.get = __bind(this.get, this);
      this.execute = __bind(this.execute, this);
      var endpoint, namespace, url, _ref, _ref1;
      this.host = this.env === 'dev' ? "http://api.bitly.org" : "https://api-ssl.bitly.com";
      this.settings = {
        traditional: true
      };
      if (this.env === 'dev') {
        this.settings.headers = {
          'X-Scheme': 'https'
        };
      }
      for (namespace in this.endpoints) {
        this[namespace] = {};
        _ref = this.endpoints[namespace];
        for (endpoint in _ref) {
          url = _ref[endpoint];
          this[namespace][endpoint] = _.bind(this.get, this, url);
        }
      }
      this.token = (_ref1 = extension.user) != null ? _ref1.access_token : void 0;
    }

    V3API.prototype.execute = function(object, method, params) {
      return this[object][method](params).always(function(res) {
        return extension.trigger("API." + object + "." + method, res.data);
      });
    };

    V3API.prototype.oauth_credentials = {
      client_id: "298b336871d6aa29e06b3033269f21ced9717625",
      client_secret: "319b6d82931c7b92bc05d83e005c3f415a66e31b"
    };

    V3API.prototype.env = 'prod';

    V3API.prototype.endpoints = {
      Link: {
        customizeKeyword: '/private/keyword_api_router'
      },
      Bitmark: {
        expandLink: '/v3/expand',
        save: '/v3/user/link_save',
        update: '/v3/user/link_edit',
        getInfo: '/v3/info',
        getTitle: '/beta/title',
        getClicks: '/v3/clicks',
        getClickHistory: '/private/link/clicks_range',
        getSaves: '/v3/link/encoders_count',
        getHistory: '/v3/user/link_history',
        getUserLink: '/v3/user/link_lookup',
        customizeKeyword: '/v3/user/link_customize',
        share: '/v3/user/share',
        shareTwitter: '/private/user/share/twitter',
        shareFacebook: '/private/user/share/facebook',
        shareEmail: '/private/user/share/email',
        getFacebookPreview: '/v3/user/facebook_link_preview'
      },
      User: {
        toggleShareAccount: '/v3/user/toggle_share_account',
        getAccounts: '/v3/user/share_accounts',
        getPreferences: '/v3/user/preferences',
        setPreferences: '/v3/user/preferences',
        getInfo: '/v3/user/info',
        getPopularLinks: '/v3/user/popular_links'
      },
      Bundle: {
        create: '/v3/bundle/create',
        history: '/v3/user/bundle_history?expand_user=true',
        addLink: '/v3/bundle/link_add',
        removeLink: '/v3/bundle/link_remove',
        addCommentToLink: '/v3/bundle/link_comment_add'
      }
    };

    V3API.prototype.get = function(url, params, source) {
      var data;
      if (params == null) {
        params = {};
      }
      data = _.extend({}, params, {
        access_token: this.token
      });
      return BITLY.get(this.host + url, data, this.settings);
    };

    V3API.prototype.auth = function(params) {
      var settings,
        _this = this;
      _.extend(params, this.oauth_credentials);
      settings = _.extend({}, {
        data: params,
        type: 'POST'
      }, this.settings);
      return $.ajax(this.host + '/oauth/access_token', settings).done(function(res) {
        var res_hash;
        console.log('auth done', document.location.href);
        res_hash = BITLY.util.queryStringToHash('?' + res);
        extension.user = {
          x_login: res_hash.login,
          x_apiKey: res_hash.apiKey,
          access_token: res_hash.access_token
        };
        Store.set("user_data", extension.user);
        return _this.token = res_hash.access_token;
      });
    };

    return V3API;

  })();

}).call(this);
