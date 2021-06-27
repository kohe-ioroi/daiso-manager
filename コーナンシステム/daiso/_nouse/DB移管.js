function dataGetAll(path)
{
    var dfd = $.Deferred();
    firebase.database().ref(path).get().then(function (i) { if (i.exists()) { dfd.resolve(i.val()); } else { dfd.resolve({}); } });
    return dfd.promise();
}
console.log("Initialize...");
$.when(
    dataGetAll("Daiso"),
).done(
    (maindata) =>
    {
        info1 = maindata;
        arr = [];
        janlist = [];
        Object.keys(info1).forEach(function (i)
        {
            if (janlist.indexOf(info1[i]["JAN"]) == -1) {
                janlist.push(info1[i]["JAN"]);
                arr.push(i);
            }
        });
        console.log("データ数:" + arr.length);
        act();
    }
);
function act()
{
    // パラメータが無くなっていれば終了
    if (arr.length == 0) return;
    // 配列の先頭を使う
    i = arr[0];
    //TODO: 何かの処理
    data = { "Bumon": 24, "ItemName": info1[i]["ItemName"], "Price": info1[i]["Price"], "isDoubled": info1[i]["isDoubled"], "isFood": info1[i]["isFood"] };
    $.when(
        dataTargetInsert("Daiso_Master", info1[i]["JAN"], data)
    ).done(
        () =>
        {
            console.log("完了:" + info1[i]["ItemName"]);
            // 処理済みのパラメータ削除
            arr.shift();
            console.log(arr.length);
            // 次の回の実行予約
            act();
            // これで１回の処理は終了
        }
    );
}

