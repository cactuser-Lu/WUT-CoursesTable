var md5 = require('../data/md5.js');
var sha1 = require('../data/sha1.js');

let app = getApp(),
	pageParams = { 
		data: {
			weekTitle: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
			courseTop: ['', 210, 425, 635, 850, 1060],
      palette: ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#f1c40f', '#e67e22', '#e74c3c', '#d35400', '#f39c12', '#1abc9c', '#8e44ad'],
			weeks: 0,
			courses: {},   
   
      userName: '0121710880108',
      password: '17411414153674',
      classInfo: [],
      classdata: '',
      pos:0
		}
	};

pageParams.setClassColor = function (that){
  var courses = that.data.courses;
  var classInfo = that.data.classInfo
  var weeks = that.getWeek();
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
          isweek=0
        }else{
          courses[i][j][0].bg='#fff'
        }
      } else {
        courses[i][j].bg = "#EBEBEB"
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
  var detail_rex2 = /target="_blank">([\d\D]*?)<p>([\d\D]*?)<\/p><p>◇([\d\D]*?)<\/p>/
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
  var week=that.getWeek();
  this.setData({
    weeks:week
  }) 
  
  //pageParams.getCourses(this)
  pageParams.setClassColor(that)
}   
  
pageParams.onLoad = function () {
	// 绑定事件
	app.event.on('getCoursesSuccess', this.renderCourses, this);
	app.event.on('logout', this.recover, this);
	
	
	
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
	throw new Error('my error msg')
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

pageParams.recover = function () {
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
  console.log(s2)
  var ans=0;
  for(let i=3;i<month;i++){
    if(i%2==0){
      ans+=30
    }else{
      ans+=31
    }
  }
  ans+=6;
  ans+=date;
  console.log(ans)
  if(ans%7!=0){
    return Math.floor((ans/7)+1)
  }else{
    return Math.floor(ans/7)
  }
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