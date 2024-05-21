  //notebook
  $("#side_open_btn").on("click", function () {
    $(".side_nav").toggleClass("close");
    $(".main").toggleClass("open");
    $(this).toggleClass("open");
  });


    $('#contextArea').on('contextmenu', function (e) {
      e.preventDefault(); // デフォルトのコンテキストメニューを防止
      $('#submenu').css({
        top: e.pageY + 'px',
        left: e.pageX + 'px',
        display: 'block'
      });
    });

    $(document).on('click', function () {
      $('#submenu').hide(); // 他の場所をクリックしたときにメニューを非表示にする
    });


  $(document).on("click", "#add_label_wrap #label_form_btn", function () {
    $("#memo_bg").remove();
    $("#close_btn").remove();
    $("#add_label_wrap").removeClass('active');
    // $("#add_label_wrap02").removeClass('active');
  });
  //ラベル編集欄のクリア
  $(document).on("click", "#clear_label_btn", function () {
    $("#add_label_input").val("");
  });
  /* チャット機能の追加 */
  $("#chat-wrap .chat-header").on("click", chatHeader);

  function chatHeader() {
    $('#chat-wrap').toggleClass('active');
    if ($('#chat-wrap').hasClass('active')) {
      $("#chat-wrap .chat-header .chat-btn").html('<i class="fa-solid fa-arrows-down-to-line"></i>');
    } else {
      $("#chat-wrap .chat-header .chat-btn").html('<i class="fa-solid fa-arrows-up-to-line"></i>');
    }
  }
  function containsHTMLorJSorCSS(text) {
    const htmlPattern = /<\/?[a-z][\s\S]*>/i;
    const jsPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/i;
    const cssPattern = /<style[\s\S]*?>[\s\S]*?<\/style>/i;
    return htmlPattern.test(text) || jsPattern.test(text) || cssPattern.test(text);
  }

document.addEventListener('DOMContentLoaded', function () {
  const editor = document.getElementById('editor_text');
  if (editor) {
    editor.addEventListener('paste', function (e) {
      e.preventDefault();
      const clipboardData = e.clipboardData || window.clipboardData;
      const items = clipboardData.items;
      const pastedData = clipboardData.getData('text');
      console.log(items.kind);
      for (const item of items) {
        if (item.kind === 'file') {
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = function (event) {
            const img = document.createElement('img');
            img.src = event.target.result;
            editor.appendChild(img);
          };
          reader.readAsDataURL(blob);
        } else if (item.kind === 'string') {
          item.getAsString(function (text) {
            const textNode = document.createTextNode(text);
            console.log(text);

            if (containsHTMLorJSorCSS(text)) {
              // &lt; が含まれている場合の処理
              console.log("Pasted data contains HTML, JS, or CSS");
              const pre = document.createElement('pre');
              pre.textContent = text;
              editor.appendChild(text);
            } else {
              // &lt; が含まれていない場合の処理
              console.log("Pasted data does not contain &lt;");
              editor.append(textNode);
            }
        
          });
        }
      }
    });
  }
  // function insertTextAsCodeSnippet(text) {
  //   const codeSnippet = document.createElement('pre');
  //   codeSnippet.textContent = text;
  //   // codeSnippet.style.background = '#f5f5f5';
  //   codeSnippet.style.border = '1px solid #ddd';
  //   codeSnippet.style.padding = '10px';
  //   codeSnippet.style.overflowX = 'auto';

  //   editor.appendChild(codeSnippet);
  //   // hljs.highlightElement(editor);
  //   hljs.highlightBlock(codeSnippet);
  // }

  const previewButton = document.getElementById('preview-button');
  const htmlCode = document.getElementById('html-code');
  const cssCode = document.getElementById('css-code');
  const jsCode = document.getElementById('js-code');
  const previewFrame = document.getElementById('preview-frame');

  $(document).on("click", "#preview-button", function () {
    const html = htmlCode.value;
    const css = `<style>${cssCode.value}</style>`;
    const js = `<script>${jsCode.value}<\/script>`;

    let finalHtml;
    if (html.includes('<html') && html.includes('</html>')) {
      finalHtml = html.replace('</head>', `<style>${css}</style></head>`);
      finalHtml = finalHtml.replace('</body>', `</style>${js}</style></body>`);
    } else {
      finalHtml = `<html><head>${css}</head><body>${html}<script
      src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>${js}</body></html>`;
    }
    const previewFrame = document.getElementById('preview-frame');
    const preview = previewFrame.contentDocument || previewFrame.contentWindow.document;
    preview.open();
    preview.write(finalHtml);
    preview.close();

    // const preview = previewFrame.contentDocument || previewFrame.contentWindow.document;
    console.log(finalHtml);
    // preview.open();
    // preview.write(html + css + js);
    // preview.close();
  });

  //クリップボード
  const pasteArea = document.getElementById('paste-area');
  const imageBoard = document.getElementById('image-board');

  pasteArea.addEventListener('paste', (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = document.createElement('img');
          img.src = event.target.result;
          imageBoard.appendChild(img);
          $("#paste-area").html("");
        };
        reader.readAsDataURL(blob);
      }
    }
  });


  //クリアボタンを押す
  $('#editor_btn_clear').on("click", function () {
    $("#editor_title").val('');
    $("#editor_text").val('');
    $("#html-code").val('');
    $("#css-code").val('');
    $("#js-code").val('');
    $("#preview-frame").html('');
    $("#paste-area").html('');
  });



















});