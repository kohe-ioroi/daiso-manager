var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
var a = 0;
var b = 0;
var c = 0;
var d = 0;
var e = 0;
var f = 0;
var g = 0;
var h = 0;
var i = 0;
var j = 0;
var k = 0;
var l = 0;
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
function getToken(){
    firebase.auth().currentUser.getIdToken(true).then(function(i) {
		idtoken = i;
	}).catch(function(error) {
	});
}
function init(){
    $("#jan_input").keypress(function(i){
        if(i.which == 13){
            insert($('#jan_input').val());
        }
    });
    $("#100t,#100ft,#150t,#200t,#250t,#300t,#400t,#500t,#600t,#700t,#800t,#1000t").hide();
    $("#100,#100f,#150,#200,#250,#300,#400,#500,#600,#700,#800,#1000").hide();
    $("#jan_input").blur(function(){$("#jan_input").focus();});
    $("#jan_input").focus();
}
function errormessage(msgcode){
    if(msgcode){
        var msg = new Audio('./msg/'+msgcode+'.mp3');
        msg.play();
    }
}
function message(msgcode){
    if(msgcode){
        var msg = new Audio('./msg/'+msgcode+'.mp3');
        msg.play();
    }
}
function formReset(){
    $("#jan_input").val("");
    a = 0;
    b = 0;
    c = 0;
    d = 0;
    e = 0;
    f = 0;
    g = 0;
    h = 0;
    i = 0;
    j = 0;
    k = 0;
    l = 0;
}
function insert(JAN){
    if(JAN.length == 8 || JAN.length == 13){
        $.when(
            dataGet("Daiso","JAN",JAN)
        ).done(
            function(x){
                if(Object.keys(x).length){
                    $("#itemname").text(x[Object.keys(x)[0]]['ItemName']);
                    price = x[Object.keys(x)[0]]['Price'];
                    isFood = x[Object.keys(x)[0]]['isFood'];
                    if(isFood){
                        message("100f");
                        b++;
                        $("#100ft,#100f").show();
                        $("#100f").text(b);
                    }else{
                        message(price);
                        if(price == "100"){
                            a++;
                            $("#100t,#100").show();
                            $("#100").text(a);
                        }else if(price == "150"){
                            c++;
                            $("#150t,#150").show();
                            $("#150").text(c);
                        }else if(price == "200"){
                            d++;
                            $("#200t,#200").show();
                            $("#200").text(d);
                        }else if(price == "250"){
                            e++;
                            $("#250t,#250").show();
                            $("#250").text(e);
                        }else if(price == "300"){
                            f++;
                            $("#300t,#300").show();
                            $("#300").text(f);
                        }else if(price == "400"){
                            g++;
                            $("#400t,#400").show();
                            $("#400").text(g);
                        }else if(price == "500"){
                            h++;
                            $("#500t,#500").show();
                            $("#500").text(h);
                        }else if(price == "600"){
                            i++;
                            $("#600t,#600").show();
                            $("#600").text(i);
                        }else if(price == "700"){
                            j++;
                            $("#700t,#700").show();
                            $("#700").text(j);
                        }else if(price == "800"){
                            k++;
                            $("#800t,#800").show();
                            $("#800").text(k)
                        }else if(price == "1000"){
                            l++;
                            $("#1000t,#1000").show();
                            $("#1000").text(l)
                        }else{
                        }
                    }
                    
                    $("#sum").text(a*100 + b*100 + c*150 + d*200 + e*250 + f*300 + g*400 + h*500 + i*600 + j*700 + k*800 + l*1000)
                    $("#price").text(price);
                    
                }else{
                    beep();
                    message("nodaiso");
                }
            }
        ).fail(
            function(){
                beep();
                message('nodata');
            }
        )
    }else{

    }
    $("#jan_input").val("");
    
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
function showload(){
    $("#message").text("処理中")
    $("#main").fadeOut(100);
    $("#load").fadeIn(100);
}
function showmain(){
    $("#load").fadeOut(100);
    $("#main").fadeIn(100);
}