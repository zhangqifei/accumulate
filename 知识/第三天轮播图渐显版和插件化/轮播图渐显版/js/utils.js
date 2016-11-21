/**
 * Created by lucky on 2016/7/20.
 */

var utils = (function () {

    var isStanderBrowser = "getComputedStyle" in window;

    function listToArray(likeArray) {
        try {
            return Array.prototype.slice.call(likeArray);
        } catch (e) {
            var ary = [];
            for (var i = 0; i < likeArray.length; i++) {
                ary[ary.length] = likeArray[i];
            }
            return ary;
        }
    }
    function jsonParse(jsonStr){
        return "JSON" in window ? JSON.parse(jsonStr) : eval("("+jsonStr+")");
    }
    function win(attr,val){
        if(typeof val !== "undefined"){
            document.documentElement[attr] = val;
            document.body[attr] = val;
        }
        return document.documentElement[attr] || document.body[attr];
    }
    function offset(ele){
        var l = null;
        var t = null;
        var par = ele.offsetParent;
        l += ele.offsetLeft;
        t += ele.offsetTop;
        while(par){
            if(window.navigator.userAgent.indexOf("MSIE 8") === -1){
                l += par.clientLeft;
                t += par.clientTop;
            }
            l += par.offsetLeft;
            t += par.offsetTop;
            par = par.offsetParent;
        }
        return {left: l, top: t};
    }


    function prevEleSibling(ele){
        if(isStanderBrowser){
            return ele.previousElementSibling;
        }else{
            var prev = ele.previousSibling;
            while(prev && prev.nodeType != 1){ //节点类型不是1那么就不是元素我就需要继续向哥哥的哥哥去找
                prev = prev.previousSibling; //总有一个时刻是null
            }
            return prev;
        }
    }

    function nextEleSibling(ele){
        if(isStanderBrowser){
            return ele.nextElementSibling;
        }else{
            var next = ele.nextSibling;
            while(next && next.nodeType != 1){
                next = next.nextSibling;
            }
            return next;
        }
    }

    function prevAll(ele) { //获取所有的哥哥元素节点
        var ary = [];
        var prev = /*this.*/prevEleSibling(ele); //使用刚刚定义好的方法,已经拿来的就是元素节点
        while (prev) {
            ary.push(prev);
            prev = prevEleSibling(prev);
        }
        /* var prev = ele.previousSibling; //有可能不是元素
         while(prev){
         if(prev.nodeType == 1){
         ary.push(prev);
         }
         prev = prev.previousSibling;
         }*/
        return ary;
    }
    
    function nextAll(ele){
        var ary = [];
        var next = ele.nextSibling; //有可能不是元素
        while (next) {
            if (next.nodeType == 1) {
                ary.push(next);
            }
            next = next.nextSibling;
        }
        return ary;
    }
    
    function sibling(ele){ //获取相邻两个兄弟元素节点
        var ary = [];
        var prev = prevEleSibling(ele);
        var next = nextEleSibling(ele);
        prev ? ary.push(prev) : void 0;
        next ? ary.push(next) : void 0;
        return ary;
    }

    function siblings(ele){ //所有的兄弟元素节点
        return prevAll(ele).concat(nextAll(ele));
    }

    function index(ele){ //获取ele的索引值
        return prevAll(ele).length;
    }

    function children(ele, tagName) {
        var val = null;
        if (isStanderBrowser) {
            val = listToArray(ele.children);
        } else {
            var ary = [];
            var childs = ele.childNodes;
            for (var i = 0; i < childs.length; i++) {
                if (childs[i].nodeType == 1) {
                    ary.push(childs[i]);
                }
            }
            val = ary;
        }
        if (typeof tagName == 'string') {
            for (var i = 0; i < val.length; i++) {
                var cur = val[i];
                if (cur.nodeName != tagName.toUpperCase()) {
                    val.splice(i, 1);
                    i--;
                }
            }
        }
        return val;
    }

    function hasClass(ele,strClass){ //判断ele是否包含className这个类
        //ele.className
        //hasClass(div1,"     c2         ")
        strClass = strClass.replace(/(^ +| +$)/g,""); //参数有可能传出来问题
        //用strClass这个参数重新组成一个新的正则，用来判断ele.className是否符合这个正则
        var reg = new RegExp("(^| +)"+strClass+"( +|$)","g"); //使用变量需要使用实例的创建方式
        console.log(reg);
        //var reg = new RegExp("\\b"+strClass+"\\b");
        return reg.test(ele.className); //只要验证通过就表示这个strClass在ele.className中出现过
    }

    function addClass(ele,strClass){
        var strClassAry = strClass.replace(/(^ +| +$)/g,"").split(/ +/g);
        //"c2 c3" ==> ["c2","c3"]
        for(var i=0; i<strClassAry.length; i++){
            var curClass = strClassAry[i]
            if(!hasClass(ele,curClass)){ //当前的c2在ele中没有出现
                ele.className += " "+curClass;
            }
        }
    }

    function removeClass(ele,strClass){
        var strClassAry = strClass.replace(/(^ +| +$)/g,"").split(/ +/g); //["c2","c3"]
        for(var i=0; i<strClassAry.length; i++){
            var curClass = strClassAry[i];
            if(hasClass(ele,curClass)){ //如果存在这个class才有必要移除
                var reg = new RegExp("(^| +)" + curClass + "( +|$)","g");
                ele.className = ele.className.replace(reg," ");
            }
        }
    }
    //strClass类名字  context范围 '   c2 c3   '
    function getElementsByClass(strClass,context){ //通过类名字获取元素
        context = context || document; //如果不传就在整个document范围内找
/*
        if(isStanderBrowser){
            return listToArray(context.getElementsByClassName(strClass));
        }
*/
        //不兼容
        var ary = []; //'c2 c3'
        var strClassAry = strClass.replace(/(^ +| +$)/g,"").split(/ +/); //["c2","c3"]
        var childs = context.getElementsByTagName("*"); //把这个范围内所有标签元素都获取到
        for(var i=0; i<childs.length; i++){ //需要把获取到的所有的标签都拿出来一个比较
            var curChild = childs[i];
            //<ul class=" c3 c4"></ul>   ["c2","c3" "c4" "c5"     ]
            var flag = true; //假如当前这个标签包含所有的class,那么我就需要把它放到数组中
            for(var j=0; j<strClassAry.length; j++){ //让刚拿出来的这个标签和数组里每个传进来的class做比较，如果有一项不符合(在当前标签的className中没有出现过，那么就删除)
                var curClass = strClassAry[j];
                var reg = new RegExp("(^| +)"+curClass+"( +|$)","g");
                if(!reg.test(curChild.className)){ //只要有一个验证没通过那么这个标签就是不符合条件的，我就把这个假设条件破坏。并且后面的其他的class c3 c4 ....都不用比较了
                    flag = false;
                    break;
                }
            }
            if(flag){ //假如这个假设已经通过了
                ary.push(curChild);
            }
        }
        return ary;
    }

    function getCss(attr){
        var val =  null;
        if("getComputedStyle" in window){
            val = window.getComputedStyle(this,null)[attr];
        }else{
            if(attr == 'opacity'){
                val = this.currentStyle.filter;
                var fitlerReg = /^alpha\(opacity=(\d+(?:\.\d+)?)\)$/i;
                val = fitlerReg.test(val) ? fitlerReg.exec(val)[1]/100 : 1;
            }else{
                val = this.currentStyle[attr];
            }
        }
        var reg = /^-?\d+(\.\d+)?(pt|px|em|rem|deg)?$/;
        if(reg.test(val)){
            val = parseFloat(val);
        }
        return val;
    }


    function setCss(attr,val){
        if(attr == 'opacity'){
            this.style.opacity = val;
            this.style.filter = 'alpha(opacity='+val*100+")";
            return;
        }
        if(attr == 'float'){
            this.style.cssFloat = val;
            this.style.styleFloat = val;
            return;
        }
        var reg = /width|height|left|top|right|bottom|(margin|padding)(Left|Right|Top|Bottom)?/;
        if(reg.test(attr)){
            if(!isNaN(val)){
                val += "px";
            }
        }
        this.style[attr] = val;
    }

    function setGroupCss(obj){ //{winth:100}
        //obj = obj || [];
        //if(obj.toString() == '[object Object]'){
            for(var key in obj){ //   propertyIsEnumerable
                if(obj.hasOwnProperty(key)){
                    setCss.call(this,key,obj[key]); //这个this是从css的入口形参通过apply的方式传过来的ele
                }
            }
        //}
    }

    function css(ele){ //
        //console.log(arguments);
        var secondArg = arguments[1];
        var thirdArg = arguments[2];
        var args = listToArray(arguments).slice(1); //args数组包含从第二个参数开始到末尾
        if(typeof secondArg == 'string'){ //第二个参数是字符串 1 getCss  2 setCss 区别：第三个参数有没有
            if(typeof thirdArg == 'undefined'){
                return getCss.apply(ele,args); //留下的值就是getCss的返回结果
            }
            setCss.apply(ele,args); //设置样式不用return
            return;
        }
        secondArg = secondArg || [];
        if(secondArg.toString() == '[object Object]'){
            setGroupCss.apply(ele,args);
        }
    }



    return {
        getElementsByClass : getElementsByClass,
        removeClass : removeClass,
        addClass : addClass,
        hasClass : hasClass,
        children : children,
        index : index,
        siblings : siblings,
        sibling : sibling,
        prevAll : prevAll,
        prevEleSibling : prevEleSibling,
        listToArray : listToArray,
        jsonParse : jsonParse,
        win : win,
        offset : offset,
        css: css
      /*  getCss : getCss, //ele,attr*/
        /*setCss : setCss, //ele,attr,val*/
        /*setGroupCss : setGroupCss ,//ele,obj,*/
    }
})();





