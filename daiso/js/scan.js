var scandata = [];
var checkOftimeoutFlag = false;
var timeoutmsec = 60000;
var timeout;
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;

//touchstart:スリープ判定/touchmove~:ズームと移動禁止
function init() {
    window.addEventListener('touchstart', logTouchStart);
    document.addEventListener("touchmove", no_scroll, { passive: false });
    document.addEventListener("mousewheel", no_scroll, { passive: false });
    settingDevice();
}
function settingDevice() {
    navigator.mediaDevices.enumerateDevices()
        .then(function (devices) {
            devices.forEach(function (device) {
                if (device.kind == "videoinput") {
                    devicelist.push(device);
                }
            });
            if (localStorage.getItem("camera_choice")) {
                deviceid = devicelist[localStorage.getItem("camera_choice")].deviceId;
            }
            else {
                deviceid = devicelist[devicelist.length - 1].deviceId;
            }
            startScanner(deviceid);
            timeoutinit();
        });
}
function sendRequest(code) {
    $.when(
        dataGet("Daiso", "JAN", code),
        dataGet("Daiso_HTData", "JAN", code)
    ).done(function (data, info) {
        displayData(data, code, info);
    });

}
function sendRequest_input() {
    janValue = document.getElementById("jancode").value;
    if (janValue == "*1234*") {
        url = new URL(location);
        devid = Number(localStorage.getItem("camera_choice"));
        if (devicelist.length == 1) {
            alert("変更可能なカメラはありません。");
        }
        else if (devid + 1 < devicelist.length) {
            alert("CAM設定を" + (devid + 1) + "に変更します。");
            localStorage.setItem("camera_choice", devid + 1);
            location.reload();
        }
        else if (devid + 1 == devicelist.length) {
            alert("CAM設定を0に変更します。");
            localStorage.setItem("camera_choice", 0);
            location.reload();
        }
        else if (devicelist.length == 0) {
            alert("使用できるデバイスが存在しません。");
        }
        else {
            alert("例外発生:sendRequest_input()");
        }
    }
    else if (janValue == "*9999*") {
        alert("ログアウトします。");
        firebase.auth().onAuthStateChanged((user) => {
            firebase.auth().signOut().then(() => {
            })
                .catch((error) => {
                    alert("ログアウトに失敗しました。");
                });
        });
    }
    else if (janValue == "*1111*") {
        alert("Token:" + idtoken);
    }
    else {
        if (janValue.length == 8 || janValue.length == 13) {
            Quagga.offProcessed();
            Quagga.offDetected();
            Quagga.stop();
            showload();
            sendRequest(janValue);
            $("#jancode").val("");
        }
        else {
            alert("JANコードの桁数は8か13です。");
        }
    }
}
function displayData(data, code, info) {
    $("#modal_Bumon").text("")
    $("#modal_ItemName").text("")
    $("#modal_Image").attr("src", "/images/loading.gif")
    $("#modal_Checker").text("")
    $("#modal_Price").text("")
    $("#modal_Daiban").text("")
    if (Object.keys(data).length) {
        daibantext = "";
        jsondata = data;
        Object.keys(jsondata).forEach(function (i) {
            fordata = jsondata[i];
            daibantext += ("<br>台番:" + fordata["Daiban"] + " 段:" + fordata["Tana"] + " 列:" + fordata["Retu"]);
        });
        if (Object.keys(info).length) {
            isStock = info[Object.keys(info)[0]]["isStock"];
        } else {
            isStock = false;
        }
        maindata = jsondata[Object.keys(jsondata)[0]];
        stockcheck = "NG";
        pbcheck = "X";
        dbcheck = "X";
        fdcheck = "X";
        if (isStock) {
            stockcheck = "OK";
        }
        if (maindata["PB"] == 1) { pbcheck = "O"; };
        if (maindata["isDoubled"] == 1) { dbcheck = "O"; };
        if (maindata["isFood"] == 1) { fdcheck = "O"; };
        $("#modal_Bumon").text("部門:ダイソー JAN:" + maindata["JAN"])
        $("#modal_ItemName").text("品名:" + maindata["ItemName"])
        $("#modal_Image").attr("src", "https://konan089-a83b7.firebaseapp.com/ItemCD/" + maindata["JAN"] + ".jpg")
        $("#modal_Image").on('error', () => {
            $("#modal_Image").attr("src", "/images/no-image.png")
        })
        $("#modal_Checker").text("発注:" + stockcheck + " 競合:" + dbcheck + " 食品:" + fdcheck)
        $("#modal_Price").text("価格:" + maindata["Price"])
        $("#modal_Daiban").html(daibantext)
        $('.js-modal').fadeIn();
    } else {
        if (Object.keys(info).length) {
            data = info[Object.keys(info)[0]]
            if (Object.keys(info).length) {
                try {
                    isStock = info[Object.keys(info)[0]]["isStock"];
                } catch {
                    isStock = "invalid"
                }
            } else {
                isStock = false;
            }
            if (isStock == true) {
                stockcheck = "OK"
            } else if (isStock == "invalid") {
                stockcheck = "参照エラー"
            } else {
                stockcheck = "NG"
            }
            $("#modal_Bumon").text("部門:ダイソー JAN:" + data["JAN"])
            $("#modal_ItemName").text("品名:" + data["ItemName"])
            $("#modal_Image").attr("src", "https://konan089-a83b7.firebaseapp.com/ItemCD/" + data["JAN"] + ".jpg")
            $("#modal_Image").on('error', () => {
                $("#modal_Image").attr("src", "/images/no-image.png")
            })
            $("#modal_Checker").text("発注:" + stockcheck)
            $("#modal_Price").text("価格:不明")
            $("#modal_Daiban").html("<h1><font color='red'>店舗登録なし</font></h1>")
            $('.js-modal').fadeIn();
        } else {
            alert("検索しましたがデータが見つかりませんでした。\nJANコードが一致しているか確認してください。\nJANコード:" + code);
            showmain();
            startScanner(deviceid);
        }


    }
}
function closeDialog() {
    document.querySelector('dialog').close();
    timeoutreset();
    showmain();
    startScanner(deviceid);
}
function calc(isbn) {
    const arrIsbn = isbn
        .toString()
        .split("")
        .map(num => parseInt(num));
    let remainder = 0;
    const checkDigit = arrIsbn.pop();

    arrIsbn.forEach((num, index) => {
        remainder += num * (index % 2 === 0 ? 1 : 3);
    });
    remainder %= 10;
    remainder = remainder === 0 ? 0 : 10 - remainder;

    return checkDigit === remainder;
}
Array.prototype.mode = function () {
    if (this.length === 0) {
        //配列の個数が0だとエラーを返す。
        throw new Error("配列の長さが0のため最頻値が計算できません");
        //nullを返しても困らない時(配列の中にnullが無い時)はnullを返すように実装しても良い。
        //return null
    }
    //回数を記録する連想配列
    var counter = {};
    //本来の値を入れた辞書
    var nativeValues = {};

    //最頻値とその出現回数を挿入する変数
    var maxCounter = 0;
    var maxValue = null;

    for (var i = 0; i < this.length; i++) {
        //counterに存在しなければ作る。keyは型を区別する
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
function startScanner(_deviceid) {
    scandata = [];
    document.getElementById("scanprogress").value = scandata.length;
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
                width: 800,
                height: 800,
                deviceId: _deviceid
            },
        },
        decoder: {
            readers: [
                "ean_reader",
                "ean_8_reader"
            ]
        },
        locator: {
            halfSample: false,
            patchSize: "medium",
        }
    }, function (err) {
        if (err) {
            console.log(err);
            return;
        }

        Quagga.start();

        // Set flag to is running
        _scannerIsRunning = true;
    });

    Quagga.onProcessed(function (result) { });

    Quagga.onDetected(function (result) {
        var code = result.codeResult.code;
        if (["45", "49"].indexOf(String(code).slice(0, 2)) != -1) {
            if (scandata.length < 10) {
                scandata.push(code);
                $("#scanprogress").val(scandata.length);
            }
            else {
                $("#scanprogress").val(scandata.length);
                Quagga.offProcessed();
                Quagga.offDetected();
                Quagga.stop();
                showload();
                sendRequest(scandata.mode());
            };
        }
    });
}
function timeoutinit() {
    checkOftimeoutFlag = false;
    timeout = setTimeout(readertimeout, timeoutmsec);
}
function timeoutreset() {
    clearTimeout(timeout);
    timeoutinit();
}
function readertimeout() {
    checkOftimeoutFlag = true;
    Quagga.offProcessed();
    Quagga.offDetected();
    Quagga.stop();
    fade();
}
function readerrecover() {
    unfade();
    startScanner(deviceid);
    timeoutinit();
    checkOftimeoutFlag = false;
}
function logTouchStart() {
    if (checkOftimeoutFlag) {
        return readerrecover();
    } else {
        return timeoutreset();
    }
}
function no_scroll(event) {
    event.preventDefault();
}
function fade() {
    var target = document.getElementById("fadeLayer");
    target.style.visibility = "visible";
}
function unfade() {
    var target = document.getElementById("fadeLayer");
    target.style.visibility = "hidden";
}