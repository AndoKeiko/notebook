$(document).on("click", "#memo_list .memo_page:not(.active)", function () {
  var index = $('#memo_list .memo_page').index(this);
  $(this).addClass("active");
  if ($("#memo_bg").length === 0) {
    $(".body").append("<div id='memo_bg'></div>");
  }
  if ($("#close_btn").length === 0) {
    $(".body").prepend("<div id='close_btn'>×</div>");
  }
  $(this).attr('contenteditable', 'true');
});

$(document).on("click", "#memo_bg", function () {
  $("#memo_bg").remove();
  $("#close_btn").remove();
  $("#memo_list .memo_page").removeClass("active");
  $("#memo_list .memo_page").attr('contenteditable', 'false');
  window.location.reload();
});

$(document).on("click", "#close_btn", function () {
  $("#memo_bg").remove();
  $("#close_btn").remove();
  $("#memo_list .memo_page").removeClass("active");
  $("#memo_list .memo_page").attr('contenteditable', 'false');
  window.location.reload();
});


//###############################################
// 必要なJSを読み込み
//###############################################
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, push, set, get, onValue, onChildAdded, update, remove, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

//###############################################
//FirebaseConfig [ KEYを取得して設定！！ ]
//###############################################
const firebaseConfig = {
  apiKey: "AIzaSyA9BFxJKe2N8iur4HrfSZu9Rh6ds-r6Iow",
  authDomain: "fusen-a11fb.firebaseapp.com",
  projectId: "fusen-a11fb",
  storageBucket: "fusen-a11fb.appspot.com",
  messagingSenderId: "617439916919",
  appId: "1:617439916919:web:0ef9bc91c6de4bae792772"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//###############################################
//Firebase-RealtimeDatabase接続
//###############################################
const db = getDatabase(app); //RealtimeDBに接続

//###############################################
//GoogleAuth用
//###############################################
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
const auth = getAuth();

// const dbRef = ref(db,"memo"); //RealtimeDB内の"chat"を使う

//###############################################
//Loginしていれば処理します
//###############################################
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    //ユーザー情報取得できます
    if (user !== null) {
      user.providerData.forEach((profile) => {
        //Login情報取得
        $("#uname").text(profile.displayName);
        $("#prof").attr("src", profile.photoURL);
      });
      $("#status").fadeOut(500);
    }
    let lastKey = "memo0";
    //データ登録(Click)
    function MaxKeyGet() {
      return new Promise((resolve, reject) => {
        const dbRef = ref(db, "users/" + uid + "/memo");
        get(dbRef).then((data) => {
          const items = data.val(); //全データ
          let nextKey = 0;

          if (items) {
            const keys = Object.keys(items); // キーの配列を取得
            const numericKeys = keys.map(key => parseInt(key.replace(/\D/g, ''), 10)); // 数値部分を抽出
            const maxKey = Math.max(...numericKeys); // 最大値を計算
            nextKey = "memo" + (maxKey + 1);
            resolve(nextKey);
          } else {
            nextKey = "memo1";
            resolve(nextKey);
          }
        }).catch((error) => {
          console.error("エラーが発生しました: ", error);
          reject(error);
        });
      });
    }

    // データ登録(Click)の部分を修正
    //let img_file;
    $("#save").on("click", function () {
      MaxKeyGet().then(nextKey => {
        const msg = {
          title: $("#title").text(),  // Default to null if undefined
          text: $("#text").text(),
          color: "",
          images: imageUrl,
          labels: [["name", "Value1"], ["value", "Value2"]]
        }
        const dbRef02 = ref(db, "users/" + uid + "/memo/" + nextKey);
        set(dbRef02, msg);
        $("#title").text("");
        $("#text").text("");
        $('#upimage').text("");
        $('#upfile').val("");
      }).catch(error => {
        console.error("キーの取得に失敗しました: ", error);
      });
    });

     //ファイルアップ
    // let imageUrl;
    // $(function(){
    //   $('#upfile').change(function(e){
    //     var file = e.target.files[0];
    //     var reader = new FileReader();
    //     if(file.type.indexOf('image') < 0){
    //       alert("画像ファイルを指定してください。");
    //       return false;
    //     }
    //     reader.onload = (function(file){
    //       return function(e){
    //         $('#upimage').attr('src', e.target.result);
    //         $('#upimage').attr('title', file.name);
    //         imageUrl = e.target.result; // 画像のDataURLが取得できる
    //         console.log(imageUrl); // コンソールにDataURLを出力
    //       };
    //     })(file);
    //     reader.readAsDataURL(file);
    //   });
    // });

    //最初にデータ取得＆onSnapshotでリアルタイムにデータを取得
    const dbRef = ref(db, "users/" + uid + "/memo");
    onChildAdded(dbRef, function (data) {
      const msg = data.val();    //オブジェクトデータを取得し、変数msgに代入
      const key = data.key;      //データのユニークキー（削除や更新に使用可能）
      console.log(msg.images);
      let html = '<div class="memo_page';
      if (msg.color.length) {
        html += " " + msg.color;
      }
      html += '" id="' + key + '" data-key="' + key + '" data-color="' + msg.color;
      html += '">';

      html += '<div class="masonry-content"><div class="title">' + msg.title + '</div>';

      if (msg.images && msg.images.length > 0) {
       html += '<div class="memo_image"><img src="' + msg.images + '" alt=""></div>';
      }

      html += '<div class="text_body">' + msg.text + '</div>';
      // ラベルが配列で存在する場合、それぞれのラベルを表示
      if (msg.labels && msg.labels.length > 0) {
        html += '<div class="label_box">';
        msg.labels.forEach(label => {
          if (label.name !== undefined) {
            html += '<span class="label_label" data-label="' + `${label.value}` + '">' + `${label.name}` + '</span>';
          }
          console.log('<span class="label_label" data-label="' + `${label.value}` + '">' + `${label.name}` + '</span>');
        });
        html += '</div>';
      }
      html += '<div class="tool_box">';
      html += '<a class="label" data-key="' + key + '" title="ラベルを追加"><i class="bi bi-bookmark"></i></a>';
      html += '<a class="pencil" data-key="' + key + '" title="編集"><i class="bi bi-pencil"></i></a>';
      html += '<a class="pallet" data-key="' + key + '" title="背景オプション"><i class="bi bi-palette"></i></a>';
      html += '<a class="trash" data-key="' + key + '" title="ゴミ箱"><i class="bi bi-trash3"></i></a>';
      html += '</div>';
      html += '</div></div>';

      $("#memo_list").append(html);
      $("#title").html('');
      $("#text").html('');

      resizeAllGridItems();
      $("#memo_list .memo_page").attr('contenteditable', 'false');
      lastKey = data.key;
    });

    //サイドメニュー
    const sideRef = ref(db, "users/" + uid + "/memo_label");
    let html2;
    let html3;
    onChildAdded(sideRef, function (data02) {
      // let i = 0;
      // i++;
      const msg = data02.val();
      const key = data02.key;

      html2 = '<li class="add_label_list_item" id="' + key + '" data-key="' + key + '" contenteditable><span class="remove_label_btn"></span>' + msg.label + '<span class="update_label_btn"></span></li>';
      html3 = '<li class="add_label_list_item" id="' + key + '" data-key="' + key + '">' + msg.label + '</li>';
      $("#add_label_list").append(html2);
      $("#side_category_list").prepend(html3);
    });

    //エラーあとで復活させる21:06
    $(document).on("click", ".add_label_list_item", function () {
      let labelId = $(this).attr('id');
      $('.memo_page').hide();
      $('.memo_page').each(function () {
        let labels = $(this).find(".label_label").map(function () {
          return $(this).attr("data-label");
        }).get();

        if (labels) {
          if (labels.includes(labelId)) {
            $(this).show(); // Show this memo page if it has the label
          }
        }
      });
    });
    $(document).on("click", ".label_label", function () {
      let labelId = $(this).data('label');
      $('.memo_page').hide();
      $('.memo_page').each(function () {
        let labels = $(this).find(".label_label").map(function () {
          return $(this).attr("data-label");
        }).get();

        if (labels.includes(labelId)) {
          $(this).show(); // Show this memo page if it has the label
        }
      });
    });

    $(document).on("click", "#side_memo_btn", function () {
      window.location.reload();
      $('.memo_page').show();
    });

    const orderRef = ref(db, "users/" + uid + "/memo_order");
    onValue(orderRef, (snapshot) => {
      const order = snapshot.val();
      if (order) {
        // order に基づいてメモの DOM 要素を並び替え
        const memoList = document.getElementById('memo_list');
        const orderedElements = [];

        // order 配列に従って、各 ID の要素を取得し、配列に追加
        order.forEach((memoId) => {
          const memoElement = document.getElementById(memoId);
          if (memoElement) {
            orderedElements.push(memoElement);
          }
        });

        // memo_list をクリアし、新しい順序で要素を追加
        memoList.innerHTML = '';
        orderedElements.forEach((element) => {
          memoList.appendChild(element);
        });
      }
    });

    // データ更新
    $(document).on("click", ".pencil", function () {
      const key = $(this).data("key");
      const memoPage = $(this).closest(".memo_page");
      const msg = {
        title: memoPage.find(".title").html(),  // Default to null if undefined
        text: memoPage.find(".text_body").html()
      }
      // console.log(uname, text); // Debugging output
      const updateRef = ref(db, "users/" + uid + "/memo/" + key);
      update(updateRef, msg).then(() => {
        console.log("Update successful!");
      }).catch((error) => {
        console.error("Update failed: " + error.message);
      });
      $("#memo_bg").remove();
      $("#close_btn").remove();
      $("#memo_list .memo_page").removeClass("active");
      $("#memo_list .memo_page").attr('contenteditable', 'false');
      window.location.reload();
    });
    // ラベルを追加

    $(document).on("click", ".tool_box .label", function () {
      let key = $(this).data('key');
      $("#add_label_wrap02").addClass('active');

      fetchAndDisplayData(key);

      if ($("#memo_bg").length === 0) {
        $(".body").append("<div id='memo_bg'></div>");
      }
      if ($("#close_btn").length === 0) {
        $(".body").prepend("<div id='close_btn'>×</div>");
      }

      //window.location.reload();
      // console.log(key);

      // const updateRef = ref(db, "users/" + uid + "/memo/" + key);

      // // Firebaseにデータを保存
      // update(updateRef, msg).then(() => {
      //   console.log("Update successful!");
      // }).catch((error) => {
      //   console.error("Update failed: " + error.message);
      // });

    });

    //ここのkeyを取るところから
    function fetchAndDisplayData(key) {
      $("#add_label_list").empty();
      $("#add_label_list02").empty();
      const sideRef = ref(db, "users/" + uid + "/memo_label");
      onChildAdded(sideRef, function (data02) {
        // let i;
        // i++;
        const msg = data02.val();
        //const dataKey = data02.key;
        const dataKey = key || data02.key;
        //console.log(dataKey);
        //if ($("#add_label_list").children().length === 0) {
        let html4 = '<li class="add_label_list_item" id="' + dataKey + '" data-key="' + data02.key + '" contenteditable><span class="remove_label_btn"></span>' + msg.label + '<span class="update_label_btn"></span></li>';
        $("#add_label_list").append(html4);
        //}
        //if ($("#add_label_list02").children().length === 0) {
        let html5 = '<li class="add_label_list_item" id="' + dataKey + '" data-memo="" data-key="' + dataKey + '" contenteditable><input type="checkbox" id="chk_label" class="chk_label" value="' + data02.key + '" name="chk_label" name="scales" /><label for="scales">' + msg.label + '</label></li>';

        $("#add_label_list02").append(html5);
        $("#add_label_list02 .add_label_list_item").attr('data-memo', dataKey);
        //}
      });
    }


    $(document).on("click", "#memo_list .memo_page:not(.active)", function () {
      var index = $('#memo_list .memo_page').index(this);
      $(this).addClass("active");
      if ($("#memo_bg").length === 0) {
        $(".body").append("<div id='memo_bg'></div>");
      }
      if ($("#close_btn").length === 0) {
        $(".body").prepend("<div id='close_btn'>×</div>");
      }
      $(this).attr('contenteditable', 'true');
    });

    $(document).on("click", "#memo_text_bg", function () {
      $("#memo_text_bg").remove();
      $("#close_btn").remove();
      $("#add_label_wrap").removeClass('active');
      $("#add_label_wrap02").removeClass('active');
      $("#memo_list .memo_page").removeClass("active");
      $("#memo_list .memo_page").attr('contenteditable', 'false');
    });

    $(document).on("click", "#close_btn", function () {
      $("#memo_text_bg").remove();
      $("#close_btn").remove();
      $("#add_label_wrap").removeClass('active');
      $("#add_label_wrap02").removeClass('active');
      $("#memo_list .memo_page").removeClass("active");
      $("#memo_list .memo_page").attr('contenteditable', 'false');
    });

    $(document).on("click", ".trash", function () { //削除
      const memo_box = $(this).parents(".memo_page");
      const key = memo_box.find(".title").text();
      $(this).parents(".memo_page").remove();
      const memoId = memo_box.attr('id').replace('', '');
      console.log(memoId);
      const dbRef = ref(db, "users/" + uid + "/memo/" + memoId);
      remove(dbRef);
      //firebase.database().ref('memo/' + memoId).remove();
      window.location.reload();
    });

    $(document).on("click", ".memo_page .pallet", function () { //カラー
      const memo_box = $(this).parents(".memo_page");
      memo_box.find(".pallet_box").toggleClass("active");
      console.log(memo_box.find(".pallet_box").children());
      if (memo_box.find(".pallet_box").children().length == 0) {
        let color_class = [
          "bg-primary text-white",
          "bg-secondary text-white",
          "bg-success text-white",
          "bg-danger text-white",
          "bg-warning text-dark",
          "bg-info text-dark",
          "bg-light text-dark",
          "bg-dark text-white",
          "bg-white text-dark"
        ];
        console.log(color_class);
        let html = '<div class="pallet_box">';
        for (let i = 0; i < color_class.length; i++) {
          html += '<div class="' + color_class[i] + '" data-color="' + color_class[i] + '"></div>';
        }
        html += '</div>';

        memo_box.append(html);
      }
    });

    $(document).on("click", "#memo_list .memo_page.active .pallet_box > div", function () { //色の選択
      //色の選択ボタンを押した時
      const memo_box = $(this).closest(".memo_page");
      const pallet_box = $(this).closest(".pallet_box");
      console.log(memo_box);
      const color = $(this).data("color");
      console.log(color);
      // let class_name = $(this).attr('class'); 
      memo_box.addClass(color);
      const key = memo_box.attr('id');
      console.log(key);
      const msg = {
        color: color,
        title: memo_box.find(".title").html(),  // Default to null if undefined
        text: memo_box.find(".text_body").html()
      }
      // console.log(uname, text); // Debugging output
      const updateRef = ref(db, "users/" + uid + "/memo/" + key);
      update(updateRef, msg).then(() => {
        console.log("Update successful!");
      }).catch((error) => {
        console.error("Update failed: " + error.message);
      });
      //  $(pallet_box).remove();
      // $("#memo_bg").remove();
      // $("#close_btn").remove();
      // $("#memo_list .memo_page").removeClass("active");
      // $("#memo_list .memo_page").attr('contenteditable', 'false');
    });

    //付箋風レイアウト
    const grid = document.getElementsByClassName('memo_list')[0];
    const allItems = document.getElementsByClassName('memo_page');
    const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));

    const resizeGridItem = (item) => {
      const rowSpan = Math.ceil((item.querySelector('.masonry-content').getBoundingClientRect().height + rowGap + 60) / (rowHeight + rowGap));
      item.style.gridRowEnd = 'span ' + rowSpan;
      updateMemoOrder();  // グリッドアイテムの高さ調整後に順序を更新 curser
    }

    const updateMemoOrder = () => {
      const order = [];
      document.querySelectorAll('.memo_page').forEach((element) => {
        order.push(element.id);
      });
      // Firebaseに順序を保存
      const dbRef = ref(db, "users/" + auth.currentUser.uid + "/memo_order");
      set(dbRef, order);
    }

    const resizeAllGridItems = () => {
      for (let i = 0; i < allItems.length; i++) {
        //毎回画像の読み込みの検出を行ってからアイテムの grid-row-end プロパティを更新
        imagesLoaded(allItems[i], (instance) => {
          const item = instance.elements[0];
          resizeGridItem(item);
        });
      }
    }

    let timer = false;
    window.addEventListener('resize', () => {
      if (timer !== false) {
        clearTimeout(timer);
      }
      timer = setTimeout(function () {
        resizeAllGridItems();
      }, 200);
    });


    //   //フィルタリング
    // window.addEventListener('DOMContentLoaded', () => {
    //   //name 属性が categories の input 要素（ラジオボタン）の集まり（静的な NodeList）を取得
    //   const input_categories = document.querySelectorAll("input[name=categories]");
    //   const targetElements = '.memo_page';  //フィルタのターゲットにグリッドアイテムを指定
    //   //全てのグリッドアイテムの要素（フィルタリングの対象）
    //   const targets = document.querySelectorAll(targetElements);
    //   //input 要素（ラジオボタン）に change イベントを設定
    //   for (let input_category of input_categories) {
    //     input_category.addEventListener('change', (e) => {
    //       //アイテムの高さを更新
    //       resizeAllGridItems();
    //       for (let target of targets) {
    //         target.style.setProperty('display', 'block');
    //       }
    //       if (e.currentTarget.checked) {
    //         if (e.currentTarget.value !== 'all') {
    //           //data-category 属性にこのラジオボタンの value 属性の値が含まれていないものを全て取得して非表示に
    //           const not_checked_categories = document.querySelectorAll(targetElements + ':not([data-category~=' + '"' + e.currentTarget.value + '"])');
    //           for (let not_checked_category of not_checked_categories) {
    //             not_checked_category.style.setProperty('display', 'none');
    //           }
    //         }
    //       }
    //     });
    //   }

    // });

    //html要素を取得をしてSortableJSに設定します
    const sortElement = document.getElementById('memo_list');
    Sortable.create(sortElement, {
      handle: '.memo_page',
      chosenClass: 'chosen',
      animation: 300,
      onEnd: function (evt) {
        const order = [];
        $('#memo_list .memo_page').each(function (index, element) {
          order.push($(element).attr('id'));
        });
        // Firebaseに順序を保存
        const dbRef = ref(db, "users/" + auth.currentUser.uid + "/memo_order");
        set(dbRef, order);
      }
    });

    $("#add_label_link").on("click", function () {
      $("#add_label_wrap").addClass('active');
      //$("#main").append(html);
      if ($("#memo_bg").length === 0) {
        $(".body").append("<div id='memo_bg'></div>");
      }
      if ($("#close_btn").length === 0) {
        $(".body").prepend("<div id='close_btn'>×</div>");
      }
      if ($("#add_label_wrap").children().length === 0) {
        fetchAndDisplayData();//サイドメニューだからkeyいらん
      }

    });

    $(document).on("change", 'input[type="checkbox"].chk_label', function () {
      if ($(this).is(':checked')) {
        console.log('Checkbox is checked');
        let memoName = $(this).closest('.add_label_list_item').data('memo');
        let labelVal = $(this).val();
        let labelName = $(this).next('label').text();
        $('#' + memoName).addClass(labelName);
        $('#' + memoName + " .label_box").append('<span class="label_label" data-label="' + labelVal + '">' + labelName + '</span>');
        console.log(memoName);
        // $(this).closest('.add_label_list_item').addClass(checkbox.value);
      } else {
        console.log('Checkbox is unchecked');
      }
    });

    $(document).on("click", "#add_label_wrap #label_form_btn", function () {
      $("#memo_bg").remove();
      $("#close_btn").remove();
      $("#add_label_wrap").removeClass('active');
      $("#add_label_wrap02").removeClass('active');
    });

    //保存ボタンにもなっている
    $(document).on("click", "#add_label_wrap02 #label_form_btn", function () {

      var dataKeys = $("#add_label_list02 .add_label_list_item").map(function () {
        return $(this).data("key");
      }).get();
      console.log(dataKeys[0]);

      const memoPage = $('#' + dataKeys[0]);
      const title = memoPage.find(".title").html();
      const text = memoPage.find(".text_body").html();
      const color = memoPage.data("color");

      const labels = [];
      $('input[type="checkbox"].chk_label:checked').each(function () {
        let labelName = $(this).next('label').text();
        let labelValue = $(this).val();
        labels.push({ name: labelName, value: labelValue });
      });

      const msg = {
        title: title,
        text: text,
        color: color,
        labels: labels,
      };

      $("#add_label_wrap02").addClass('active');

      fetchAndDisplayData(dataKeys[0]);

      if ($("#memo_bg").length === 0) {
        $(".body").append("<div id='memo_bg'></div>");
      }
      if ($("#close_btn").length === 0) {
        $(".body").prepend("<div id='close_btn'>×</div>");
      }

      if (labels.length > 0) { // Only update if there are checked labels
        const updateRef = ref(db, "users/" + uid + "/memo/" + dataKeys[0]);
        update(updateRef, msg).then(() => {
          console.log("Update successful!");
        }).catch((error) => {
          console.error("Update failed: " + error.message);
        });
      }
      $("#memo_bg").remove();
      $("#close_btn").remove();
      $("#add_label_wrap02").removeClass('active');
      window.location.reload();
      // $("#memo_bg").remove();
      // $("#close_btn").remove();
    });
    //ラベル追加
    $(document).on("click", "#add_label_btn", function () {
      //やり直し
      let memo_page_num = "label" + ($('.add_label_list_item').length + 1);
      //console.log($("#add_label_input").val());
      const msg = {
        label: $("#add_label_input").val()
      }
      // $("#add_label_list").append('<li class="add_label_list_item" id="add_label_list_item'+memo_page_num+' data-key="'+  +'"><span class="remove_label_btn"></span><span class="label_name">'+msg.label+'</span><span class="update_label_btn"></span></li>');
      const dbRef = ref(db, "users/" + uid + "/memo_label/" + memo_page_num);
      set(dbRef, msg);
    });

    //ラベル編集欄のクリア
    $(document).on("click", "#clear_label_btn", function () {
      $("#add_label_input").val("");
    });

    //既存ラベルのアップデート
    $(document).on("click", ".update_label_btn", function () {
      $(this).toggleClass("active");

      const labelListItem = $(this).closest(".add_label_list_item");
      const key = labelListItem.data("key");
      const msg = {
        label: labelListItem.text()
      }
      console.log(msg.label);
      // console.log(uname, text); // Debugging output
      const updateRef = ref(db, "users/" + uid + "/memo_label/" + key);
      update(updateRef, msg).then(() => {
        console.log("Update successful!");
      }).catch((error) => {
        console.error("Update failed: " + error.message);
      });
    });

    $(document).on("click", ".remove_label_btn", function () {
      const labelListItem = $(this).closest(".add_label_list_item");
      const key = labelListItem.data("key");
      const dbRef = ref(db, "users/" + uid + "/memo_label/" + key);
      labelListItem.remove();
      remove(dbRef);
    });

    /* チャット機能の追加 */
    $("#chat-wrap .chat-header").on("click", chatHeader);
    function chatHeader() {
      $('#chat-wrap').toggleClass('active');
      if ($('#chat-wrap').hasClass('active')) {
        $("#chat-wrap .chat-header .chat-btn").html('<i class="bi bi-journal-arrow-down"></i>');
      } else {
        $("#chat-wrap .chat-header .chat-btn").html('<i class="bi bi-journal-arrow-up"></i>');
      }
    }

    //送信
    $("#send_chat").on("click", chat_send);
    let textBoxData;
    const dbRefChat = ref(db, "users/" + uid + "/chat");
    function chat_send() {
      const chatText = $("#chat-text").val() || '';
      const msg = {
        name: $("#uname").text(),
        chat: chatText
      }
      const data = push(dbRefChat);
      set(data, msg).then(() => {
        console.log("Chat saved successfully!");
      }).catch((error) => {
        console.error("Error sending message:", error);
      });
      // テキストボックスのデータを取得
      textBoxData = $("#chat-text").val();
      fetchAndCheckData(textBoxData);
    }

    //受信
    onChildAdded(dbRefChat, function (data) {
      const msg = data.val(); //ここでデータ取得
      const key = data.key;
      //console.log(msg);
      let h = "";
      if(msg.name == "pc-chat"){
        h += '<div role="list-item" class="chat-list-item pc-chat">';
      } else {
        h += '<div role="list-item" class="chat-list-item">';  
      }
      h += '<div class="chat-msg-name">';
      h += msg.name;
      h += '</div>';
      h += '<div class="chat-msg-text">';
      h += msg.chat;
      h += '';
      h += '</div>';
      $("#chat-area").append(h);
      $("#chat-area").animate({
        scrollTop: $("#chat-area")[0].scrollHeight
      }, 100);
    });

    let pc_chat;
    // データベースから全データを取得する関数
    function fetchAndCheckData(textBoxValue) {
      // const textBoxValue = $("#chat-text").val(); // チャットテキストボックスの値を取得
      const dbRef = ref(db, "users/" + uid + "/memo"); // データベース参照を設定

      get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
          const memos = snapshot.val();
          // メモデータをループしてテキストボックスの値で検索
          Object.keys(memos).forEach((key) => {
            const memo = memos[key];
            console.log(memo.text);
            if (memo.text && memo.text.includes(textBoxData)) {
              //データがあり、データの中にテキストボックスが含まれる時
              //一致した場合にチャットDBに保存
              const dbRefChat = ref(db, "users/" + uid + "/chat");
              const newChatRef = push(dbRefChat);
              set(newChatRef, {
                name: "pc-chat", // または他の識別可能な情報
                chat: "<h3>" + memo.title + "</h3><br>" + memo.text
              }).then(() => {
                console.log("Chat saved successfully!");
              }).catch((error) => {
                console.error("Failed to save chat:", error);
              });
            }
          });
        } else {
          console.log("No memo data available.");
        }
      }).catch((error) => {
        console.error("Failed to fetch memo data:", error);
      });
      // 関数を呼び出してデータを取得
      //fetchAllData();
    }


  } else {
    _redirect();  // User is signed out
  }

});
//###############################################
//Logout処理
//###############################################
$("#out").on("click", function () {
  // signInWithRedirect(auth, provider);
  signOut(auth).then(() => {
    // Sign-out successful.
    _redirect();
  }).catch((error) => {
    // An error happened.
    console.error(error);
  });
});

//###############################################
//Login画面へリダイレクト(関数作成)
//###############################################
function _redirect() {
  location.href = "login.html";
}

