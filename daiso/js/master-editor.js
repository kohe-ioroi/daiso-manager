function init()
{
    showload();
    $("#message").text("デバイスセットアップ...");
    $("#jan_input").change((e) =>
    {

        if (regexTest(/([0-9]{8})|([0-9]{13})/, $("#jan_input").val())) {
            dbsearch($("#jan_input").val());
        } else {
            alert("入力内容に不備があります。");
        }
    });
    nextfieldALL();
    focustoselectALL();
    showmain();
    $("#jan_input").focus();
    if (location.search) {
        try {
            $("#jan_input").val(getParam('jan'));
            dbsearch(getParam('jan'));
        } catch {
        }
    }
}

function dbsearch(JAN)
{
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
                doubledCheck(JAN);
                $("#daibanTitle").css("background-color", "transparent");
                $("#priceTitle").css("background-color", "transparent");
                $("#isFoodTitle").css("background-color", "transparent");
                showmain();
                $("#itemName").focus();

            } else if (Object.keys(htdata).length) {
                $("#itemName").val(htdata[Object.keys(htdata)[0]]["ItemName"]);
                $("#itemName").focus();
                doubledCheck(JAN);
                $("#daibanTitle").css("background-color", "#FFFF00");
                $("#isFoodTitle").css("background-color", "#FFFF00");
                $("#priceTitle").css("background-color", "#FFFF00");
                showmain();
                $("#itemName").focus();
            } else {
                showmain();
                $('#itemName').focus();
            }
        }
    );
}
function insertData()
{
    itemName = document.getElementById("itemName").value;
    JAN = document.getElementById("jan_input").value;
    Price = document.getElementById("price").value;
    isFood = document.getElementById("isFood").checked;
    isDoubled = document.getElementById("isDoubled").checked;
    if (!regexTest(/([0-9]{8})|([0-9]{13})/, JAN)) {
        showPopup("JANコードが正しく入力されていません。確認してください。");
        return false;
    }
    var data = { "Bumon": "24", "ItemName": itemName, "JAN": JAN, "PB": "", "Price": Price, "isFood": isFood, "isDoubled": isDoubled };
    if (itemName && JAN && Price) {
        showload();
        $.when(
            dataGet("Daiso_Master", "JAN", JAN),
            dataGet("Daiso", "JAN", JAN)
        ).done(
            (func1, func2) =>
            {
                if (Object.keys(func1).length == 0) {
                    dataTargetInsert("Daiso_Master", JAN, data);
                    showPopup("データ書き込み完了");
                    if (window.opener != null) {
                        window.opener.inputData();
                        window.close();
                    }
                } else {
                    if (confirm("データはすでに存在します。上書きして良いですか？")) {
                        dataTargetInsert("Daiso_Master", JAN, data);
                        Object.keys(func2).forEach((key) =>
                        {
                            dataPatch("Daiso", key, data);
                        });
                        showPopup("データ上書き完了");
                    } else {
                        showPopup("中断しました。");
                    }

                }
                showmain();
            }
        );
    }
};
function resetData()
{
    document.getElementById("itemName").value = "";
    document.getElementById("jan_input").value = "";
    document.getElementById("isDoubled").checked = false;
}
function delData(dataid)
{
    var dfd = $.Deferred();
    $.when(
        dataDelete("Daiso", dataid)
    ).done(
        function () { dfd.resolve(); }
    );
    return dfd.promise();

}

function getParam(name, url)
{
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function doubledCheck(JAN)
{
    var dfd = $.Deferred();
    $.when(
        dataGet("Main", "JAN", JAN)
    ).done(
        function (data)
        {
            if (Object.keys(data).length) {
                document.getElementById("isDoubled").checked = true;
            } else {
                document.getElementById("isDoubled").checked = false;
            }
            showPopup("コーナン競合判定完了。結果:" + document.getElementById("isDoubled").checked);
            dfd.resolve();
        }
    );
    return dfd.promise();
}