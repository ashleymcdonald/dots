(function() {
  var updateExtensionUser;

  App.$AppView = new App.ChromeExtensionView;

  App.Dispatch.on('App.Bitmark:create', function(bitmark) {
    return chromeSend({
      method: 'bitmarkCreated',
      params: {
        link: bitmark.get('link')
      }
    });
  });

  App.Dispatch.on('App.Bitmark:saveExisting', function(bitmark) {
    return chromeSend({
      method: 'bitmarkAlreadyExists',
      params: {
        link: bitmark.get('link')
      }
    });
  });

  App.Dispatch.on('user:sign_out_intent', function() {
    return chromeSend({
      method: 'signout'
    });
  });

  App.Dispatch.on('UI.Modal.Stack:empty', function() {
    return chromeSend({
      method: 'removeIframe'
    });
  });

  window.chromeSend = function(msg, cb) {
    var deferred;
    deferred = $.Deferred();
    chrome.extension.sendMessage(msg, function(response) {
      if (typeof cb === "function") {
        cb(response);
      }
      if (!response && chrome.extension.lastError) {
        deferred.reject(chrome.extension.lastError.message);
      } else {
        deferred.resolve(response);
      }
      return true;
    });
    return deferred.promise();
  };

  updateExtensionUser = function() {
    App.$User.on('change:share_accounts', function(user, share_accounts) {
      return chromeSend({
        method: 'updateUser',
        params: {
          key: 'share_accounts',
          value: share_accounts
        }
      });
    });
    return App.$User.on('change:preferences', function(user, prefs) {
      return chromeSend({
        method: 'updateUser',
        params: {
          key: 'preferences',
          value: prefs
        }
      });
    });
  };

  $.when(chromeSend({
    method: 'getDocumentInfo'
  }), chromeSend({
    method: 'getUserData'
  }), chromeSend({
    method: 'getSelectedText'
  })).done(function(doc, user, note) {
    var current;
    App.$User = new App.User(user);
    current = new App.Bitmark({
      url: doc.url,
      note: note.note,
      title: doc.title
    });
    chromeSend({
      method: 'syncUser'
    }).done(function(update) {
      if (update.share_accounts) {
        App.$User.set('share_accounts', update.share_accounts);
      }
      if (update.preferences) {
        App.$User.set('preferences', update.preferences);
      }
      return updateExtensionUser();
    });
    return current.autoSave();
  });

}).call(this);
