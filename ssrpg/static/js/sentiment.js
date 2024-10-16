function initializeSearchResults() {


    $("#myTable").DataTable({
        "responsive": true,
        "searching": true,
        dom: 'Bfrtip',
        buttons: [
            {
                extend: 'copy',
                charset: 'utf-8',
                className: 'copyButton' // 添加自定义类
            },
            {
                extend: 'csv',
                charset: 'utf-8',
                className: 'csvButton' // 添加自定义类
            },
            {
                extend: 'excel',
                charset: 'utf-8',
                className: 'excelButton' // 添加自定义类
            },
        ],
    });


    function calculateStatistics() {
        var table = $('#myTable').DataTable();

        var column2Data = table.column(1).data();
        var column3Data = table.column(2).data();
        var column4Data = table.column(3).data();
        var column5Data = table.column(5).data();

        var column2Sum = column2Data.reduce(function (a, b) {
            return Number(a) + Number(b);
        }, 0);
        var column2Avg = column2Sum / column2Data.length;

        var column3Sum = column3Data.reduce(function (a, b) {
            return Number(a) + Number(b);
        }, 0);
        var column3Avg = column3Sum / column3Data.length;

        var column4Sum = column4Data.reduce(function (a, b) {
            return Number(a) + Number(b);
        }, 0);
        var column4Avg = column4Sum / column4Data.length;

        var column5Vip = column5Data.reduce(function (count, value) {
            // 统计值为"大R反馈"的个数
            return value === "大R反馈" ? count + 1 : count;
        }, 0);

        var column5Normal = column5Data.reduce(function (count, value) {
            return value === "公测问卷" ? count + 1 : count;
        }, 0);

        $('.statistic_res').html("<h3>整体数据</h3>");
        var statisticHtml = '' +
            '<p>筛选后整体样本数：<b>' + column4Data.length + '</b></p>' +
            '<p>来自大R反馈：<b>' + column5Vip + '</b></p>' +
            '<p>来自公测问卷：<b>' + column5Normal + '</b></p>' +
            // '<hr style="width: 75%; border-bottom: 1px solid grey;margin-left:-0.2rem;">' +
            '<p>整体平均等级：<b>' + column2Avg.toFixed(0) + '</b></p>' +
            '<p>整体平均累充rmb：<b>' + column3Avg.toFixed(0) + '</b></p>' +
            '<p>整体平均情感评分：<b>' + column4Avg.toFixed(1) + '</b></p>'
        ;

        $('.statistic_res').append(statisticHtml);


    }

    function classifyAndCalculate() {

        var table = $('#myTable').DataTable();
        // Initialize the counters and sum variables
        var lowActivityLostUserCount = 0,
            whiteUserCount = 0,
            normalPayingUserCount = 0,
            coreUserCount = 0,
            bigRCount = 0;

        var lowActivityLostUserLevelSum = 0,
            whiteUserLevelSum = 0,
            normalPayingUserLevelSum = 0,
            coreUserLevelSum = 0,
            bigRLevelSum = 0;

        var lowActivityLostUserRechargeSum = 0,
            whiteUserRechargeSum = 0,
            normalPayingUserRechargeSum = 0,
            coreUserRechargeSum = 0,
            bigRRechargeSum = 0;

        var lowActivityLostUserScoreSum = 0,
            whiteUserScoreSum = 0,
            normalPayingUserScoreSum = 0,
            coreUserScoreSum = 0,
            bigRScoreSum = 0;

        // Loop through each row of the table
        table.rows().every(function (rowIdx, tableLoop, rowLoop) {
            var data = this.data();
            var level = parseInt(data[1], 10);
            var recharge = parseFloat(data[2]);
            var score = parseFloat(data[3]);

            // Classify the user and update the counters and sums
            if (level < 15 && recharge === 0) {
                lowActivityLostUserCount++;
                lowActivityLostUserLevelSum += level;
                lowActivityLostUserScoreSum += score;
            } else if (level >= 15 && level <= 35 && recharge === 0) {
                whiteUserCount++;
                whiteUserLevelSum += level;
                whiteUserScoreSum += score;
            } else if (level < 35 && recharge > 0 && recharge <= 3000) {
                normalPayingUserCount++;
                normalPayingUserLevelSum += level;
                normalPayingUserRechargeSum += recharge;
                normalPayingUserScoreSum += score;
            } else if (level > 35 && recharge < 3000) {
                coreUserCount++;
                coreUserLevelSum += level;
                coreUserRechargeSum += recharge;
                coreUserScoreSum += score;
            } else if (recharge >= 3000) {
                bigRCount++;
                bigRLevelSum += level;
                bigRRechargeSum += recharge;
                bigRScoreSum += score;
            }
        });

        // Calculate the averages
        var lowActivityLostUserLevelAvg = lowActivityLostUserCount > 0 ? (lowActivityLostUserLevelSum / lowActivityLostUserCount) : 0;
        var whiteUserLevelAvg = whiteUserCount > 0 ? (whiteUserLevelSum / whiteUserCount) : 0;
        var normalPayingUserLevelAvg = normalPayingUserCount > 0 ? (normalPayingUserLevelSum / normalPayingUserCount) : 0;
        var coreUserLevelAvg = coreUserCount > 0 ? (coreUserLevelSum / coreUserCount) : 0;
        var bigRLevelAvg = bigRCount > 0 ? (bigRLevelSum / bigRCount) : 0;

        var lowActivityLostUserRechargeAvg = lowActivityLostUserCount > 0 ? (lowActivityLostUserRechargeSum / lowActivityLostUserCount) : 0;
        var whiteUserRechargeAvg = whiteUserCount > 0 ? (whiteUserRechargeSum / whiteUserCount) : 0;
        var normalPayingUserRechargeAvg = normalPayingUserCount > 0 ? (normalPayingUserRechargeSum / normalPayingUserCount) : 0;
        var coreUserRechargeAvg = coreUserCount > 0 ? (coreUserRechargeSum / coreUserCount) : 0;
        var bigRRechargeAvg = bigRCount > 0 ? (bigRRechargeSum / bigRCount) : 0;

        var lowActivityLostUserScoreAvg = lowActivityLostUserCount > 0 ? (lowActivityLostUserScoreSum / lowActivityLostUserCount) : 0;
        var whiteUserScoreAvg = whiteUserCount > 0 ? (whiteUserScoreSum / whiteUserCount) : 0;
        var normalPayingUserScoreAvg = normalPayingUserCount > 0 ? (normalPayingUserScoreSum / normalPayingUserCount) : 0;
        var coreUserScoreAvg = coreUserCount > 0 ? (coreUserScoreSum / coreUserCount) : 0;
        var bigRScoreAvg = bigRCount > 0 ? (bigRScoreSum / bigRCount) : 0;

        // Create the statistic table content
        var statisticTableContent = `
        <table class="table_class" id="table_class_instance">
            <thead>
                <tr>
                    <th>玩家分层</th>
                    <th>人数</th>
                    <th>人均等级</th>
                    <th>人均充值rmb</th>
                    <th>人均情感评分</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>低活跃流失</td>
                    <td>${lowActivityLostUserCount}</td>
                    <td>${lowActivityLostUserLevelAvg.toFixed(0)}</td>
                    <td>${lowActivityLostUserRechargeAvg.toFixed(0)}</td>
                    <td>${lowActivityLostUserScoreAvg.toFixed(1)}</td>
                </tr>
                <tr>
                    <td>白嫖玩家</td>
                    <td>${whiteUserCount}</td>
                    <td>${whiteUserLevelAvg.toFixed(0)}</td>
                    <td>${whiteUserRechargeAvg.toFixed(0)}</td>
                    <td>${whiteUserScoreAvg.toFixed(1)}</td>
                </tr>
                <tr>
                    <td>普通玩家</td>
                    <td>${normalPayingUserCount}</td>
                    <td>${normalPayingUserLevelAvg.toFixed(0)}</td>
                    <td>${normalPayingUserRechargeAvg.toFixed(0)}</td>
                    <td>${normalPayingUserScoreAvg.toFixed(1)}</td>
                </tr>
                <tr>
                    <td>核心玩家</td>
                    <td>${coreUserCount}</td>
                    <td>${coreUserLevelAvg.toFixed(0)}</td>
                    <td>${coreUserRechargeAvg.toFixed(0)}</td>
                    <td>${coreUserScoreAvg.toFixed(1)}</td>
                </tr>
                <tr>
                    <td>大R玩家</td>
                    <td>${bigRCount}</td>
                    <td>${bigRLevelAvg.toFixed(0)}</td>
                    <td>${bigRRechargeAvg.toFixed(0)}</td>
                    <td>${bigRScoreAvg.toFixed(1)}</td>
                </tr>
            </tbody>
        </table>
    `;

        // Add the content to the statistic table
        $('.statistic_class').append(statisticTableContent);

        $('#table_class_instance').DataTable({
            "responsive": true,
            "paging": false,
            "searching": false,
            "info": false,
        });


        var playerData = [
            {name: '低活跃流失', value: lowActivityLostUserCount},
            {name: '白嫖玩家', value: whiteUserCount},
            {name: '普通玩家', value: normalPayingUserCount},
            {name: '核心玩家', value: coreUserCount},
            {name: '大R玩家', value: bigRCount}
        ];
        // Data for the bar charts
        var levelData = [
            {name: '低活跃流失', value: lowActivityLostUserLevelAvg.toFixed(0)},
            {name: '白嫖玩家', value: whiteUserLevelAvg.toFixed(0)},
            {name: '普通玩家', value: normalPayingUserLevelAvg.toFixed(0)},
            {name: '核心玩家', value: coreUserLevelAvg.toFixed(0)},
            {name: '大R玩家', value: bigRLevelAvg.toFixed(0)}
        ];

        var rechargeData = [
            {name: '低活跃流失', value: lowActivityLostUserRechargeAvg.toFixed(0)},
            {name: '白嫖玩家', value: whiteUserRechargeAvg.toFixed(0)},
            {name: '普通玩家', value: normalPayingUserRechargeAvg.toFixed(0)},
            {name: '核心玩家', value: coreUserRechargeAvg.toFixed(0)},
            {name: '大R玩家', value: bigRRechargeAvg.toFixed(0)}
        ];

        var scoreData = [
            {name: '低活跃流失', value: lowActivityLostUserScoreAvg.toFixed(1)},
            {name: '白嫖玩家', value: whiteUserScoreAvg.toFixed(1)},
            {name: '普通玩家', value: normalPayingUserScoreAvg.toFixed(1)},
            {name: '核心玩家', value: coreUserScoreAvg.toFixed(1)},
            {name: '大R玩家', value: bigRScoreAvg.toFixed(1)}
        ];

        class BarChart {
            constructor(chartDomClass, data, titleText) {
                this.chartDom = document.getElementsByClassName(chartDomClass)[0];
                this.data = data;
                this.titleText = titleText;
                this.myChart = echarts.init(this.chartDom);
                this.option = {
                    title: {
                        text: this.titleText,
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    xAxis: [{
                        type: 'category',
                        data: this.data.map(item => item.name),
                        axisLabel: {
                            interval: 0,
                        },

                    }],
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                            data: this.data.map(item => item.value),
                            type: 'bar',
                            showBackground: true,
                            backgroundStyle: {
                                color: 'rgba(111, 162, 135, 0.2)'
                            },
                            itemStyle: {
                                normal: {
                                    //这里是颜色
                                    color: function (params) {
                                        //注意，如果颜色太少的话，后面颜色不会自动循环，最好多定义几个颜色
                                        var colorList = ['#5470c6', '#73c0de', '#fac858', '#ee6666', '#73c0de'];
                                        return colorList[params.dataIndex]
                                    }
                                }
                            }

                        }
                    ]
                };
            }

            createChart() {
                this.myChart.setOption(this.option);
            }
        }


        // Creating a PieChart class similar to BarChart
        class PieChart {
            constructor(chartDomClass, data, titleText) {
                this.chartDom = document.getElementsByClassName(chartDomClass)[0];
                this.data = data;
                this.titleText = titleText;
                this.myChart = echarts.init(this.chartDom);
                this.option = {
                    title: {
                        text: this.titleText,
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item'
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left'
                    },
                    series: [
                        {
                            name: '用户分类',
                            type: 'pie',
                            radius: '50%',
                            data: this.data.map(item => ({
                                name: item.name,
                                value: item.value
                            })),
                            labelLine: {
                                show: false  // 隐藏指示线
                            },
                            label: {
                                show: false  // 隐藏标签
                            },
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
            }

            createChart() {
                this.myChart.setOption(this.option);
            }
        }

        // Creating a pie chart for playerData
        var playerPieChart = new PieChart('table_1', playerData, '玩家分层');

        // Call the function to render the pie chart
        playerPieChart.createChart();

        // Creating bar charts for each statistic
        var levelChart = new BarChart('table_2', levelData, '人均等级');
        var rechargeChart = new BarChart('table_3', rechargeData, '人均充值rmb');
        var scoreChart = new BarChart('table_4', scoreData, '人均情感评分');

        levelChart.createChart();
        rechargeChart.createChart();
        scoreChart.createChart();
    }

    classifyAndCalculate();
    calculateStatistics();


}


function SubmitHandle() {
    // Get form values

    console.log("SubmitHandle called")

    const textQuery = document.getElementById("text_query").value;
    const minLength = document.getElementById("min_length_slider").value;
    const maxLength = document.getElementById("max_length_slider").value;
    const sentiment = document.getElementById("sentiment").value;
    const minLength_level = document.getElementById("min_level_slider").value;
    const maxLength_level = document.getElementById("max_level_slider").value;
    const minLength_rmb = document.getElementById("min_rmb_slider").value;
    const maxLength_rmb = document.getElementById("max_rmb_slider").value;
    const sentiment_source = document.getElementById("sentiment_source").value;
    const data_source_selection = document.getElementById("data_source_selection").value;
    // Construct the URL with query parameters
    const url = `query/?text_query=${textQuery}&min_length=${minLength}&max_length=${maxLength}&sentiment=${sentiment}&minLength_level=${minLength_level}&maxLength_level=${maxLength_level}&minLength_rmb=${minLength_rmb}&maxLength_rmb=${maxLength_rmb}&sentiment_source=${sentiment_source}&data_source_selection=${data_source_selection}`;

    document.getElementById("sentiment_loader").style.display = "block";
    // Redirect to the constructed URL
    // window.location.href = url;


    fetch(url)
        .then(response => response.text())
        .then(data => {
            // Insert the returned HTML into the page
            document.getElementById("results_container").innerHTML = data;
            document.getElementById("sentiment_loader").style.display = "none";
            initializeSearchResults()


        });
}


function SubmitHandle_sql() {
    // Get form values

    console.log("SubmitHandleSQL called")

    const textQuerySQL = document.getElementById("text_query_sql").value;
    // Construct the URL with query parameters
    const url = `querysql/?text_query_sql=${textQuerySQL}`;

    document.getElementById("sentiment_loader").style.display = "block";
    // Redirect to the constructed URL
    // window.location.href = url;


    fetch(url)
        .then(response => response.text())
        .then(data => {
            // Insert the returned HTML into the page
            document.getElementById("results_container").innerHTML = data;
            document.getElementById("sentiment_loader").style.display = "none";
            initializeSearchResults()


        });
}


const searchForm = document.getElementById("sentiment_query");
searchForm.addEventListener("submit", function (event) {


    console.log("searchForm.addEventListener is called")
    event.preventDefault();
    SubmitHandle()

});

// const searchFormSQL = document.getElementById("sentiment_query_sql");
// searchFormSQL.addEventListener("submit", function (event) {


//     console.log("searchFormSQL.addEventListener is called")
//     event.preventDefault();
//     SubmitHandle_sql()

// });

const minSlider = document.getElementById("min_length_slider");
const minInput = document.getElementById("min_length_input");
const maxSlider = document.getElementById("max_length_slider");
const maxInput = document.getElementById("max_length_input");

// Update the slider value when the input value changes
minInput.addEventListener("input", function () {
    minSlider.value = minInput.value;
    minValue.textContent = minInput.value;
});

// Update the input value when the slider value changes
minSlider.addEventListener("input", function () {
    minInput.value = minSlider.value;
    minValue.textContent = minSlider.value;
});

// Update the slider value when the input value changes
maxInput.addEventListener("input", function () {
    maxSlider.value = maxInput.value;
    maxValue.textContent = maxInput.value;
});

// Update the input value when the slider value changes
maxSlider.addEventListener("input", function () {
    maxInput.value = maxSlider.value;
    maxValue.textContent = maxSlider.value;
});


const level_minSlider = document.getElementById("min_level_slider");
const level_minInput = document.getElementById("min_level_input");
const level_maxSlider = document.getElementById("max_level_slider");
const level_maxInput = document.getElementById("max_level_input");

// Update the slider value when the input value changes
level_minInput.addEventListener("input", function () {
    level_minSlider.value = level_minInput.value;
});

// Update the input value when the slider value changes
level_minSlider.addEventListener("input", function () {
    level_minInput.value = level_minSlider.value;
});

// Update the slider value when the input value changes
level_maxInput.addEventListener("input", function () {
    level_maxSlider.value = level_maxInput.value;
});

// Update the input value when the slider value changes
level_maxSlider.addEventListener("input", function () {
    level_maxInput.value = level_maxSlider.value;
});

const rmb_minSlider = document.getElementById("min_rmb_slider");
const rmb_minInput = document.getElementById("min_rmb_input");
const rmb_maxSlider = document.getElementById("max_rmb_slider");
const rmb_maxInput = document.getElementById("max_rmb_input");
// const rmb_minValue = document.getElementById("min_rmb_value");
// const rmb_maxValue = document.getElementById("max_rmb_value");

// Update the slider value when the input value changes
rmb_minInput.addEventListener("input", function () {
    rmb_minSlider.value = rmb_minInput.value;
    // rmb_minValue.textContent = rmb_minInput.value;
});

// Update the input value when the slider value changes
rmb_minSlider.addEventListener("input", function () {
    rmb_minInput.value = rmb_minSlider.value;
    // rmb_minValue.textContent = rmb_minSlider.value;
});

// Update the slider value when the input value changes
rmb_maxInput.addEventListener("input", function () {
    rmb_maxSlider.value = rmb_maxInput.value;
    // rmb_maxValue.textContent = rmb_maxInput.value;
});

// Update the input value when the slider value changes
rmb_maxSlider.addEventListener("input", function () {
    rmb_maxInput.value = rmb_maxSlider.value;
    // rmb_maxValue.textContent = rmb_maxSlider.value;
});


function disableLoadingAnimation() {
    // 找到加载动画元素
    console.log("disableLoadingAnimation is called")
    var sentiment_loader = document.getElementById("sentiment_loader");

    // 隐藏加载动画
    sentiment_loader.style.display = "none";
}


setInterval(function () {
    var currentHeight = document.body.scrollHeight;
    // 如果内容高度发生变化，通过postMessage发送新的高度给父页面
    if (currentHeight !== window.lastSentHeight) {
        window.parent.postMessage({
            'iframeHeight': currentHeight
        }, '*');
        window.lastSentHeight = currentHeight;
    }
}, 1000); // 每秒检查一次


window.addEventListener('load', function () {
    console.log("window.addEventListener is called")
    disableLoadingAnimation();
    console.log("IsFirst value:", "{{ dict_return.IsFirst }}");
    if (isFirst === "True") {
        SubmitHandle()
    }

    colls.forEach(function (coll, index) {
        // 切换相关内容的显示状态
        if (index !== 0 && index !== 1 && index !== 2) {
            contents[index].style.display = contents[index].style.display === "block" ? "none" : "block";
            // 切换相关箭头的方向
            arrows[index].classList.toggle("down");
        }
    });

});