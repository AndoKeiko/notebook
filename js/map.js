//マップ入力画面
function updateLocation() {
  // マップを更新
  GetMap();
}

function GetMap() {
  let pin;
  let lat;
  let lon;
  let geo;
  // if (document.getElementById("lat_hidden").value && document.getElementById("lon_hidden").value && document.getElementById("geo_hidden").value) {
    lat = document.getElementById("lat_hidden").value;
    lon = document.getElementById("lon_hidden").value;
    geo = document.getElementById("geo_hidden").value;
  // } else {
  //   console.error("Element not found: Check if 'lat_hidden', 'lon_hidden', or 'geo_hidden' exist in the HTML.");
  //   return;
  // }
  
  console.log(geo);
  let map = new Bmap("#map");

  map.geolocation(function (data) {
    if (lat == "" || lon == "") {
      //location
      lat = data.coords.latitude;
      lon = data.coords.longitude;
    }

    // 緯度と経度の値が有効かチェック
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      console.error('Invalid latitude or longitude');
      return;
    }

    console.log(lat);
    console.log(lon);
    //Map
    map.startMap(lat, lon, "load", 15);
    //pin
    pin = map.pinIcon(lat, lon, "./img/poi_custom.png", 1.0, 0, 0);
    //A. Set location data for BingMaps
    let location = map.setLocation(lat, lon);
    //const location = map.getCenter(); //MapCenter
    map.reverseGeocode(location, function (data) {
      if (geo == "") {
        var result = data.split(',')[1];
        document.querySelector("#geocode").innerHTML = result;
      } else {
        document.querySelector("#geocode").innerHTML = geo;
      }
    });
    map.onGeocode("click", function (clickPoint) {
      console.log(clickPoint.location.latitude);
      map.reverseGeocode(clickPoint.location, function (data) {
        console.log(data);
        document.querySelector("#geocode").innerHTML = data;
        const event = new CustomEvent('locationUpdated', { detail: { lat: clickPoint.location.latitude, lon: clickPoint.location.longitude, geocode: data } });
        document.dispatchEvent(event);
      });
      map.deletePin();
      pin = map.pinIcon(clickPoint.location.latitude, clickPoint.location.longitude, "./img/poi_custom.png", 1.0, 0, 0);

    });
  });
}
$("#lat_hidden").change(function () {
  GetMap();
});

//#add_label_wrap03
$(document).on("click", "#map_close_btn", function () {
  $("#memo_bg").remove();
  $("#close_btn").remove();
  $('.memo_page.active').removeClass('active');
  $("#add_label_wrap03").removeClass('active');
});
$("#mnemonic-btn").on("click", function () {
  $("#popup-wrapper02").toggleClass('active');
});
$("#popup-wrapper02").on("click", function () {
  $("#popup-wrapper02").removeClass("active");
});
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
//ファイルアップ
let imageUrl;
$(function () {
  $('#upfile').change(function (e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    if (file.type.indexOf('image') < 0) {
      alert("画像ファイルを指定してください。");
      return false;
    }
    reader.onload = (function (file) {
      return function (e) {
        $('#upimage').attr('src', e.target.result);
        $('#upimage').attr('title', file.name);
        imageUrl = e.target.result; // 画像のDataURLが取得できる
        console.log(imageUrl); // コンソールにDataURLを出力
      };
    })(file);
    reader.readAsDataURL(file);
  });
});
$(document).on("click", "#add_label_wrap04 #map_close_btn", function () {
  $("#add_label_wrap03").removeClass("active");
  $("#memo_bg").remove();
  $("#close_btn").remove();
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
});
let lat;
let lon;
let geocode;
let memory_key;
//地図を開いて場所を指定する
$(document).on("click", ".tool_box .memory", function () {
  memory_key = $(this).data('key');
  $("#add_label_wrap03").addClass('active');
  $("#add_label_wrap03").attr("data-key", memory_key);

  if ($("#memo_bg").length === 0) {
    $(".body").append("<div id='memo_bg'></div>");
  }
  if ($("#close_btn").length === 0) {
    $(".body").prepend("<div id='close_btn'>×</div>");
  }
});
document.addEventListener('locationUpdated', function (e) {
  console.log(e.detail.lat, e.detail.lon, e.detail.geocode);
  lat = e.detail.lat;
  lon = e.detail.lon;
  geocode = e.detail.geocode;
});
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
    color: color
    // title: memo_box.find(".title").html(),  // Default to null if undefined
    // text: memo_box.find(".text_body").html()
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
    $("#chat-wrap .chat-header .chat-btn").html('<i class="bi bi-journal-arrow-down"></i>');
  } else {
    $("#chat-wrap .chat-header .chat-btn").html('<i class="bi bi-journal-arrow-up"></i>');
  }
}