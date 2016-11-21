//获取元素
var banner = document.getElementById('banner');
var bannerInner = utils.getElementsByClass('bannerInner',banner)[0];
var imgsBox = bannerInner.getElementsByTagName('div'); //这是包含img的盒子
var imgs = bannerInner.getElementsByTagName('img'); //所有的img
var focusList  = banner.getElementsByTagName('ul')[0];
var lis = focusList.getElementsByTagName('li');
var left = utils.getElementsByClass('left',banner)[0];
var right = utils.getElementsByClass('right',banner)[0];

//获取数据
(function getData(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET',"data.txt?_="+Math.random(),false);
    xhr.onreadystatechange = function (){
        if(xhr.readyState == 4 && /^2\d{2}$/.test(xhr.status)){
            window.data = utils.jsonParse(xhr.responseText);
        }
    }
    xhr.send(null);
})();
//console.log(data);

//绑定数据
(function bindData(){
    if(window.data){
        var str = "";
        var liStr = "";
        for(var i=0; i<data.length; i++){
            var curData = data[i];
            str += '<div><img src="" trueSrc="'+ curData.src +'"/></div>';
            liStr += i === 0 ? '<li class="bg"></li>' : '<li></li>';
        }
        bannerInner.innerHTML = str;
        focusList.innerHTML = liStr;
    }
})();

//图片延迟加载： 在这个过程中已经把第一张默认从zIndex=0设置成1，并且透明度也从0到1
function imgsDelayLoad(){
    for(var i=0; i<imgs.length; i++){
        (function (i){
            var curImg = imgs[i];
            if(curImg.isloaded) return;
            var tempImg = new Image();
            tempImg.src = curImg.getAttribute('trueSrc');
            tempImg.onload = function (){
                curImg.src = this.src;
                utils.css(curImg,"display","block"); //仅仅是里面的图片display是block，但是包含着图片的div的z-Index的层级是0。并且它的透明度opacity也是0
                //我只让默认的第一张img(包含着第一张图片的img的div的z-Index为1，并且让这个盒子的透明度opacity从0运动到1)
                //判断只有i==0的时候，才是第一张
                if(i === 0){
                    //先把层级z-Index改变
                    utils.css(curImg.parentNode,'zIndex',1);
                    //并且还要修改透明度
                    animate(curImg.parentNode,{opacity:1},300);
                }else{
                    utils.css(curImg.parentNode,"zIndex",0); //万一样式没写
                    utils.css(curImg.parentNode,'opacity',0); //万一透明度也没有设置
                }
            }
            tempImg = null;
            curImg.isloaded = true;
        })(i);
    }
}
window.setTimeout(imgsDelayLoad,500);

//自动轮播
var step = 0;
var timer = null;
var interval = 2000; //2000ms更换一张图片
timer = window.setInterval(autoMove,interval);
function autoMove(){
    //console.log(step); //上一次哪张图片显示的
    if(step == data.length - 1){ // 只要这个step等于3，说明上一次是第4张显示的。那么下一次应该是第一张显示了。第一张显示的索引是0 ==> 那么就是step++之后才是0. 那么在step++之前就是-1
        step = -1;
    }
    step++; //下一次的终点，下次对应索引值的图片显示
    //这个地方要写一个函数，这个函数负责让索引为step的这张图片的zIndex=1出现并且让其他的图片的zIndex回到0. 并且让索引为step的图片的透明度从0过度到1
    //console.log(step); //这一次谁要显示
    setBanner();
}

function setBanner(){ //负责设置哪一张图片显示
    //我要循环所有的img，只要索引值和全局的step相同的那一张的zIndex的值变成1，让其他的变成0.并且让step的透明度从0运动到1，说明到达终点之后别忘记了其他的图片的透明度直接设置成0就可以了.(需要回调函数)
    for(var i=0; i<imgs.length; i++){
        var curImg = imgs[i];
        if(i === step){ //
            utils.css(curImg.parentNode,'zIndex',1); //先把step代表的索引值那一张的zIndex设置成1
            animate(curImg.parentNode,{opacity:1},300,function (){
                var siblings = utils.siblings(this); //除了当前最上面也就是step这一张的其他所有图片,由于siblings是多张我需要循环设置透明度为0
                for(var j=0; j<siblings.length; j++){
                    var curSibling = siblings[j];
                    utils.css(curSibling,'opacity',0);
                }
            });

        }else{
            utils.css(curImg.parentNode,'zIndex',0); //把除了step这一张的其他所有图片的zIndex设置成0
        }
    }
    for(var i=0; i<lis.length; i++){
        lis[i].className = i == step ? 'bg' : '';
    }
}

(function bindEventForLi(){
    for(var i=0; i<lis.length; i++){
        var curLi = lis[i];
        curLi.index = i;
        curLi.onclick = function (){
            step = this.index; //把点击li的索引值赋值给全局step，全局step就是记录哪一张图片显示。所以只要修改step就可以了
            setBanner(); //就是根据step的变化不断设置的
        }
    }
})();

banner.onmouseover = function (){
    left.style.display = right.style.display = 'block';
    window.clearInterval(timer);
}
banner.onmouseout = function (){
    left.style.display = right.style.display = 'none';
    timer = window.setInterval(autoMove,interval);
}
left.onclick = function (){
    step--; //我下一次让谁显示
    if(step == -1){
        step = data.length -1;
    }
    setBanner();
}
right.onclick = autoMove;