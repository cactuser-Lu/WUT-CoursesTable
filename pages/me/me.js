// pages/fortest/fortest.js
var md5 = require('../data/md5.js');
var sha1 = require('../data/sha1.js');
const jinrishici = require('../../utils/jinrishici.js')

let app = getApp(),
	pageParams = {
		data: {
			stuid: '',
			stupwd: '',
			stuid_focus: false,
			stupwd_focus: false,
			btn_disabled: true,
			btn_loading: false,
			updateTime: "未更新",
      status:'未绑定',
      classInfo: [],
      classdata: '',
      code: 0,
      palette: ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#f1c40f', '#e67e22', '#e74c3c', '#d35400', '#f39c12', '#1abc9c', '#8e44ad'],
      jinrishici: "吹灭读书灯,一身都是月。",
      author:'',
      dynasty:'',
      swiperList: [{
        id: 0,
        type: 'image',
        url: 'https://s2.ax1x.com/2019/05/23/VCIILF.jpg'
        }
      ],
      note:[]
		}
	};
var that = this;
pageParams.bindStuNum = function (options) {
	//如果没有登录，先登录
	if (wx.getStorageSync("nick") == "") {
		wx.showLoading({
			title: '正在登录',
		});
		this.wxLogin();
	} else {
		wx.navigateTo({
			url: '/pages/login/login'
		});
	}
};
pageParams.wxLogin = function (e) {
	wx.showLoading({
		title: '正在登录',
	})
	// var that = this;
	wx.login({
		success: function (res) {
			var code = res.code; //发送给服务器的code 
			wx.getUserInfo({
				success: function (res) {
					var userNick = res.userInfo.nickName; //用户昵称 
					var avataUrl = res.userInfo.avatarUrl; //用户头像地址 
					var gender = res.userInfo.gender; //用户性别
					that.setData({
						nick: userNick,
						avataUrl: avataUrl
					})
					if (code) {
						wx.request({
							url: app.SERVER_URL + '/wxLogin.php',
							//url: 'http://127.0.0.1/jiaowu3/wxLogin.php',
							//服务器的地址，现在微信小程序只支持https请求，所以调试的时候请勾选不校监安全域名
							data: {
								code: code,
								nick: userNick,
								avaurl: avataUrl,
								sex: gender,
							},
							header: {
								'content-type': 'application/json'
							},
							success: function (res) {
								console.log(res.data);
								wx.setStorageSync('nick', res.data.nick); //将获取信息写入本地缓存 
								wx.setStorageSync('openid', res.data.openid);
								wx.setStorageSync('imgUrl', res.data.imgUrl);
								wx.setStorageSync('sex', res.data.sex);
								if (res.data.account != null) {
									wx.setStorageSync('stuNum', res.data.account);
									wx.setStorageSync('password', res.data.password);
									that.setData({
										stuNum: res.data.account,
										password: res.data.password
									});
									app.getCourses(res.data.account, res.data.password);
								} else {
									wx.setStorageSync('stuNum', null);
									wx.setStorageSync('password', null);
									wx.showModal({
										title: '提示',
										content: '还未绑定教务账号，立即绑定？',
										cancelText: "稍后",//默认是“取消” 
										confirmText:"去绑定",//默认是“确定” 
										success: function (res) {
											if (res.cancel) {
												wx.showModal({
													content: '可在“我”界面“教务账号”菜单中进行绑定',
													showCancel: false
												})
											} else {
												wx.navigateTo({
													url: '/pages/login/login'
												});
											}
										}
									})
									wx.hideLoading();
								}
							},
							fail : function (res) {
								wx.hideLoading();
								wx.showModal({
									title: '连接教务系统超时',
									content: '可能是教务系统不稳定所至，请稍后重试',
									showCancel: false
								})
							}							
						})
					} else {
						console.log("获取用户登录态失败！");
					}
				},
				fail: function (e) {
					console.log("获取用户信息失败+" + JSON.stringify(e));
					wx.redirectTo({
						url: '../auth/auth',
					})
				},
				complete: function (res) {

				},
			})
		},
		fail: function (error) {
			console.log('login failed ' + error);
		}
	})
};
/**
 * 生命周期函数--监听页面加载
 */
