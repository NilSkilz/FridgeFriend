import React, { Component, Suspense, Fragment } from 'react';
import { Redirect, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';
import { Row, Col } from 'reactstrap';
import ProductsCard from '../../Cards/Product/ProductsCard';
import { connect } from 'react-redux';

class ProductView extends Component {
    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;

    signOut(e) {
        e.preventDefault();
        this.props.history.push('/login');
    }

    refresh = () => {
        this.setState({ state: this.state });
    };

    render() {
        return (
            <Container className="p-0">
                <Suspense fallback={this.loading()}>
                    <Switch>
                        <Fragment>
                            <div className="animated fadeIn">
                                <Row>
                                    <Col xs="12" lg="12">
                                        <ProductsCard
                                            refresh={this.refresh}
                                            add
                                            url={`/api/products`}
                                            title="In Stock"
                                            filter={items => {
                                                this.props.dispatch({
                                                    type: 'ADD_PRODUCTS',
                                                    products: items
                                                });
                                                return items.filter(
                                                    item => item.stock.length !== 0
                                                );
                                            }}
                                            headers={[
                                                { label: '' },
                                                { label: 'Product' },
                                                { label: 'Quantity', colSpan: 2 },
                                                { label: 'Best Before' },
                                                { label: '' }
                                            ]}
                                        />
                                        <ProductsCard
                                            refresh={this.refresh}
                                            url={`/api/products`}
                                            title="Out of Stock"
                                            filter={items => {
                                                return items.filter(
                                                    item => item.stock.length === 0
                                                );
                                            }}
                                            headers={[
                                                { label: '' },
                                                { label: 'Product' },
                                                { label: '' }
                                            ]}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </Fragment>
                        <Redirect from="/" to="/dashboard" />
                    </Switch>
                </Suspense>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    products: state.products
});

export default connect(mapStateToProps)(ProductView);
