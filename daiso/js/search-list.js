var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
var arrayd;
function init()
{
  if (new Date(localStorage.getItem("Daiso_Update")) < new Date(new Date().setDate(new Date().getDate() - 1))) {
    showPopup("ローカルデータの更新を開始。終了までしばらくお待ち下さい。");
    $("#search").prop('disabled', true);
    $.when(TableGet("Daiso")).done(
      function (data)
      {
        arrayls = {};
        Object.keys(data).forEach(function (i)
        {
          if (data[i]["Daiban"] != "XXXX") {
            arrayls[i] = data[i];
          }
        });
        localStorage.setItem("Daiso_Data", JSON.stringify(arrayls));
        localStorage.setItem("Daiso_Update", String(new Date()));
        arrayd = JSON.parse(localStorage.getItem("Daiso_Data"));
        showPopup("更新が完了しました。");
        $("#search").prop('disabled', false);
      }
    );
  } else {
    showPopup("現在ローカルデータを使用しています。");
    arrayd = JSON.parse(localStorage.getItem("Daiso_Data"));
    showmain();
    $("#search").focus();
  }
  document.getElementById("search").oninput = function () { if ($('#search').val().length >= 3) { showTable($('#search').val()); } };
}
function downloadAll()
{
  $("#download").fadeOut();
  showPopup("サーバー内最新データを受信中...");
  $("#search").prop('disabled', true);
  $.when(TableGet("Daiso")).done(
    function (data)
    {
      arrayls = {};
      Object.keys(data).forEach(function (i)
      {
        if (data[i]["Daiban"] != "XXXX") {
          arrayls[i] = data[i];
        }
      });
      localStorage.setItem("Daiso_Data", JSON.stringify(arrayls));
      localStorage.setItem("Daiso_Update", String(new Date()));
      arrayd = data;
      showTable($('#search').val());
      showPopup("更新が完了しました。");
      $("#search").prop('disabled', false);
    }
  );
}
function showTable(query)
{
  try {
    $('#columns').columns('destroy');
  } catch {
  } finally {
    try {
      var text = "";
      query.split(/\s/).forEach((i) =>
      {
        if (i != zenkaku2Hankaku(i) && i != hiraToKana(i)) {
          text += "(?=(.*" + i + ".*)|(.*" + hiraToKana(zenkaku2Hankaku(i)) + ".*)|(.*" + zenkaku2Hankaku(i) + ".*)|(.*" + hiraToKana(i) + ".*))";
        } else if (i != zenkaku2Hankaku(i)) {
          text += "(?=(.*" + i + ".*)|(.*" + zenkaku2Hankaku(i) + ".*))";
        } else if (i != hiraToKana(i)) {
          text += "(?=(.*" + i + ".*)|(.*" + hiraToKana(i) + ".*))";
        } else {
          text += "(?=(.*" + i + ".*))";
        }
      });
      obj = arrayd;
      list = [];
      Object.keys(obj).forEach((i) => { list.push(obj[i]); });
      list.sort(funcCompare);
      $('#columns').columns({
        data: list,
        query: text,
        search: false,
        schema: [
          { "header": "商品名", "key": "ItemName" },
          { "header": "JANコード", "key": "JAN", "template": '<div name="JANCODE">{{JAN}}</div>' },
          { "header": "価格", "key": "Price" },
          { "header": "台番-段-列", "key": "Daiban", "template": "{{Daiban}}-{{Tana}}-{{Retu}}" },
          { "header": "段", "key": "Tana", "hide": true },
          { "header": "列", "key": "Retu", "hide": true },
          { "header": "重複", "key": "isDoubled" },
          { "header": "食品", "key": "isFood" },
        ],
        size: 1000,
        showRows: [-1, 30, 50, 100, 1000, 10000]
      });
      $('td:contains("XXXX-XX-XX")').parent("tr").css("background-color", "#FA817D");
    } catch (e) {
      alert(e);
    }
  }
}
function zenkaku2Hankaku(str)
{
  return str.replace(/[A-Za-z0-9]/g, function (s)
  {
    return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
  });
}
function hiraToKana(str)
{
  return str.replace(/[\u3041-\u3096]/g, function (match)
  {
    var chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
}