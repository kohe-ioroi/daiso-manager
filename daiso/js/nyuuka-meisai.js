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
    $("#item-code, #item-count").focus(() =>
    {
        $(this).select();
    });
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
            function (data)
            {
                datakey = Object.keys(data)[0];
                if (Object.keys(data).length) {
                    alertbeep();
                    showPopup("該当する番号はすでに入力が完了しています。");
                    showmain();
                    formReset();
                } else {
                    edobj = new Date(exportdate);
                    idobj = new Date(importdate);
                    nowobj = new Date();
                    nowobj.setDate(nowobj.getDate() + 1);
                    if (nowobj >= edobj && nowobj >= idobj && edobj <= idobj) {
                        // if(confirm("下記データで登録します。間違いないですか？\n"+msg)){
                        if (true) {
                            $.when(
                                appendData(exportdate, importdate, itemcode, itemcount)
                            ).done(
                                function ()
                                {
                                    beep();
                                    showmain();
                                    formReset();
                                }
                            );
                        } else {
                            showmain();
                        }
                    } else {
                        showPopup("日付が異常です。");
                        showmain();
                    }
                }
            });
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
function showload()
{
    $("#message").text("処理中");
    $("#main").fadeOut(50);
    $("#load").fadeIn(50);
}
function showmain()
{
    $("#load").fadeOut(50);
    $("#main").fadeIn(50);
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
$(function ()
{
    $("input").keydown(function (e)
    {
        if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
            return false;
        } else {
            return true;
        }
    });
});