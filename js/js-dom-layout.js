/*
jslayout, version 1.3.2

Copyright (c) 2017, 2018, Nicholas Gasior <nmls@laatu.se>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var jsLayout = (function() {
/* Extends jsHelper object with few shorter methods */
  function _extendJsHelper() {
    jshEl.prototype.m0 = function() {
      this.style('margin', '0');
      return this;
    }
    jshEl.prototype.p0 = function() {
      this.style('padding', '0');
      return this;
    }
    jshEl.prototype.os = function(s) {
      var x = 'scroll', y = 'scroll';
      if (s == 'x') {
        y='hidden';
      } else if (s == 'y') {
        x='hidden';
      } else if (s != 'xy') {
        return this;
      }
      this.style('overflow-x', x).style('overflow-y', y);
      return this;
    }
    jshEl.prototype.oh = function() {
      this.style('overflow', 'hidden');
      return this;
    }
    jshEl.prototype.ov = function() {
      this.style('overflow', 'visible');
      return this;
    }
    jshEl.prototype.pa = function(l, t) {
      if (typeof(l) != "undefined" && typeof(t) != "undefined") {
        this.style('position', 'absolute').style('left',l+'px')
          .style('top',t+'px');
      } else {
        this.style('position', 'absolute');
      }
      return this;
    }
    jshEl.prototype.pr = function() {
      this.style('position','relative');
      return this;
    }
    jshEl.prototype.z = function(z) {
      this.style('zIndex', z);
      return this;
    }
    jshEl.prototype.t0 = function() {
      this.style('top', '0px');
      return this;
    }
    jshEl.prototype.l0 = function() {
      this.style('left', '0px');
      return this;
    }
    jshEl.prototype.w = function(w) {
      this.style('width', w+'px');
      return this;
    }
    jshEl.prototype.h = function(h) {
      this.style('height', h+'px');
      return this;
    }
    jshEl.prototype.db = function() {
      this.style('display', 'block');
      return this;
    }
    jshEl.prototype.dn = function() {
      this.style('display', 'none');
      return this;
    }
    jshEl.prototype.fln = function() {
      this.style('float', 'none');
      return this;
    }
    jshEl.prototype.fll = function() {
      this.style('float', 'left');
      return this;
    }
    jshEl.prototype.uiRows = function() {
      this.children().filterTag('ui-row');
      return this;
    }
    jshEl.prototype.uiCols = function() {
      this.children().filterTag('ui-col');
      return this;
    }
    jshEl.prototype.resizePane = function(v) {
      this.func(function(el) {
        if (el.tagName.toLowerCase() == "ui-col") {
          jsHelper(el).attr('w', v);
        } else if (el.tagName.toLowerCase() == "ui-row") {
          jsHelper(el).attr('h', v);
        }
      });
      jsHelper.layout();
      return this;
    }
  }
/* Makes whole page have no scrolls, margin etc. */
  function _initDocumentBody() {
    jsHelper(document.body).m0().p0().oh();
  }

/* Makes pane cover whole window */
  function _setPaneToCoverWindow(el) {
    var pos = jsHelper(window).pos();
    jsHelper(el).m0().p0().oh().pa().t0().l0().w(pos.w).h(pos.h);
    return true;
  }

/* Checks if layout pane should be split into columns or rows */
  function _getPaneSplitType(el) {
    var rows = jsHelper(el).uiRows().length();
    var cols = jsHelper(el).uiCols().length();
    if (rows > 0 && cols > 0) {
      console.log("jslayout-window can't have both ui-row and ui-col");
      return false;
    }
    if (rows == 0 && cols == 0) {
      console.log("jslayout-window has no children, nothing to do");
      return false;
    }
    if (rows > 0)
      return 'h';
    if (cols > 0)
      return 'v';
  }

