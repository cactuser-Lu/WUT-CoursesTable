var md5 = require('../data/md5.js');
var sha1 = require('../data/sha1.js');
 
let app = getApp(),
	pageParams = {
		data: {
			stuid: '',
			stupwd: '', 
			stuid_focus: false,
			stupwd_focus: false,
			btn_disabled: true,
			btn_loading: false,

      palette: ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#f1c40f', '#e67e22', '#e74c3c', '#d35400', '#f39c12', '#1abc9c', '#8e44ad'],
      userName: '',
      password: '',
      classInfo: [],
      classdata: '',
      code:0
		}
	};
var that=this
pageParams.onLoad = function() {
  // 绑定事件
  app.event.on('getCoursesSuccess', this.loginSuccess, this);
  app.event.on('getCoursesComplete', this.loginComplete, this);
};

pageParams.onUnload = function() {
  app.event.remove('getCoursesSuccess', this);
  app.event.remove('getCoursesComplete', this);
};

pageParams.loginSuccess = function() {
  wx.switchTab({
    url: '/pages/index/index'
  });
};

pageParams.loginComplete = function() {
  this.setData({
    btn_loading: false
  });
};

pageParams.inputInput = function(e) {
  if (e.target.id == 'stuid') {
    this.setData({
      stuid: e.detail.value
    });
  } else if (e.target.id == 'stupwd') {
    this.setData({
      stupwd: e.detail.value
    });
  }
  let btn = true;
  if (this.data.stuid.length == 10 && this.data.stupwd.length >= 6) {
    btn = false;
  }
  this.setData({
    btn_disabled: btn
  });
};

pageParams.inputFocus = function(e) {
  if (e.target.id == 'stuid') {
    this.setData({
      stuid_focus: true
    });
  } else if (e.target.id == 'stupwd') {
    this.setData({
      stupwd_focus: true
    });
  }
};

pageParams.inputBlur = function(e) {
  if (e.target.id == 'stuid') {
    this.setData({
      stuid_focus: false
    });
  } else if (e.target.id == 'stupwd') {
    this.setData({
      stupwd_focus: false
    });
  }
};

//获取week
pageParams.getWeek = function () {
  var day2 = new Date();
  day2.setTime(day2.getTime());
  var s2 = day2.getFullYear() + "-" + (day2.getMonth() + 1) + "-" + day2.getDate();
  var month = day2.getMonth();
  var date = day2.getDate()
  console.log(s2)
  var ans = 0;
  for (let i = 3; i <= month; i++) {
    if (i % 2 == 0) {
      ans += 30
    } else {
      ans += 31
    }
  }
  ans += 6;
  ans += date;
  console.log(ans)
  if (ans % 7 != 0) {
    return Math.floor((ans / 7) + 1)
  } else {
    return Math.floor(ans / 7)
  }
};

pageParams.setClassColor = function (that) {
  var courses = this.data.courses;
  var classInfo = this.data.classInfo
  var weeks = this.getWeek();
  var week_rex = /第(\d{2})-(\d{2})周/
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 5; j++) {
      if (courses[i][j].length > 0 && courses[i][j].length != 'undefined') {
        courses[i][j].unshift({ bg: this.data.palette[Math.floor(Math.random() * 12)] })
        var isweek = 0//标记本节有无本周课
        //循环每个位置的课程
        for (let k = 1; k < courses[i][j].length; k++) {
          var week_re = courses[i][j][k].time.match(week_rex)
          var start = parseInt(week_re[1], 10)
          var end = parseInt(week_re[2], 10)
          if (weeks >= start && weeks <= end) {
            courses[i][j][k].iscurrentweek = 1
            var tmp = courses[i][j][1];
            courses[i][j][1] = courses[i][j][k];
            courses[i][j][k] = tmp;
            isweek = 1
          } else {
            courses[i][j][k].iscurrentweek = 0
          }
        }
        if (isweek) {
          isweek = 0
        } else {
          courses[i][j][0].bg = '#FFFFFF'
        }
      } else {
        courses[i][j].bg = "#FFFFFF"
      }

    }
  }
  this.setData({
    courses: courses
  })
  wx.setStorageSync('courses', courses)
  wx.setStorageSync('stuid', that.data.stuid)
  wx.setStorageSync('stupwd', that.data.stupwd)
  // wx.showToast({
  //   title: '绑定成功',
  //   icon: 'success',
  //   duration: 1000
  // })
}

