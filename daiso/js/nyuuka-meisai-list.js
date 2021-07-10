var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
function init()
{
  showTable();
}
function showTable()
{
  showload();
  $.when(
    TableGet("Daiso_import")
  ).done(function (data)
  {
    showmain();
    obj = data;
    try {
      $('#columns').columns({
        data: Object.keys(data).map(function (key) { return obj[key]; }),
        schema: [
          { "header": "RDC/直送系出荷日", "key": "exportdate" },
          { "header": "店舗着荷日", "key": "importdate" },
          { "header": "荷札コード", "key": "itemcode" },
          { "header": "総アイテム数", "key": "itemcount" },
        ],
        size: 100,
        showRows: [30, 50, 100, 1000],
        sortBy: 'importdate',
        reverse: true,
      });
    } catch (e) {
      alert(e);
    }
  });
}