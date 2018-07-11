window.onload = function () {
  // 主页面
  let history = null
  let buttonToggle = document.getElementsByClassName('button-toggle')
  // ajax请求
  setInterval(function () {
    getData()
  }, 1000)
  // 图形渲染
  var dom = document.getElementById("surface-content");
  var myChart = echarts.init(dom);
  var app = {};
  option = null;
  var arr = []
  arr[0]='-60S'
  for (var i=1;i<20;i++) {
    arr.push('')
  }
  arr[19]='Now'
  option = {
      xAxis: {
          boundaryGap: false,
          type: 'category',
          data: arr
      },
      yAxis: {
          type: 'value',
          min:20,
          max:35,
          splitNumber:3
      },
      series: [{
          data: [],
          name:'--',
            type:'line',
            smooth:true,
            symbol: 'none',
            stack: 'a',
            areaStyle: {
                normal: {}
            },
      }]
  }
  var hasInit = false
  function renderLine (json) {
    var h = json.history
    for (var i=0;i<h.length;i++) {
      h[i] = h[i]/100
    }
    h = h.splice(40)
    if (!hasInit) {
      option.series[0].data = h
    }
    option.series[0].data.shift()
    option.series[0].data.push(h[h.length-1])
    if (!hasInit) {
      hasInit = true
      myChart.setOption(option)
    } else {
      myChart.setOption({
        series: [{
          data: option.series[0].data
        }]
      });
    }
  }

  // 失去焦点发送一次
  let numInput = document.getElementById('the-temperature')
  numInput.addEventListener('blur', function () {
    let xhr = new XMLHttpRequest()
    let num = document.getElementById('the-temperature').value * 100
    xhr.open('get', `http://192.168.23.1:8080/iot-server/data?o=set&expect=${num}`)
    xhr.send()
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        
      }
    }
  })
  // 初始化以及更新
  function getData (buttonData, toggles) {
    let xhr = new XMLHttpRequest()
    if (buttonData) {
      let num = document.getElementById('the-temperature').value * 100
      xhr.open('get', `http://192.168.23.1:8080/iot-server/data?${buttonData}=${toggles}&o=set&expect=${num}`)
    } else {
      xhr.open('get', `http://192.168.23.1:8080/iot-server/data`)
    }
    xhr.send()
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        let responseText = JSON.parse(xhr.responseText)
        renderLine(responseText)
        let light = responseText.light
        let wind = responseText.wind
        let auto = responseText.auto
        let temperature = responseText.temperature
        light ? onButton(buttonToggle[0]) : offButton(buttonToggle[0])
        wind ? onButton(buttonToggle[1]) : offButton(buttonToggle[1])
        if (history === null) {
          document.getElementById('the-temperature').value = (responseText.expect / 100).toFixed(2)
        }
        auto ? onButton(buttonToggle[2]) : offButton(buttonToggle[2])
        history ? '' : history = responseText.history
      }
    }
  }
  getData()
  // 页面顶部按钮样式
  window.addEventListener('click', (e) => {
    switch (e.target) {
      case buttonToggle[0]: e.target.className === 'button-toggle' ? getData('light', true) : getData('light', false); break;
      case buttonToggle[1]: e.target.className === 'button-toggle' ? getData('wind', true) : getData('wind', false); break;
      case buttonToggle[2]: e.target.className === 'button-toggle' ? getData('auto', true) : getData('auto', false); break;
      default: '';
    }
  })
  // 开按钮
  function onButton (theElement) {
    theElement.classList.add('button-on')
    theElement.children[0].style.transition = 'transform 300ms ease-out'
    theElement.children[0].style.transform = 'translate(2.5em)'
  }
  // 关按钮
  function offButton (theElement) {
    theElement.classList.remove('button-on')
    theElement.children[0].style.transition = 'transform 300ms ease-out'
    theElement.children[0].style.transform = 'translate(0em)'
  }
}