/* Iterates element's children with specific tag name and returns array of attr
values. If value is not integer or percent then it's replaced with null. */
  function _getChildrenAttrsWhenIntOrPc(tag, attr, el, oneMustBeNull) {
    var o = [], vCnt = 0, len = 0;
    for (var i=0; i<jsHelper(el).children().filterTag(tag).length(); i++) {
      var v = jsHelper(el).children().filterTag(tag).nth(i+1).attr(attr);
      if (v !== null && v.match('^[0-9]+%{0,1}$')
        && (!oneMustBeNull || (oneMustBeNull
        && vCnt < (jsHelper(el).children().filterTag(tag).length()-1)))) {
        o.push(v);
      } else {
        o.push(null);
      }
    }
    return o;
  }

/* Iterates element's 'ui-row' children and returns array of attr values. If
value is not integer or percent then it's replaced with null. */
  function _getUiRowsHAttrs(el, oneMustBeNull) {
    return _getChildrenAttrsWhenIntOrPc('ui-row', 'h', el, oneMustBeNull);
  }

/* Iterates element's 'ui-col' children and returns array of attr values. If
value is not integer or percent then it's replaced with null. */
  function _getUiColsWAttrs(el, oneMustBeNull) {
    return _getChildrenAttrsWhenIntOrPc('ui-col', 'w', el, oneMustBeNull);
  }

/* Splits one integer value to many values according to array of percent or
integer values */
  function _getSplitValues(v, a) {
    var o = [];
  /* Iterate values and ensure that they are either integer or null */
    var sumInt = 0, nullIds = 0;
    for (var i=0; i<a.length; i++) {
      if (a[i] === null) {
        nullIds++;
      } else if (a[i].match('^[0-9]+%$')) {
      /* Percent value, eg. 50% needs to be re-calculated to integer */
        a[i] = Math.ceil((parseInt(a[i])*v)/100);
        sumInt += a[i];
      } else if (a[i].match('^[0-9]+$')) {
        a[i] = parseInt(a[i]);
        sumInt += a[i];
      }
    }
  /* Loop through definition array and calculate final values for each item */
    var sumNull = v - sumInt, nullSize = sumNull / nullIds, chgCnt = 0,
      lastSize = sumNull - (nullSize*(nullIds-1)), size = 0;
    for (var i=0; i<a.length; i++) {
    /* If there's integer value already defined then just use it */
      if (a[i] != null) {
        o.push(a[i]);
    /* If there is no value defined then:
       - set it to v/number of undefined items if its not last element;
       - if its last element then use v-sum of all previous values. */
      } else {
        if (chgCnt == (nullIds-1)) {
          o.push(lastSize);
        } else {
          o.push(nullSize);
          chgCnt++;
        }
      }
    }
    return o;
  }

  function _setPaneHelpersAttrs(phEl, el) {
    var elPos = jsHelper(el).pos();
    var h = jsHelper(el).attr('h'), w = jsHelper(el).attr('w');
    jsHelper(phEl)
      .attr('orig-attr-h', (h?h:"")).attr('orig-attr-w', (w?w:""))
      .attr('orig-pos-h', elPos.h).attr('orig-pos-w', elPos.w)
      .attr('collapse', 'exp');
  }

  function _createCollapsePaneHelper(ui_win, phEl, el, type) {
    var a = jsHelper.nu('ui-icon-collapse');
    if (type == 'h') {
      jsHelper(a).on('click', function() {
        var collapseStatus = jsHelper(phEl).attr('collapse');
        if (collapseStatus == 'col') {
          jsHelper(el).attr('h', jsHelper(phEl).attr('orig-attr-h'));
          jsHelper(phEl).attr('collapse', 'exp');
          _createLayout(ui_win);
        } else {
          jsHelper(el).attr('h', '0').oh();
          jsHelper(phEl).attr('collapse', 'col');
          _createLayout(ui_win);
        }
      });
    } else {
      jsHelper(a).on('click', function() {
        var collapseStatus = jsHelper(phEl).attr('collapse');
        if (collapseStatus == 'col') {
          jsHelper(el).attr('w', jsHelper(phEl).attr('orig-attr-w'));
          jsHelper(phEl).attr('collapse', 'exp');
          _createLayout(ui_win);
        } else {
          jsHelper(el).attr('w', '0').oh();
          jsHelper(phEl).attr('collapse', 'col');
          _createLayout(ui_win);
        }
      });
    }
    jsHelper(a).html('');
    jsHelper(phEl).append(a);
  }

