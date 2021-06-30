
function init() {
    startup();
}
function startup() {
    showload();
    $("#message").text("デバイスセットアップ...");
    $("#jan_input").change(function () {
        if ($("#jan_input").val().length) {
            dbsearch($("#jan_input").val());
        }
    });
    document.getElementById("jan_input").onkeydown = (e) => {
        key = e.code || 0;
        if (key == 13) {
            if ($("jan_input").val() && $("itemName").val()) {
                insertData();
            } else {
                alert("入力内容に不備があります。");
            }
        }

    };
    $("#Daiban").blur(() => {
        if ($("#Daiban").val().length < 4 & $("#Daiban").val() != "") {
            $("#Daiban").val($("#Daiban").val().toString().padStart(4, "0"));
        }
    });
    $("#Dan").blur(() => {
        if ($("#Dan").val().length < 2 & $("#Dan").val() != "") {
            $("#Dan").val($("#Dan").val().toString().padStart(2, "0"));
        }
    });
    $("#Retu").blur(() => {
        if ($("#Retu").val().length < 2 & $("#Retu").val() != "") {
            $("#Retu").val($("#Retu").val().toString().padStart(2, "0"));
        }
    });
    showmain();
    $("#jan_input").focus();

}
function dbsearch(JAN) {
    JAN = JAN.toString();
    showload();
    $("#message").text("データベース内を検索中");
    $.when(
        dataGet("Daiso_Master", "JAN", JAN),
        dataGet("Daiso_HTData", "JAN", JAN)
    ).done(
        function (master, ht) {
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
                showPopup("データ取得に成功。売り場コードを入力して登録してください。")
            } else if (Object.keys(htdata).length) {
                showmain();
                alert("マスタデータに登録がされていませんが、HTデータに存在します。\nマスタデータの登録を開始してください。")
                window.open('/master.html?jan=' + JAN);
            } else {
                showmain();
                alert("マスタ、HTデータともに存在しません。間違いがなければ手動でマスタデータを登録してください。")
                window.open('/master.html?jan=' + JAN);
            }
        }
    );
}
function nextfeild(str) {
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
function insertData() {
    var JAN = $("#jan_input").val();
    var Daiban = $("#Daiban").val();
    var Tana = $("#Dan").val();
    var Retu = $("#Retu").val();
    $.when(
        dataGet("Daiso_Master", "JAN", JAN),
        dataGet("Daiso", "Daiban", $("#Daiban").val())
    ).done(
        (data1, data2) => {
            if (Object.keys(data1).length) {
                var data = { "Bumon": "24", "ItemName": data1[Object.keys(data1)[0]]["ItemName"], "JAN": JAN, "PB": "", "Price": data1[Object.keys(data1)[0]]["Price"], "Daiban": Daiban, "Tana": Tana, "Retu": Retu, "isFood": data1[Object.keys(data1)[0]]["isFood"], "isDoubled": data1[Object.keys(data1)[0]]["isDoubled"] };
                Object.keys(data2).forEach((key) => {
                    if (data2[key]["Daiban"] == Daiban && data2[key]["Tana"] == Tana && data2[key]["Retu"] == Retu) {
                        dataDelete("Daiso", key);
                    }
                })
                dataInsert("Daiso", data);
                showPopup("データ入力完了")
            } else {
                dbsearch();
            }

        }
    )
};