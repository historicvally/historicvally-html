/**
 * @author Historical valley
 * @email sslkiss7@gmail.com
 * @version 1.0
 * @date Create Time：2018/5/15 22:26
 * @intro 任意级数多级联动控件，通用性强，容忍性高，使用简单，便于多语言
 *
 * 我参与了很多web项目的开发，常遇到需要使用多级联动选择器的场景，但是一直没有找到简单通用的多级联动代码，所以我特地写了一个供大家直接使用和参考
 * 尤其是针对数据库中定义了一张有父类子关系的表，而前后端需要展示并初始化选中值的时候，使用该控件能大大简化前后端开发的工作量
 *
 * 请求返回的数据放在content字段里,是一个列表，列表中的json对象需要至少包含以下字段：id,parentId,name。其中顶级对象的parentId为0。
 * selectDoms是一个数组，传入select的id列表
 * url是数据请求链接
 * chooseIds 是一个数组，包含了每一级已经选择的id，如果没有初始值的话请传null
 * chooseId是一个id，允许是任意一级的id
 * 示例 his_multilevel_linkage_ini_easy(["select0","select1"], "/listAllCategory", 12,"--please select--")
 * 或者 his_multilevel_linkage_ini_data_easy(["select0","select1"], [{"id":15,"name":"a","parentId":12},{"id":14,"name":"b","parentId":12},{"id":12,"name":"c","parentId":8},{"id":11,"name":"d","parentId":0},{"id":10,"name":"e","parentId":0},{"id":8,"name":"f","parentId":0}], 12,"please select")
 * 或者 his_multilevel_linkage_ini(["select0","select1"], "/listAllCategory", [8,12],"未选择");
 * 或者 his_multilevel_linkage_ini(["select0","select1"], "/listAllCategory", null,"--请选择--");
 *
 *
 * his_multilevel_linkage_ini_easy部分原理示例说明：
 * 例如传入的chooseId是17，那么会自动寻找其父类，得到[17,父类5,再父类3]，17对应的是第三级分类,
 * 此时例如selectDoms为4元数组[dom1,dom2,dom3,dom4],那么函数里会把数组转化成 [3,5,17,0]后传入his_multilevel_linkage_ini
 *
 * 另外需要注意的是，选择器value为0表示没有选中或等于选择了topTitle
 */


function his_multilevel_linkage_ini_easy(selectDoms, url, chooseId,topTitle) {

    $.get(url, {}, function (data) {
        var dataContent = data.content;
        his_multilevel_linkage_ini_data_easy(selectDoms, dataContent, chooseId,topTitle)
    }, "json");

}



function his_multilevel_linkage_ini_data_easy(selectDoms, dataContent, chooseId,topTitle) {

    if (chooseId == null||chooseId==0) {
        his_multilevel_linkage(selectDoms, null, dataContent,topTitle);
    } else {
        var chooseIdsTmp = [];//例如[17,5,3]
        var nowChooseIdTmp = chooseId;
        var breakTagOut = false;
        for (var jOut = 0; jOut < selectDoms.length && !breakTagOut; jOut++) {
            var breakTag = false;
            for (var i = 0; i < dataContent.length && !breakTag; i++) {
                if (dataContent[i].id == nowChooseIdTmp) {
                    chooseIdsTmp[jOut] = nowChooseIdTmp;
                    nowChooseIdTmp = dataContent[i].parentId;
                    //console.log("nowChooseIdTmp=" + nowChooseIdTmp );
                    breakTag = true;
                }
            }
            if (!breakTag) {
                breakTagOut = true;
            }
        }

        //console.log("chooseIdsTmp=" + JSON.stringify(chooseIdsTmp));
        var chooseIds = [];//例如[0,0,0,0,0,0]
        for (jOut = 0; jOut < selectDoms.length; jOut++) {
            chooseIds[jOut] = 0;
        }

        // 打算变成 [3,5,17,0,0,0]
        var chooseIdsTmpIndex = chooseIdsTmp.length - 1;
        for (jOut = 0; chooseIdsTmpIndex >= 0; chooseIdsTmpIndex--, jOut++) {
            chooseIds[jOut] = chooseIdsTmp[chooseIdsTmpIndex];
        }
        his_multilevel_linkage(selectDoms, chooseIds, dataContent,topTitle);
    }
}



function his_multilevel_linkage_ini(selectDoms, url, chooseIds,topTitle) {
    $.get(url, {}, function (data) {
        var dataContent = data.content;
        his_multilevel_linkage(selectDoms, chooseIds, dataContent,topTitle)
    }, "json");
}

function his_multilevel_linkage(selectDoms, chooseIds, data,topTitle) {
    //console.log("data="+JSON.stringify(data)+"   selectDoms="+JSON.stringify(selectDoms));
    var tmp_option;
    for (var jOut = 0; jOut < selectDoms.length; jOut++) {

        if (jOut > 0 && chooseIds == null) {
        } else {

            tmp_option = " <option value='0'   >"+topTitle+"</option>";
            for (var i = 0; i < data.length; i++) {
                //console.log("jOut="+jOut+"data[i].parentId="+data[i].parentId );
                if ((jOut == 0 && data[i].parentId == 0) || (chooseIds != null && data[i].parentId == chooseIds[jOut - 1])) {
                    if (chooseIds != null && chooseIds[jOut] == data[i].id) {
                        tmp_option = tmp_option + " <option value='" + data[i].id + "'  selected='selected'  >" + data[i].name + "</option>";
                    } else {
                        tmp_option = tmp_option + " <option value='" + data[i].id + "'>" + data[i].name + "</option>";
                    }
                }
            }
            // console.log("tmp_option="+tmp_option);
            $("#" + selectDoms[jOut]).html(tmp_option);
        }
    }

    for (var jOut2 = 0; jOut2 < selectDoms.length; jOut2++) {
        if (jOut2 < selectDoms.length - 1) {
            //直接on('change' 问题是参数会变成最后一个被置换的元素，所以要用函数包一下，这样可以传入具体参数
            his_multilevel_linkage_listenChange(selectDoms, jOut2, data,topTitle);
        }
    }

}


function his_multilevel_linkage_listenChange(selectDoms, tmpjOut, data,topTitle) {
    $("#" + selectDoms[tmpjOut]).on('change', function () {
        var tmp_option;
        //console.log("tmpjOut=" + tmpjOut);
        var parentDom = $("#" + selectDoms[tmpjOut]);
        var nowDom = $("#" + selectDoms[tmpjOut + 1]);

        for (var tmpjOutInner = tmpjOut + 1; tmpjOutInner < selectDoms.length; tmpjOutInner++) {
            $("#" + selectDoms[tmpjOutInner]).html("");
        }

        var fatherId = parentDom.val();
        //console.log("selectDoms=" + selectDoms[tmpjOut] + "  tmpjOut=" + tmpjOut + " fatherId=" + fatherId);

        tmp_option = " <option value='0'   >"+topTitle+"</option>";
        var hasNext = false;
        for (var i = 0; i < data.length; i++) {
            if (data[i].parentId == fatherId && fatherId != 0) {
                tmp_option = tmp_option + " <option value='" + data[i].id + "'>" + data[i].name + "</option>";
                hasNext = true;
            }
        }
        if (hasNext) {
            nowDom.html(tmp_option);
        } else {
            nowDom.html("");
        }
    });
}