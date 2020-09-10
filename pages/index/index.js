var md5 = require('../data/md5.js');
var sha1 = require('../data/sha1.js');

let app = getApp(),
	pageParams = { 
		data: {
			weekTitle: [
        { 
          week: '周一',
          date:''
        },
        {
          week: '周二',
          date: ''
        },
        {
          week: '周三',
          date: ''
        },
        {
          week: '周四',
          date: ''
        },
        {
          week: '周五',
          date: ''
        },
        {
          week: '周六',
          date: ''
        },
        {
          week: '周日',
          date: ''
        },
      
      ],
			courseTop: ['', 210, 425, 635, 850, 1060],
      palette1: ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#f1c40f', '#e67e22', '#e74c3c', '#d35400', '#f39c12', '#3498DB', '#FAAD2E'],
      palette:[
        '#43BC55', '#0AD6C6', '#FE86A5','#1090F4',
        '#FE86A5', '#01BFFD', '#43BC55','#2E9DFA',
        '#FF5778', '#01B5FF', '#45C19E', '#FEAB2E'
      ],  
      //1090f4蓝
			weeks: 0,
      firstDay:'2/24/2020',
			courses: {},     
      picker: [
        '第0周', '第1周', '第2周',
        '第3周', '第4周', '第5周',
        '第6周', '第7周', '第8周',
        '第9周', '第10周', '第11周',
        '第12周', '第13周', '第14周',
        '第15周', '第16周', '第17周',
        '第18周', '第19周', '第20周',
      
      ],
      weekindex:null,
      index:0,
      userName: '',
      password: '',
      classInfo: [],
      classdata: '',
      pos:0,
      
		}
	};


pageParams.getDateHeader = function (that) {
  var weekTitle = that.data.weekTitle
  this.nowTime = new Date();
  this.init = function () {
    this.dayInWeek = this.nowTime.getDay();
    this.dayInWeek == 0 && (this.dayInWeek = 7);
    this.thsiWeekFirstDay = this.nowTime.getTime() - (this.dayInWeek - 1) * 86400000;
    this.thisWeekLastDay = this.nowTime.getTime() + (7 - this.dayInWeek) * 86400000;
    return this;
  };
  this.getWeekType = function (type) {
    type = ~~type;
    var firstDay = this.thsiWeekFirstDay + type * 7 * 86400000;
    var lastDay = this.thisWeekLastDay + type * 7 * 86400000;
    for(let i=0;i<7;i++){
      var day = this.thsiWeekFirstDay +  i * 86400000;
      var date = this.formateDate(day)
      weekTitle[i].date=date
      // console.log(date)
    }
    //记得setDate才能重新渲染,直接修改this.data，而不调用this.setData()，是无法改变当前页面的状态的，会导致数据不一致,setData 函数用于将数据从逻辑层发送到视图层（异步），同时改变对应的 this.data 的值（同步）。
    that.setData({
      weekTitle: weekTitle
    })
    return this.getWeekHtml(firstDay, lastDay);
  }
  this.formateDate = function (time) {
    var newTime = new Date(time)
    var year = newTime.getFullYear();
    var month = newTime.getMonth() + 1;
    var day = newTime.getDate();
    // return year + "-" + (month >= 10 ? month : "0" + month) + "-" + (day >= 10 ? day : "0" + day);
    return month+"-"+day;
  };
  this.getWeekHtml = function (f, l) {
    return this.formateDate(f) + "至" + this.formateDate(l);
  };
} 
/** 
 * 转发
 */
pageParams.onShareAppMessage= function () {
  return {
    title: 'WUT课表'
  }
}
/**
 * 分享到朋友圈
 */
pageParams.onShareTimeline=function(){
  return {
    title: 'WUT课表'
  }
}
/**
 * 底部周次选择器
 */
pageParams.PickerChange=function(e){
  console.log(e);
  this.setData({
    index: e.detail.value,
    weeks: e.detail.value
  })
  pageParams.setClassColor(this)
}  