/* Sets pane helpers position */
  function _setPaneHelperPos(phEl, el, type, w, h) {
  /* Position depends on whether pane is collapsed or not */
    var s = jsHelper(phEl).attr('collapse'), elPos = jsHelper(el).pos();
  /* To properly calculate element's width and height, we need to put it at
  0,0 first */
    jsHelper(phEl).db().oh().z(1000).pa(0,0);
    var phPos = jsHelper(phEl).pos();
    if (type == 'h') {
      jsHelper(phEl).pa(elPos.l+Math.round((elPos.w-phPos.w)/2),
        elPos.t+elPos.h-(s=='col'?0:phPos.h)).z(1000);
    } else {
      jsHelper(phEl).pa(elPos.l+elPos.w-(s=='col'?0:phPos.w),
        elPos.t+Math.round((elPos.h-phPos.h)/2)).z(1000);
    }
  }

/* Creates pane helpers */
  function _createPaneHelpers(ui_win, el, type) {
    var aCollapsible = jsHelper(el).attr('collapsible');
    if (aCollapsible === null || aCollapsible != "y")
      return false;
    var phId = el.id+"_panehelpers", w = 30, h = 10;
    if (!jsHelper.elById(phId)) {
      var phEl = jsHelper.nu('ui-panehelper-'+type);
      jsHelper(document.body).append(phEl);
      jsHelper(phEl).attr('id', phId);
      _setPaneHelpersAttrs(phEl, el);
      _createCollapsePaneHelper(ui_win, phEl, el, type);
    } else {
      phEl = jsHelper.elById(phId);
    }
    _setPaneHelperPos(phEl, el, type);
  }

/* Creates dropdown navigation */
  function _createDropdownNav(el, actions) {
    jsHelper(el).children().filterTag('ui-nav-dropdown').func(function(el) {
    /* It should be loaded just once */
      if (jsHelper(el).attr('loaded') == 'y')
        return true;

    /* Set style for the element and loop through its 'item' elements */
      var h = jsHelper(el).attr('h');
      if (h !== null && h.match('^[0-9]+$')) {
        jsHelper(el).h(h);
      }
      jsHelper(el).fll().ov().db().children().filterTag('ui-item')
                                                          .func(function(el) {
        var html = jsHelper(el).html(), l = jsHelper(el).attr('label'),
          w = jsHelper(el).attr('w');
      /* Set style and create 'a' element inside */
        if (w !== null && w.match('^[0-9]+$')) {
          jsHelper(el).w(w);
        }
        jsHelper(el).db().fll()
          .html('<ui-item-label>'+l+'</ui-item-label>'+html)
          .children().filterTag('ui-item-label').db();
      /* Set action */
        var action = jsHelper(el).attr('action');
        if (action !== null && action != ""
                                && typeof(actions[action]) == 'function') {
          jsHelper(el).children().filterTag('ui-item-label')
            .on('click', actions[action]);
        }
      /* Loop through items */
        jsHelper(el).children().filterTag('ui-subitems').func(function(el) {
          var w = jsHelper(el).attr('w');
        /* Set style and loop through subitems */
          if (w !== null && w.match('^[0-9]+$')) {
            jsHelper(el).w(w);
          }
          jsHelper(el).dn().pr().fll().m0().p0()
                        .children().filterTag('ui-subitem').func(function(el) {
            var html2 = jsHelper(el).html(), l2 = jsHelper(el).attr('label');
            jsHelper(el)
              .html('<ui-subitem-label>'+l2+'</ui-subitem-label>'+html2)
              .children().filterTag('ui-subitem-label').db();
          /* Set action */
            var action = jsHelper(el).attr('action');
            if (action !== null && action != ""
                                && typeof(actions[action]) == 'function') {
              jsHelper(el).children().filterTag('ui-subitem-label')
                .on('click', actions[action]);
            }
          })
        });
      /* Set menu to open on click */
        jsHelper(el).children().filterTag('ui-item-label').on('mouseover',
                                                                function() {
          jsHelper(this).parent().children('ui-subitems').db();
        });
      /* Make menu disappear when mouseout */
        jsHelper(el).on('mouseout', function(e) {
          if (e.relatedTarget == null
              || e.relatedTarget.tagName.toLowerCase() != "ui-subitem-label") {
            jsHelper(this).children().filterTag('ui-subitems').dn();
          }
        });
      });

    /* Mark element as already loaded */
      jsHelper(el).attr('loaded', 'y');
    });
  }

