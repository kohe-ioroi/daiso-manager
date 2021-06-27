var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
function getToken()
{
    firebase.auth().currentUser.getIdToken(true).then(function (i)
    {
        idtoken = i;
    }).catch(function (error)
    {
        alert(e);
    });
}
function init()
{
    // document.addEventListener("touchmove", no_scroll, { passive: false });
    // document.addEventListener("mousewheel", no_scroll, { passive: false });
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
            showload();
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

            $('#jan_input').val("");
            $('#jan_input').focus();
            showmain();
            $.when(
                dataGet("Main", "JAN", JAN),
                dataGet("Daiso", "JAN", JAN)
            ).done(
                function (kohnan, daiso)
                {
                    if (Object.keys(kohnan).length) {
                        var isDoubled = true;
                    } else {
                        var isDoubled = false;
                    }
                    if (Object.keys(daiso).length) {
                        var data = daiso[Object.keys(daiso)[0]];
                        var itemName = data["ItemName"];
                        var Price = data["Price"];
                        var isFood = data["isFood"];
                        $.when(
                            insertData(itemName, JAN, Daiban, Tana, Retu, Price, isFood, isDoubled)
                        ).done(function () { beep(); });
                    } else {
                        errormessage("e0001");//マスタ登録なしエラー。
                        window.open('/master.html?jan=' + JAN + '&Daiban=' + Daiban + '&Tana=' + Tana + '&Retu=' + Retu);
                        $('#jan_input').focus();
                    }
                }
            ).fail(
                function ()
                {
                    firebase.auth().currentUser.getIdToken(true).then(function (i)
                    {
                        idtoken = i;
                        $.when(
                            dataGet("Main", "JAN", JAN),
                            dataGet("Daiso", "JAN", JAN)
                        ).done(
                            function (kohnan, daiso)
                            {
                                if (Object.keys(kohnan).length) {
                                    var isDoubled = true;
                                } else {
                                    var isDoubled = false;
                                }
                                if (Object.keys(daiso).length) {
                                    var data = daiso[Object.keys(daiso)[0]];
                                    var itemName = data["ItemName"];
                                    var Price = data["Price"];
                                    var isFood = data["isFood"];
                                    $.when(
                                        insertData(itemName, JAN, Daiban, Tana, Retu, Price, isFood, isDoubled)
                                    ).done(function () { beep(); });
                                } else {
                                    errormessage("e0001");//マスタ登録なしエラー。
                                    window.open('/master.html?jan=' + JAN + '&Daiban=' + Daiban + '&Tana=' + Tana + '&Retu=' + Retu);
                                    $('#jan_input').focus();
                                }
                            }
                        );
                    });
                });

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
    var dfd = $.Deferred();
    if (itemName && JAN && Daiban && Tana && Retu && Price) {
        overwritecheck = [];
        overwritecheckJAN = "";
        overwriteJAN = [];
        overwritelive = false;
        overwriteliveJAN = "";
        overwritelivecode = "";
        overwritelist = [];
        $.when(
            dataGet("Daiso", "Daiban", Daiban)
        ).done(function (d)
        {
            Object.keys(d).forEach(function (i)
            {
                fordata = d[i];
                if (fordata["JAN"] != JAN && fordata["Daiban"] == Daiban && fordata["Tana"] == Tana && fordata["Retu"] == Retu) {
                    overwritecheck.push(i);
                    overwriteliveJAN = fordata["JAN"];
                } else if (fordata["JAN"] == JAN && fordata["Daiban"] == Daiban && fordata["Tana"] == Tana && fordata["Retu"] == Retu) {
                    overwriteJAN.push(i);
                } else {

                }
            });
            if (overwritecheck.length) {
                $.when(
                    dataGet("Daiso", "JAN", overwriteliveJAN)
                ).done(function (data)
                {
                    Object.keys(data[0]).forEach(function (n)
                    {
                        fordata = data[n];
                        overwritelist.push(n);
                    });
                    if (overwritelist.length >= 2) {
                        overwritelive = true;
                    } else if (overwritelist.length <= 1) {
                        overwritelive = false;
                    }
                });
            }
            if (overwriteJAN.length) {
                if (true) {
                    overwriteJAN.forEach(function (m)
                    {
                        $.when(
                            delData(m),
                            appendData(itemName, JAN, Daiban, Tana, Retu, Price, isFood, isDoubled),
                        ).done(function ()
                        {
                            showPopup("書き込み完了");
                        });
                    });
                } else {

                }
            }
            else if (overwritecheck.length) {
                if (true) {
                    if (overwritelive == true) {
                        jsondata = { "ItemName": itemName, "JAN": JAN, "Price": Price, "isDoubled": isDoubled, "isFood": isFood };
                        $.when(
                            dataPatch("Daiso", overwritecheck[0], jsondata)
                        ).done(function ()
                        {
                            showPopup("書き込み完了");
                        });
                    } else {
                        jsondata = { "Daiban": "XXXX", "Tana": "XX", "Retu": "XX" };
                        $.when(
                            dataPatch("Daiso", overwritecheck[0], jsondata),
                            appendData(itemName, JAN, Daiban, Tana, Retu, Price, isFood, isDoubled)
                        ).done(function ()
                        {
                            showPopup("書き込み完了");
                        });
                    }
                } else {
                }
            } else {
                $.when(
                    appendData(itemName, JAN, Daiban, Tana, Retu, Price, isFood, isDoubled)
                ).done(function ()
                {
                    showPopup("書き込み完了");
                });
            }
            $.when(
                oldJANDataDel(JAN)
            ).done(
                function () { dfd.resolve(); }
            );
        });
    } else {
        dfd.resolve();
        alertbeep();
    }
    return dfd.promise();
};
function appendData(itemName, JAN, Daiban, Tana, Retu, Price, isFood, isDoubled)
{
    data = { "Bumon": "24", "ItemName": itemName, "JAN": JAN, "Daiban": Daiban, "Tana": Tana, "Retu": Retu, "PB": "", "Price": Price, "isFood": isFood, "isDoubled": isDoubled };
    dataInsert("Daiso", data);
}
function resetData()
{
    $("#jan_input").val("");
    $('#jan_input').focus();
}
function delData(dataid)
{
    dataDelete("Daiso", dataid);
}
function oldJANDataDel(JAN)
{
    var dfd = $.Deferred();
    $.when(
        dataGet("Daiso", "JAN", JAN)
    ).done(function (data)
    {
        Object.keys(data).forEach(function (i)
        {
            if (data[i]["Daiban"] == "XXXX") {
                delData(i);
            }
        });
        dfd.resolve();
    });
    return dfd.promise();
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
                    console.log(data[i]["JAN"] + "の削除判定を開始");
                    fordata = data[i];
                    if (wlist.indexOf(data[i]["JAN"]) == -1) {
                        console.log("判定結果:対象");
                        wlist.push(data[i]["JAN"]);
                        jsondata = { "Daiban": "XXXX", "Tana": "XX", "Retu": "XX" };
                        dataPatch("Daiso", i, jsondata).then(
                            () =>
                            {
                                console.log("フラグ「消去」完了");
                                dataGet("Daiso", "JAN", data[i]["JAN"]).then(
                                    (data) =>
                                    {
                                        console.log(Object.keys(data).length + "件の該当データを発見");
                                        Object.keys(data).forEach((n) =>
                                        {
                                            if (data[n]["Daiban"] != "XXXX") {
                                                console.log("ID:" + n + " の削除を開始");
                                                dataDelete("Daiso", n);
                                            } else {
                                                console.log("削除対象外");
                                            }
                                        });
                                        console.log("削除処理完了");
                                    }
                                );
                            }
                        );
                    } else {
                        console.log("判定結果:対象外");
                    }
                });
                showPopup("削除処理完了");
            }
        );
    }
}