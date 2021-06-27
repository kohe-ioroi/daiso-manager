var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
function init()
{
    startup();
    if (location.search) {
        try {
            $("#jan_input").val(getParam('jan'));
            dbsearch(getParam('jan'));
            $("#Daiban").val(getParam('Daiban'));
            $("#Dan").val(getParam('Tana'));
            $("#Retu").val(getParam('Retu'));
        } catch {

        }

    }
}
function startup()
{
    // document.addEventListener("touchmove", no_scroll, { passive: false });
    // document.addEventListener("mousewheel", no_scroll, { passive: false });
    showload();
    $("#message").text("デバイスセットアップ...");
    settingDevice();
    $("#jan_input").change(function ()
    {
        if ($("#jan_input").val().length) {
            dbsearch($("#jan_input").val());
        }
    });
    document.getElementById("jan_input").onkeydown = (e) =>
    {
        key = e.code || 0;
        if (key == 13) {
            if ($("jan_input").val() && $("itemName").val()) {
                insertData();
            } else {
                alert("入力内容に不備があります。");
            }
        }

    };
    $("#Daiban").blur(() =>
    {
        if ($("#Daiban").val().length < 4) {
            $("#Daiban").val($("#Daiban").val().toString().padStart(4, "0"));
        }
    });
    $("#Dan").blur(() =>
    {
        if ($("#Dan").val().length < 2) {
            $("#Dan").val($("#Dan").val().toString().padStart(2, "0"));
        }
    });
    $("#Retu").blur(() =>
    {
        if ($("#Retu").val().length < 2) {
            $("#Retu").val($("#Retu").val().toString().padStart(2, "0"));
        }
    });
    showmain();
    $("#jan_input").focus();

}
function dbsearch(JAN)
{
    JAN = JAN.toString();
    showload();
    $("#message").text("データベース内を検索中");
    $.when(
        dataGet("Daiso", "JAN", JAN),
        dataGet("Daiso_HTData", "JAN", JAN)
    ).done(
        function (main, ht)
        {
            var data = main;
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
            } else if (Object.keys(htdata).length) {
                $("#itemName").val(htdata[Object.keys(htdata)[0]]["ItemName"]);
                $("#itemName").focus();
                $("#daibanTitle").css("background-color", "#FFFF00");
                $("#isFoodTitle").css("background-color", "#FFFF00");
                $("#priceTitle").css("background-color", "#FFFF00");
                showmain();
                $('#Daiban').focus(() => { $(this).select(); });
            } else {
                showmain();
                $('#itemName').focus();
            }
        }
    );
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
function startScanner(_deviceid)
{
    scandata = [];
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#photo-area'),
            constraints: {
                decodeBarCodeRate: 10,
                successTimeout: 500,
                codeRepetition: true,
                tryVertical: true,
                frameRate: 10,
                width: 600,
                height: 600,
                deviceId: _deviceid
            },
        },
        decoder: {
            readers: [
                "ean_reader",
            ]
        },
        locator: {
            halfSample: true,
            patchSize: "medium",
        }
    }, function (err)
    {
        if (err) {
            console.log(err);
            return;
        }

        Quagga.start();

        // Set flag to is running
        _scannerIsRunning = true;
    });

    Quagga.onProcessed(function (result) { });

    Quagga.onDetected(function (result)
    {
        var code = result.codeResult.code;
        console.log(code);
        if (calc(code)) {
            document.getElementById("jan_input").value = code;
            searchItemName(code);
            doubledCheck(code);
            stopQuagga();
        };
    });
}
function startscanbutton()
{
    startScanner(deviceid);
    $("#photo-area").css("display", "initial");
    $('#modalArea').fadeIn();
    $('#closeModal ,#modalBg').click(function () { $('#modalArea').fadeOut(); stopQuagga(); });
}
function stopQuagga()
{
    Quagga.offProcessed();
    Quagga.offDetected();
    Quagga.stop();
    $('#modalArea').fadeOut();
    $("#photo-area").css("display", "none");

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
function insertData()
{
    itemName = document.getElementById("itemName").value;
    JAN = document.getElementById("jan_input").value;
    Daiban = document.getElementById("Daiban").value;
    Tana = document.getElementById("Dan").value;
    Retu = document.getElementById("Retu").value;
    Price = document.getElementById("price").value;
    isFood = document.getElementById("isFood").checked;
    isDoubled = document.getElementById("isDoubled").checked;
    if (itemName && JAN && Daiban && Tana && Retu && Price) {
        showload();
        doubledCheck(JAN);
        overwritecheck = [];
        overwritecheckJAN = "";
        overwriteJAN = [];
        overwritelive = false;
        overwriteliveJAN = "";
        overwritelivecode = "";
        overwritelist = [];
        $.when(
            doubledCheck(JAN),
            $.when(
                dataGet('Daiso', "Daiban", Daiban)
            ).done(
                function (data)
                {
                    Object.keys(data).forEach(function (i)
                    {
                        fordata = data[i];
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
                        ).done(
                            function (data)
                            {
                                Object.keys(data).forEach(function (n)
                                {
                                    fordata = data[n];
                                    overwritelist.push(n);
                                });
                                if (overwritelist.length >= 2) {
                                    overwritelive = true;
                                } else if (overwritelist.length <= 1) {
                                    overwritelive = false;
                                }
                            }
                        );
                    }
                }

            )
        ).done(function ()
        {
            if (overwriteJAN.length) {
                if (true) {
                    overwriteJAN.forEach(function (m)
                    {
                        $.when(
                            delData(m),
                            appendData(),
                            oldJANDataDel(JAN)
                        ).done(
                            function ()
                            {
                                resetData();
                                console.log("データ同一上書き");
                                showPopup("書き込み完了 種別:データ上書き");
                            }
                        );

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
                        ).done(
                            function ()
                            {
                                oldJANDataDel(JAN);
                                resetData();
                                showPopup("書き込み完了 種別:データ上書/旧データ消去");
                            }
                        );
                    } else {
                        jsondata = { "Daiban": "XXXX", "Tana": "XX", "Retu": "XX" };
                        $.when(
                            dataPatch("Daiso", overwritecheck[0], jsondata),
                            appendData()
                        ).done(
                            function ()
                            {
                                oldJANDataDel(JAN);
                                resetData();
                                showPopup("書き込み完了 種別:データ新規/旧データ退避");
                            }
                        );
                    }
                } else {
                }
            } else {
                $.when(
                    appendData(),
                    resetData(),
                    oldJANDataDel(JAN)
                ).done(
                    function ()
                    {
                        showPopup("書き込み完了 種別:データ新規");
                    }
                );
            }
            oldJANDataDel(JAN);
            showmain();
            $("#jan_input").focus();
            if (location.search) {
                window.close();
            }
        });
    } else {
        showPopup("入力されたデータがフォーマットに一致しません。");
        $("#jan_input").focus();
    }
};
function appendData()
{
    var dfd = $.Deferred();
    itemName = document.getElementById("itemName").value;
    JAN = document.getElementById("jan_input").value;
    Daiban = document.getElementById("Daiban").value;
    Tana = document.getElementById("Dan").value;
    Retu = document.getElementById("Retu").value;
    Price = document.getElementById("price").value;
    isFood = document.getElementById("isFood").checked;
    isDoubled = document.getElementById("isDoubled").checked;
    var data = { "Bumon": "24", "ItemName": itemName, "JAN": JAN, "Daiban": Daiban, "Tana": Tana, "Retu": Retu, "PB": "", "Price": Price, "isFood": isFood, "isDoubled": isDoubled };
    $.when(
        dataInsert("Daiso", data)
    ).done(
        function () { dfd.resolve(); }
    );
    return dfd.promise();

}
function resetData()
{
    document.getElementById("itemName").value = "";
    document.getElementById("jan_input").value = "";
    //document.getElementById("Daiban").value = "";
    document.getElementById("Dan").value = "";
    document.getElementById("Retu").value = "";
    document.getElementById("isDoubled").checked = false;
}
function getData()
{
    JAN = document.getElementById("jan_input").value;
    Daiban = document.getElementById("Daiban").value;
    Tana = document.getElementById("Dan").value;
    Retu = document.getElementById("Retu").value;
    if (Daiban && Tana && Retu) {
        showload();
        $.when(
            dataGet("Daiso", "Daiban", Daiban)
        ).done(
            function (data)
            {
                if (Object.keys(data).length) {
                    var isFound = false;
                    Object.keys(data).forEach(function (i)
                    {
                        var fordata = data[i];
                        if (fordata["Daiban"] == Daiban && fordata["Tana"] == Tana && fordata["Retu"] == Retu) {
                            openInfo(fordata);
                            isFound = true;
                        }
                        if (isFound == false) {
                            showPopup("一致データ無し");
                        }
                    });
                } else {
                    showPopup("一致データ無し");
                }
                showmain();
            }
        );
    } else if (JAN) {
        showload();
        $.when(
            dataGet("Daiso", "JAN", JAN)
        ).done(
            function (data)
            {
                if (Object.keys(data).length) {
                    Object.keys(data).forEach(function (i)
                    {
                        fordata = data[i];
                        if (fordata["JAN"] == JAN) {
                            openInfo(fordata);
                        }
                    });
                } else {
                    showPopup("一致データ無し");
                }
                showmain();
            }
        );
    } else {
        showPopup("検索クエリがありません。");
    }
};
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
function oldJANDataDel(JAN)
{
    var dfd = $.Deferred();
    oldlist = [];
    $.when(
        dataGet("Daiso", "JAN", JAN)
    ).done(function (data)
    {
        Object.keys(data).forEach(function (i)
        {
            if (data[i]["Daiban"] == "XXXX") {
                oldlist.push(i);
            }
        });
        oldlist.forEach(function (i)
        {
            delData(i);
        });
        dfd.resolve();
    });
    return dfd.promise();
}
function openInfo(e)
{
    data = e;
    document.getElementById("itemName").value = data["ItemName"];
    document.getElementById("jan_input").value = data["JAN"];
    document.getElementById("Daiban").value = data["Daiban"];
    document.getElementById("Dan").value = data["Tana"];
    document.getElementById("Retu").value = data["Retu"];
    $("#price").val(data["Price"]);
    $(".filter-option").html(data["Price"]);
    if (data["isFood"]) { document.getElementById("isFood").checked = true; }
    if (data["isDoubled"]) { document.getElementById("isDoubled").checked = true; }
}
function updateAllJAN()
{
    updatedflag = false;
    itemName = document.getElementById("itemName").value;
    JAN = document.getElementById("jan_input").value;
    Daiban = document.getElementById("Daiban").value;
    Tana = document.getElementById("Dan").value;
    Retu = document.getElementById("Retu").value;
    Price = document.getElementById("price").value;
    isFood = document.getElementById("isFood").checked;
    isDoubled = document.getElementById("isDoubled").checked;
    BeforeJAN = window.prompt("変更前JANコードを入力");
    if (!itemName || !JAN || !Price || !BeforeJAN) {
        alert("入力データが異常です。");
    } else {
        showload();
        $.when(
            dataGet("Daiso", "JAN", BeforeJAN)
        ).done(function (data)
        {
            alertmessagedata = data;
            Object.keys(data).forEach(function (i)
            {
                if (data[i]["JAN"] == BeforeJAN && BeforeJAN == JAN) {
                    var wdata = { "ItemName": itemName, "Price": Price, "isDoubled": isDoubled, "isFood": isFood };
                    dataPatch("Daiso", i, wdata);
                } else if (data[i]["JAN"] == BeforeJAN && BeforeJAN != JAN) {
                    if (!updatedflag) {
                        var wdata = { "Daiban": "XXXX", "Tana": "XX", "Retu": "XX" };
                        dataPatch("Daiso", i, wdata);
                        updatedflag = true;
                    } else {
                        delData(i);
                    }
                    maindata = { "Bumon": "24", "ItemName": itemName, "JAN": JAN, "Daiban": data[i]["Daiban"], "Tana": data[i]["Tana"], "Retu": data[i]["Retu"], "PB": "", "Price": Price, "isFood": isFood, "isDoubled": isDoubled };
                    dataInsert("Daiso", maindata);
                }
            });
            oldJANDataDel(JAN);
            resetData();
            showPopup("更新に成功しました。\n対象:" + Object.keys(alertmessagedata).length + "件");
            showmain();
        });

    }
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
function showload()
{
    $("#message").text("処理中");
    $("#main").fadeOut();
    $("#load").fadeIn();
}
function showmain()
{
    $("#load").fadeOut();
    $("#main").fadeIn();
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
            dfd.resolve();
        }
    );
    return dfd.promise();
}
function searchItemName(JAN)
{
    $.when(
        dataGet("Daiso", "JAN", JAN)
    ).done(function (data)
    {
        openInfo(data[Object.keys(data)]);
        document.getElementById("Dan").value = "";
        document.getElementById("Retu").value = "";
        document.getElementById("Daiban").focus();
    });
}
