(function() {
  var addQuotes;

  addQuotes = function(selection) {
    if (!selection.length) {
      return '';
    }
    switch (selection.charAt(0)) {
      case "\u201c":
      case "\"":
      case "“":
      case "&quot;":
      case "&ldquo;":
        switch (selection.charAt(selection.length - 1)) {
          case "\u201c":
          case "\"":
          case "”":
          case "&quot;":
          case "&rdquo;":
            return selection;
        }
    }
    return "\u201c" + selection + "\u201d";
  };

  return addQuotes(window.getSelection().toString().trim());

}).call(this);
