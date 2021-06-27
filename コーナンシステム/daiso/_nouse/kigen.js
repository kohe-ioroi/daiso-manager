var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
var ui = new firebaseui.auth.AuthUI(firebase.auth());
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
  	startup();
  	userid = firebase.auth().currentUser.email;
    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
		idtoken = idToken;
        showTable();
	}).catch(function(error) {
	});
  } else {
  	$(".hideme").css("visibility","hidden");
    var uiConfig = {
	  callbacks: {
	    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
	      // User successfully signed in.
	      // Return type determines whether we continue the redirect automatically
	      // or whether we leave that to developer to handle.
	      return true;
	    },
	    uiShown: function() {
	      // The widget is rendered.
	      // Hide the loader.
	    }
	  },
	  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
	  signInFlow: 'popup',
	  signInSuccessUrl: '/',
	  signInOptions: [
	    firebase.auth.EmailAuthProvider.PROVIDER_ID,
	  ],
		};
		ui.start('#firebaseui-auth-container', uiConfig);
	  }
});
function startup(){
    // document.addEventListener("touchmove", no_scroll, { passive: false });
    // document.addEventListener("mousewheel", no_scroll, { passive: false });
	settingDevice();
    $("#jan_input").change(function(){
        showload();
        $.when(
            $.getJSON('https://konan089-a83b7-default-rtdb.firebaseio.com/Daiso.json?orderBy="JAN"&equalTo="'+$("#jan_input").val()+'"&auth='+idtoken)
        ).done(
            function(data){
                try{
                    $("#itemName").val(data[Object.keys(data)[0]]["ItemName"]);
                    showmain();
                }catch(e){
                    showmain();
                }
                
            }
        )
    })
}
function settingDevice(){
    navigator.mediaDevices.enumerateDevices()
    .then(function(devices){
        devices.forEach(function(device){
            if (device.kind == "videoinput"){
                devicelist.push(device);
            }
        });
        dev1 = new URL(location).searchParams.get("cam");
        if (dev1){
            deviceid = devicelist[dev1].deviceId;
        }
        else{
            deviceid = devicelist[devicelist.length -1].deviceId;
        }
    });
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
    if (this.length === 0){
        throw new Error("ERROR");    }
    var counter = {}
    var nativeValues = {}

    var maxCounter = 0;
    var maxValue = null;

    for (var i = 0; i < this.length; i++) {        if (!counter[this[i] + "_" + typeof this[i]]) {
            counter[this[i] + "_" + typeof this[i]] = 0;
        }
        counter[this[i] + "_" + typeof this[i]]++;
        nativeValues[this[i] + "_" + typeof this[i]] = this[i];

    }
    for (var j = 0; j < Object.keys(counter).length; j++) {
        key = Object.keys(counter)[j];
        if (counter[key] > maxCounter) {
            maxCounter = counter[key];
            maxValue = nativeValues[key]
        }
    }
    return maxValue

}
function startScanner(_deviceid) {
    scandata = []
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
        locator:{
            halfSample: true,
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

    Quagga.onProcessed(function (result) {});

    Quagga.onDetected(function (result) {
        var code = result.codeResult.code;
        console.log(code);
        if (calc(code)){
        document.getElementById("jan_input").value=code;
        searchItemName(code);
        stopQuagga();
        };
    });
}
function searchItemName(code){
    $.when(
        $.getJSON('https://konan089-a83b7-default-rtdb.firebaseio.com/Daiso.json?orderBy="JAN"&equalTo="'+code+'"&auth='+idtoken)
    ).done(
        function(data){
            try{
                $("#itemName").val(data[Object.keys(data)[0]]["ItemName"]);
                $("#Year").focus()
            }catch(e){
            }
            
        }
    )
}
function startscanbutton(){
    startScanner(deviceid);
    $("#photo-area").css("display","initial");
    $('#modalArea').fadeIn();
    $('#closeModal ,#modalBg').click(function(){$('#modalArea').fadeOut();stopQuagga();})
}
function stopQuagga(){
    Quagga.offProcessed();
    Quagga.offDetected();
    Quagga.stop();
    $('#modalArea').fadeOut();
    $("#photo-area").css("display","none");
    
}
function no_scroll(event) {
    event.preventDefault();
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
    showload();
    itemName = $("#itemName").val();
    JAN = $("#jan_input").val();
    Year = $("#Year").val();
    Month = $("#Month").val();
    Day = $("#Day").val();
    if(itemName && JAN && Year.length == 4 && Month.length == 2 && Month <= 12 && Day.length == 2 && Day <= 31){
        if(confirm("次の内容で間違いないですか?\n\nJAN:"+JAN+"\n商品名:"+itemName+"\n期限日:"+Year+" 年"+Month+" 月"+Day+" 日")){
            jsondata = {"ItemName":itemName,"JAN":JAN,"Year":Year,"Month":Month,"Day":Day};
            appendData(jsondata);
            alert("追加に成功しました。")
            location.reload();
        }
    }else{
        alert("入力された数値が不適切です。");
    }
    showmain();
};
function appendData(jsondata){
    $.ajax({
        type: 'POST',
        url: 'https://konan089-a83b7-default-rtdb.firebaseio.com/Daiso_Limit.json?auth='+idtoken,
        dataType:'json',
        data:JSON.stringify(jsondata),
        crossDomain: true,
        success: function(e){return true;},
        error: function(){alert("Ajax接続エラー/appendData")}
    });
}
function resetData(){
    $("#itemName").val("");
    $("#jan_input").val("");
    $("#Year").val("");
    $("#Month").val("");
    $("#Day").val("");
}
function getData() {
    showload();
    itemName = $("#itemName").val();
    JAN = $("#jan_input").val();
    Year = $("#Year").val();
    Month = $("#Month").val();
    Day = $("#Day").val();
    DataList = [];
    if (JAN){
        $.ajax({
            type: 'GET',
            url: 'https://konan089-a83b7-default-rtdb.firebaseio.com/Daiso_Limit.json?orderBy="JAN"&equalTo="'+JAN+'"&auth='+idtoken,
            dataType:'text',
            crossDomain: true,
            success: function(e){
                data = JSON.parse(e)
                if (Object.keys(data).length){
                    Object.keys(data).forEach(function(i){
                        DataList.push(data[i]["Year"]+"/"+data[i]["Month"]+"/"+data[i]["Day"]+"#"+i);
                    })
                    DataList.sort();
                    try{
                        $("#Year").val(data[DataList[0].split("#")[1]]["Year"]);
                        $("#Month").val(data[DataList[0].split("#")[1]]["Month"]);
                        $("#Day").val(data[DataList[0].split("#")[1]]["Day"]);
                    }catch(e){

                    }
                }else{
                    alert("一致するデータは存在しませんでした。")
                }
            },
            error: function(){alert("Ajax接続エラー/getData/JAN")}
            });
    }else{
        alert("JANがありません。")
    }
    showmain();
};
function delData(dataid){
    $.ajax({
        type: 'DELETE',
        url: 'https://konan089-a83b7-default-rtdb.firebaseio.com/Daiso_Limit/'+dataid+'.json?auth='+idtoken,
        crossDomain: true,
        success: function(e){return true;},
        error: function(){alert("Ajax接続エラー/delData")}
    });
}
function patchData(dataid,jsondata){
    $.ajax({
        type: 'PATCH',
        url: 'https://konan089-a83b7-default-rtdb.firebaseio.com/Daiso_Limit/'+dataid+'.json?auth='+idtoken,
        dataType:'JSON',
        data:JSON.stringify(jsondata),
        crossDomain: true,
        success: function(e){return true;},
        error: function(){alert("Ajax接続エラー/patchData")}
    });
}
function openInfo(e){
    data = e
    document.getElementById("itemName").value = data["ItemName"];
    document.getElementById("jan_input").value = data["JAN"];
    $("#Year").val(data["Year"]);
    $("#Month").val(data["Month"]);
    $("#Day").val(data["Day"]);
}
function showload(){
    $("#main").fadeOut();
    $("#load").fadeIn();
}
function showmain(){
    $("#load").fadeOut();
    $("#main").fadeIn();
}
function deleteLimitData() {
    showload();
    itemName = $("#itemName").val();
    JAN = $("#jan_input").val();
    Year = $("#Year").val();
    Month = $("#Month").val();
    Day = $("#Day").val();
    DataList = [];
    isDeleted = false;
    if (JAN && Year && Month && Day){
        $.ajax({
            type: 'GET',
            url: 'https://konan089-a83b7-default-rtdb.firebaseio.com/Daiso_Limit.json?orderBy="JAN"&equalTo="'+JAN+'"&auth='+idtoken,
            dataType:'text',
            crossDomain: true,
            success: function(e){
                data = JSON.parse(e)
                if (Object.keys(data).length){
                    Object.keys(data).forEach(function(i){
                        if(data[i]["Year"] == Year && data[i]["Month"] == Month && data[i]["Day"] == Day){
                            delData(i);
                            isDeleted = true;
                        }
                        

                    })
                    if(isDeleted){
                        alert("該当する日付のデータを削除しました。")
                        location.reload();
                    }else{
                        alert("データがありませんでした。")
                    }
                }else{
                    alert("一致するデータは存在しませんでした。")
                }
            },
            error: function(){alert("Ajax接続エラー/getData/JAN")}
            });
    }else{
        alert("入力された数値が不適切です。")
    }
    showmain();
};

function showTable(){
    var jsondata = new Object();
    $.when(
    $.ajax({
        type: 'GET',
        url: 'https://konan089-a83b7-default-rtdb.firebaseio.com/Daiso_Limit.json?auth='+idtoken,
        dataType:'text',
        crossDomain: true,
        success: function(e){
            data = JSON.parse(e)
            Object.keys(data).forEach(function(i){
                var now = new Date();
                var after1month = now;
                after1month.setDate(now.getDate() + 30);
                var datadate = new Date(data[i]["Year"]+"/"+data[i]["Month"]+"/"+data[i]["Day"]);
                if(datadate < after1month){
                    jsondata[i] = {"JAN":data[i]["JAN"],"ItemName":data[i]["ItemName"],"Limit":data[i]["Year"]+"/"+data[i]["Month"]+"/"+data[i]["Day"]};
                }
            })
        },
        error: function(){alert("マスタデータの受信に失敗しました。\nログイン情報を確認してください。")}
        })
    ).done(function(){
        obj = jsondata;
        try{
            $('#columns').columns({
                data:Object.keys(jsondata).map(function (key) {return obj[key]}),
                schema:[
                    {"header":"商品名","key":"ItemName"},
                    {"header":"JANコード","key":"JAN"},
                    {"header":"日付","key":"Limit"},
                ],
                size:3,
                showRows:[3,5,100,9999]
            })
        }catch(e){
      $("#columns").text("データが存在しないか接続に失敗しました。");
        }
    })
}