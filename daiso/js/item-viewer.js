var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
function showload() {
  $("#main").fadeOut(50);
  $("#load").fadeIn(50);
}
function showmain() {
  $("#load").fadeOut(50);
  $("#main").fadeIn(50);
}
function init() {
}

function doWork(DB) {
  var Daiban = DB.padStart(4, "0")
  $('#search').val(Daiban)
  $('#search').val()
  $("table").remove()
  dataGet("Daiso", "Daiban", Daiban).then((data) => {
    var list = [];
    Object.keys(data).forEach((i) => { list.push(data[i]) });
    list.sort(funcCompare);
    var [mTana, mRetu] = [1, 1]
    list.forEach((key) => {
      if (parseInt(key["Tana"]) > mTana) {
        mTana = 1 + parseInt(key["Tana"]);
      }
      if (parseInt(key["Retu"]) > mRetu) {
        mRetu = 1 + parseInt(key["Retu"]);
      }
    })
    var body = document.getElementsByTagName("body")[0];
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");
    for (var i = 0; i < mTana; i++) {
      var row = document.createElement("tr");
      for (var j = 0; j < mRetu; j++) {
        list.forEach((e) => {
          if (parseInt(e["Tana"]) == (i + 1) && parseInt(e["Retu"]) == (j + 1)) {
            var cell = document.createElement("td");
            var cellText = document.createElement("div")
            cellText.innerHTML = (i + 1) + "-" + (j + 1) + " / " + e["Price"] + "<br><a href='javascript:void(0);' onclick='window.open(\"/master.html?jan=" + e["JAN"] + "\")'>" + e["ItemName"] + "</a><br><center><div name='JANCODE'>" + e["JAN"] + "</div></center>";
            cell.appendChild(cellText);
            row.appendChild(cell);
          }
        })
      }
      tblBody.appendChild(row);
    }
    tbl.appendChild(tblBody);
    body.appendChild(tbl);
    // tbl.setAttribute("border", "2");
    $("[name=JANCODE]").each((index, element) => {
      if (String($(element).text()).length == 13) {
        $(element).barcode(String($(element).text()), "ean13", { barWidth: 1.5, barHeight: 20 });
      } else if (String($(element).text()).length == 8) {
        $(element).barcode(String($(element).text()), "ean8", { barWidth: 1.5, barHeight: 20 });
      }
    });
  })
}