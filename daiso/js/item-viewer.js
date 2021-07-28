var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
function init() {
  window.onbeforeprint = () => {
    $("form").hide();
  };
  window.onafterprint = () => {
    $("form").show();
  };
}

function doWork(DB) {
  var Daiban = DB.padStart(4, "0");
  $('#search').val(Daiban);
  $("table").remove();
  $('#search').prop('disabled', true);
  document.title = "台番:" + Daiban;
  dataGet("Daiso", "Daiban", Daiban).then((data) => {
    var list = [];
    Object.keys(data).forEach((i) => { list.push(data[i]); });
    list.sort(funcCompare);
    var [mTana, mRetu] = [1, 1];
    list.forEach((key) => {
      if (parseInt(key["Tana"]) > mTana) {
        mTana = 1 + parseInt(key["Tana"]);
      }
      if (parseInt(key["Retu"]) > mRetu) {
        mRetu = 1 + parseInt(key["Retu"]);
      }
    });
    var body = document.getElementsByTagName("body")[0];
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");
    for (var i = 0; i < mTana; i++) {
      var row = document.createElement("tr");
      for (var j = 0; j < mRetu; j++) {
        list.forEach((e) => {
          if (parseInt(e["Tana"]) == (i + 1) && parseInt(e["Retu"]) == (j + 1)) {
            var cell = document.createElement("td");
            var cellText = document.createElement("div");
            cellText.setAttribute("class", "inboxdata");
            var infotxt = "";
            if (e["isDoubled"]) {
              infotxt += " / ㋙";
            }
            if (e["isFood"]) {
              infotxt += " / 食";
            }
            cellText.innerHTML = e["Daiban"] + "-" + (i + 1) + "-" + (j + 1) + " / " + e["Price"] + infotxt + " <br><a href='javascript:void(0);' onclick='window.open(\"/master.html?jan=" + e["JAN"] + "\")'>" + e["ItemName"] + "</a><br><center><div name='JANCODE_INFOMATION'>" + e["JAN"] + "</div></center>";
            cell.appendChild(cellText);
            row.appendChild(cell);
          }
        });
        var countPage = 10;
        if (j + 1 == countPage || j + 1 == countPage * 2 || j + 1 == countPage * 3) {
          tblBody.appendChild(row);
          row = document.createElement("tr");
        }
      }
      tblBody.appendChild(row);
    }
    tbl.appendChild(tblBody);
    tbl.setAttribute("class", "splitForPrint");
    body.appendChild(tbl);
    $("[name=JANCODE_INFOMATION]").each((index, element) => {
      if (String($(element).text()).length == 13) {
        $(element).barcode(String($(element).text()), "ean13", { barWidth: 1, barHeight: 15 });
      } else if (String($(element).text()).length == 8) {
        $(element).barcode(String($(element).text()), "ean8", { barWidth: 1, barHeight: 15 });
      }
    });
    $('#search').prop('disabled', false);
  });
}