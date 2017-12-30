/*
notepad version 0.1.0

Copyright (c) 2015, 2016, 2017, 2018, Nicholas Gasior <nmls@laatu.se>
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

var notepad = (function() {
    function init() {
      jsLayout.init({ code:
`
  <ui-row h="32" overflow="y" id="lay_top">
    <ui-nav-dropdown h="32">
      <ui-item label="File" w="50">
        <ui-subitems w="100">
          <ui-subitem label="Open file" action="notImplemented"></ui-subitem>
          <ui-subitem label="Save as a file" action="notImplemented"></ui-subitem>
        </ui-subitems>
      </ui-item>
      <ui-item label="About" action="modalAbout"></ui-item>
      <ui-item label="GitHub" action="github"></ui-item>
    </ui-nav-dropdown>
  </ui-row>
  <ui-row>
    <ui-col id="lay_center"><textarea id="notepad"></textarea></ui-col>
  </ui-row>
`,
        actions: {
          notImplemented: function() { alert('Not implemented yet'); },
          modalAbout: function() { $.modalOpen('#modal-about'); },
          github: function() {
            window.open('https://github.com/nmls/notepad/', '_blank');
          }
        }
      });
      var modal = $.nu('ui-modal');
      $(modal).attr('id','modal-about').attr('w','250').attr('h','120')
        .attr('blur','y').html(
`
<p style="text-align:center;font-weight:bold">About</p>
<p>It's a small project created for fun. More information can be found on GitHub.</p>
<p style="text-align:center;margin:40px;"><a style="cursor:pointer;font-weight:bold" onclick="$.modalClose('#{%id%}')">Close window</a></p>
`
        );
      $(document.body).append(modal);
      var pos = $('lay_center').pos();
      $('notepad').style('width', pos.w+'px').style('height', pos.h+'px');
   };

    return {
        init            : init,
    }
})();

notepad.init();
