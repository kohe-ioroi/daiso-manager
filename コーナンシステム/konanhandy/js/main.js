var scandata = [];
var checkOftimeoutFlag = false;
var timeoutmsec = 30000;
var timeout;
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
var ui = new firebaseui.auth.AuthUI(firebase.auth());
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
  	startup();
  	userid = firebase.auth().currentUser.email;
    document.getElementById("userid").innerText=userid;
    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
		idtoken = idToken;
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



//touchstart:スリープ判定/touchmove~:ズームと移動禁止
function startup(){
    window.addEventListener('touchstart', logTouchStart);
    document.addEventListener("touchmove", no_scroll, { passive: false });
    document.addEventListener("mousewheel", no_scroll, { passive: false });
	settingDevice();
	makeManifest();
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
        startScanner(deviceid);
        timeoutinit();
    });
}
function sendRequest(code) {
    $.when(
        $.getJSON('https://konan089-a83b7-default-rtdb.firebaseio.com/Main.json?orderBy="JAN"&equalTo="'+code+'"'+'&auth='+idtoken)
    ).done(function(e){
        displayData(e)
    })
}
function sendRequest_input(){
    janValue = document.getElementById("jancode").value
    if (janValue == "*1234*"){
        url = new URL(location);
        devid = Number(url.searchParams.get("cam"));
        if (devicelist.length == 1){
            alert("変更可能なカメラはありません。");
        }
        else if (devid+1 < devicelist.length){
            alert("CAM設定を"+(devid+1)+"に変更します。");
            url.searchParams.set("cam",devid+1);
            location.href = url.toString();
        }
        else if (devid+1 == devicelist.length){
            alert("CAM設定を0に変更します。");
            url.searchParams.set("cam",0);
            location.href = url.toString();
        }
        else if (devicelist.length == 0){
            alert("使用できるデバイスが存在しません。");
        }
        else{
            alert("例外発生:sendRequest_input()");
        }
    }
    else if(janValue == "*9999*"){
    	alert("ログアウトします。")
    	firebase.auth().onAuthStateChanged( (user) => {
		  firebase.auth().signOut().then(()=>{
		  })
		  .catch( (error)=>{
		    alert("ログアウトに失敗しました。");
		  });
		});
    }
    else if(janValue == "*1111*"){
    	alert("Token:"+idtoken);
    }
    else{
        if (janValue.length == 8 || janValue.length == 13){
            Quagga.offProcessed();
            Quagga.offDetected();
            Quagga.stop();
            showload();
            sendRequest(janValue);
            document.getElementById("jancode").value = "";
        }
        else{
            alert("JANコードの桁数は8か13です。")
        }
    }
}
function displayData(pdata) {
    data = JSON.parse(pdata);
    console.log(Object.keys(data));
    if (Object.keys(data).length){
    daibantext = "";
    jsondata = JSON.parse(pdata);
    Object.keys(jsondata).forEach(function(i){
        fordata = jsondata[i];
        daibantext +=("\n台番:"+fordata["Daiban"]+" 段:"+fordata["Tana"]+" 列:"+fordata["Retu"]);
    });
    maindata = jsondata[Object.keys(jsondata)[0]];
    pbcheck="X";
    if(maindata["PB"] == 1){pbcheck="O"};
    alert("部門:"+maindata["Bumon"]+"\nJANコード:"+maindata["JAN"]+"\n商品名:"+maindata["ItemName"]+"\nPB判定:"+pbcheck+daibantext);
    timeoutreset();
    showmain();
    startScanner(deviceid);
    }else{
        alert("検索できませんでした。");
        showmain();
        startScanner(deviceid);
    }   
}
function ajaxerror(){
    alert("通信エラーです。");
    showmain();
    startScanner(deviceid);
}
function showload(){
    $("#main").fadeOut();
    $("#load").fadeIn();
}
function showmain(){
    $("#load").fadeOut();
    $("#main").fadeIn();
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
        //配列の個数が0だとエラーを返す。
        throw new Error("配列の長さが0のため最頻値が計算できません");
        //nullを返しても困らない時(配列の中にnullが無い時)はnullを返すように実装しても良い。
        //return null
    }
    //回数を記録する連想配列
    var counter = {}
    //本来の値を入れた辞書
    var nativeValues = {}

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
            maxValue = nativeValues[key]
        }
    }
    return maxValue

}
function startScanner(_deviceid) {
    scandata = []
    document.getElementById("scanprogress").value=scandata.length;
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
        if (scandata.length < 5){
            scandata.push(code);
            document.getElementById("scanprogress").value=scandata.length;
        }
        else{
            document.getElementById("scanprogress").value=scandata.length;
            Quagga.offProcessed();
            Quagga.offDetected();
            Quagga.stop();
            showload();
            sendRequest(scandata.mode());
        };
    });
}
function timeoutinit(){
    checkOftimeoutFlag = false;
    timeout = setTimeout(readertimeout,timeoutmsec);
}
function timeoutreset(){
    clearTimeout(timeout);
    timeoutinit();
}
function readertimeout(){
    checkOftimeoutFlag = true;
    Quagga.offProcessed();
    Quagga.offDetected();
    Quagga.stop();
    fade();
}
function readerrecover(){
    unfade();
    startScanner(deviceid);
    timeoutinit();
    checkOftimeoutFlag = false;
}
function logTouchStart() {
    if (checkOftimeoutFlag){
        return readerrecover();
    }else{
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

function makeManifest() {
    var myUrl = window.location.protocol + '//' + window.location.host;
    var camid = new URL(location).searchParams.get("cam");
        if (camid){
            var startUrl = myUrl + "?cam=" + camid;
        }
        else{
            var startUrl = myUrl;
        }
    var manifest = {
      "name": "ﾐﾆﾊﾝﾃﾞｨ 089店",
      "short_name": "HANDY Cid:"+camid,
      "display": "standalone",
      "start_url": startUrl,
      "icons": [
        {
          "src": myUrl + "/icon.png",
          "sizes": "256x256",
          "type": "image/png"
        }
      ]
    }

    const stringManifest = JSON.stringify(manifest);
    const blob = new Blob([stringManifest], {type: 'application/json'});
    const manifestURL = URL.createObjectURL(blob);
    document.querySelector('#my-manifest').setAttribute('href', manifestURL);
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service_worker.js').then(function () {});
    }
}