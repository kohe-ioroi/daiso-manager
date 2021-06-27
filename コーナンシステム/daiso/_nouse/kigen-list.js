var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
var ui = new firebaseui.auth.AuthUI(firebase.auth());
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
  	userid = firebase.auth().currentUser.email;
    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
		idtoken = idToken;
    showTable();
    
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
function showTable(){
  var jsondata = new Object();
  showload();
  $.when(
    $.getJSON('https://konan089-a83b7-default-rtdb.firebaseio.com/Daiso_Limit.json?auth='+idtoken)
  ).done(
    function(data){
      showmain();
      Object.keys(data).forEach(function(i){
      var now = new Date();
      var after1month = now;
      after1month.setDate(now.getDate() + 30);
      var datadate = new Date(data[i]["Year"]+"/"+data[i]["Month"]+"/"+data[i]["Day"]);
      if(datadate < after1month){
        jsondata[i] = {"JAN":data[i]["JAN"],"ItemName":data[i]["ItemName"],"Limit":data[i]["Year"]+"/"+data[i]["Month"]+"/"+data[i]["Day"]};
      }
      obj = jsondata;
      try{
        $('#columns').columns({
        data:Object.keys(jsondata).map(function (key) {return obj[key]}),
        schema:[
        {"header":"商品名","key":"ItemName"},
        {"header":"JANコード","key":"JAN"},
        {"header":"日付","key":"Limit"},
        ],
        size:100,
        showRows:[30,50,100,1000]
        })
      }catch(e){
        $("#columns").text("データが存在しないか接続に失敗しました。");
      }
    })
  })
}
function showload(){
  $("#message").text("処理中")
  $("#main").fadeOut(50);
  $("#load").fadeIn(50);
}
function showmain(){
  $("#load").fadeOut(50);
  $("#main").fadeIn(50);
}