pageParams.setClassColor = function (that){
  var courses = that.data.courses;
  var classInfo = that.data.classInfo
  var weeks = that.data.weeks
  // var weeks = 18
  var week_rex = /第(\d{2})-(\d{2})周/
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 5; j++) {
      if (courses[i][j].length > 0 && courses[i][j].length != 'undefined') {
        
        // console.log(courses[i][j])
        var isweek = 0
        //标记本节有无本周课
        //循环每个位置的课程
        for (let k = 1; k < courses[i][j].length; k++) {
          
          var week_re = courses[i][j][k].time.match(week_rex)
          var start = parseInt(week_re[1], 10)
          var end = parseInt(week_re[2], 10)
          if (weeks >= start && weeks <= end) {
            courses[i][j][k].iscurrentweek = 1
            var tmp = courses[i][j][1];
            courses[i][j][1] = courses[i][j][k];
            courses[i][j][k]=tmp;
            isweek=1
          } else {
            courses[i][j][k].iscurrentweek = 0
          }
        }
        if(isweek){
          courses[i][j][0].bg=that.data.palette[Math.floor(Math.random() * 12)] 
          isweek=0
        }else{
          courses[i][j][0].bg ='#FFFFFF'
        }
      } else {
        courses[i][j].bg = "#FFFFFF"
      }

    }
  }
  that.setData({
    courses: courses
  })

}

pageParams.formatClass=function(that) {
  // =this.data.classInfo
  var classInfo = that.data.classInfo;
  var data = this.data.classdata
  var weeks = this.getWeek();
  //console.log(data)
  var data_re = data.replace(/[\r\n|\t]/g, '');
  // console.log(data_re);
  //var classes_rex =/<td style="text-align: center">.*?<\/td>/g
  //加工为td标签
  var classes_rex = /<td style="text-align: center">[\d\D]*?<\/td>/g
  var classes = data_re.match(classes_rex);
  // console.log(classes);
  //匹配不为空的td
  var detail_rex = /<div.*?<\/div>/
  //匹配汉字
  var detail_rex2 = /target="_blank">([\d\D]*?)<p>@([\d\D]*?)<\/p><p>◇([\d\D]*?)<\/p>/
  for (let i in classes) {
    if (detail_rex.test(classes[i])) {
      classes[i] = classes[i].match(/<div.*?<\/div>/g)
      // console.log(classes[i])
      classInfo[i] = new Array(classes[i].length);
      for (let j in classes[i]) {
        var cc = classes[i][j].match(detail_rex2)
        classInfo[i][j] = {
          name: cc[1],
          address: cc[2],
          time: cc[3]
        }
      }

    } else {
      classInfo[i] = {}
    }
  }
  
  //为courses进行赋值操作
  var courses = new Array(7);
  var classInfo = this.data.classInfo
  var weeks = this.getWeek();
  var week_rex = /第(\d{2})-(\d{2})周/
  for (let i = 0; i < 7; i++) {
    courses[i] = new Array(5);
    for (let j = 0; j < 5; j++) {
      courses[i][j] = classInfo[j * 7 + i]
    }
  }


  this.setData({
    data: data_re,
    classInfo: classInfo,
    courses: courses
  })
  that.setClassColor(that)
}
pageParams.getCourses=function(that){
  var tname = md5.hex_md5(this.data.userName)
  var tpw = sha1.hex_sha1(this.data.userName + this.data.password)

  var URL = "http://sso.jwc.whut.edu.cn/Certification/login.do?"
  URL += "code=1913507941"
  URL += "&webfinger=f11a076b5b7cbf537093f85010d1f6d1"
  URL += "&type=xs"
  URL += "&userName=" + that.data.userName
  URL += "&password=" + that.data.password
  URL += "&userName1=" + tname
  URL += "&password1=" + tpw
  console.log(URL)
  wx.cloud.init({ env: 'wut-classtable-umngq' })
  wx.cloud.callFunction({
    name: 'getCourse',
    data: {
      URL: URL
    }
  }).then(res => {
    console.log(res.result['set-cookie'])
    console.log(res.result) // get
    // console.log(JSON.parse(res.result)) // post

    var cookie_reg1 = /JSESSIONID[^;]*;/;
    var cookie_reg2 = /CERLOGIN[^;]*;/;
    //console.log(res.cookies[0].match(cookie_reg1))
    //console.log(res.cookies[1].match(cookie_reg2))
    var cookies = res.result['set-cookie'][0].match(cookie_reg1) + res.result['set-cookie'][1].match(cookie_reg2)
    console.log(cookies)
    var URL2 = 'http://sso.jwc.whut.edu.cn/Certification/toIndex.do'
    wx.cloud.callFunction({
      name: 'getTable',
      data: {
        URL: URL2,
        Cookie: cookies
      }
    }).then(res2 => {
      console.log('--------')
      console.log(res2)
      that.data.classdata = res2.result
      var classdata = that.data.classdata
      var data = res2.result
      that.setData({
        classdata: data
      })
      that.formatClass(that);
    })

  })
}
/**
	 * 生命周期函数--监听页面显示
	 */
