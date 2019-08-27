import React, { Component, Suspense, Fragment } from 'react';
import { Redirect, Switch } from 'react-router-dom';
import { Container, Col, Card, CardHeader, Badge, CardBody } from 'reactstrap';
import Axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

class ProductDetails extends Component {
    state = { product: null };
    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;

    componentDidMount() {
        this.getProduct();
    }

    getProduct = () => {
        const { id } = this.props.match.params;
        Axios.get(`/api/products/${id}`).then(({ data }) => {
            this.setState({ product: data.data });
        });
    };

    getProductStockCount = product => {
        return product.stock.reduce((acc, stock) => {
            return { quantity: acc.quantity + stock.quantity };
        });
    };

    getLastPurchased = () => {
        const { product } = this.state;
        const length = product.stock.length - 1;
        const lastStock = product.stock[length];
        const date = lastStock.purchase_date;
        if (date) {
            return moment(date).fromNow();
        }
        return 'n/a';
    };

    render() {
        const { product } = this.state;

        return (
            <Container fluid>
                <Suspense fallback={this.loading()}>
                    <Switch>
                        <Fragment>
                            <div className="animated fadeIn" />
                            <Col xs="6" sm="6" md="6">
                                {product ? (
                                    <Card>
                                        <CardHeader>
                                            {product.name}
                                            <div className="card-header-actions">
                                                <Badge
                                                    color={
                                                        product.stock.length === 0
                                                            ? 'danger'
                                                            : this.getProductStockCount(product)
                                                                  .quantity > product.minimum_stock
                                                            ? 'success'
                                                            : 'warning'
                                                    }
                                                    className="float-right p-2"
                                                >
                                                    {product.stock.length === 0
                                                        ? 'Out of Stock'
                                                        : this.getProductStockCount(product)
                                                              .quantity > product.minimum_stock
                                                        ? 'In Stock'
                                                        : 'Low Stock'}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardBody>
                                            <img
                                                width="100%"
                                                src={product.image.replace('90x90', '540x540')}
                                                alt={product.name}
                                            />
                                            <div>
                                                <span style={{ fontSize: '20px' }}>{`${
                                                    this.getProductStockCount(product).quantity
                                                }`}</span>
                                                <span> in stock</span>

                                                <span style={{ fontSize: '20px' }}>
                                                    {` / ${product.minimum_stock}`}
                                                </span>
                                                <span> required</span>
                                            </div>
                                            <div>
                                                <span className="mr-3"> Current price:</span>
                                                <span style={{ fontWeight: '200' }}>
                                                    {`£${
                                                        product.price
                                                            ? product.price.toFixed(2)
                                                            : ' n/a'
                                                    }`}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="mr-3"> Last purchased:</span>
                                                <span style={{ fontWeight: '200' }}>
                                                    {this.getLastPurchased()}
                                                </span>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ) : (
                                    this.loading()
                                )}
                            </Col>
                        </Fragment>
                        <Redirect from="/" to="/products" />
                    </Switch>
                </Suspense>
            </Container>
        );
    }
}

export default ProductDetails;
