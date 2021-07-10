var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
var arrayd;
function init()
{
  showload();
  $.when(
    dataGet("Main")
  ).done(
    function (data)
    {
      arrayd = data;
      showmain();
      $("#search").focus();
    });
}
function dataGet(path)
{
  var dfd = $.Deferred();
  firebase.database().ref(path).once('value').then(function (i) { if (i.exists()) { dfd.resolve(i.val()); } else { dfd.resolve({}); } }).catch(function (e) { alert(e); });
  return dfd.promise();
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
        text += "(?=.*" + i + ".*)";
      });
      obj = arrayd;
      $('#columns').columns({
        data: Object.keys(obj).map(function (key) { return obj[key]; }),
        sortBy: 'Daiban',
        reverse: true,
        query: text,
        search: false,
        schema: [
          { "header": "部門", "key": "Bumon" },
          { "header": "商品名", "key": "ItemName" },
          { "header": "JANコード", "key": "JAN" },
          { "header": "価格", "key": "Price" },
          { "header": "台番-段-列", "key": "Daiban", "template": "{{Daiban}}-{{Tana}}-{{Retu}}" },
          { "header": "段", "key": "Tana", "hide": true },
          { "header": "列", "key": "Retu", "hide": true },
        ],
        size: 1000,
        showRows: [-1, 30, 50, 100, 1000, 10000]
      });
      $('td:contains("--")').parent("tr").css("background-color", "#FA817D");
    } catch (e) {
      alert(e);
    }
  }
}