pageParams.onShow = function () {
var that=this;
  // pageParams.test()
	//每次显示这个页面,判断有没有登录
  if (!wx.getStorageSync("courses")) {
		wx.showModal({
			title: '提示',
			content: '请先绑定教务账号',
			showCancel: false,
			confirmText: '确定',
			success: function (res) {
				wx.switchTab({
					url: '/pages/me/me'
				});
			}
		});
	} else {
      this.setData({
        courses: wx.getStorageSync('courses')
      })
  }
  if (Object.keys(this.data.courses).length === 0) {
		//判断是否有课程信息，如果没有则加载缓存
		if (app.cache.courses) { //如果有课程的缓存
			wx.showLoading({
				title: '正在加载课表',
			});
			this.renderCourses();
		} else { //如果登录了&没有课程缓存
			//获取课表
		}
	}
  
  // this.getFirstDay()
  var week = that.getWeek()
  var weekindex = new Date().getDay();
  weekindex = weekindex == 0 ? 6 : weekindex - 1;
  
  that.setData({
    weeks: week,
    weekindex: weekindex,
    index: null
  })
  pageParams.setClassColor(this)
  // pageParams.getCourses(this)
} 
//采用了Promise方式同步，延迟有点高，会出现屏闪
pageParams.getFirstDay = function () {
  var that = this
  return new Promise(function (resolve, reject) {
    // that.getFirstDay(resolve)
    wx.cloud.init()
    const db = wx.cloud.database({
      env: 'wut-classtable-umngq'
    });
    const table = db.collection('classTable');
    var firstDay = that.data.firstDay
    table.doc("b1cb7d3a5f375beb009fd03946531378").get({
      success: function (res) {
        console.log(res.data)
        that.setData({
          firstDay: res.data.firstday
        })
        resolve()
      },
      fail: function () {
        return false
      }
    });
  }).then(function () {
    var week = that.getWeek()
    var weekindex = new Date().getDay();
    // weekindex=0
    weekindex = weekindex == 0 ? 6 : weekindex - 1;
    console.log(weekindex)
    that.setData({
      weeks: week,
      weekindex: weekindex,
      index:null
    })       
    pageParams.setClassColor(that)
  })

};

pageParams.getFirstDay02 = function () {
  var that = this
    wx.cloud.init()
    const db = wx.cloud.database({
      env: 'wut-classtable-umngq'
    });
    const table = db.collection('classTable');
    var firstDay = that.data.firstDay
    table.doc("b1cb7d3a5f375beb009fd03946531378").get({
      success: function (res) {
        console.log(res.data)
        that.setData({
          firstDay: res.data.firstday
        })
      }
    });
  

};
 