/* Splits layout element: horizontally or vertically */
  function _splitPane(ui_win, el, actions, type) {
    if (type != 'h' && type != 'v')
      return false;
    var len = (type=='h' ? jsHelper(el).uiRows().length()
                         : jsHelper(el).uiCols().length());
    if (len < 1)
      return false;
    var elSize = jsHelper(el).pos();
  /* If there's just one row/col apply parent height/width to it */
    if (len == 1) {
      if (type == 'h') {
        jsHelper(el).uiRows().h(elSize.h).db().oh();
      } else {
        jsHelper(el).uiCols().w(elSize.w).db().oh();
      }
    } else {
    /* Get all 'h'/'w' attribute values that are integer or percent */
      var attrValues = (type=='h' ? _getUiRowsHAttrs(el, true)
                                  : _getUiColsWAttrs(el, true));
    /* Calculate height/width for all the rows/cols */
      var values = (type=='h' ? _getSplitValues(elSize.h, attrValues)
                              : _getSplitValues(elSize.w, attrValues));
    /* Apply the heights/widths and behavior like element to be scrollable*/
      for (var i=0; i<len; i++) {
        if (type == 'h') {
        /* Set height */
          jsHelper(el).uiRows().nth(i+1).h(values[i]).db();
        /* Check if element should be scrollable and eventually apply */
          var attrScroll = jsHelper(el).uiRows().nth(i+1).attr('scroll');
        /* Check if element allows overflow to be visible, eg. dropdown menus */
          var attrOverflow = jsHelper(el).uiRows().nth(i+1).attr('overflow');
          if (attrScroll != null && attrScroll.match('^(x|y|xy)$')) {
            jsHelper(el).uiRows().nth(i+1).os(attrScroll);
          } else if (attrOverflow != null && attrOverflow == "y"
                                                            && values[i] > 0) {
            jsHelper(el).uiRows().nth(i+1).ov();
          } else {
            jsHelper(el).uiRows().nth(i+1).oh();
          }
        } else {
        /* Set width */
          if (i == len-1) {
            jsHelper(el).uiCols().nth(i+1).w(values[i]).db().fln();
          } else {
            jsHelper(el).uiCols().nth(i+1).w(values[i]).db().fll();
          }
        /* Check if element should be scrollable and eventually apply */
          var attrScroll = jsHelper(el).uiCols().nth(i+1).attr('scroll');
          if (attrScroll != null && attrScroll.match('^(x|y|xy)$')) {
            jsHelper(el).uiCols().nth(i+1).os(attrScroll);
          } else if (attrOverflow != null && attrOverflow == "y"
                                                            && values[i] > 0) {
            jsHelper(el).uiCols().nth(i+1).ov();
          } else {
            jsHelper(el).uiCols().nth(i+1).oh();
          }
        }
      }
    }
  /* Set width/height of all rows/cols */
    if (type == 'h') {
      jsHelper(el).uiRows().w(elSize.w);
    } else {
      jsHelper(el).uiCols().h(elSize.h);
    }
  /* Loop through every row/col */
    for (var i=0; i<len; i++) {
      if (type == 'h') {
        jsHelper(el).uiRows().nth(i+1).func(function (el) {
          _elemId(jsHelper(el));
          _splitPaneVertically(ui_win, el);
          _createPaneHelpers(ui_win, el, 'h');
          _createDropdownNav(el, actions);
        });
      } else {
        jsHelper(el).uiCols().nth(i+1).func(function (el) {
          _elemId(jsHelper(el));
          _splitPaneHorizontally(ui_win, el);
          _createPaneHelpers(ui_win, el, 'v');
        });
      }
    }
  }