pageParams.formatClass = function (that) {
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

/**
	 * 生命周期函数--监听页面显示
	 */
pageParams.onShow = function () {
  var that = this;
  wx.cloud.init({ env: 'wut-classtable-umngq' })
  var URLCode = "http://sso.jwc.whut.edu.cn/Certification/getCode.do?webfinger="
  wx.cloud.callFunction({
    name: 'getCode',
    data: {
      URL: URLCode + 'f11a076b5b7cbf537093f85010d1f6d1'
    }
  }).then(res => {
    console.log(res.result)
    var code = that.data.code
    that.setData({
      code: res.result
    })
  })
  
}

pageParams.getCourses = function (that) {
  
  console.log(that.data.stuid)
  that.setData({
    userName: that.data.stuid,
    password: that.data.stupwd
  })
  wx.cloud.init({ env: 'wut-classtable-umngq' })
  // var URLCode = "http://sso.jwc.whut.edu.cn/Certification/getCode.do?webfinger="
  // var code = wx.cloud.callFunction({
  //   name: 'getCode',
  //   data: {
  //     URL: URLCode + 'f11a076b5b7cbf537093f85010d1f6d1'
  //   }
  // }).then(res => {
  //   console.log(res.result)
  //   return res.result
  // })

  var tname = md5.hex_md5(that.data.userName)
  var tpw = sha1.hex_sha1(that.data.userName + that.data.password)

  var URL = "http://sso.jwc.whut.edu.cn/Certification/login.do?"
  URL += "code="+that.data.code
  URL += "&webfinger=f11a076b5b7cbf537093f85010d1f6d1"
  URL += "&type=xs"
  URL += "&userName=" + that.data.stuid
  URL += "&password=" + that.data.stupwd
  URL += "&userName1=" + tname
  URL += "&password1=" + tpw
  console.log(URL)

  
  
  wx.cloud.callFunction({
    name: 'getCourse',
    data: {
      URL: URL
    }
  }).then(res => {
    // console.log(res.result['set-cookie'])
    // console.log(res.result) // get
    // console.log(JSON.parse(res.result)) // post

    var cookie_reg1 = /JSESSIONID[^;]*;/;
    var cookie_reg2 = /CERLOGIN[^;]*;/;
    //console.log(res.cookies[0].match(cookie_reg1))
    //console.log(res.cookies[1].match(cookie_reg2))

    
    if (res.result['set-cookie'].length > 1) {
      
    } else {
      wx.hideLoading();
      wx.showModal({
        title: '绑定失败',
        content: '可能是账号或密码不正确',
        showCancel: false
      })
    }  
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
      // console.log(res2)
      that.data.classdata = res2.result
      var classdata = that.data.classdata
      var data = res2.result
      // console.log(data)
      that.setData({
        classdata: data
      })
      wx.hideLoading();
      wx.showToast({
        title: '绑定成功',
        icon: 'success',
        duration: 1000
      })
      that.formatClass(that);
    })

  })
}

pageParams.getData = function() {
  // this.setData({
  //   btn_loading: true
  // });
	// app.bindingAccount(this.data.stuid, this.data.stupwd);	//绑定
  this.setData({
    userName: this.data.stuid,
    password: this.data.stupwd
  })
  wx.showLoading({
    title: '正在绑定',
  })
  var that = this

  //调用云函数发送http请求
  pageParams.getCourses(that)
  
  // if(wx.getStorageSync('courses')){
  //   wx.showToast({
  //     title: '绑定成功',
  //     icon: 'success',
  //     duration: 1000
  //   })
    
  // }else{
  //   wx.showToast({
  //     title: '绑定失败',
  //     duration: 1000
  //   })
  // }

}

Page(pageParams);