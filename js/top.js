$("#side_open_btn").on("click", function(){
  $(".side_nav").toggleClass("close");
  $(".main").toggleClass("open");
  $(this).toggleClass("open");
});
// document.addEventListener('DOMContentLoaded', function() {
//   if (!window.location.href.includes('top.html')) {
//   // リンクにイベントリスナーを設定
//   document.querySelectorAll('a.search_function_item').forEach(link => {
//       link.addEventListener('click', function(event) {
//           event.preventDefault(); // デフォルトのリンク動作をキャンセル

//           // fetch APIを使用してサーバーからコンテンツを取得
//           fetch(this.href)
//               .then(response => response.text()) // レスポンスをテキストとして取得
//               .then(html => {
//                   // コンテンツをページに挿入
//                   document.getElementById('content').innerHTML = html;
//               })
//               .catch(error => console.error('Error loading the page: ', error));
//       });
//   });
// }
// });