(function() {
  this.MessageHandlers = {
    bitmarkCreated: function(msg, sender, sendResponse) {
      if (msg.params.link && Store.get('auto_copy')) {
        return this.copyToClipboard(msg.params.link);
      }
    },
    bitmarkAlreadyExists: function(msg, sender, sendResponse) {
      if (msg.params.link && Store.get('auto_copy')) {
        return this.copyToClipboard(msg.params.link);
      }
    },
    syncUser: function(msg, sender, sendResponse) {
      var preferencesListener, shareAccountListener, update;
      update = {};
      shareAccountListener = function(user, share_accounts) {
        return update.share_accounts = share_accounts;
      };
      preferencesListener = function(user, preferences) {
        return update.preferences = preferences;
      };
      App.$User.on('change:share_accounts', shareAccountListener);
      App.$User.on('change:preferences', preferencesListener);
      this.syncUser().done(function(accounts, prefs) {
        App.$User.off('change:share_accounts', shareAccountListener);
        App.$User.off('change:preferences', preferencesListener);
        return sendResponse(update);
      });
      return true;
    },
    updateUser: function(msg, sender, sendResponse) {
      App.$User.set(msg.params.key, msg.params.value);
      return sendResponse({
        msg: 'success'
      });
    },
    signout: function(msg, sender, sendResponse) {
      this.signout();
      this.signin();
      return sendResponse({
        msg: 'success'
      });
    },
    getSelectedText: function(msg, sender, sendResponse) {
      chrome.tabs.executeScript(null, {
        file: 'js/content_text.js'
      }, function(res) {
        var note;
        note = res != null ? res[0] : void 0;
        return sendResponse({
          note: note
        });
      });
      return true;
    },
    getDocumentInfo: function(msg, sender, sendResponse) {
      return sendResponse({
        title: sender.tab.title,
        url: sender.tab.url
      });
    },
    getUserData: function(msg, sender, sendResponse) {
      return sendResponse(App.$User.toJSON());
    },
    openOauth: function(msg, sender, sendResponse) {
      return this.openOauth(msg.params, sendResponse);
    },
    removeIframe: function(msg, sender, sendResponse) {
      var code,
        _this = this;
      code = '\
    var iframe = document.getElementById("bitly_chrome_extension_iframe");\
    iframe.parentNode.removeChild(iframe);\
    document.body.className = document.body.className.replace(/(?:^|\\s)bitly\\-extension\\-enabled(?:\\s|$)/g, " ");\
    ';
      return chrome.tabs.executeScript(sender.tab.id, {
        code: code
      }, function() {
        return _this.trigger('Iframe:close', sender.tab.id);
      });
    }
  };

}).call(this);
