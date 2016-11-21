(function (){
    function Banner(id, url, interval) { //把可能必须要用到这这些全局变量都存放到这个实例的私有属性身上
        this.banner = document.getElementById(id);
        this.bannerInner = utils.getElementsByClass('bannerInner', this.banner)[0];
        this.imgs = this.bannerInner.getElementsByTagName('img'); //所有的img
        this.focusList = this.banner.getElementsByTagName('ul')[0];
        this.lis = this.focusList.getElementsByTagName('li');
        this.left = utils.getElementsByClass('left', this.banner)[0];
        this.right = utils.getElementsByClass('right', this.banner)[0];
        this.timer = null;
        this.data = null;
        this.url = url;
        this.interval = interval || 2000;
        this.step = 0;
        //return this.init(); //实例
    }
    Banner.prototype = {
        constructor: Banner,
        getData: function () {
            var that = this; //这个this一定是实例
            var xhr = new XMLHttpRequest();
            xhr.open('GET', this.url + "?_=" + Math.random(), false);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && /^2\d{2}$/.test(xhr.status)) {
                    that.data = utils.jsonParse(xhr.responseText); //给实例的data属性重新赋值的过程
                }
            }
            xhr.send(null);
        },
        bindData: function () {
            if (this.data) {
                var str = "";
                var liStr = "";
                for (var i = 0; i < this.data.length; i++) {
                    var curData = this.data[i];
                    str += '<div><img src="" trueSrc="' + curData.src + '"/></div>';
                    liStr += i === 0 ? '<li class="bg"></li>' : '<li></li>';
                }
                this.bannerInner.innerHTML = str;
                this.focusList.innerHTML = liStr;
            }
        },
        imgsDelayLoad: function () {
            var that = this;
            for (var i = 0; i < this.imgs.length; i++) {
                (function (i) {
                    var curImg = that.imgs[i];
                    if (curImg.isloaded) return;
                    var tempImg = new Image();
                    tempImg.src = curImg.getAttribute('trueSrc');
                    tempImg.onload = function () {
                        curImg.src = this.src;
                        utils.css(curImg, "display", "block");
                        if (i === 0) {
                            utils.css(curImg.parentNode, 'zIndex', 1);
                            animate(curImg.parentNode, {opacity: 1}, 300);
                        } else {
                            utils.css(curImg.parentNode, "zIndex", 0); //万一样式没写
                            utils.css(curImg.parentNode, 'opacity', 0); //万一透明度也没有设置
                        }
                    }
                    tempImg = null;
                    curImg.isloaded = true;
                })(i);
            }
        },
        autoMove: function () {
            if (this.step == this.data.length - 1) {
                this.step = -1;
            }
            this.step++;
            this.setBanner();
        },
        setBanner: function () {
            for (var i = 0; i < this.imgs.length; i++) {
                var curImg = this.imgs[i];
                if (i === this.step) {
                    utils.css(curImg.parentNode, 'zIndex', 1);
                    animate(curImg.parentNode, {opacity: 1}, 300, function () {
                        var siblings = utils.siblings(this);
                        for (var j = 0; j < siblings.length; j++) {
                            var curSibling = siblings[j];
                            utils.css(curSibling, 'opacity', 0);
                        }
                    });
                } else {
                    utils.css(curImg.parentNode, 'zIndex', 0);
                }
            }
            for (var i = 0; i < this.lis.length; i++) {
                this.lis[i].className = i == this.step ? 'bg' : '';
            }
        },
        bindEventForLi: function () {
            var that = this;
            for (var i = 0; i < this.lis.length; i++) {
                var curLi = this.lis[i];
                curLi.index = i;
                curLi.onclick = function () {
                    that.step = this.index;
                    that.setBanner();
                }
            }
        },
        bindEventForMouse: function (){
            var that = this;
            this.banner.onmouseover = function () {
                that.left.style.display = that.right.style.display = 'block';
                window.clearInterval(that.timer);
            }
            this.banner.onmouseout = function () {
                that.left.style.display = that.right.style.display = 'none';
                that.timer = window.setInterval(function (){
                    //由于定时器函数中的this是window，所以我们嵌套了一个匿名函数。是保证在autoMove中的this是当前实例
                    that.autoMove();
                }, that.interval);
            }
        },
        bindEventForBtn : function (){
            var that = this;
            this.left.onclick = function () {
                that.step--; //我下一次让谁显示
                if (that.step == -1) {
                    that.step = that.data.length - 1;
                }
                that.setBanner();
            }
            this.right.onclick = function (){
                that.autoMove();
            }
        },
        init : function (){
            //负责执行函数,但是函数的执行是有先后顺序的
            var that = this;
            this.getData();
            this.bindData();
            window.setTimeout(function (){
                that.imgsDelayLoad()
            },500);
            this.timer = window.setInterval(function (){
                that.autoMove();
            },this.interval);
            this.bindEventForLi();
            this.bindEventForMouse();
            this.bindEventForBtn();
            //return this;
        }
    };
    window.Banner = Banner; //把这个类暴露到全局
})();

//var banner1 = new Banner('banner1','data.txt',2000);


//获取元素

//获取数据

//console.log(data);

//绑定数据


//图片延迟加载： 在这个过程中已经把第一张默认从zIndex=0设置成1，并且透明度也从0到1

//window.setTimeout(imgsDelayLoad, 500);

//自动轮播
//var step = 0;
//var timer = null;
//var interval = 2000; //2000ms更换一张图片
//timer = window.setInterval(autoMove, interval);





