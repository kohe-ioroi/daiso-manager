var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
function init() {
    $("#jan_input").keydown((e) => {
        if (e.keyCode == 13) {
            inputData();
        }
    });
    $("#tana-code").keydown((e) => {
        if (e.keyCode == 13) {
            onChangeTana();
        }
    });
    $(".js-modal-close").on("click", () => {
        $('.js-modal').fadeOut();
        Quagga.offProcessed();
        Quagga.offDetected();
        Quagga.stop();
    })
    $("#jan_input").on("click", () => {
        if ($("#RenzokuInput").prop("checked") == true) {
            navigator.mediaDevices.enumerateDevices().then(
                (devices) => {
                    devices.forEach((e) => {
                        if (e.kind == "videoinput") {
                            startScanner();
                        }
                    })
                }
            )
        }
    })
    $("#tana-code").focus();
}
function errormessage(msgcode) {
    if (msgcode) {
        var msg = new Audio('./msg/' + msgcode + '.mp3');
        msg.play();
    }
}
function onChangeTana() {
    var tanacode = String($("#tana-code").val());
    if (tanacode.indexOf("D-") != -1 && tanacode.length == 6) {
        beep();
        $("#Daiban").val(tanacode.slice(2));
        $("#jan_input").focus();
    } else if (tanacode.length == 4 && isNaN(tanacode) == false) {
        beep();
        $("#Daiban").val(tanacode);
        $("#jan_input").focus();
    }
    else {
        $("#tana-code").val("");
        errormessage("e0003");//入力値エラー。
    }
}
function formReset() {
    $("#tana-code").val("");
    $("#jan_input").val("");
    $("#Daiban").val("");
    $("#Dan").val("01");
    $("#Retu").val("01");
    $("#tana-code").focus();
}
function inputData() {
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
                function (master) {
                    var data = master;
                    if (Object.keys(data).length) {
                        $.when(
                            insertData(data[Object.keys(data)[0]]["ItemName"], JAN, Daiban, Tana, Retu, data[Object.keys(data)[0]]["Price"], data[Object.keys(data)[0]]["isFood"], data[Object.keys(data)[0]]["isDoubled"])
                        ).done(() => {
                            showmain();
                            beep();
                            $("input").prop('disabled', false);
                            $('#jan_input').val("");
                            $('#jan_input').focus();
                            if ($("#RenzokuInput").prop("checked") == true) {
                                startScanner()
                            }
                        });
                    } else {
                        showmain();
                        errormessage("e0001");//マスタ登録なしエラー。
                        if (!window.open('/master.html?jan=' + JAN)) {
                            alert("ポップアップが拒否されたか、ブロックがONになっているため、商品の新規登録が行えません。\niPhone:設定→Safari→ポップアップブロックをOFF\nAndroid(Chrome):Chromeの設定→ポップアップを許可")
                        }
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

function insertData(itemName, JAN, Daiban, Tana, Retu, Price, isFood, isDoubled) {
    if (JAN && Daiban && Tana && Retu) {
        $.when(
            dataGet("Daiso", "Daiban", Daiban)
        ).done(
            (data1) => {
                var data = { "Bumon": "24", "ItemName": itemName, "JAN": JAN, "PB": "", "Price": Price, "Daiban": Daiban, "Tana": Tana, "Retu": Retu, "isFood": isFood, "isDoubled": isDoubled };
                Object.keys(data1).forEach((key) => {
                    if (data1[key]["Daiban"] == Daiban && data1[key]["Tana"] == Tana && data1[key]["Retu"] == Retu) {
                        dataDelete("Daiso", key);
                    }
                });
                dataInsert("Daiso", data);
            }
        );
    }

};


function deleteDaiban(Daiban) {
    if (Daiban != "XXXX" && Daiban != "" && confirm("指定の台番を削除してよろしいですか？No:" + Daiban)) {
        $.when(
            dataGet("Daiso", "Daiban", Daiban)
        ).done(
            (data) => {
                if (Object.keys(data).length == 0) {
                    showPopup("該当するデータがありませんでした。");
                    return false;
                }
                var count = 0;
                Object.keys(data).forEach(function (i) {
                    dataDelete("Daiso", i);
                    count++;
                });
                showPopup("削除処理完了 件数:" + count);
            }
        );
    }
}
function changeTana(switcher) {
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
    } else {
        alert("棚変更判定エラー");
    }

}

function startScanner(_deviceid) {
    $('.js-modal').fadeIn();
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
            if (scandata.length < 3) {
                scandata.push(code);
            }
            else {
                ans = scandata.mode()
                scandata = []
                Quagga.offProcessed();
                Quagga.offDetected();
                Quagga.stop();
                $("#jan_input").val(ans)
                inputData()
                $('.js-modal').fadeOut();
            };
        }
    });
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