/* Splits layout element horizontally */
  function _splitPaneHorizontally(ui_win, el, actions) {
    return _splitPane(ui_win, el, actions, 'h');
  }

/* Splits layout element vertically */
  function _splitPaneVertically(ui_win, el, actions) {
    return _splitPane(ui_win, el, actions, 'v');
  }

/* Creates layout */
  function _createLayout(ui_win, actions) {
    _initDocumentBody();
    _setPaneToCoverWindow(ui_win);
    var splitType = _getPaneSplitType(ui_win);
  /* We need to pass main jslayout-window object, at least for now. It's
  necessary for calling _createLayout to update the layout */
    if (splitType == 'h') {
      _splitPaneHorizontally(ui_win, ui_win, actions);
    } else {
      _splitPaneVertically(ui_win, ui_win, actions);
    }
  }

/* Returns element id. If element has no id, it will be generated */
  function _elemId($el) {
    var id = $el.attr('id');
    if (id === null) {
      id = jsHelper.uid();
      $el.attr('id', id);
    }
    return id;
  }

/* Init */
  function init(opts) {
    var state = jsHelper(document.body).attr('jslayout');
    if (state != "initialized") {
    /* Create HTML when code is passed */
      if (typeof(opts) != "undefined" && typeof(opts['code']) == "string") {
        var newLayout = jsHelper.nu('jslayout-window');
        jsHelper(document.body).append(newLayout);
        jsHelper(document.body).children().filterTag('jslayout-window')
          .html(opts['code']);
      }
    }

  /* Get jslayout-window tag */
    var $ui_win = jsHelper(document.body).children()
      .filterTag("jslayout-window");
    if ($ui_win.length() < 1) {
      console.log("jslayout-window element not found");
      return false;
    }
    if ($ui_win.length() > 1) {
      console.log("Too many jslayout-window elements.");
      return false;
    }

    if (state != "initialized") {
    /* Check if we should resize the layout when window gets resized */
      var resize = false;
      if ((typeof(opts['resize']) != "undefined" && opts['resize'])
        || $ui_win.attr('resize') == 'yes') {
        resize = true;
      }

      _extendJsHelper();

    /* Check if any actions are defined */
      var actions = {};
      if (typeof(opts['actions']) != "undefined") {
        actions = opts['actions'];
      }
    }

    var ui_win_id = _elemId($ui_win);
    _createLayout(jsHelper.elById(ui_win_id), actions);
    if (state != "initialized") {
      if (typeof(opts['onReady']) == "function") {
        opts["onReady"]();
      }

      jsHelper(window).on('resize', function() {
        _createLayout(jsHelper.elById(ui_win_id));
        if (typeof(opts['onResize']) == "function") {
          opts["onResize"]();
        }
      });
    }
    jsHelper(document.body).attr('jslayout', 'initialized');
  }
  return {
    init: init
  }
})();

jsHelper.layout = function(opts) {
  jsLayout.init(opts);
};
if (typeof(JSHELPER_COMPATIBLE) == "undefined") {
  $.layout = function(opts) {
    jsLayout.init(opts);
  };
}
