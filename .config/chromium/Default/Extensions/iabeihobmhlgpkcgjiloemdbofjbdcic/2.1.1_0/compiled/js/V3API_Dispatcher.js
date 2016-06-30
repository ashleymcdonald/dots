(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.V3API_Dispatcher = (function() {
    function V3API_Dispatcher() {
      this.execute = __bind(this.execute, this);
    }

    V3API_Dispatcher.prototype.execute = function(object, method, params) {
      var response,
        _this = this;
      response = $.Deferred();
      params = {
        action: 'API',
        object: object,
        method: method,
        params: params,
        source: 'app'
      };
      chrome.extension.sendMessage(params, function(res) {
        if (res.status === 'success') {
          return response.resolve(res.data);
        } else {
          if (res.data.missing_method) {
            throw new Error("Missing method: '" + res.data.missing_object + "." + res.data.missing_method + "'");
          } else if (res.data.missing_object) {
            throw new Error("Missing object: '" + res.data.missing_object + "'");
          }
          return response.reject(res.data);
        }
      });
      response.always(function(res) {
        return App.Dispatch.trigger("API." + object + "." + method, res.data);
      });
      return response;
    };

    return V3API_Dispatcher;

  })();

}).call(this);
