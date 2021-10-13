import React, { useEffect } from "react";
import ReactDOM from "react-dom";
const { Screen, Layout } = require("../components/layout")
const Secure = require("../components/secure")

const Widgets = (props) => {
    useEffect(() => {
        const me = ReactDOM.findDOMNode(this);

        $('.sparkline-bar-stats').sparkline('html', {
            type: 'bar',
            height: 36,
            barWidth: 3,
            barColor: '#fff',
            barSpacing: 2
        });

        // Make some sample data
    var pieData = [
        {data: 1, color: '#ff6b68', label: 'Toyota'},
        {data: 2, color: '#03A9F4', label: 'Nissan'},
        {data: 3, color: '#32c787', label: 'Hyundai'},
        {data: 4, color: '#f5c942', label: 'Scion'},
        {data: 5, color: '#d066e2', label: 'Daihatsu'}
    ];

    // Pie Chart
    if($('.flot-pie')[0]){
        $.plot('.flot-pie', pieData, {
            series: {
                pie: {
                    show: true,
                    stroke: {
                        width: 2
                    }
                }
            },
            legend: {
                container: '.flot-chart-legend--pie',
                backgroundOpacity: 0.5,
                noColumns: 0,
                backgroundColor: "white",
                lineWidth: 0,
                labelBoxBorderColor: '#fff'
            }
        });
    }

    // Donut Chart
    if($('.flot-donut')[0]){
        $.plot('.flot-donut', pieData, {
            series: {
                pie: {
                    innerRadius: 0.5,
                    show: true,
                    stroke: { 
                        width: 2
                    }
                }
            },
            legend: {
                container: '.flot-chart-legend--donut',
                backgroundOpacity: 0.5,
                noColumns: 0,
                backgroundColor: "white",
                lineWidth: 0,
                labelBoxBorderColor: '#fff'
            }
        });
    }

    }, []);

    return <>
        <header className="content__title">
            <h1>Dashboard</h1>
            <small>Sample dashboard for framework</small>

            <div className="actions">
                <a href="" className="actions__item zmdi zmdi-trending-up"></a>
                <a href="" className="actions__item zmdi zmdi-check-all"></a>

                <div className="dropdown actions__item">
                    <i data-toggle="dropdown" className="zmdi zmdi-more-vert"></i>
                    <div className="dropdown-menu dropdown-menu-right">
                        <a href="" className="dropdown-item">Refresh</a>
                        <a href="" className="dropdown-item">Manage Widgets</a>
                        <a href="" className="dropdown-item">Settings</a>
                    </div>
                </div>
            </div>
        </header>

        <div className="row quick-stats">
            <div className="col-sm-6 col-md-3">
                <div className="quick-stats__item bg-blue">
                    <div className="quick-stats__info">
                        <h2>1546</h2>
                        <small>Stat 1</small>
                    </div>

                    <div className="quick-stats__chart sparkline-bar-stats">6,4,8,6,5,6,7,8,3,5,9,5</div>
                </div>
            </div>

            <div className="col-sm-6 col-md-3">
                <div className="quick-stats__item bg-amber">
                    <div className="quick-stats__info">
                        <h2>2194</h2>
                        <small>Stat 2</small>
                    </div>

                    <div className="quick-stats__chart sparkline-bar-stats">6,4,8,6,5,6,7,8,3,5,9,5</div>
                </div>
            </div>

            <div className="col-sm-6 col-md-3">
                <div className="quick-stats__item bg-purple">
                    <div className="quick-stats__info">
                        <h2>$58,778</h2>
                        <small>Stat 3</small>
                    </div>

                    <div className="quick-stats__chart sparkline-bar-stats">6,4,8,6,5,6,7,8,3,5,9,5</div>
                </div>
            </div>

            <div className="col-sm-6 col-md-3">
                <div className="quick-stats__item bg-red">
                    <div className="quick-stats__info">
                        <h2>214</h2>
                        <small>Stat 4</small>
                    </div>

                    <div className="quick-stats__chart sparkline-bar-stats">6,4,8,6,5,6,7,8,3,5,9,5</div>
                </div>
            </div>
        </div>

        <div className="row">
            <div className="col-sm-6">
                <div className="card">
                    <div className="card-body">
                        <h4 className="card-title">Sales</h4>

                        <div className="flot-chart flot-pie"></div>
                        <div className="flot-chart-legends flot-chart-legend--pie"></div>
                    </div>
                </div>
            </div>

            <div className="col-sm-6">
                <div className="card">
                    <div className="card-body">
                        <h4 className="card-title">Orders</h4>

                        <div className="flot-chart flot-donut"></div>
                        <div className="flot-chart-legends flot-chart-legend--donut"></div>
                    </div>
                </div>
            </div>
        </div>




    </>
}

export default class Home extends Screen {

    render() {
        return (
            <Secure>
                <Layout>
                    
                        <Widgets />

                </Layout>
            </Secure>
        )
    }
}



