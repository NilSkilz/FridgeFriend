import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle } from '@coreui/coreui/dist/js/coreui-utilities';
import Axios from 'axios';

const brandPrimary = getStyle('--primary');
const brandInfo = getStyle('--info');
const brandWarning = getStyle('--warning');
const brandDanger = getStyle('--danger');

// Card Chart 1
const cardChartData1 = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            label: 'My First dataset',
            backgroundColor: brandInfo,
            borderColor: 'rgba(255,255,255,.55)',
            data: [65, 59, 84, 84, 51, 55, 40]
        }
    ]
};

const cardChartData2 = JSON.parse(JSON.stringify(cardChartData1));
const cardChartData3 = JSON.parse(JSON.stringify(cardChartData1));
const cardChartData4 = JSON.parse(JSON.stringify(cardChartData1));
cardChartData2.datasets[0].backgroundColor = brandPrimary;
cardChartData3.datasets[0].backgroundColor = brandWarning;
cardChartData4.datasets[0].backgroundColor = brandDanger;

const cardChartOpts1 = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false,
    legend: {
        display: false
    },
    scales: {
        xAxes: [
            {
                gridLines: {
                    color: 'transparent',
                    zeroLineColor: 'transparent'
                },
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent'
                }
            }
        ],
        yAxes: [
            {
                display: false,
                ticks: {
                    display: false,
                    min: Math.min.apply(Math, cardChartData1.datasets[0].data) - 5,
                    max: Math.max.apply(Math, cardChartData1.datasets[0].data) + 5
                }
            }
        ]
    },
    elements: {
        line: {
            borderWidth: 1
        },
        point: {
            radius: 4,
            hitRadius: 10,
            hoverRadius: 4
        }
    }
};

//Random Numbers
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

var elements = 27;
var data1 = [];
var data2 = [];
var data3 = [];

for (var i = 0; i <= elements; i++) {
    data1.push(random(50, 200));
    data2.push(random(80, 100));
    data3.push(65);
}

class DashboardView extends Component {
    state = { products: [] };

    componentDidMount() {
        this.getData();
    }

    getData = () => {
        Axios.get('/api/products').then(({ data }) => {
            this.setState({ products: data.data });
        });
    };

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    onRadioBtnClick(radioSelected) {
        this.setState({
            radioSelected: radioSelected
        });
    }

    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;

    getProductStockCount = product => {
        return product.stock.length === 0
            ? 0
            : product.stock.reduce((acc, stock) => {
                  return { quantity: acc.quantity + stock.quantity };
              });
    };

    render() {
        const { products } = this.state;
        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;
        products.forEach(product => {
            if (product.stock.length > 0) {
                inStock++;
                if (this.getProductStockCount(product).quantity < product.minimum_stock) {
                    lowStock++;
                }
            } else {
                outOfStock++;
            }
        });

        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" sm="6" lg="3">
                        <Card className="text-white bg-info">
                            <CardBody className="pb-0">
                                <div className="text-value">{products.length}</div>
                                <div>Products</div>
                            </CardBody>
                            <div className="chart-wrapper mx-3" style={{ height: '70px' }}>
                                <Line data={cardChartData1} options={cardChartOpts1} height={70} />
                            </div>
                        </Card>
                    </Col>

                    <Col xs="12" sm="6" lg="3">
                        <Card className="text-white bg-primary">
                            <CardBody className="pb-0">
                                <div className="text-value">{inStock}</div>
                                <div>In Stock</div>
                            </CardBody>
                            <div className="chart-wrapper mx-3" style={{ height: '70px' }}>
                                <Line data={cardChartData2} options={cardChartOpts1} height={70} />
                            </div>
                        </Card>
                    </Col>

                    <Col xs="12" sm="6" lg="3">
                        <Card className="text-white bg-warning">
                            <CardBody className="pb-0">
                                <div className="text-value">{lowStock}</div>
                                <div>Low Stock</div>
                            </CardBody>
                            <div className="chart-wrapper mx-3" style={{ height: '70px' }}>
                                <Line data={cardChartData3} options={cardChartOpts1} height={70} />
                            </div>
                        </Card>
                    </Col>
                    <Col xs="12" sm="6" lg="3">
                        <Card className="text-white bg-danger">
                            <CardBody className="pb-0">
                                <div className="text-value">{outOfStock}</div>
                                <div>Out of Stock</div>
                            </CardBody>
                            <div className="chart-wrapper mx-3" style={{ height: '70px' }}>
                                <Line data={cardChartData4} options={cardChartOpts1} height={70} />
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default DashboardView;
