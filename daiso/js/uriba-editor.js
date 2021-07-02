
function init()
{
    startup();
}
function startup()
{
    showload();
    $("#message").text("デバイスセットアップ...");
    $("#jan_input").change(function ()
    {
        if ($("#jan_input").val().length) {
            dbsearch($("#jan_input").val());
        }
    });
    $("#Daiban").blur(() =>
    {
        if ($("#Daiban").val().length < 4 & $("#Daiban").val() != "") {
            $("#Daiban").val($("#Daiban").val().toString().padStart(4, "0"));
        }
    });
    $("#Dan").blur(() =>
    {
        if ($("#Dan").val().length < 2 & $("#Dan").val() != "") {
            $("#Dan").val($("#Dan").val().toString().padStart(2, "0"));
        }
    });
    $("#Retu").blur(() =>
    {
        if ($("#Retu").val().length < 2 & $("#Retu").val() != "") {
            $("#Retu").val($("#Retu").val().toString().padStart(2, "0"));
        }
    });
    focustoselectALL();
    nextfieldALL();
    showmain();
    $("#jan_input").focus();

}
function dbsearch(JAN)
{
    if (!regexTest(/([0-9]{8})|([0-9]{13})/, JAN)) {
        showPopup("JANコードが正しく指定されていません。");
        return false;
    }
    showload();
    $("#message").text("データベース内を検索中");
    $.when(
        dataGet("Daiso_Master", "JAN", JAN),
        dataGet("Daiso_HTData", "JAN", JAN)
    ).done(
        function (master, ht)
        {
            var data = master;
            var htdata = ht;
            if (Object.keys(data).length) {
                $("#itemName").val(data[Object.keys(data)[0]]["ItemName"]);
                $("#price").val(data[Object.keys(data)[0]]["Price"]);
                $(".filter-option").html(data[Object.keys(data)[0]]["Price"]);
                if (data[Object.keys(data)[0]]["isFood"]) { document.getElementById("isFood").checked = true; };
                if (data[Object.keys(data)[0]]["isDoubled"]) { document.getElementById("isDoubled").checked = true; };
                $("#daibanTitle").css("background-color", "transparent");
                $("#priceTitle").css("background-color", "transparent");
                $("#isFoodTitle").css("background-color", "transparent");
                showmain();
                $('#Daiban').focus(() => { $(this).select(); });
                showPopup("データ取得に成功。売り場コードを入力して登録してください。");
            } else if (Object.keys(htdata).length) {
                showmain();
                alert("マスタデータに登録がされていませんが、HTデータに存在します。\nマスタデータの登録を開始してください。");
                window.open('/master.html?jan=' + JAN);
            } else {
                showmain();
                alert("マスタ、HTデータともに存在しません。間違いがなければ手動でマスタデータを登録してください。");
                window.open('/master.html?jan=' + JAN);
            }
        }
    );
}
function insertData()
{
    var JAN = $("#jan_input").val();
    if (!regexTest(/([0-9]{8})|([0-9]{13})/, JAN)) {
        showPopup("JANコードが正しく指定されていません。");
        return false;
    }
    var Daiban = $("#Daiban").val();
    var Tana = $("#Dan").val();
    var Retu = $("#Retu").val();
    if (JAN && Daiban && Tana && Retu) {
        $.when(
            dataGet("Daiso_Master", "JAN", JAN),
            dataGet("Daiso", "Daiban", Daiban)
        ).done(
            (data1, data2) =>
            {
                if (Object.keys(data1).length) {
                    var data = { "Bumon": "24", "ItemName": data1[Object.keys(data1)[0]]["ItemName"], "JAN": JAN, "PB": "", "Price": data1[Object.keys(data1)[0]]["Price"], "Daiban": Daiban, "Tana": Tana, "Retu": Retu, "isFood": data1[Object.keys(data1)[0]]["isFood"], "isDoubled": data1[Object.keys(data1)[0]]["isDoubled"] };
                    Object.keys(data2).forEach((key) =>
                    {
                        if (data2[key]["Daiban"] == Daiban && data2[key]["Tana"] == Tana && data2[key]["Retu"] == Retu) {
                            dataDelete("Daiso", key);
                        }
                    });
                    dataInsert("Daiso", data);
                    showPopup("データ入力完了");
                    clearInput();

                } else {
                    dbsearch();
                }

            }
        );
    }

};
function deleteItem()
{
    var [Daiban, Tana, Retu] = [$("#Daiban").val(), $("#Dan").val(), $("#Retu").val()];
    if (Daiban != "" && Tana != "" && Retu != "") {
        $.when(
            dataGet("Daiso", "Daiban", Daiban)
        ).done((data1) =>
        {
            var flag1 = false;
            Object.keys(data1).forEach((key) =>
            {
                if (data1[key]["Daiban"] == Daiban && data1[key]["Tana"] == Tana && data1[key]["Retu"] == Retu) {
                    dataDelete("Daiso", key);
                    flag1 = true;

                }
            });
            if (flag1) {
                showPopup("データの削除に成功しました。");
            } else {
                showPopup("対象の番号はありませんでした。");
            }
        });
    } else {
        showPopup("数値が指定されていません。");
    }
}

function daibanPickupItem()
{

    var [Daiban, Tana, Retu] = [$("#Daiban").val(), $("#Dan").val(), $("#Retu").val()];
    if (Daiban != "" && Tana != "" && Retu != "") {
        $.when(
            dataGet("Daiso", "Daiban", Daiban)
        ).done((data1) =>
        {
            var flag1 = false;
            Object.keys(data1).forEach((key) =>
            {
                if (data1[key]["Daiban"] == Daiban && data1[key]["Tana"] == Tana && data1[key]["Retu"] == Retu) {
                    flag1 = true;
                    $("#itemName").val(data1[key]["ItemName"]);
                    $("#jan_input").val(data1[key]["JAN"]);
                }
            });
            if (flag1) {
                showPopup("データの検索に成功しました。");
            } else {
                showPopup("対象の番号はありませんでした。");
            }
        });
    } else {
        showPopup("数値が指定されていません。");
    }
}

function nextfeild(str)
{
    if (str.value.length >= str.maxLength) {
        for (var i = 0, elm = str.form.elements; i < elm.length; i++) {
            if (elm[i] == str) {
                (elm[i + 1] || elm[0]).focus();
                break;
            }
        }
    }
    return (str);
}
function clearInput()
{
    $("#jan_input").val("");
    $("#itemName").val("");
    $("#Daiban").val("");
    $("#Dan").val("");
    $("#Retu").val("");

}