/*
var utilsNew = {
    listToArray : function (likeArray){
        try{
            return Array.prototype.slice.call(likeArray);
        }catch(e){
            var ary = [];
            for(var i=0; i<likeArray.length; i++){
                ary[ary.length] = likeArray[i];
            }
            return ary;
        }
    },
    jsonParse : function (jsonStr){
        //this.listToArray(); //utils
        return "JSON" in window ? JSON.parse(jsonStr) : eval("("+jsonStr+")");
    },
    win : function (attr,val){
        if(typeof val !== "undefined"){
            document.documentElement[attr] = val;
            document.body[attr] = val;
        }
        return document.documentElement[attr] || document.body[attr];
    },
    offset : function (ele){
        var l = null;
        var t = null;
        var par = ele.offsetParent;
        l += ele.offsetLeft;
        t += ele.offsetTop;
        while(par){
            if(window.navigator.userAgent.indexOf("MSIE 8") === -1){
                l += par.clientLeft;
                t += par.clientTop;
            }
            l += par.offsetLeft;
            t += par.offsetTop;
            par = par.offsetParent;
        }
        return {left: l, top: t};
    },
    getCss : function (ele,attr){
        var val =  null;
        if("getComputedStyle" in window){
            val = window.getComputedStyle(ele,null)[attr];
        }else{
            if(attr == 'opacity'){
                val = ele.currentStyle.filter;
                var fitlerReg = /^alpha\(opacity=(\d+(?:\.\d+)?)\)$/i;
                val = fitlerReg.test(val) ? fitlerReg.exec(val)[1]/100 : 1;
            }else{
                val = ele.currentStyle[attr];
            }
        }
        var reg = /^-?\d+(\.\d+)?(pt|px|em|rem|deg)?$/;
        if(reg.test(val)){
            val = parseFloat(val);
        }
        return val;
    }
};
*/

