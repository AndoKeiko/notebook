//###############################################
// 必要なJSを読み込み
//###############################################
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  onValue,
  onChildAdded,
  update,
  remove,
  onChildRemoved
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
// Firebase Storage のインポート
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

//###############################################
//FirebaseConfig [ KEYを取得して設定！！ ]
//###############################################
const firebaseConfig = {
  apiKey: "AIzaSyCqdfsPbivh4W3syxeyfR7PTNX3VVQg2yU",
  authDomain: "notebook-e4868.firebaseapp.com",
  projectId: "notebook-e4868",
  storageBucket: "notebook-e4868.appspot.com",
  messagingSenderId: "362022666601",
  appId: "1:362022666601:web:a53a69ff45bb752e117df8"
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
        $("#uname02").text(profile.displayName);
        $("#prof").attr("src", profile.photoURL);
        $("#umail").text(profile.email);
        // console.log("Sign-in provider: " + profile.providerId);
        // console.log("Provider-specific UID: " + profile.uid);
        // console.log("Email: " + profile.email);
        // console.log("Photo URL: " + profile.photoURL);
      });
      $("#status").fadeOut(500);
    }

    // その他の処理

    let lastKey = "note0";
    //データ登録(Click)
    function MaxKeyGet() {
      return new Promise((resolve, reject) => {
        const dbRef = ref(db, "users/" + uid + "/note");
        get(dbRef).then((data) => {
          const items = data.val(); //全データ
          let nextKey = 0;

          if (items) {
            const keys = Object.keys(items); // キーの配列を取得
            const numericKeys = keys.map(key => parseInt(key.replace(/\D/g, ''), 10)); // 数値部分を抽出
            const maxKey = Math.max(...numericKeys); // 最大値を計算
            nextKey = "note" + (maxKey + 1);
            resolve(nextKey);
          } else {
            nextKey = "note1";
            resolve(nextKey);
          }
        }).catch((error) => {
          console.error("エラーが発生しました: ", error);
          reject(error);
        });
      });
    }
    let lastKey02 = "source0";
    function MaxKeyGet02() {
      return new Promise((resolve, reject) => {
        const dbRef = ref(db, "users/" + uid + "/source");
        get(dbRef).then((data) => {
          const items = data.val(); //全データ
          let nextKey = 0;

          if (items) {
            const keys = Object.keys(items); // キーの配列を取得
            const numericKeys = keys.map(key => parseInt(key.replace(/\D/g, ''), 10)); // 数値部分を抽出
            const maxKey = Math.max(...numericKeys); // 最大値を計算
            nextKey = "source" + (maxKey + 1);
            resolve(nextKey);
          } else {
            nextKey = "source1";
            resolve(nextKey);
          }
        }).catch((error) => {
          console.error("エラーが発生しました: ", error);
          reject(error);
        });
      });
    }
    let lastKey03 = "img0";
    function MaxKeyGet03() {
      return new Promise((resolve, reject) => {
        const dbRef = ref(db, "users/" + uid + "/img");
        get(dbRef).then((data) => {
          const items = data.val(); //全データ
          let nextKey = 0;

          if (items) {
            const keys = Object.keys(items); // キーの配列を取得
            const numericKeys = keys.map(key => parseInt(key.replace(/\D/g, ''), 10)); // 数値部分を抽出
            const maxKey = Math.max(...numericKeys); // 最大値を計算
            nextKey = "img" + (maxKey + 1);
            resolve(nextKey);
          } else {
            nextKey = "img1";
            resolve(nextKey);
          }
        }).catch((error) => {
          console.error("エラーが発生しました: ", error);
          reject(error);
        });
      });
    }

    function escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    }

    $("#editor_title").on("input", function () {
      $("#hidden_editor_title").val($(this).text());
    });
    //#editor_textをinput時にhiddenに入れる
    $("#editor_text").on("input", function () {
      // $("#hidden_editor_text").val(this.innerHTML);
      $("#hidden_editor_text").val($(this).html());
    });

    // データ登録(Click)の部分を修正
    $("#editor_btn_save").on("click", function () {
      // URLからkeyパラメータを取得
      let url = new URL(window.location.href);
      let urlParams = url.searchParams;
      const key = urlParams.get('key');
      console.log(key);
      const buttonClass = $(this).attr("class");
      console.log("Button class:", buttonClass);
      if (key) {
        if (buttonClass == "content1") {
          const msg = {
            title: $("#hidden_editor_title").val(), // Default to null if undefined
            text: $("#hidden_editor_text").val()
          }
          const updateRef = ref(db, "users/" + uid + "/note/" + key);
          update(updateRef, msg).then(() => {
            console.log("Update successful!");
            $("#editor_title").html('');
            $("#editor_text").html('');
            $("#hidden_editor_title").val('');
            $("#hidden_editor_text").val('');
            $("#html-code").val('');
            $("#css-code").val('');
            $("#js-code").val('');
            $('#image-board').empty();
            $('#preview-frame').empty();
            $("#paste-area").html('');
          }).catch((error) => {
            console.error("Update failed: " + error.message);
          });

        }
        if (buttonClass == "content2") {
          const msg = {
            title: $("#editor_title02").val(),
            html: $("#html-code").val(),
            css: $("#css-code").val(),
            js: $("#js-code").val(),
          }
          const updateRef = ref(db, "users/" + uid + "/source/" + key);
          update(updateRef, msg).then(() => {
            console.log("Update successful!");
          }).catch((error) => {
            console.error("Update failed: " + error.message);
          });
          $("#editor_title").val('');
          $("#editor_text").val('');
          $("#html-code").val('');
          $("#css-code").val('');
          $("#js-code").val('');
          $("#preview-frame").html('');
          $("#paste-area").html('');
        }
        if (buttonClass == "content3") {
          
        }
      } else {
        if (buttonClass == "content1") {
          MaxKeyGet().then(nextKey => {
            const currentDate = new Date().toISOString();
            const orderIndex = parseInt(nextKey.replace(/\D/g, ''), 10);

            const msg = {
              order: orderIndex,
              date: currentDate,
              color: "",
              title: $("#hidden_editor_title").val(),
              text: $("#hidden_editor_text").val(),//escapeHTML($("#editor_text").html()),
              labels: {
                name: "",  // 緯度
                value: "",  // 経度
              },
            }
            const dbRef = ref(db, "users/" + uid + "/note/" + nextKey);
            set(dbRef, msg);
            $("#editor_title").html('');
            $("#editor_text").html('');
            $("#hidden_editor_title").val('');
            $("#hidden_editor_text").val('');
            $("#html-code").val('');
            $("#css-code").val('');
            $("#js-code").val('');
            $("#preview-frame").html('');
            $("#paste-area").html('');

          }).catch(error => {
            console.error("キーの取得に失敗しました: ", error);
          });
        }

        if (buttonClass == "content2") {
          MaxKeyGet02().then(nextKey => {
            const currentDate = new Date().toISOString();
            const orderIndex = parseInt(nextKey.replace(/\D/g, ''), 10);
            const msg = {
              order: orderIndex,
              title: $("#editor_title02").val(),
              date: currentDate,
              html: $("#html-code").val(),
              css: $("#css-code").val(),
              js: $("#js-code").val(),
              labels: {
                name: "",  // 緯度
                value: "",  // 経度
              },
            }
            const dbRef = ref(db, "users/" + uid + "/source/" + nextKey);
            set(dbRef, msg);
            $("#editor_title").val('');
            $("#editor_text").val('');
            $("#html-code").val('');
            $("#css-code").val('');
            $("#js-code").val('');
            $("#preview-frame").html('');
            $("#paste-area").html('');

          }).catch(error => {
            console.error("キーの取得に失敗しました: ", error);
          });
        }

        if (buttonClass == "content3") {
          MaxKeyGet03().then(nextKey => {
            const currentDate = new Date().toISOString();
            const orderIndex = parseInt(nextKey.replace(/\D/g, ''), 10);
            const imgElements = document.querySelectorAll('#image-board img');

            console.log(imgElements);
            imgElements.forEach((imgElement, index) => {
              const imgSrc = imgElement.src;
              console.log(`Image ${index}:`, imgSrc);
              const msg = {
                order: orderIndex,
                title: "",
                date: currentDate,
                src: imgSrc,
                url: "",
                apr: "",
                source: "",
                labels: {
                  name: "",  // 緯度
                  value: "",  // 経度
                },
              }
              const dbRef = ref(db, "users/" + uid + "/img/" + nextKey);
              set(dbRef, msg);
            });
            $("#editor_title").val('');
            $("#editor_text").val('');
            $("#html-code").val('');
            $("#css-code").val('');
            $("#js-code").val('');
            $("#preview-frame").html('');
            $("#paste-area").html('');

          }).catch(error => {
            console.error("キーの取得に失敗しました: ", error);
          });
        }
      }
    });

    //最初にデータ取得＆onSnapshotでリアルタイムにデータを取得
    const dbRef = ref(db, "users/" + uid + "/note");
    onChildAdded(dbRef, function (data) {
      const msg = data.val(); //オブジェクトデータを取得し、変数msgに代入
      // console.log(msg);
      const key = data.key; //データのユニークキー（削除や更新に使用可能）
      let html = "<div class='note-board-item";
      if (msg.color && msg.color.length > 0) {
        html += " " + msg.color;
      }
      html += "'data-key='" + key + "'>";
      html += "<input type='checkbox' class='note-board-item-checkbox' value='" + key + "'>";
      html += "<div class='note-board-item-title'>" + msg.title + "</div>";
      html += "<div class='note-board-item-text'>" +msg.text + "</div>";
      html += '<div class="tool_box"><a class="label" data-key="' + key + '" title="ラベルを追加"><i class="bi bi-bookmark"></i></a><a class="trash" data-key="' + key + '" title="ゴミ箱"><i class="bi bi-trash3"></i></a><a class="pallet" data-key="' + key + '" title="背景オプション"><i class="bi bi-palette"></i></a></div>';
      html += "</div>";
      $("#note-board").append(html);
      $(".note-board-item").css("overflow","hidden");
      lastKey = data.key;
    });
    //最初にデータ取得＆onSnapshotでリアルタイムにデータを取得
    const dbRef02 = ref(db, "users/" + uid + "/source");
    onChildAdded(dbRef02, function (data) {
      const msg = data.val(); //オブジェクトデータを取得し、変数msgに代入
      // console.log(msg);
      const key = data.key; //データのユニークキー（削除や更新に使用可能）
      let html = "<div class='editor-board-item' data-key='" + key + "'>";
      html += "<input type='checkbox' class='editor-board-item-checkbox' value='" + key + "'>";
      html += "<div>" + msg.title + "</div>";
      html += "<div>" + msg.html + "</div>";
      // html += "<div>" + escapeHtml(msg.html) + "</div>";
      html += "<div>" + msg.css + "</div>";
      html += "<div>" + msg.js + "</div>";
      html += '<div class="tool_box"><a class="label" data-key="' + key + '" title="ラベルを追加"><i class="bi bi-bookmark"></i></a><a class="trash" data-key="' + key + '" title="ゴミ箱"><i class="bi bi-trash3"></i></a><a class="pallet" data-key="' + key + '" title="背景オプション"><i class="bi bi-palette"></i></a></div>';
      html += "</div>";
      $("#editor-board").append(html);
      lastKey02 = data.key;
    });
    //最初にデータ取得＆onSnapshotでリアルタイムにデータを取得
    const dbRef03 = ref(db, "users/" + uid + "/img");
    onChildAdded(dbRef03, function (data) {
      const msg = data.val(); //オブジェクトデータを取得し、変数msgに代入
      // console.log(msg);
      const key = data.key; //データのユニークキー（削除や更新に使用可能）
      let html = "<div class='image-board-item' data-key='" + key + "'>";
      html += "<input type='checkbox' class='image-board-item-checkbox' value='" + key + "'>";
      html += "<img src='" + msg.src + "'/>";
      html += '<div class="tool_box"><a class="label" data-key="' + key + '" title="ラベルを追加"><i class="bi bi-bookmark"></i></a><a class="trash" data-key="' + key + '" title="ゴミ箱"><i class="bi bi-trash3"></i></a><a class="pallet" data-key="' + key + '" title="背景オプション"><i class="bi bi-palette"></i></a></div>';
      html += "</div>";
      $("#image-board02").append(html);
      lastKey03 = data.key;
    });

    function deleteSelectedItems() {
      const selectedNoteItems = document.querySelectorAll('.note-board-item-checkbox:checked');
      const selectedSourceItems = document.querySelectorAll('.editor-board-item-checkbox:checked');
      const selectedImageItems = document.querySelectorAll('.image-board-item-checkbox:checked');
      const selectedItems = [...selectedNoteItems, ...selectedSourceItems, ...selectedImageItems];

      selectedItems.forEach(item => {
        const key = item.value;
        const parentClass = item.closest('div').className;
        let dbRef;
        if (parentClass.includes('note-board-item')) {
          dbRef = ref(db, "users/" + uid + "/note/" + key);
        } else if (parentClass.includes('editor-board-item')) {
          dbRef = ref(db, "users/" + uid + "/source/" + key);
        } else if (parentClass.includes('image-board-item')) {
          dbRef = ref(db, "users/" + uid + "/img/" + key);
        }

        if (dbRef) {
          remove(dbRef).then(() => {
            console.log(`Item with key ${key} deleted successfully!`);
            item.closest('div').remove(); // DOMからも削除
          }).catch((error) => {
            console.error(`Failed to delete item with key ${key}: `, error);
          });
        }
      });
    }

    if ($('#editor_btn_delete').length > 0) {
      document.getElementById('editor_btn_delete').addEventListener('click', deleteSelectedItems);
    }
      // $(document).on("click", ".location_label", function () {
      //   let memoPage = $(this).closest('.memo_page');
      //   let dataKey = memoPage.attr('data-key');
      //   console.log(dataKey);
      //   $('#add_label_wrap03').addClass('active');
      //   $('#add_label_wrap03').attr('data-key', dataKey);
      //   //     // Firebaseからデータを取得
      //   const mapRef = ref(db, "users/" + uid + "/note/" + dataKey);
      //   onValue(mapRef, (snapshot) => {
      //     const msg = snapshot.val();
      //     if (msg) {
      //       // order に基づいてメモの DOM 要素を並び替え
      //       let lat = msg.location.lat;
      //       let lon = msg.location.lon;
      //       let geocode = msg.location.geocode
      //       $("#lat_hidden").val(lat);
      //       $("#lon_hidden").val(lon);
      //       $("#geo_hidden").val(geocode);
      //       // マップの中心を更新
      //       // let map = new Bmap("#map");
      //       // map.startMap(lat, lon, "load", 15);
      //     } else {
      //       // lat = data.coords.latitude;
      //       // lon = data.coords.longitude;
      //     }
      //   });
      //   updateLocation();
      // });
   
      $(document).on("click", ".trash", function () { //削除
        const parentItem = $(this).closest('.note-board-item, .editor-board-item, .image-board-item');
        const key = parentItem.data('key');
        const parentClass = parentItem.attr('class');
      
        let dbRef;
        if (parentClass.includes('note-board-item')) {
          dbRef = ref(db, "users/" + uid + "/note/" + key);
        } else if (parentClass.includes('editor-board-item')) {
          dbRef = ref(db, "users/" + uid + "/source/" + key);
        } else if (parentClass.includes('image-board-item')) {
          dbRef = ref(db, "users/" + uid + "/img/" + key);
        }
        remove(dbRef);
        //firebase.database().ref('memo/' + memoId).remove();
      });
      $(document).on("click", ".pallet", function () {//カラー
        const memo_box = $(this).closest('.note-board-item, .editor-board-item, .image-board-item');
        const palletBox = memo_box.find(".pallet_box");
        palletBox.toggleClass("active");
        console.log(memo_box.find(".pallet_box").children());
        if (palletBox.find(".pallet_box").children().length == 0) {
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
  
          if (palletBox.length === 0) {
            memo_box.append(html);
          }
        }
        // $(this).on("mouseleave", function () {
        //   palletBox.removeClass("active");
        // });
      }); 
      $(document).on("click",".pallet_box > div", function () { //色の選択
        //色の選択ボタンを押した時

        const parentItem = $(this).closest('.note-board-item, .editor-board-item, .image-board-item');
        const pallet_box = $(this).closest(".pallet_box");
        // pallet_box.removeClass("active");
        const colorClass = $(this).data("color");
        console.log(colorClass);
        // let class_name = $(this).attr('class'); 
        parentItem.addClass(colorClass);
        const key = parentItem.data('key');
        console.log(key);
        const parentClass = parentItem.attr('class');

        
        let dbRef;
        if (parentClass.includes('note-board-item')) {
          dbRef = ref(db, "users/" + uid + "/note/" + key);
        } else if (parentClass.includes('editor-board-item')) {
          dbRef = ref(db, "users/" + uid + "/source/" + key);
        } else if (parentClass.includes('image-board-item')) {
          dbRef = ref(db, "users/" + uid + "/img/" + key);
        }
        if (dbRef) {
          get(dbRef).then((snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              data.color = colorClass; // 色を更新
              update(dbRef, data).then(() => {
                console.log("記事の更新に成功しました！");
              }).catch((error) => {
                console.error("記事の更新に失敗しました: ", error);
              });
            } else {
              console.log("記事が見つかりませんでした。");
            }
          }).catch((error) => {
            console.error("データの取得に失敗しました: ", error);
          });
        }
      });
    //サイドメニュー
    const sideRef = ref(db, "users/" + uid + "/note_label");
    let html2;
    let html3;
    onChildAdded(sideRef, function (data02) {
      // let i = 0;
      // i++;
      const msg = data02.val();
      const key = data02.key;
      // console.log("Key:", key, "Data:", msg);

      html2 = '<li class="add_label_list_item html2" id="' + key + '" data-key="' + key + '" contenteditable><span class="remove_label_btn"></span>' + msg.label + '<span class="update_label_btn"></span></li>';
      html3 = '<li class="add_label_list_item html3" id="' + key + '" data-key="' + key + '">' + msg.label + '</li>';
      $("#add_label_list").append(html2);
      $("#side_category_list").append(html3);
    });


    // ラベルを追加

    //ここのkeyを取るところから
    function fetchAndDisplayData(key) {
      $("#add_label_list").empty();
      $("#add_label_list02").empty();
      const sideRef = ref(db, "users/" + uid + "/note_label");
      onChildAdded(sideRef, function (data02) {
        // let i;
        // i++;
        const msg = data02.val();
        //const dataKey = data02.key;
        const dataKey = key || data02.key;
        //console.log(dataKey);
        //if ($("#add_label_list").children().length === 0) {
        let html4 = '<li class="add_label_list_item html4" id="' + dataKey + '" data-key="' + data02.key + '" contenteditable><span class="remove_label_btn"></span>' + msg.label + '<span class="update_label_btn"></span></li>';
        $("#add_label_list").append(html4);
        //}
        //if ($("#add_label_list02").children().length === 0) {
        let html5 = '<li class="add_label_list_item html5" id="' + dataKey + '" data-memo="" data-key="' + dataKey + '" contenteditable><input type="checkbox" id="chk_label" class="chk_label" value="' + data02.key + '" name="chk_label" name="scales" /><label for="scales">' + msg.label + '</label></li>';

        $("#add_label_list02").append(html5);
        $("#add_label_list02 .add_label_list_item").attr('data-memo', dataKey);
        //}
      });
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
      if (msg.name == "pc-chat") {
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
      if ($("#chat-area").length > 0) {
        $("#chat-area").append(h);
        $("#chat-area").animate({
          scrollTop: $("#chat-area")[0].scrollHeight
        }, 100);
      }
    });

    let pc_chat;
    // データベースから全データを取得する関数
    function fetchAndCheckData(textBoxValue) {
      // const textBoxValue = $("#chat-text").val(); // チャットテキストボックスの値を取得
      const dbRef = ref(db, "users/" + uid + "/note"); // データベース参照を設定

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

    //ここから、
    if (document.body.id === 'notebook') {
      const activeTab = localStorage.getItem('activeTab');
      console.log(activeTab);
      if (activeTab) {
        document.querySelector(`.tab[data-target="${activeTab}"]`).click();
        let CollectionName;
        if (activeTab == "content1") {
          CollectionName = "note";
        } else if (activeTab == "content2") {
          CollectionName = "source";
        } else {
          CollectionName = "img";
        }
        // URLからkeyパラメータを取得
        let url = new URL(window.location.href);
        let urlParams = url.searchParams;
        // const urlParams = new URLSearchParams(window.location.search);
        // console.log(url.searchParams);
        const key = urlParams.get('key');
        console.log(key);
        if (key) {//0521見直すかもしれない場所
          // Firebaseからデータを取得
          const orderRef = ref(db, "users/" + uid + "/" + CollectionName + "/" + key);
          onValue(orderRef, (snapshot) => {
            const data = snapshot.val();
            // db.collection(CollectionName).doc(key).get().then((doc) => {
            console.log(CollectionName);
            if (data) {
              if (CollectionName == "note") {
                document.getElementById('editor_title').innerHTML = data.title;
                document.getElementById('editor_text').innerHTML = data.text;
                document.getElementById('hidden_editor_title').value = data.title;
                document.getElementById('hidden_editor_text').value = data.text;
              } else if (CollectionName == "source") {
                console.log(data);
                document.getElementById('editor_title02').value = data.title;
                document.getElementById('html-code').value = data.html;
                document.getElementById('css-code').value = data.css;
                document.getElementById('js-code').value = data.js;
              } else {
                //まだ仕組みを作っていないけど、タイトル取って来たところのデータなどいろいろ変更できるようにするつもり
              }
            } else {
              console.log('No such document!');
            }
          });
        }
      }
    } else {
      // 初期設定として最初のタブをアクティブにする
      document.querySelector('.tab').click();
    }
















  } else {
    _redirect(); // User is signed out
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
  location.href = "login02.html";
}