(function() {
  this.Plugin = (function() {
    function Plugin() {}

    Plugin.prototype.active = false;

    Plugin.prototype.enable = function() {
      return this.active = true;
    };

    Plugin.prototype.disable = function() {
      return this.active = false;
    };

    Plugin.prototype.toggle = function(enable) {
      if (enable) {
        return this.enable();
      } else {
        return this.disable();
      }
    };

    return Plugin;

  })();

}).call(this);
