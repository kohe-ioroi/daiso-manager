// Firebase ConfigをInitialize
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
// Firebase Appが過剰登録されていないか確認
if (firebase.apps.length === 0) {
	firebase.initializeApp(firebaseConfig);
}
//認証シーケンス
var ui = new firebaseui.auth.AuthUI(firebase.auth());
firebase.auth().onAuthStateChanged(function (user)
{
	if (user) {
		firebase.auth().currentUser.getIdToken(true).then(function (idToken)
		{
			idtoken = idToken;
			userid = firebase.auth().currentUser.email;
			if (userid != "konan089@handy.app") {
				alert("不正なユーザーを検知しました。管理者に問い合わせてください。ログアウトを実行します。");
				firebase.auth().signOut();
			} else {
				database = firebase.database();
				init();
			}
		}).catch((e) => { });
	} else {
		// 6月20日まで開放
		$(".hideme").css("visibility", "hidden");
		// var uiConfig = {
		// 	callbacks: {
		// 		signInSuccessWithAuthResult: function (authResult, redirectUrl)
		// 		{
		// 			return true;
		// 		},
		// 		uiShown: function ()
		// 		{
		// 		}
		// 	},
		// 	signInFlow: 'popup',
		// 	signInSuccessUrl: location.href,
		// 	signInOptions: [
		// 		firebase.auth.EmailAuthProvider.PROVIDER_ID,
		// 	],
		// };
		// ui.start('#firebaseui-auth-container', uiConfig);
		var password = window.prompt("パスワードを入力してください。");
		if (password == null) { location.reload(); }
		firebase.auth().signInWithEmailAndPassword("konan089@handy.app", password).then(
			() => { alert("ログインに成功しました。"); location.reload(); },
			() => { alert("ログインに失敗しました。パスワードを確認してください。"); location.reload(); }
		);
	}
});

function regexTest(regex, str)
{
	var REGEXP = new RegExp(regex);
	return REGEXP.test(str);
}

function getParam_init(name, url)
{
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function funcCompare(a, b)
{
	if (a["Daiban"] < b["Daiban"]) return -1;
	if (a["Daiban"] > b["Daiban"]) return 1;
	if (a["Tana"] < b["Tana"]) return -1;
	if (a["Tana"] > b["Tana"]) return 1;
	if (a["Retu"] < b["Retu"]) return -1;
	if (a["Retu"] > b["Retu"]) return 1;
	return 0;
}
//下記よりCRUD命令
//指定したデータを自動パスで追加(C)
function dataInsert(path, data)
{
	var dfd = $.Deferred();
	firebase.database().ref(path).push().set(data).then(
		() =>
		{
			dfd.resolve();
		}
	);
	return dfd.promise();
}
//指定したデータを指定パスで追加(C)
function dataTargetInsert(path, target, data)
{
	var dfd = $.Deferred();
	firebase.database().ref(path + "/" + target).set(data).then(
		() =>
		{
			dfd.resolve();
		}
	);
	return dfd.promise();
}
//指定したキーで検索して取得(R)
function dataGet(path, variable, data)
{
	var dfd = $.Deferred();
	firebase.database().ref(path).orderByChild(variable).equalTo(data).once("value").then(
		(i) =>
		{
			if (i.exists()) { dfd.resolve(i.val()); } else { dfd.resolve({}); }
		});
	return dfd.promise();
}
//指定したパスを取得(R)
function getMaster(path, key)
{
	var dfd = $.Deferred();
	firebase.database().ref(path).orderByChild(key).once("value").then(
		(i) =>
		{
			if (i.exists()) { dfd.resolve(i.val()); } else { dfd.resolve({}); }
		});
	return dfd.promise();
}
//指定したキーを指定データで上書き(U)
function dataUpdate(path, key, data)
{
	var dfd = $.Deferred();
	firebase.database().ref(path).child(key).get().then(
		(snapshot) =>
		{
			if (snapshot.exists()) {
				dataDelete(path, key);
				dataInsert(path, data);
				dfd.resolve();
			} else {
				dfd.resolve({});
			}
		}
	);
	return dfd.promise();
}
//指定したキーを指定差分データで更新(U)
function dataPatch(path, key, data)
{
	var dfd = $.Deferred();
	firebase.database().ref(path).child(key).update(data).then(
		() =>
		{
			dfd.resolve();
		}
	);
	return dfd.promise();
}
//指定したキーを削除(D)
function dataDelete(path, key)
{
	var dfd = $.Deferred();
	firebase.database().ref(path + "/" + key).remove().then(
		() =>
		{
			dfd.resolve();
		}
	);
	return dfd.promise();
}
//指定したパスのデータをすべて取得
function TableGet(path)
{
	var dfd = $.Deferred();
	firebase.database().ref(path).once("value").then(
		(i) =>
		{
			if (i.exists()) { dfd.resolve(i.val()); } else { dfd.resolve({}); }
		});
	return dfd.promise();
}


window.onbeforeprint = () =>
{
	$("[name=JANCODE]").each((index, element) =>
	{
		if (String($(element).text()).length == 13) {
			$(element).barcode(String($(element).text()), "ean13", { barWidth: 1, barHeight: 10 });
		} else if (String($(element).text()).length == 8) {
			$(element).barcode(String($(element).text()), "ean8", { barWidth: 1, barHeight: 10 });
		}
	});
};

//メッセージウインドウを作成。５秒後に自動で消滅する。
function showPopup(msg)
{
	if (typeof popuptimer !== "undefined") {
		clearTimeout(popuptimer);
	}
	$(".popup").text(msg);
	$('.popup').addClass('js_active');
	$('.popup').hover(() => { $('.popup').removeClass('js_active'); });
	popuptimer = setTimeout(() => { $('.popup').removeClass('js_active'); }, 5000);
}
function showload()
{
	$("#message").text("処理中");
	$("#main").fadeOut();
	$("#load").fadeIn();
}
function showmain()
{
	$("#load").fadeOut();
	$("#main").fadeIn();
}
function no_scroll(event)
{
	event.preventDefault();
}
function nextfeild(str)
{
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

function nextfieldALL()
{
	$('input').on("keydown", function (e)
	{
		var n = $("input").length;
		if (e.which == 13) {
			e.preventDefault();
			var Index = $('input').index(this);
			var nextIndex = $('input').index(this) + 1;
			if (nextIndex < n) {
				$('input')[nextIndex].focus();   // 次の要素へフォーカスを移動
			} else {
				$('input')[Index].blur();        // 最後の要素ではフォーカスを外す
			}
		}
	});
}