// Firebase ConfigをInitialize
const shortbeep = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
// if (document.location.hostname != "daiso.ioroikouhei.com") {
// 	let path = location.pathname;
// 	location.href = ("https://daiso.ioroikouhei.com" + path);
// }
const firebaseConfig = {
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
$(document).ready(() => {
	const appCheck = firebase.appCheck();
	appCheck.activate('6Lc2oYgbAAAAAAY7PP-a4o6Z9kG6OcnCYW7XDZvL');

});
//認証シーケンス
firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
		firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
			idtoken = idToken;
			userid = firebase.auth().currentUser.email;
			if (userid != "konan089@handy.app") {
				firebase.auth().signOut();
			} else {
				database = firebase.database();
				init();
			}
		}).catch((e) => { });
	} else {
		$("body").css("visibility", "hidden");
		var password = window.prompt("パスワードを入力してください。");
		if (password == null) { location.reload(); }
		firebase.auth().signInWithEmailAndPassword("konan089@handy.app", password).then(
			() => { location.reload(); },
			() => { alert("ログインに失敗しました。パスワードを確認してください。"); location.reload(); }
		);
	}
});
function regexTest(regex, str) {
	var REGEXP = new RegExp(regex);
	return REGEXP.test(str);
}
function appendScript(URL) {
	var el = document.createElement('script');
	el.src = URL;
	document.body.appendChild(el);
};
function getParam_init(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function funcCompare(a, b) {
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
function dataInsert(path, data) {
	var dfd = $.Deferred();
	firebase.database().ref(path).push().set(data).then(
		() => {
			dfd.resolve();
		}
	);
	return dfd.promise();
}
//指定したデータを指定パスで追加(C)
function dataTargetInsert(path, target, data) {
	var dfd = $.Deferred();
	firebase.database().ref(path + "/" + target).set(data).then(
		() => {
			dfd.resolve();
		}
	);
	return dfd.promise();
}
//指定したキーで検索して取得(R)
function dataGet(path, variable, data) {
	var dfd = $.Deferred();
	firebase.database().ref(path).orderByChild(variable).equalTo(data).once("value").then(
		(i) => {
			if (i.exists()) { dfd.resolve(i.val()); } else { dfd.resolve({}); }
		});
	return dfd.promise();
}
//指定したパスを取得(R)
function getMaster(path, key) {
	var dfd = $.Deferred();
	firebase.database().ref(path).orderByChild(key).once("value").then(
		(i) => {
			if (i.exists()) { dfd.resolve(i.val()); } else { dfd.resolve({}); }
		});
	return dfd.promise();
}
//指定したキーを指定データで上書き(U)
function dataUpdate(path, key, data) {
	var dfd = $.Deferred();
	firebase.database().ref(path).child(key).get().then(
		(snapshot) => {
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
function dataPatch(path, key, data) {
	var dfd = $.Deferred();
	firebase.database().ref(path).child(key).update(data).then(
		() => {
			dfd.resolve();
		}
	);
	return dfd.promise();
}
//指定したキーを削除(D)
function dataDelete(path, key) {
	var dfd = $.Deferred();
	firebase.database().ref(path + "/" + key).remove().then(
		() => {
			dfd.resolve();
		}
	);
	return dfd.promise();
}
//指定したパスのデータをすべて取得
function TableGet(path) {
	var dfd = $.Deferred();
	firebase.database().ref(path).once("value").then(
		(i) => {
			if (i.exists()) { dfd.resolve(i.val()); } else { dfd.resolve({}); }
		});
	return dfd.promise();
}


window.onbeforeprint = () => {
	$("[name=JANCODE_INFOMATION]").each((index, element) => {
		if (String($(element).text()).length == 13) {
			$(element).barcode(String($(element).text()), "ean13", { barWidth: 1, barHeight: 20 });
		} else if (String($(element).text()).length == 8) {
			$(element).barcode(String($(element).text()), "ean8", { barWidth: 1, barHeight: 20 });
		}
	});
};

//メッセージウインドウを作成。５秒後に自動で消滅する。
function showPopup(msg) {
	if (typeof popuptimer != "undefined") {
		clearTimeout(popuptimer);
	}
	$(".popup").text(msg);
	$('.popup').addClass('js_active');
	$('.popup').on("click", () => { $('.popup').removeClass('js_active'); });
	popuptimer = setTimeout(() => { $('.popup').removeClass('js_active'); }, 5000);
}
function showload() {
	showPopup("処理中...");
	$("input").prop('disabled', true);
}
function showmain() {
	$('.popup').removeClass('js_active');
	$("input").prop('disabled', false);
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

function nextfieldALL() {
	$('input').on("keyup", function (e) {
		var n = $("input").length;
		if (e.which == 13) {
			e.preventDefault();
			var Index = $('input').index(this);
			var nextIndex = $('input').index(this) + 1;
			if (nextIndex < n) {
				$('input')[nextIndex].focus();   // 次の要素へフォーカスを移動
			} else {
				$('input')[Index].focus();        // 最後の要素ではフォーカスを外す
			}
		} else if (e.which == 8) {
			var Index = $('input').index(this);
			var beforeIndex = $('input').index(this) - 1;
			if (beforeIndex < n & beforeIndex >= 0) {
				if (this.value.length == 0) {
					e.preventDefault();
					$('input')[beforeIndex].focus();
				} else {
				}
			} else {
				$('input')[Index].focus();        // 最後の要素ではフォーカスを外す
			}
		} else {
			var lgh = this.value.length;
			var maxlgh = this.maxLength;
			if (maxlgh == lgh) {
				e.preventDefault();
				var Index = $('input').index(this);
				var nextIndex = $('input').index(this) + 1;
				if (nextIndex < n) {
					$('input')[nextIndex].focus();   // 次の要素へフォーカスを移動
				} else {
					$('input')[Index].focus();        // 最後の要素ではフォーカスを外す
				}
			}
			return false;
		}
	});
}
function focustoselectALL() {
	$("input").focus(() => {
		$(this).select();
	});
}
function checkStock() {
	$.each($("[name='JANCODE_INFOMATION']"), (i, val) => {
		$.when(dataGet("Daiso_HTData", "JAN", val.innerText)).done((data) => {
			if (Object.keys(data).length) {
				if (data[Object.keys(data)[0]]["isStock"] == false) {
					$(val.parentNode.parentNode).css("background-color", "#FA817D")
				}
			} else {
				$(val.parentNode.parentNode).css("background-color", "#DDFFDD")
			}
		})
	})
	showPopup("検査完了。赤→在庫なし、緑→データなし")
}