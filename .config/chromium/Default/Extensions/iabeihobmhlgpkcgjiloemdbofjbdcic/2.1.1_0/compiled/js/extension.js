(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  this.Store = nyan.Store;

  this.Extension = (function() {
    function Extension() {
      this.onContextMenuClick = __bind(this.onContextMenuClick, this);
      this.attachContextMenuItem = __bind(this.attachContextMenuItem, this);
      this.signout = __bind(this.signout, this);
      this.getUser = __bind(this.getUser, this);
      this.onMessage = __bind(this.onMessage, this);
      this.loadIframe = __bind(this.loadIframe, this);
      this.listenIframe = __bind(this.listenIframe, this);
      this.browserAction = __bind(this.browserAction, this);
      this.signin = __bind(this.signin, this);
      this.initAndShorten = __bind(this.initAndShorten, this);
      this.loadUserInfo = __bind(this.loadUserInfo, this);
      this.init = __bind(this.init, this);
      this.checkAuthentication = __bind(this.checkAuthentication, this);
      this.syncUser = __bind(this.syncUser, this);
      this.newTab = __bind(this.newTab, this);
      this.chromePage = __bind(this.chromePage, this);
      this.isTabActive = __bind(this.isTabActive, this);
      this.activateTab = __bind(this.activateTab, this);
      this.deactivateTab = __bind(this.deactivateTab, this);
      var _ref,
        _this = this;
      _.extend(this, Backbone.Events);
      this.on('all', function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return console.log(args);
      });
      chrome.extension.onMessage.addListener(this.onMessage);
      this.user = Store.get('user_data');
      this.authenticated = Boolean(((_ref = this.user) != null ? _ref.x_login : void 0) && this.user.x_apiKey);
      _.defer(function() {
        _this.api = new V3API;
        return _this.checkAuthentication();
      });
      this.on('Extension:initialize', function() {
        _this.trends = new Trends;
        return setInterval(_this.syncUser, 60 * 60 * 1000);
      });
    }

    Extension.prototype.tabs = {};

    Extension.prototype.deactivateTab = function(tab_id) {
      return delete this.tabs[tab_id];
    };

    Extension.prototype.activateTab = function(tab_id) {
      return this.tabs[tab_id] = {};
    };

    Extension.prototype.isTabActive = function(tab_id) {
      return this.tabs[tab_id] != null;
    };

    Extension.prototype.bg = chrome.extension.getBackgroundPage();

    Extension.prototype.chromePage = function(page) {
      return chrome.extension.getURL("html/" + page + ".html");
    };

    Extension.prototype.newTab = function(url) {
      return chrome.tabs.create({
        url: url
      });
    };

    Extension.prototype.syncUser = function() {
      var _this = this;
      return $.when(this.api.execute('User', 'getAccounts'), this.api.execute('User', 'getPreferences')).done(function(accounts, prefs) {
        if (!_.isEqual(App.$User.get('share_accounts'), accounts[0].data.share_accounts)) {
          App.$User.set('share_accounts', accounts[0].data.share_accounts);
        }
        if (!_.isEqual(App.$User.get('preferences'), prefs[0].data.preferences)) {
          return App.$User.set('preferences', prefs[0].data.preferences);
        }
      });
    };

    Extension.prototype.checkAuthentication = function() {
      var _this = this;
      if (this.authenticated) {
        return this.init();
      } else {
        console.log('not authed, waiting for signin');
        chrome.browserAction.onClicked.addListener(this.signin);
        return this.once('Auth:login', function(tab) {
          var _ref;
          _this.user = Store.get('user_data');
          chrome.browserAction.onClicked.removeListener(_this.signin);
          _this.authenticated = Boolean(((_ref = _this.user) != null ? _ref.x_login : void 0) && _this.user.x_apiKey);
          _this.init();
          return _this.once('Extension:initialize', function() {
            return chrome.tabs.getCurrent(function() {
              return chrome.tabs.update(tab.id, {
                url: _this.chromePage('options')
              });
            });
          });
        });
      }
    };

    Extension.prototype.init = function() {
      this.loadUserInfo();
      return this.on('Iframe:close', this.deactivateTab);
    };

    Extension.prototype.loadUserInfo = function() {
      var _this = this;
      return this.getUser().done(function() {
        chrome.browserAction.onClicked.addListener(_this.browserAction);
        return _this.attachContextMenuItem();
      }).done(function() {
        return _this.trigger('Extension:initialize');
      }).fail(function(res) {
        console.log(['Init failed', arguments]);
        if (res.status_code === 403) {
          console.log('Authorization rejected. Please sign in again.');
          return _this.signout();
        } else if (!chrome.browserAction.onClicked.hasListener(_this.initAndShorten)) {
          console.log('Will try to init again when extension icon is clicked');
          return chrome.browserAction.onClicked.addListener(_this.initAndShorten);
        }
      });
    };

    Extension.prototype.initAndShorten = function(tab) {
      var _this = this;
      return this.loadUserInfo().done(function() {
        chrome.browserAction.onClicked.removeListener(_this.initAndShorten);
        return _this.browserAction(tab);
      });
    };

    Extension.prototype.signin = function(tab_id) {
      var dest, domain, redirect_uri;
      redirect_uri = this.chromePage('signin');
      domain = this.api.env === 'dev' ? 'https://bitly.org' : 'https://bitly.com';
      dest = "" + domain + "/oauth/authorize?client_id=" + extension.api.oauth_credentials.client_id + "&redirect_uri=" + redirect_uri;
      if (typeof tab_id === 'number') {
        return chrome.tabs.update(tab_id, {
          url: dest
        });
      } else {
        return this.newTab(dest);
      }
    };

    Extension.prototype.browserAction = function(tab) {
      this.trigger('BrowserAction:click', tab.id);
      if (this.isTabActive(tab.id)) {
        return;
      }
      this.activateTab(tab.id);
      this.listenIframe();
      return this.loadIframe();
    };

    Extension.prototype.listenIframe = function() {
      var cleanup, tabClosed, tabUpdated,
        _this = this;
      cleanup = function(tab_id) {
        chrome.tabs.onRemoved.removeListener(tabClosed);
        chrome.tabs.onUpdated.removeListener(tabUpdated);
        return _this.trigger('Iframe:close', tab_id);
      };
      tabUpdated = function(tab_id, change_info) {
        if (_this.isTabActive(tab_id) && change_info.status === 'loading') {
          _this.trigger('ActiveTab:update', tab_id);
          return cleanup(tab_id);
        }
      };
      tabClosed = function(tab_id) {
        if (_this.isTabActive(tab_id)) {
          _this.trigger('ActiveTab:close', tab_id);
          return cleanup(tab_id);
        }
      };
      chrome.tabs.onRemoved.addListener(tabClosed);
      return chrome.tabs.onUpdated.addListener(tabUpdated);
    };

    Extension.prototype.loadIframe = function() {
      var code;
      code = '\
    var iframe = document.createElement("iframe"); \
    iframe.id = "bitly_chrome_extension_iframe";\
    iframe.style.width = "100%"; \
    iframe.style.height = "100%"; \
    iframe.style.position = "fixed"; \
    iframe.style.top = 0;\
    iframe.style.left = 0;\
    iframe.style.border = 0;\
    iframe.style.zIndex = 2147483647;\
    iframe.src = "' + this.chromePage('iframe') + '"; \
    document.body.height = "100%"; \
    document.body.appendChild(iframe);\
    document.body.className = document.body.className.replace(/(?:^|\\s)bitly\\-extension\\-enabled(?:\\s|$)/g, " ");\
    document.body.className += " bitly-extension-enabled";';
      chrome.tabs.executeScript(null, {
        code: code
      });
      return this.trigger('Iframe:open');
    };

    Extension.prototype.onMessage = function(msg, sender, sendResponse) {
      var data, result, _ref, _ref1;
      if (msg.action === 'API') {
        if (((_ref = this.api[msg.object]) != null ? _ref[msg.method] : void 0) != null) {
          result = this.api[msg.object][msg.method](msg.params);
          result.always(function(data, status) {
            return sendResponse({
              data: data,
              status: status
            });
          });
          return true;
        } else {
          if (!this.api[msg.object]) {
            data = {
              missing_object: msg.object
            };
          } else {
            data = {
              missing_object: msg.object,
              missing_method: msg.method
            };
          }
          return sendResponse({
            data: data,
            status: 'error'
          });
        }
      } else {
        if (msg.method) {
          return (_ref1 = MessageHandlers[msg.method]) != null ? _ref1.apply(this, arguments) : void 0;
        }
      }
    };

    Extension.prototype.openOauth = function(params, sendResponse) {
      var _this = this;
      chrome.windows.create({
        url: params.url,
        width: params.width,
        height: params.height
      }, function(win) {
        var cleanupListeners, oauth_tab_id, onRemove, onUpdate;
        oauth_tab_id = win.tabs[0].id;
        cleanupListeners = function() {
          chrome.tabs.onRemoved.removeListener(onRemove);
          return chrome.tabs.onUpdated.removeListener(onUpdate);
        };
        onRemove = function(tab_id, remove_info) {
          if (tab_id === oauth_tab_id) {
            cleanupListeners();
            return sendResponse({
              event: 'App.Oauth:error'
            });
          }
        };
        onUpdate = function(tab_id, change_info, tab) {
          var _ref;
          if (params.return_url && ((_ref = change_info.url) != null ? _ref.indexOf(params.return_url) : void 0) === 0) {
            chrome.tabs.remove(tab_id);
            cleanupListeners();
            return sendResponse({
              event: 'App.Oauth:success'
            });
          }
        };
        chrome.tabs.onRemoved.addListener(onRemove);
        return chrome.tabs.onUpdated.addListener(onUpdate);
      });
      return true;
    };

    Extension.prototype.getUser = function() {
      var nyanUserSetup, prefRequest, userSetup,
        _this = this;
      userSetup = $.Deferred();
      nyanUserSetup = $.Deferred();
      prefRequest = nyan.nyanUser = new nyan.NyanUser({
        user: this.user.x_login,
        preferences: {},
        noload: true
      });
      return $.when(this.api.execute('User', 'getPreferences'), this.api.execute('User', 'getInfo')).done(function(prefs_response, user_response) {
        var prefs_data, user, user_data;
        user_data = user_response[0].data;
        prefs_data = prefs_response[0].data;
        nyan.share_accounts = user_data.share_accounts || [];
        user = {
          user: user_data.login,
          info: user_data,
          preferences: prefs_data.preferences,
          share_accounts: nyan.share_accounts
        };
        start_application(user);
        App.$User = new App.User(user);
        return _this.trigger('User:initialize');
      }).fail(function() {
        return console.log(arguments);
      });
    };

    Extension.prototype.copyToClipboard = function(val) {
      $('#clipboard').val(val).select();
      return document.execCommand("copy", false, null);
    };

    Extension.prototype.signout = function() {
      var _ref;
      this.user = null;
      this.api.token = null;
      Store.clear();
      this.authenticated = false;
      if ((_ref = this.trends) != null) {
        _ref.stop();
      }
      return this.checkAuthentication();
    };

    Extension.prototype.attachContextMenuItem = function() {
      if (!this.context_menu) {
        chrome.contextMenus.removeAll();
        chrome.contextMenus.create({
          type: "normal",
          title: "Save Link to bitly",
          contexts: ["link"],
          onclick: this.onContextMenuClick,
          documentUrlPatterns: ["http://*/*", "https://*/*"]
        });
        return this.context_menu = true;
      }
    };

    Extension.prototype.onContextMenuClick = function(info, tab) {
      var long_url, _ref,
        _this = this;
      long_url = (_ref = info.linkUrl) != null ? _ref.trim() : void 0;
      if (!long_url) {
        return;
      }
      return this.api.execute('Bitmark', 'save', {
        longUrl: long_url
      }).done(function(res) {
        var _ref1;
        if ((((_ref1 = res.data.link_save) != null ? _ref1.link : void 0) != null) && Store.get('auto_copy')) {
          return _this.copyToClipboard(res.data.link_save.link);
        }
      });
    };

    return Extension;

  })();

}).call(this);
