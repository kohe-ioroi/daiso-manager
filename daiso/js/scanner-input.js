var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
function init()
{
    showload();
    $("#message").text("デバイスセットアップ...");
    settingDevice();
    showmain();
    document.getElementById("jan_input").onkeypress = (e) =>
    {
        key = e.keyCode || e.charCode || 0;
        if (key == 13) {
            inputData();
        }
    };
    document.getElementById("tana-code").onkeypress = (e) =>
    {
        key = e.keyCode || e.charCode || 0;
        if (key == 13) {
            onChangeTana();
        }
    };
    $("#tana-code").focus();

}

function errormessage(msgcode)
{
    if (msgcode) {
        var msg = new Audio('./msg/' + msgcode + '.mp3');
        msg.play();
    }
}
function settingDevice()
{
    navigator.mediaDevices.enumerateDevices()
        .then(function (devices)
        {
            devices.forEach(function (device)
            {
                if (device.kind == "videoinput") {
                    devicelist.push(device);
                }
            });
            dev1 = new URL(location).searchParams.get("cam");
            if (dev1) {
                deviceid = devicelist[dev1].deviceId;
            }
            else {
                deviceid = devicelist[devicelist.length - 1].deviceId;
            }
        });
}
function calc(isbn)
{
    const arrIsbn = isbn
        .toString()
        .split("")
        .map(num => parseInt(num));
    let remainder = 0;
    const checkDigit = arrIsbn.pop();

    arrIsbn.forEach((num, index) =>
    {
        remainder += num * (index % 2 === 0 ? 1 : 3);
    });
    remainder %= 10;
    remainder = remainder === 0 ? 0 : 10 - remainder;

    return checkDigit === remainder;
}
Array.prototype.mode = function ()
{
    if (this.length === 0) {
        throw new Error("ERROR");
    }
    var counter = {};
    var nativeValues = {};

    var maxCounter = 0;
    var maxValue = null;

    for (var i = 0; i < this.length; i++) {
        if (!counter[this[i] + "_" + typeof this[i]]) {
            counter[this[i] + "_" + typeof this[i]] = 0;
        }
        counter[this[i] + "_" + typeof this[i]]++;
        nativeValues[this[i] + "_" + typeof this[i]] = this[i];

    }
    for (var j = 0; j < Object.keys(counter).length; j++) {
        key = Object.keys(counter)[j];
        if (counter[key] > maxCounter) {
            maxCounter = counter[key];
            maxValue = nativeValues[key];
        }
    }
    return maxValue;

};
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
    } else if ($("#jan_input").val() == "") {
    } else if ($("#jan_input").val() == "CHGTANA") {
        beep();
        formReset();
    } else {
        var JAN = document.getElementById("jan_input").value;
        var Daiban = $("#Daiban").val();
        var Tana = $("#Dan").val();
        var Retu = $("#Retu").val();
        if (JAN.length == 13 || JAN.length == 8 && !isNaN(JAN)) {
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
            showload();
            $.when(
                dataGet("Daiso_Master", "JAN", JAN)
            ).done(
                function (master)
                {
                    var data = master;
                    if (Object.keys(data).length) {
                        $.when(
                            insertData(data[Object.keys(data)[0]]["ItemName"], JAN, Daiban, Tana, Retu, data[Object.keys(data)[0]]["Price"], data[Object.keys(data)[0]]["isFood"], data[Object.keys(data)[0]]["isDoubled"])
                        ).done(function () { showmain(); beep(); $('#jan_input').focus(); });
                    } else {
                        showmain();
                        errormessage("e0001");//マスタ登録なしエラー。
                        window.open('/master.html?jan=' + JAN);
                        $("#Retu").val(Retu);
                        $('#jan_input').focus();
                        if (confirm("マスタに登録しましたか？")) {
                            inputData();
                            break;
                        } else {

                        }

                    }
                    $('#jan_input').val("");
                    $('#jan_input').focus();
                }
            );
        } else {
            errormessage("e0003");//入力値エラー。
            $("#jan_input").select();
        }
    }
}
function no_scroll(event)
{
    event.preventDefault();
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
            Object.keys(data).forEach(function (i)
            {
                $.when(
                    dataDelete("Daiso", i)
                ).done(function ()
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
        var wlist = [];
        $.when(
            dataGet("Daiso", "Daiban", Daiban)
        ).done(
            function (data)
            {
                Object.keys(data).forEach(function (i)
                {
                    dataDelete("Daiso", i);
                });
                showPopup("削除処理完了");
            }
        );
    }
}