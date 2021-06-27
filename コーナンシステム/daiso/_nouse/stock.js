var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
// var ui = new firebaseui.auth.AuthUI(firebase.auth());
var firebaseConfig = {
    apiKey: "AIzaSyDlqQrxpx5tXJkX_K33BPKbfHiOjFodbGE",
    authDomain: "konan089-a83b7.firebaseapp.com",
    databaseURL: "https://konan089-a83b7-default-rtdb.firebaseio.com",
    projectId: "konan089-a83b7",
    storageBucket: "konan089-a83b7.appspot.com",
    messagingSenderId: "932034786555",
    appId: "1:932034786555:web:91a52eede50a3d152aac5e",
    measurementId: "G-NXD6GY7SK3"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
var database = firebase.database();

function dataInsert(path,data){
    firebase.database().ref(path).push().set(data);
}
function dataGet(path,variable,data){
    var dfd = $.Deferred();
    firebase.database().ref(path).orderByChild(variable).equalTo(data).get().then(function(i){if(i.exists()){dfd.resolve(i.val())}else{dfd.resolve({})}})
    return dfd.promise();
}
function dataUpdate(path,key,data){
    var dfd = $.Deferred();
    firebase.database().ref(path).child(key).get().then(
        function(snapshot){if(snapshot.exists()){
            dataDelete(path,key);
            dataInsert(path,data);
            dfd.resolve();
        }else{
            dfd.resolve({});
        }}
    )
    return dfd.promise();
}
function dataPatch(path,key,data){
    var newdata = {};
    newdata['/'+path+'/'+key] = data;
    return firebase.database().ref().update(newdata);
}
function dataDelete(path,key){
    firebase.database().ref(path+"/"+key).remove()
}
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
  	startup();
  	userid = firebase.auth().currentUser.email;
    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
		idtoken = idToken;
        if(location.search){
            try{
                $("#jan_input").val(getParam('jan'));
                $("#Daiban").val(getParam('Daiban'));
                $("#Dan").val(getParam('Tana'));
                $("#Retu").val(getParam('Retu'));
                dbsearch(getParam('jan'));
            }catch{
    
            }
            
        }
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
	showload();
    $("#message").text("デバイスセットアップ...")
    settingDevice();
    $("#jan_input").change(function(){
        dbsearch($("#jan_input").val());
    })
    document.getElementById("jan_input").onkeypress = (e) => {
        key = e.keyCode || e.charCode || 0;
        if(key == 13 && location.search){
            if ($("jan_input").val() && $("itemName").val()){
                insertData();
            }else{
                alert("入力内容に不備があります。")
            }
        }
        
    }
    showmain();
    $("#jan_input").focus();
    
}
function dbsearch(JAN){
    showload();
    $("#message").text("データベース内を検索中")
    $.when(
        dataGet("Daiso","JAN",JAN),
        dataGet("Daiso_HTData","JAN",JAN)
    ).done(
        function(main,ht){
            var data = main;
            var htdata = ht;
            if(Object.keys(data).length){
                $("#itemName").val(data[Object.keys(data)[0]]["ItemName"]);
                $("#price").val(data[Object.keys(data)[0]]["Price"]);
                $(".filter-option").html(data[Object.keys(data)[0]]["Price"]);
                if (data[Object.keys(data)[0]]["isFood"]){document.getElementById("isFood").checked = true};
                if (data[Object.keys(data)[0]]["isDoubled"]){document.getElementById("isDoubled").checked = true;};
                showmain();
            }else if(Object.keys(htdata).length){
                $("#itemName").val(htdata[Object.keys(htdata)[0]]["ItemName"]);
                $("#itemName").focus();
                showmain();
            }else{
                showmain();
            }
        }
    )
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
        doubledCheck(code);
        stopQuagga();
        };
    });
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
    itemName = document.getElementById("itemName").value;
    JAN = document.getElementById("jan_input").value;
    Daiban = document.getElementById("Daiban").value;
    Tana = document.getElementById("Dan").value;
    Retu = document.getElementById("Retu").value;
    Price = document.getElementById("price").value;
    isFood = document.getElementById("isFood").checked;
    isDoubled = document.getElementById("isDoubled").checked;
    if(itemName && JAN && Daiban && Tana && Retu && Price){
        doubledCheck(JAN);
        overwritecheck = [];
        overwritecheckJAN = "";
        overwriteJAN=[];
        overwritelive=false;
        overwriteliveJAN = "";
        overwritelivecode = "";
        overwritelist = [];
        $.when(
            doubledCheck(JAN),
            $.when(
                dataGet('Daiso',"Daiban",Daiban)
            ).done(
                function(data){
                    Object.keys(data).forEach(function(i){
                        fordata = data[i];
                        if (fordata["JAN"] != JAN && fordata["Daiban"] == Daiban && fordata["Tana"]==Tana && fordata["Retu"]==Retu){
                            overwritecheck.push(i);
                            overwriteliveJAN = fordata["JAN"];
                        }else if (fordata["JAN"] == JAN && fordata["Daiban"] == Daiban && fordata["Tana"]==Tana && fordata["Retu"]==Retu){
                            overwriteJAN.push(i);
                        }else{
                            
                        }
                    })
                    if(overwritecheck.length){
                        $.when(
                            dataGet("Daiso","JAN",overwriteliveJAN)
                        ).done(
                            function(data){
                                Object.keys(data).forEach(function(n){
                                    fordata = data[n];
                                    overwritelist.push(n);
                                    })
                                if (overwritelist.length >= 2){
                                    overwritelive = true;
                                }else if(overwritelist.length <= 1){
                                    overwritelive = false;
                                }
                            }
                        )
                    }
                }
                
            )
        ).done(function(){
            if (overwriteJAN.length){
                if (confirm("同一JAN/台番で上書きしても良いですか？\n(複数ある場合は改廃の使用をおすすめします。)")){
                    overwriteJAN.forEach(function(m){
                        $.when(
                            delData(m),
                            appendData(),
                            oldJANDataDel(JAN)
                        ).done(
                            function(){
                                resetData();
                                console.log("データ同一上書き");
                                alert("上書き完了。(同一データ)");
                            }
                        )
                        
                    })
                }else{

                }
            }
            else if (overwritecheck.length){
                if (confirm("上書きしても良いですか？")){
                    if(overwritelive == true){
                        jsondata = {"ItemName":itemName,"JAN":JAN,"Price":Price,"isDoubled":isDoubled,"isFood":isFood};
                        $.when(
                            patchData(overwritecheck[0],jsondata)
                        ).done(
                            function(){
                                resetData();
                                console.log("データ保護上書き");
                            }   
                        )                        
                    }else{
                        jsondata = {"Daiban":"XXXX","Tana":"XX","Retu":"XX"}
                        $.when(
                            patchData(overwritecheck[0],jsondata),
                            appendData()
                        ).done(
                            function(){
                                resetData();
                                console.log("データ移動上書き");
                            }
                        )
                    }
                    $.when(oldJANDataDel(JAN)).done(
                        function(){
                            alert("上書き完了。");
                        }
                    )
                }else{
                }
            }else{
                $.when(
                    appendData(),
                    resetData(),
                    oldJANDataDel(JAN)
                ).done(
                    function(){
                        if(location.search){
                            window.close();
                        }else{
                            alert("書き込み完了。");
                        }
                    }
                )
            }
            showmain();
            $("#jan_input").focus();

        })
    }else{
        alert("入力されたデータが異常です")
        showmain();
        $("#jan_input").focus();
    }
};
function allremovedatabase(){
    $.when(
        $.getJSON('https://konan089-a83b7-default-rtdb.firebaseio.com/Daiso.json?auth='+idtoken)
    ).done(
        function(data){
            Object.keys(data).forEach(function(i){
                delData(i);
            })
        }
    )
}
function appendData(){
    var dfd = $.Deferred();
    itemName = document.getElementById("itemName").value;
    JAN = document.getElementById("jan_input").value;
    Daiban = document.getElementById("Daiban").value;
    Tana = document.getElementById("Dan").value;
    Retu = document.getElementById("Retu").value;
    Price = document.getElementById("price").value;
    isFood = document.getElementById("isFood").checked;
    isDoubled = document.getElementById("isDoubled").checked;
    var data = {"Bumon":"24","ItemName":itemName,"JAN":JAN,"Daiban":Daiban,"Tana":Tana,"Retu":Retu,"PB":"","Price":Price,"isFood":isFood,"isDoubled":isDoubled}
    $.when(
        dataInsert("Daiso",data)
    ).done(
        function(){dfd.resolve();}
        )
    return dfd.promise();

}
function resetData(){
    document.getElementById("itemName").value = "";
    document.getElementById("jan_input").value = "";
    //document.getElementById("Daiban").value = "";
    document.getElementById("Dan").value = "";
    document.getElementById("Retu").value = "";
    document.getElementById("isDoubled").checked = false;
}
function getData() {
    showload();
    JAN = document.getElementById("jan_input").value;
    Daiban = document.getElementById("Daiban").value;
    Tana = document.getElementById("Dan").value;
    Retu = document.getElementById("Retu").value;
    if (JAN){
        $.when(
            dataGet("Daiso","JAN",JAN)
        ).done(
            function(data){
                if (Object.keys(data).length){
                    Object.keys(data).forEach(function(i){
                        fordata = data[i];
                        if (fordata["JAN"] == JAN){
                            openInfo(fordata);
                        }
                    })
                }else{
                    alert("一致するデータは存在しませんでした。")
                }
            }
        )
    }else if(Daiban && Tana && Retu){
        $.when(
            dataGet("Daiso","Daiban",Daiban)
        ).done(
            function(data){
                if (Object.keys(data).length){
                    Object.keys(data).forEach(function(i){
                        var fordata = data[i];
                        if (fordata["Daiban"] == Daiban && fordata["Tana"]==Tana && fordata["Retu"]==Retu){
                            openInfo(fordata);
                        }
                    })
                }else{
                    alert("一致するデータは存在しませんでした。")
                }
            }   
        )
    }else{
        alert("検索情報(JAN・台番など)がありません。")
    }
    showmain();
};
function delData(dataid){
    var dfd = $.Deferred();
    $.when(
        dataDelete("Daiso",dataid)
    ).done(
        function(){dfd.resolve();}
    )
    return dfd.promise();
    
}
function oldJANDataDel(JAN){
    var dfd = $.Deferred();
    oldlist = [];
    $.when(
        dataGet("Daiso","JAN",JAN)
    ).done(function(data){
        Object.keys(data).forEach(function(i){
            if(data[i]["Daiban"] == "XXXX"){
                oldlist.push(i)
            }
        })
        oldlist.forEach(function(i){
            delData(i);
        })
        dfd.resolve();
    })
    return dfd.promise();
}
function patchData(dataid,jsondata){
    var dfd = $.Deferred();
    $.when(
        dataPatch("Daiso",dataid,jsondata)
    ).done(function(){dfd.resolve();})
    return dfd.promise();
}
function openInfo(e){
    data = e
    document.getElementById("itemName").value = data["ItemName"];
    document.getElementById("jan_input").value = data["JAN"];
    document.getElementById("Daiban").value = data["Daiban"];
    document.getElementById("Dan").value = data["Tana"];
    document.getElementById("Retu").value = data["Retu"];
    $("#price").val(data["Price"]);
    $(".filter-option").html(data["Price"])
    if (data["isFood"]){document.getElementById("isFood").checked = true}
    if (data["isDoubled"]){document.getElementById("isDoubled").checked = true;}
}
function updateAllJAN(){
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
    if(!itemName || !JAN || !Price || BeforeJAN==""){
        alert("入力データが異常です。")
    }else{
        showload();
        $.when(
            dataGet("Daiso","JAN",BeforeJAN)
        ).done(function(data){
            alertmessagedata = data;
            Object.keys(data).forEach(function(i){
                if (data[i]["JAN"] == BeforeJAN && BeforeJAN == JAN){
                    senddata = {"ItemName":itemName,"Price":Price,"isDoubled":isDoubled,"isFood":isFood};
                    patchData(i,senddata);
                }else if(data[i]["JAN"] == BeforeJAN && BeforeJAN != JAN){
                    jsondata = {"Daiban":"XXXX","Tana":"XX","Retu":"XX"}
                    if (!updatedflag){
                        patchData(i,jsondata);
                        updatedflag = true;
                    }else{
                        delData(i);
                    }
                    maindata = {"Bumon":"24","ItemName":itemName,"JAN":JAN,"Daiban":data[i]["Daiban"],"Tana":data[i]["Tana"],"Retu":data[i]["Retu"],"PB":"","Price":Price,"isFood":isFood,"isDoubled":isDoubled}
                    dataInsert("Daiso",maindata);
                }
            })
            oldJANDataDel(JAN);
            resetData();
            alert("更新に成功しました。\n対象:"+Object.keys(alertmessagedata).length+"件")
            showmain();
        })
        
    }
}
function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function showload(){
    $("#message").text("処理中")
    $("#main").fadeOut();
    $("#load").fadeIn();
}
function showmain(){
    $("#load").fadeOut();
    $("#main").fadeIn();
}
function doubledCheck(JAN){
    var dfd = $.Deferred();
    $.when(
        dataGet("Main","JAN",JAN)
    ).done(
        function(data){
            if(Object.keys(data).length){
                document.getElementById("isDoubled").checked = true;
            }else{
                document.getElementById("isDoubled").checked = false;
            }
            dfd.resolve();
        }
    )
    return dfd.promise();
}
function searchItemName(JAN){
    $.when(
        dataGet("Daiso","JAN",JAN)
    ).done(function(data){
        openInfo(data[Object.keys(data)]);
        document.getElementById("Dan").value = "";
        document.getElementById("Retu").value = "";
        document.getElementById("Daiban").focus();
    })
}
