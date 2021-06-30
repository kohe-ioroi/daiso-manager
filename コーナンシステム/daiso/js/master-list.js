var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
function init() {
  showTable();
}
function showTable() {
  showload();
  $.when(
    TableGet("Daiso_Master")
  ).done(function (data) {
    showmain();
    obj = data;
    try {
      list = [];
      Object.keys(obj).forEach((i) => { list.push(obj[i]) });
      list.sort(funcCompare);
      $('#columns').columns({
        data: list,
        schema: [
          { "header": "商品名", "key": "ItemName" },
          { "header": "JANコード", "key": "JAN", "template": '<div name="JANCODE">{{JAN}}</div>' },
          { "header": "価格", "key": "Price" },
          { "header": "重複", "key": "isDoubled" },
          { "header": "食品", "key": "isFood" },
        ],
        size: 100,
        showRows: [-1, 30, 50, 100, 1000, 10000]
      })
    } catch (e) {
      alert(e);
    }
  })
}
function showload() {
  $("#message").text("処理中")
  $("#main").fadeOut(50);
  $("#load").fadeIn(50);
}
function showmain() {
  $("#load").fadeOut(50);
  $("#main").fadeIn(50);
}