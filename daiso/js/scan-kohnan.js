var scandata = [];
var checkOftimeoutFlag = false;
var timeoutmsec = 60000;
var timeout;
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;

//touchstart:スリープ判定/touchmove~:ズームと移動禁止
function init()
{
    window.addEventListener('touchstart', logTouchStart);
    document.addEventListener("touchmove", no_scroll, { passive: false });
    document.addEventListener("mousewheel", no_scroll, { passive: false });
    settingDevice();
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
function sendRequest(code)
{
    $.when(
        dataGet("Main", "JAN", code)
    ).done(function (data)
    {
        displayData(data, code);
    });

}
function sendRequest_input()
{
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
        firebase.auth().onAuthStateChanged((user) =>
        {
            firebase.auth().signOut().then(() =>
            {
            })
                .catch((error) =>
                {
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
function displayData(data, code)
{
    console.log(Object.keys(data));
    if (Object.keys(data).length) {
        daibantext = "";
        jsondata = data;
        Object.keys(jsondata).forEach(function (i)
        {
            fordata = jsondata[i];
            daibantext += ("\n台番:" + fordata["Daiban"] + " 段:" + fordata["Tana"] + " 列:" + fordata["Retu"]);
        });
        maindata = jsondata[Object.keys(jsondata)[0]];
        pbcheck = "X";
        dbcheck = "X";
        fdcheck = "X";
        if (maindata["PB"] == 1) { pbcheck = "O"; };
        alert("部門:" + maindata["Bumon"] + "\nJANコード:" + maindata["JAN"] + "\n商品名:" + maindata["ItemName"] + "\n価格:" + maindata["Price"] + "\n" + daibantext);
        timeoutreset();
        showmain();
        startScanner(deviceid);
    } else {
        alert("検索しましたがデータが見つかりませんでした。\nJANコードが一致しているか確認してください。\nJANコード:" + code);
        showmain();
        startScanner(deviceid);
    }
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
function startScanner(_deviceid)
{
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
                width: 600,
                height: 600,
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
        if (scandata.length < 5) {
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
    });
}
function timeoutinit()
{
    checkOftimeoutFlag = false;
    timeout = setTimeout(readertimeout, timeoutmsec);
}
function timeoutreset()
{
    clearTimeout(timeout);
    timeoutinit();
}
function readertimeout()
{
    checkOftimeoutFlag = true;
    Quagga.offProcessed();
    Quagga.offDetected();
    Quagga.stop();
    fade();
}
function readerrecover()
{
    unfade();
    startScanner(deviceid);
    timeoutinit();
    checkOftimeoutFlag = false;
}
function logTouchStart()
{
    if (checkOftimeoutFlag) {
        return readerrecover();
    } else {
        return timeoutreset();
    }
}
function no_scroll(event)
{
    event.preventDefault();
}
function fade()
{
    var target = document.getElementById("fadeLayer");
    target.style.visibility = "visible";
}
function unfade()
{
    var target = document.getElementById("fadeLayer");
    target.style.visibility = "hidden";
}