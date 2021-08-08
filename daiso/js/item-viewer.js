var scandata = [];
var devicelist = [];
var choicedevicecount = 0;
var deviceid;
var idtoken;
var doMode = true;
function init() {
  window.onbeforeprint = () => {
    $("form, #footer-scan").hide();
  };
  window.onafterprint = () => {
    $("form, #footer-scan").show();
  };
  doMode = true;
}
function showOrder() {
  $.when(
    TableGet("Daiso_Order")
  ).done(
    (data) => {
      var itemlist = {};
      Object.keys(data).forEach((keys) => {
        if (Object.keys(itemlist).indexOf(data[keys]["JAN"]) != -1) {
          itemlist[data[keys]["JAN"]] += 1;
        } else {
          itemlist[data[keys]["JAN"]] = 1;
        }
      })
      Object.keys(itemlist).forEach((keys) => {
        $(document.getElementsByName(keys)).text(itemlist[keys]);
      })
    }
  )
}
function doOrder(JAN) {
  if (doMode) {
    dataInsert("Daiso_Order", { "JAN": String(JAN) }).then(() => {
      showPopup("追加に成功しました");
      dataGet("Daiso_Order", "JAN", String(JAN)).then((data) => {
        if (Object.keys(data).length) {
          $(document.getElementsByName(data[Object.keys(data)[0]]["JAN"])).text(Object.keys(data).length);
        }
      })
    }, () => {
      showPopup("追加に失敗しました")
      dataGet("Daiso_Order", "JAN", String(JAN)).then((data) => {
        if (Object.keys(data).length) {
          $(document.getElementsByName(data[Object.keys(data)[0]]["JAN"])).text(Object.keys(data).length);
        }
      })
    })
  } else {
    dataGet("Daiso_Order", "JAN", String(JAN)).then((data) => {
      if (Object.keys(data).length) {
        if (Object.keys(data).length - 1 <= 0) {
          $(document.getElementsByName(data[Object.keys(data)[0]]["JAN"])).text("");
        } else {
          $(document.getElementsByName(data[Object.keys(data)[0]]["JAN"])).text(Object.keys(data).length - 1);
        }
        dataDelete("Daiso_Order", Object.keys(data)[0]);
        showPopup("削除に成功しました。");
      } else {
        showPopup("これ以上削除できません。");
      }
    })
  }
}
function changeOrderMode() {
  if (doMode == true) {
    doMode = false;
    $("#ordermode").text("消ﾓｰﾄﾞ")
  } else {
    doMode = true;
    $("#ordermode").text("発ﾓｰﾄﾞ")
  }
}
function downloadOrder() {
  text = ""
  $.when(
    TableGet("Daiso_Order")
  ).done(
    (data) => {
      var text = ""
      Object.keys(data).forEach((keys) => {
        if (data[keys]["JAN"].length == 8) {
          text += "\n00000000,0000,00,00003,00000" + data[keys]["JAN"] + ",05027999,1"
        } else {
          text += "\n00000000,0000,00,00003," + data[keys]["JAN"] + ",05027999,1"
        }
      })
      try {
        var blob = new Blob([text], { type: "text/csv" });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Orderjis.csv';
        link.click();
      } catch {
        console.log(text);
        alert("コンソールを確認して下さい。")
      }
    }
  )
}
function deleteOrder() {
  $.when(
    TableGet("Daiso_Order")
  ).done(
    (data) => {
      Object.keys(data).forEach((keys) => {
        dataDelete("Daiso_Order", keys)
      })
      showPopup("すべての発注を取り消しました。")
    }
  )
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
            cellText.innerHTML = e["Daiban"] + "-" + (i + 1) + "-" + (j + 1) + " / " + e["Price"] + infotxt + " <br><a href='javascript:void(0);' onclick='doOrder(" + e["JAN"] + ")'>" + e["ItemName"] + "</a><br><center><div name='JANCODE_INFOMATION'>" + e["JAN"] + "</div></center><div class='CELLBACKTEXT' name='" + e["JAN"] + "'></div>";
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