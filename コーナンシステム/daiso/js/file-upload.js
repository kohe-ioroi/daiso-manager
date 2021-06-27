var fileup;
function init()
{
    if (window.File) {
    }
    else {
        alert('File APIは利用できません');
    }
    fileup = document.getElementById("fileup");
    fileup.onchange = () => { makepath(); };
    filelist = [];
    firebase.storage().ref().listAll().then((res) =>
    {
        res.items.forEach(
            (dd) =>
            {
                filelist.push({ "filepath": dd.fullPath });
            });
        $('#columns').columns({
            data: filelist,
            schema: [
                { "header": "ファイル名", "key": "filepath", "template": "<a href='javascript:void(0);' onclick='downloader(\"{{filepath}}\");'>{{filepath}}</a>" },
                { "header": "削除", "key": "filepath", "template": "<a href='javascript:void(0);' onclick='deleter(\"{{filepath}}\");'>削除</a>" },
            ],
            size: 100,
            showRows: [-1, 30, 50, 100, 1000, 10000]
        });
    });
}
function downloader(filepath)
{
    firebase.storage().ref().child(filepath).getDownloadURL().then(function (url)
    {
        window.open(url);
    });
}
function deleter(filepath)
{
    firebase.storage().ref().child(filepath).delete().then(function (url)
    {
        location.reload();
    });
}
function makepath()
{
    var storageRef = firebase.storage().ref();
    var fileRef = storageRef.child(fileup.files[0].name);
    var file = fileup.files[0];
    if (file.size < 67108864) {
        fileRef.put(file).then((ss) =>
        {
            location.reload();
        });
    } else {
        alert("ファイルサイズが大きすぎます。64MB以内でアップロードしてください。");
        fileup.value = "";
    }

}
function showload()
{
    $("#message").text("処理中");
    $("#main").fadeOut(50);
    $("#load").fadeIn(50);
}
function showmain()
{
    $("#load").fadeOut(50);
    $("#main").fadeIn(50);
}