pageParams.onReady = function () {
};
pageParams.onLoad = function () {
  
  var that = this;
  
	// 绑定事件
	app.event.on('getCoursesSuccess', this.renderCourses, this);
	app.event.on('logout', this.recover, this);
  
  this.getFirstDay()
/**
 * header上的日期
 */
  var getWeek = new pageParams.getDateHeader(that);
  var week = getWeek.init().getWeekType();
  console.log(week);
};

pageParams.onUnload = function () {

	app.event.remove('getCoursesSuccess', this);
	app.event.remove('logout', this);
};


// 监听错误
pageParams.onError = function (err) {
	console.log("监听错误：" + err)
	// 上报错误
	
};
// 触发错误
pageParams.onLaunch= function () {
	// throw new Error('my error msg')
  

};

pageParams.renderCourses = function () {
	this.recover();
	let weeks = app.cache.week,
		resCourses = app.cache.courses,
		resWeekTitle = [],
		index = 0,
		colorIndex = Math.floor(Math.random() * (this.data.palette.length)),
		courseBg = {};

	for (let key in resCourses) {
		resWeekTitle.push(this.data.weekTitle[key]);
		index += 1;
		for (let subKey in resCourses[key]) {
			for (let subSubKey in resCourses[key][subKey]) {
				let course = resCourses[key][subKey][subSubKey];
				course['shortName'] = course['name'];
				if (course['name'].length > 9) {
					course['shortName'] = course['name'].slice(0, 9) + '...';
				}
				let bgKey = course['name'];
				if (!courseBg[bgKey]) {
					courseBg[bgKey] = this.data.palette[colorIndex++ % (this.data.palette.length)];
				}
				course['bg'] = courseBg[bgKey];
			}
		}
	}
	wx.hideLoading();
	if (index == 0) {
		wx.showModal({
			title: '哎哟～',
			content: '本周无课哟～ 关掉手机浪去吧~',
			confirmText: 'Get',
			showCancel: false
		});
	}
	// 保存渲染后的课程信息
	this.setData({
		weekTitle: resWeekTitle,
		weeks: weeks,
		courses: resCourses
	})
};

pageParams.recover = function (firstDay) {
	this.setData({
		weekTitle: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
		weeks: wx.getStorageSync("week"),
		courses: {}
	})
};
//获取week
pageParams.getWeek = function () {
  var day2 = new Date();
  day2.setTime(day2.getTime());
  var s2 = day2.getFullYear() + "-" + (day2.getMonth() + 1) + "-" + day2.getDate();
  var month = day2.getMonth();
  var date = day2.getDate()
  var startDate = Date.parse(this.data.firstDay);
  var endDate = Date.parse(day2);

  console.log(startDate)
  console.log(day2)
  var days = (endDate - startDate) / (1 * 24 * 60 * 60 * 1000);
  
  days = parseInt(days)
  console.log(Math.ceil((days+1) / 7))
  return Math.ceil((days+1) / 7)
  // var ans=0;
  // for(let i=3;i<=month;i++){
  //   if(i%2==0){
  //     ans+=30
  //   }else{
  //     ans+=31
  //   }
  // }
  // console.log(month)
  // ans+=6;
  // ans+=date;
  // console.log(ans)
  // if(ans%7!=0){
  //   return Math.floor((ans/7)+1)
  // }else{
  //   return Math.floor(ans/7)
  // }
};

pageParams.showDetail = function (e) {
	let dataSet = e.currentTarget.dataset,
	course = this.data.courses[dataSet.day][dataSet.lesson][1];
  var content='';
  //console.log("length="+this.data.courses[dataSet.day][dataSet.lesson].length)
  //console.log(this.data.courses[dataSet.day][dataSet.lesson])
  for (let i = 1; i < this.data.courses[dataSet.day][dataSet.lesson].length;i++){
    course = this.data.courses[dataSet.day][dataSet.lesson][i]
   //console.log(course)

    content += course['name'] + '\r\n' + course['address'] + '\r\n' + course['time'] + '\r\n' +'\r\n'
  }
	wx.showModal({
		title: '详情',
    content: content,
		confirmText: '知道了',
		showCancel: false
	});
};


Page(pageParams);