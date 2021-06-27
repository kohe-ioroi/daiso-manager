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
if (firebase.apps.length === 0) {
	firebase.initializeApp(firebaseConfig);
}
var ui = new firebaseui.auth.AuthUI(firebase.auth());
firebase.auth().onAuthStateChanged(function (user)
{
	if (user) {
		firebase.auth().currentUser.getIdToken(true).then(function (idToken)
		{
			userid = firebase.auth().currentUser.email;
			if (userid != "konan089@handy.app") {
				alert("不正なユーザーを検知しました。管理者に問い合わせてください。ログアウトを実行します。");
				firebase.auth().signOut();
			} else {
				idtoken = idToken;
				database = firebase.database();
				init();
			}

		}).catch((e) => { throw new Error(e); });
	} else {
		// 6月20日まで開放
		// $(".hideme").css("visibility", "hidden");
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
		firebase.auth().signInWithEmailAndPassword("konan089@handy.app", "konan089").then(() => { alert("現在BIG-Kシステムがダウンしているため、6/20までシステムを開放しています。"); location.reload(true); });
	}
});
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
if (location.search && getParam_init("forcereload")) {
	location.reload(true);
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
function showPopup(msg)
{
	if (typeof popuptimer !== "undefined") {
		clearTimeout(popuptimer);
	}
	$(".popup").text(msg);
	$('.popup').addClass('js_active');
	$('.popup').hover(() => { $('.popup').removeClass('js_active'); });
	popuptimer = setTimeout(() => { $('.popup').removeClass('js_active'); }, 3000);
}