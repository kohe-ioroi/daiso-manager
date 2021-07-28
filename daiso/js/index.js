var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
function init() {
}

function showhidden() {
	if (confirm("このメニューは管理者用の機能です、理解せずに操作すると業務に影響を及ぼす危険があります。\n\n危険性を理解している場合は進んでください。\nなぜこの警告が発生するか不明な場合は、管理者に問い合わせてください。")) {
		$(".hiddenme").removeClass("hiddenme");
		$("#showadminbtn").addClass("hiddenme");
		localStorage.setItem("Daiso_Admin", true);
	} else {
	}
}