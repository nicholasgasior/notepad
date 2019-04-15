/*
jsui, version 0.1.0

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

var jsUi = {
  zIndex: 1000
}

jshEl.prototype.modalOpen = function() {
  if (this.length() == 1) {
    var id = this.attr('id');
    if (id === null) {
      id = jsHelper.uid();
      this.attr('id', id);
    }
    jsHelper.modalOpen('#'+id);
  }
}

jshEl.prototype.modalClose = function() {
  if (this.length() == 1) {
    var id = this.attr('id');
    if (id === null) {
      id = jsHelper.uid();
      this.attr('id', id);
    }
    jsHelper.modalClose('#'+id);
  }
}

jsHelper.modalOpen = function(src) {
  var pos = jsHelper(window).pos();
  if (src[0] == '#' && src.length > 1) {
    var id = src.substring(1);
    if (jsHelper(id).length() != 1)
      return false;
    var h=jsHelper(id).attr('h'), w=jsHelper(id).attr('w'),
        b = jsHelper(id).attr('blur'), scroll = jsHelper(id).attr('scroll');
    if (h.match(/^[0-9]+%{0,1}$/) && w.match(/^[0-9]+%{0,1}$/)) {
      if (h.indexOf('%')>0) {
        h = Math.floor(pos.h*(parseInt(h.replace('%',''))/100));
      }
      if (w.indexOf('%')>0) {
        w = Math.floor(pos.w*(parseInt(w.replace('%',''))/100));
      }
      if (h-10 > pos.h) { h = pos.h-10; }
      if (w-10 > pos.w) { w = pos.w-10; }
      var l = Math.floor((pos.w-w)/2), t = Math.floor((pos.h-h)/2);
      jsUi.zIndex = jsUi.zIndex+2;
      jsHelper(id).style('left',l+'px').style('top',t+'px')
        .style('position','absolute').style('display','block')
        .style('width',w+'px').style('height',h+'px')
        .style('zIndex', jsUi.zIndex-1);
      if (scroll == "x" || scroll == "xy") {
        jsHelper(id).style('overflow-x', 'scroll');
      }
      if (scroll == "y" || scroll == "xy") {
        jsHelper(id).style('overflow-y', 'scroll');
      }
      var html = jsHelper(id).html().replace('{%id%}',id);
      jsHelper(id).html(html);
      if (b == "y") {
        if (jsHelper(id+'_blur').length() == 0) {
          var blur = jsHelper.nu('ui-blur');
        } else {
          var blur = jsHelper.elById(id+'_blur');
        }
        jsHelper(blur).style('display', 'block')
          .style('zIndex', jsUi.zIndex-2).style('position', 'absolute')
          .style('top', 0).style('left', 0).style('width', pos.w+'px')
          .style('height', pos.h+'px').style('display','block');
        if (jsHelper(id+'_blur').length() == 0) {
          $(document.body).append(blur);
          jsHelper(blur).attr('id', id+'_blur');
        }
      }
    }
  }
};

jsHelper.modalClose = function(src) {
  if (src[0] == '#' && src.length > 1) {
    var id = src.substring(1);
    if (jsHelper(id).length() != 1)
      return true;
    jsHelper(id).style('display','none');
    if (jsHelper(id+'_blur').length() != 1)
      return true;
    jsHelper(id+'_blur').style('display','none');
    return true;
  }
};

if (typeof(JSHELPER_COMPATIBLE) == "undefined") {
  $.modalOpen = function(src) { jsHelper.modalOpen(src); };
  $.modalClose = function(src) { jsHelper.modalClose(src); };
}
