var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
var datakey = "";
function init()
{
    $("#item-count").blur(function ()
    {
        if (document.getElementsByName("input2")[0].value && RegExp("([M][0-9]{7})|([0-9]{2}[BTXY][0-9]{5})").test($("#item-code").val()) && RegExp("[0-9]+").test($("#item-count").val())) {
            inputData();
        } else { if ($("#item-count").val() != "") { alertbeep(); showPopup("入力が設定した内容に一致していません。"); formReset(); } }
    });
    nextfieldALL();
    focustoselectALL();
    var date = new Date();
    document.getElementsByName("input2")[0].value = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    $("#item-code").focus();
}
function errormessage(msgcode)
{
    if (msgcode) {
        var msg = new Audio('./msg/' + msgcode + '.mp3');
        msg.play();
    }
}
function formReset()
{
    $("#item-code").val("");
    $("#item-count").val("");
    $("#item-code").focus();
}
function inputData()
{
    showload();
    var exportdate = document.getElementsByName("input2")[0].value;
    var importdate = document.getElementsByName("input2")[0].value;
    var itemcode = $("#item-code").val().replace(/\s+/g, '');
    var itemcount = $("#item-count").val().replace(/\s+/g, '');
    if (exportdate != "" && importdate != "" && itemcode != "" && itemcount != "") {
        $.when(
            dataGet("Daiso_import", "itemcode", itemcode)
        ).done(
            (data) =>
            {
                var [edobj, idobj, nowobj] = [new Date(exportdate), new Date(importdate), new Date()];
                nowobj.setDate(nowobj.getDate() + 1);
                var [datakey, datakeys] = [Object.keys(data)[0], Object.keys(data)];
                if (Object.keys(data).length && data[datakey]["itemcode"] == itemcode && new Date(data[datakey]["importdate"]) >= new Date(importdate)) {
                    alertbeep();
                    showPopup("該当する番号はすでに入力が完了しています。");
                    showmain();
                    formReset();
                } else if (Object.keys(data).length && data[datakey]["itemcode"] == itemcode && new Date(data[datakey]["importdate"]) < new Date(importdate)) {
                    if (nowobj >= edobj && nowobj >= idobj && edobj <= idobj) {
                        $.when(
                            () => { datakeys.forEach((key) => { dataDelete("Daiso_import", key); }); },
                            appendData(exportdate, importdate, itemcode, itemcount)
                        ).done(
                            function ()
                            {
                                beep();
                                showmain();
                                formReset();
                                showPopup("入力完了(重複データ上書き)");
                            }
                        );
                    } else {
                        showPopup("日付が異常です。");
                        showmain();
                    }
                } else {
                    if (nowobj >= edobj && nowobj >= idobj && edobj <= idobj) {
                        $.when(
                            appendData(exportdate, importdate, itemcode, itemcount)
                        ).done(
                            function ()
                            {
                                beep();
                                showmain();
                                formReset();
                                showPopup("入力完了(通常書き込み)");
                            }
                        );
                    } else {
                        showPopup("日付が異常です。");
                        showmain();
                    }
                }
            }
        );
    } else {
        alertbeep();
        showPopup("データがありません。");
        showmain();
        formReset();
    }

}
function searchData(id)
{
    $.when(
        dataGet("Daiso_import", "itemcode", id)
    ).done(
        function (data)
        {
            datakey = Object.keys(data)[0];
            if (Object.keys(data).length) {
                d = data[Object.keys(data)[0]];
                document.getElementsByName("input1")[0].value = d["exportdate"];
                document.getElementsByName("input2")[0].value = d["importdate"];
                $("#item-code").val(d["itemcode"]);
                $("#item-count").val(d["itemcount"]);
            } else {
                alert("要求された荷札コードのデータはありません。");
            }
        }
    );

}
function appendData(a, b, c, d)
{
    var dfd = $.Deferred();
    var data = { "exportdate": a, "importdate": b, "itemcode": c, "itemcount": d };
    $.when(
        dataInsert("Daiso_import", data)
    ).done(
        function () { dfd.resolve(); }
    );
    return dfd.promise();
}
function delData()
{
    $.when(dataGet("Daiso_import", "itemcode", $("#item-code").val())).done((data) =>
    {
        if (Object.keys(data).length) {
            Object.keys(data).forEach((i) =>
            {
                dataDelete("Daiso_import", i);
            });
            alert("データの削除が完了しました。");
            formReset();
        } else { alert("対象データはありません。"); }
    });
}