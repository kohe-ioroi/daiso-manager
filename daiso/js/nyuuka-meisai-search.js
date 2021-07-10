var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
var datakey = "";
function init()
{
}
function dowork()
{
    var datajson = [];
    var text = document.getElementById("pdf-text").value.replace(/\r?\n/g, "");
    var data1 = text.match(/([M][0-9]{7})|(68[BTXY][0-9]{5})/g);
    data1.forEach((key) =>
    {
        $.when(dataGet("Daiso_import", "itemcode", key)).done((returndata) =>
        {
            if (Object.keys(returndata).length) {
                datajson.push({ "荷札コード": key, "入力": returndata[Object.keys(returndata)[0]]["importdate"], "合計数": returndata[Object.keys(returndata)[0]]["itemcount"] });
            } else {
                datajson.push({ "荷札コード": key, "入力": "XXXX", "合計数": "XXXX" });
            }
            if (data1[data1.length - 1] == key) {
                $('#columns').columns({
                    data: datajson,
                    size: 1000,
                    showRows: [30, 50, 100, 1000],
                });
                $('td:contains("XXXX")').parent("tr").css("background-color", "#FA817D");
            }
        });
    });
}
function searchData(id)
{
    $.when(
        dataGet("Daiso_import", "itemcode", id)
    ).done(
        function (data)
        {
            datakey = Object.keys(data);
            if (Object.keys(data).length) {
                return true;
            } else {
                return false;
            }

        }
    );

}