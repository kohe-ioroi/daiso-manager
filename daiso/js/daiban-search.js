var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
function showTable(val, val2)
{
  datalist = {};
  if (parseInt(val) > parseInt(val2)) {
    alert("開始ページを終了ページより大きくすることはできません。");
    return false;
  }
  $('#search').val(val.padStart(4, "0"));
  if (val2 == "") {
    val2 = val;
  } else {
    $('#search2').val(val2.padStart(4, "0"));
  }
  showload();
  $.when(TableGet("Daiso")
  ).done(
    (data) =>
    {
      lists = [];
      putdata = {};
      for (i = parseInt(val); i < parseInt(val2) + 1; i++) {
        lists.push(i.toString().padStart(4, "0"));
      }
      Object.keys(data).forEach((key) =>
      {
        if (lists.includes(data[key]["Daiban"])) {
          putdata[key] = data[key];
        }

      });
      obj = putdata;
      showmain();
      if (Object.keys(putdata).length == 0) {
        alert("検索結果がありません。");
        return false;
      }
      try {
        $('#columns').columns('destroy');
      } catch {
      } finally {
        list = [];
        Object.keys(obj).forEach((i) => { list.push(obj[i]); });
        list.sort(funcCompare);
        $('#columns').columns({
          data: list,
          search: false,
          schema: [
            { "header": "商品名", "key": "ItemName" },
            { "header": "JANコード", "key": "JAN", "template": '<div name="JANCODE">{{JAN}}</div>' },
            { "header": "価格", "key": "Price" },
            { "header": "台番", "key": "Daiban" },
            { "header": "段", "key": "Tana" },
            { "header": "列", "key": "Retu" },
            { "header": "重複", "key": "isDoubled" },
            { "header": "食品", "key": "isFood" },
          ],
          size: 1000,
          showRows: [-1, 30, 50, 100, 1000, 10000]
        });
      }
    }
  );

}
function init()
{
  document.getElementById("search").onkeypress = (e) =>
  {
    $("#search").val($("#search").val().replace(/[^0-9]/g, ''));
    key = e.keyCode || e.charCode || 0;
    if (key == 13) {
      showTable($('#search').val(), $('#search2').val());
    }
  };
  document.getElementById("search2").onkeypress = (e) =>
  {
    $("#search2").val($("#search2").val().replace(/[^0-9]/g, ''));
    key = e.keyCode || e.charCode || 0;
    if (key == 13) {
      showTable($('#search').val(), $('#search2').val());
    }
  };
  $("#search").change(() =>
  {
    $("#search").val($("#search").val().replace(/[^0-9]/g, ''));
  });
  $("#search2").change(() =>
  {
    $("#search2").val($("#search2").val().replace(/[^0-9]/g, ''));
  });
}