pageParams.onLoad = function (options) {
  var status=this.data.status
  if (wx.getStorageSync('courses')){
    this.setData({
        status:'已绑定'
    })
    this.getNote();
    jinrishici.load(result => {
      // 下面是处理逻辑示例
      console.log(result)
      this.setData({ "jinrishici": result.data.content, 'author': result.data.origin.author, 'dynasty': result.data.origin.dynasty})
    })
  }
	this.setData({	//加载页面时显示昵称和头像
		nick: wx.getStorageSync('nick'),
		avataUrl: wx.getStorageSync('imgUrl'),
		stuNum: wx.getStorageSync('stuNum'),
	})
	
};
/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
pageParams.onReady = function () {
	//如果没有时间信息，获取时间信息
	//app.getTime();
};

pageParams.getNote = function () {
  var that=this
  wx.cloud.init()
  const db = wx.cloud.database({
    env: 'wut-classtable-umngq'
  });
  const table = db.collection('classTable');

  table.doc("4a46c0515f374bc600a721b036bfebc0").get({
    success: function (res) {
      console.log(res.data)
      var note=that.data.note
      that.setData({
          note:res.data
      })
    }
    
  });
};
pageParams.fresh=function() {
  console.log(123)
  var that=this
  if (wx.getStorageSync('stuid') && wx.getStorageSync('stupwd')){
    wx.showLoading({
      title: '正在刷新',
    })
    var stuid=that.data.stuid
    var stupwd=that.data.stupwd
    that.setData({
      stuid: wx.getStorageSync('stuid'),
      stupwd: wx.getStorageSync('stupwd')
    })
    pageParams.getData(that)
    
  }else{
    wx.hideLoading();
    wx.showModal({
      title: '刷新失败',
      content: '可能是版本问题，请重新绑定后重试',
      showCancel: false
    })
  }
};
/**
	 * 生命周期函数--监听页面显示
	 */
pageParams.onShow = function () {

  

	this.setData({
		stuNum: wx.getStorageSync('stuNum'),
		updateTime: wx.getStorageSync("updateTime"),
	})
  var status = this.data.status
  if (wx.getStorageSync('courses')) {
    this.setData({
      status: '已绑定'
    })
  }
};



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
  URL += "code=" + that.data.code
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
    // console.log(res.cookies[0].match(cookie_reg1))
    // console.log(res.cookies[1].match(cookie_reg2))
    // console.log(res.result['set-cookie'].length)
    wx.hideLoading();
    if (res.result['set-cookie'].length>1){
        wx.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1000
        })
    }else{
      wx.showToast({
        title: '刷新失败',
        duration: 1000
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
      that.formatClass(that);
    })

  })
}

pageParams.getData = function (that) {
  // this.setData({
  //   btn_loading: true
  // });
  // app.bindingAccount(this.data.stuid, this.data.stupwd);	//绑定
  that.setData({
    userName: this.data.stuid,
    password: this.data.stupwd
  })

  // var that = this

  //调用云函数发送http请求
  
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
    pageParams.getCourses(that)
  })
  
  

}


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
 * 生命周期函数--监听页面隐藏
 */
pageParams.onHide = function () {

},

/**
 * 生命周期函数--监听页面卸载
 */
pageParams.onUnload = function () {

};

/**
 * 页面相关事件处理函数--监听用户下拉动作
 */
pageParams.onPullDownRefresh = function () {

};

/**
 * 页面上拉触底事件的处理函数
 */
pageParams.onReachBottom = function () {

};

/**
 * 用户点击右上角分享
 */
pageParams.onShareAppMessage = function () {

}

Page(pageParams);