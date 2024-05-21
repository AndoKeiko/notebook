
//###############################################
// 必要なJSを読み込み
//###############################################
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getDatabase, ref, push,
  set, get, onValue, onChildAdded, update, remove, onChildRemoved
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
// Firebase Storage のインポート
import {
  getAuth, signInWithPopup, GoogleAuthProvider,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

//###############################################
//FirebaseConfig [ KEYを取得して設定！！ ]
//###############################################
const firebaseConfig = {
  apiKey: "AIzaSyBVI_P4OzKWR_Rhl92nXv4jg1oDgZLMZtc",
  authDomain: "mnemonic-fc0e8.firebaseapp.com",
  databaseURL: "https://mnemonic-fc0e8-default-rtdb.firebaseio.com",
  projectId: "mnemonic-fc0e8",
  storageBucket: "mnemonic-fc0e8.appspot.com",
  messagingSenderId: "771953991768",
  appId: "1:771953991768:web:1a2e670d11dad8fc892a2d"
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

    //付箋風レイアウト
    //トップページにのみ有効
    const grid = document.getElementsByClassName('memo_list')[0];
    if (grid) {
      const allItems = document.getElementsByClassName('memo_page');
      const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
      const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
      // その他の処理


      const resizeGridItem = (item) => {
        const rowSpan = Math.ceil((item.querySelector('.masonry-content').getBoundingClientRect().height + rowGap + 60) / (rowHeight + rowGap));
        item.style.gridRowEnd = 'span ' + rowSpan;
        updateMemoOrder(); // グリッドアイテムの高さ調整後に順序を更新 curser
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
            title: $("#title").text(), // Default to null if undefined
            text: $("#text").text(),
            color: "",
            labels: {
              name: "",  // 緯度
              value: "",  // 経度
            },
            location: {
              lat: "",  // 緯度
              lon: "",  // 経度
              geocode: ""  // 地理コード
            }
          }
          if (typeof imageUrl !== 'undefined') {
            msg.images = imageUrl;
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

      //最初にデータ取得＆onSnapshotでリアルタイムにデータを取得
      const dbRef = ref(db, "users/" + uid + "/memo");
      onChildAdded(dbRef, function (data) {
        const msg = data.val(); //オブジェクトデータを取得し、変数msgに代入
        console.log(msg);
        const key = data.key; //データのユニークキー（削除や更新に使用可能）
        let html = '<div class="memo_page';
        if (msg.color && msg.color.length > 0) {
          html += " " + msg.color;
        }
        html += '" id="' + key + '" data-key="' + key + '" data-color="' + msg.color;
        html += '">';

        html += '<div class="masonry-content"><div class="title">' + msg.title + '</div>';

        if (msg.images && msg.images.length > 0) {
          html += '<div class="memo_image"><img src="' + msg.images + '" alt=""></div>';
        }

        html += '<div class="text_body">' + msg.text + '</div>';
        // 場所が配列で存在する場合、それぞれのラベルを表示
        //if (msg.location !== undefined) {
        html += '<div class="location_box">';
        var result = msg.location.geocode.split(',')[1];
        html += '<span class="location_label" data-lat="' + msg.location.lat + '" data-lon="' + msg.location.lon + '" data-geocode="' + msg.location.geocode + '">' + result + '</span>';
        console.log('<span class="location_label" data-lat="' + msg.location.lat + '" data-lon="' + msg.location.lon + '" data-geocode="' + msg.location.geocode + '">' + result + '</span>');
        //}
        html += '</div>';
        // }
        console.log(msg.location.lat);
        console.log(msg.labels);
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
        html += '<a class="memory" data-key="' + key + '" title="場所追加"><i class="bi bi-pin-map"></i></a>';
        // html += '<a class="reminder" data-key="' + key + '" title="リマインダー"><i class="bi bi-bell"></i></a>';
        html += '<a class="label" data-key="' + key + '" title="ラベルを追加"><i class="bi bi-bookmark"></i></a>';
        html += '<a class="pencil" data-key="' + key + '" title="編集"><i class="bi bi-pencil"></i></a>';
        html += '<a class="pallet" data-key="' + key + '" title="背景オプション"><i class="bi bi-palette"></i></a>';
        html += '<a class="trash" data-key="' + key + '" title="ゴミ箱"><i class="bi bi-trash3"></i></a>';
        html += '</div>';
        html += '</div></div>';
        // console.log(html);
        $("#memo_list").append(html);
        $("#title").html('');
        $("#text").html('');

        resizeAllGridItems();
        $("#memo_list .memo_page").attr('contenteditable', 'false');
        lastKey = data.key;
      });

      // $(document).on("click", ".location_label", function () {
      //   let memoPage = $(this).closest('.memo_page');
      //   let dataKey = memoPage.attr('data-key');
      //   console.log(dataKey);
      //   $('#add_label_wrap03').addClass('active');
      //   $('#add_label_wrap03').attr('data-key', dataKey);
      // });



      $(document).on("click", ".location_label", function () {
        let memoPage = $(this).closest('.memo_page');
        let dataKey = memoPage.attr('data-key');
        console.log(dataKey);
        $('#add_label_wrap03').addClass('active');
        $('#add_label_wrap03').attr('data-key', dataKey);
        //     // Firebaseからデータを取得
        const mapRef = ref(db, "users/" + uid + "/memo/" + dataKey);
        onValue(mapRef, (snapshot) => {
          const msg = snapshot.val();
          if (msg) {
            // order に基づいてメモの DOM 要素を並び替え
            let lat = msg.location.lat;
            let lon = msg.location.lon;
            let geocode = msg.location.geocode
            $("#lat_hidden").val(lat);
            $("#lon_hidden").val(lon);
            $("#geo_hidden").val(geocode);
            // マップの中心を更新
            // let map = new Bmap("#map");
            // map.startMap(lat, lon, "load", 15);
          } else {
            // lat = data.coords.latitude;
            // lon = data.coords.longitude;
          }
        });
        updateLocation();
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
        // console.log("Key:", key, "Data:", msg);

        html2 = '<li class="add_label_list_item html2" id="' + key + '" data-key="' + key + '" contenteditable><span class="remove_label_btn"></span>' + msg.label + '<span class="update_label_btn"></span></li>';
        html3 = '<li class="add_label_list_item html3" id="' + key + '" data-key="' + key + '">' + msg.label + '</li>';
        $("#add_label_list").append(html2);
        $("#side_category_list").append(html3);
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
          if (memoList) {
            memoList.innerHTML = '';
            orderedElements.forEach((element) => {
              memoList.appendChild(element);
            });
          } else {
            console.error('指定されたIDを持つ要素が見つかりません。');
          }
        }
      });

      // データ更新
      $(document).on("click", ".pencil", function () {
        const key = $(this).data("key");
        const memoPage = $(this).closest(".memo_page");
        const msg = {
          title: memoPage.find(".title").html(), // Default to null if undefined
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

      $(document).on("click", "#map_decision_btn", function () {
        memory_key = $(this).closest("#add_label_wrap03").data("key")
        console.log(memory_key);
        const msg = {
          location: {
            lat: lat,  // 緯度
            lon: lon,  // 経度
            geocode: geocode  // 地理コード
          }
        }
        const updateRef = ref(db, "users/" + uid + "/memo/" + memory_key);
        update(updateRef, msg).then(() => {
          console.log("Update successful!");
          alert("Update successful!");
        }).catch((error) => {
          console.error("Update failed: " + error.message);
        });
      });

      $(document).on("click", "#map_clear_btn", function () {
        console.log(memory_key);
        const msg = {
          location: {
            lat: "",  // 緯度
            lon: "",  // 経度
            geocode: ""  // 地理コード
          }
        }
        if (lat === undefined || lon === undefined || geocode === undefined) {
        }
        const updateRef = ref(db, "users/" + uid + "/memo/" + memory_key);
        update(updateRef, msg).then(() => {
          console.log("Update successful!");
        }).catch((error) => {
          console.error("Update failed: " + error.message);
        });
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





      //html要素を取得をしてSortableJSに設定します
      if ($('#memo_list').length > 0) {
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
      }

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
          fetchAndDisplayData(); //サイドメニューだからkeyいらん
        }

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
          labels.push({
            name: labelName,
            value: labelValue
          });
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

      function MaxKeyGet_label() {
        return new Promise((resolve, reject) => {
          const dbRef = ref(db, "users/" + uid + "/memo_label");
          get(dbRef).then((data) => {
            const items = data.val(); //全データ
            let nextKey = 0;

            if (items) {
              const keys = Object.keys(items); // キーの配列を取得
              const numericKeys = keys.map(key => parseInt(key.replace(/\D/g, ''), 10));
              // 数値部分を抽出し、元の配列とは別の配列（数字のみ）を作って変数に入れる
              const maxKey = Math.max(...numericKeys); // 最大値を計算
              nextKey = maxKey + 1;
              resolve(nextKey);
            } else {
              nextKey = "1";
              resolve(nextKey);
            }
          }).catch((error) => {
            console.error("エラーが発生しました: ", error);
            reject(error);
          });
        });
      }
      //ラベル追加
      $(document).on("click", "#add_label_btn", function () {
        MaxKeyGet_label().then(nextKey => {
          const msg = {
            label: $("#add_label_input").val()
          }
          const dbRef = ref(db, "users/" + uid + "/memo_label/" + nextKey);
          set(dbRef, msg);
          $("add_label_input").val("");
        }).catch(error => {
          console.error("キーの取得に失敗しました: ", error);
        });

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
      console.log('memo_list クラスを持つ要素が見つかりません。');
      //geolocationページ分
      //最初にデータ取得＆onSnapshotでリアルタイムにデータを取得
      const dbRef = ref(db, "users/" + uid + "/memo");
      let jsonArray = [];
      onChildAdded(dbRef, function (data) {
        const msg = data.val(); //オブジェクトデータを取得し、変数msgに代入
        jsonArray.push(msg);

        $("#json_box").text(JSON.stringify(jsonArray));
        localStorage.setItem('jsonData', JSON.stringify(jsonArray));
      });


      //送信      
      // 保存ボタンのクリックイベント
      if($("#draw-save-btn").length > 0) {
        document.getElementById('draw-save-btn').addEventListener('click', function () {
          // canvas要素を取得
          const canvas = document.getElementById('draw-area');
          // Base64形式の画像URLを取得
          const dataURL = canvas.toDataURL('image/png');
          // Firebase Storageの参照を取得
          // DataURLからBlobデータを生成
          const dbRef = ref(db, "users/" + uid + "/draw");
          const newDrawRef = push(dbRef);
          set(newDrawRef, {
            image: dataURL,
            timestamp: Date.now()  // 現在の日時をミリ秒で保存
          });
        });
      }
      //受信
      const newDrawRef = ref(db, "users/" + uid + "/draw");
      onChildAdded(newDrawRef, function (data) {
        const msg = data.val(); //ここでデータ取得
        console.log(msg.image);
        const key = data.key;
        //console.log(msg);
        let h = "";
        h += '<div class="draw-img" role="list"><img src="';
        h += msg.image;
        h += '" width="200" height="200" alt=""></div>';
        if ($("#draw_list").length > 0) {
          $("#draw_list").append(h);
        }
      });







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