function dataGetAll(path){
    var dfd = $.Deferred();
    firebase.database().ref(path).get().then(function(i){if(i.exists()){dfd.resolve(i.val())}else{dfd.resolve({})}})
    return dfd.promise();
}
console.log("Initialize...")
$.when(
    dataGetAll("Daiso"),
    dataGetAll("Main")
    ).done(
function(info1,info2){
    data = info1;
    arr = [];
    kohnanlist = []
    Object.keys(info2).forEach(function(i){
        kohnanlist.push(info2[i]["JAN"]);
    })
    Object.keys(info1).forEach(function(i){
        if(kohnanlist.indexOf(info1[i]["JAN"]) != -1){
            arr.push(i)
            console.log(i);
        }
    })
    console.log("競合データ数:"+arr.length)
    act();
}
)
function act() {
    // パラメータが無くなっていれば終了
    if(arr.length==0) return;
    // 配列の先頭を使う
    i = arr[0];
    //TODO: 何かの処理
    if(kohnanlist.indexOf(data[i]['JAN']) != -1){
        var jsondata = {"isDoubled":true};
        $.when(
            dataPatch("Daiso",i,jsondata)
        ).done(
            function(){
                console.log("重複あり:"+data[i]["ItemName"])
                // 処理済みのパラメータ削除
                arr.shift();
                console.log(arr.length)
                // 次の回の実行予約
                act();
                // これで１回の処理は終了
            }
        )
        
        
    }else{
        // 処理済みのパラメータ削除
        arr.shift();
        // 次の回の実行予約
        act();
        // これで１回の処理は終了
    }
}
