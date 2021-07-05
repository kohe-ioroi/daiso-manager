var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
function init()
{
    showload();
    $("#message").text("デバイスセットアップ...");
    showmain();
    $("#jan_input").keydown((e) =>
    {
        if (e.keyCode == 13) {
            inputData();
        }
    });
    $("#tana-code").keydown((e) =>
    {
        if (e.keyCode == 13) {
            onChangeTana();
        }
    });
    $("#tana-code").focus();

}

function errormessage(msgcode)
{
    if (msgcode) {
        var msg = new Audio('./msg/' + msgcode + '.mp3');
        msg.play();
    }
}
function onChangeTana()
{
    var tanacode = String($("#tana-code").val());
    if (tanacode.indexOf("D-") != -1 && tanacode.length == 6) {
        beep();
        $("#Daiban").val(tanacode.slice(2));
        $("#jan_input").focus();
    } else {
        $("#tana-code").val("");
        errormessage("e0003");//入力値エラー。
    }
}
function formReset()
{
    $("#tana-code").val("");
    $("#jan_input").val("");
    $("#Daiban").val("");
    $("#Dan").val("01");
    $("#Retu").val("01");
    $("#tana-code").focus();
}
function inputData()
{
    if ($("#jan_input").val() == "NEXT") {
        changeTana(true);
    } else if ($("#jan_input").val() == "") {
    } else if ($("#jan_input").val() == "CHGTANA") {
        beep();
        formReset();
    } else {
        var JAN = $("#jan_input").val();
        var Daiban = $("#Daiban").val();
        var Tana = $("#Dan").val();
        var Retu = $("#Retu").val();
        if (JAN.length == 13 || JAN.length == 8 && !isNaN(JAN)) {
            $("input").prop('disabled', true);
            if (Retu.slice(0, 1) == "0") {
                var i = Retu.slice(1);
                var n = Number(i) + 1;
                if (String(n).length == 1) {
                    x = "0" + String(n);
                } else {
                    x = n;
                }
                $("#Retu").val(x);
            }
            else {
                var i = Number(Retu);
                $("#Retu").val((i + 1));
            }

            $.when(
                dataGet("Daiso_Master", "JAN", JAN)
            ).done(
                function (master)
                {
                    var data = master;
                    if (Object.keys(data).length) {
                        $.when(
                            insertData(data[Object.keys(data)[0]]["ItemName"], JAN, Daiban, Tana, Retu, data[Object.keys(data)[0]]["Price"], data[Object.keys(data)[0]]["isFood"], data[Object.keys(data)[0]]["isDoubled"])
                        ).done(() =>
                        {
                            showmain();
                            beep();
                            $("input").prop('disabled', false);
                            $('#jan_input').val("");
                            $('#jan_input').focus();
                        });
                    } else {
                        showmain();
                        errormessage("e0001");//マスタ登録なしエラー。
                        window.open('/master.html?jan=' + JAN);
                        $("input").prop('disabled', false);
                        $("#Retu").val(Retu);
                        $('#jan_input').focus();
                    }
                }
            );
        } else {
            errormessage("e0003");//入力値エラー。
            $("#jan_input").select();
        }
    }
}

function insertData(itemName, JAN, Daiban, Tana, Retu, Price, isFood, isDoubled)
{
    if (JAN && Daiban && Tana && Retu) {
        $.when(
            dataGet("Daiso", "Daiban", Daiban)
        ).done(
            (data1) =>
            {
                var data = { "Bumon": "24", "ItemName": itemName, "JAN": JAN, "PB": "", "Price": Price, "Daiban": Daiban, "Tana": Tana, "Retu": Retu, "isFood": isFood, "isDoubled": isDoubled };
                Object.keys(data1).forEach((key) =>
                {
                    if (data1[key]["Daiban"] == Daiban && data1[key]["Tana"] == Tana && data1[key]["Retu"] == Retu) {
                        dataDelete("Daiso", key);
                    }
                });
                dataInsert("Daiso", data);
            }
        );
    }

};


function missdataremove()
{
    itemscount = 0;
    counter = 0;
    $.when(
        dataGet("Daiso", "JAN", "0000000000000")
    ).done(
        function (data)
        {
            itemscount = Object.keys(data).length;
            if (itemscount == 0) {
                showPopup("該当するデータがありませんでした。");
                return false;
            }
            Object.keys(data).forEach(function (i)
            {
                $.when(
                    dataDelete("Daiso", i)
                ).done(() =>
                {
                    console.log("処理中:" + i);
                });
            });
            showPopup("削除処理完了 件数:" + itemscount);
        }
    );
}
function deleteDaiban(Daiban)
{
    if (Daiban != "XXXX" && Daiban != "" && confirm("指定の台番を削除してよろしいですか？No:" + Daiban)) {
        $.when(
            dataGet("Daiso", "Daiban", Daiban)
        ).done(
            (data) =>
            {
                if (Object.keys(data).length == 0) {
                    showPopup("該当するデータがありませんでした。");
                    return false;
                }
                var count = 0;
                Object.keys(data).forEach(function (i)
                {
                    dataDelete("Daiso", i);
                    count++;
                });
                showPopup("削除処理完了 件数:" + count);
            }
        );
    }
}
function changeTana(switcher)
{
    if (switcher == true) {
        VDan = $('#Dan').val();
        if (VDan.slice(0, 1) == "0") {
            var i = VDan.slice(1);
            var n = Number(i) + 1;
            if (String(n).length == 1) {
                x = "0" + String(n);
            } else {
                x = n;
            }
            $("#Dan").val(x);
        }
        else {
            var i = Number(VDan);
            $("#Dan").val((i + 1));
        }
        $("#Retu").val("01");
        $("#jan_input").val("");
        $('#jan_input').focus();
        beep();
    } else if (switcher == false) {
        VDan = $('#Dan').val();
        if (parseInt(VDan) <= 1) {
            return false;
        }
        if (VDan.slice(0, 1) == "0") {
            var i = VDan.slice(1);
            var n = Number(i) - 1;
            if (String(n).length == 1) {
                x = "0" + String(n);
            } else {
                x = n;
            }
            $("#Dan").val(x);
        }
        else {
            var i = Number(VDan);
            $("#Dan").val((i - 1));
        }
        $("#Retu").val("01");
        $("#jan_input").val("");
        $('#jan_input').focus();
        beep();
    } else {
        alert("棚変更判定エラー");
    }

}