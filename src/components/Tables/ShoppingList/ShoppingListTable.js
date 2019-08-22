import React, { Component } from 'react';
import { Table } from 'reactstrap';
import { AppSwitch } from '@coreui/react';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import moment from 'moment';

class ShoppingListTable extends Component {
    state = { products: [], dropdownOpen: new Array(2).fill(false) };

    toggle(i) {
        const newArray = this.state.dropdownOpen.map((element, index) => {
            return index === i ? !element : false;
        });
        this.setState({
            dropdownOpen: newArray
        });
    }

    componentDidMount() {
        this.getData();
    }

    componentDidUpdate() {
        this.getData();
    }

    error = err => {
        console.log('Got error', err);
        const { error } = this.props;
        if (error) error();
    };

    getData = () => {
        Axios.get(`/api/products?limit=10&skip=0`)
            .then(({ data }) => {
                const products = data.data;
                this.setState({ products });
            })
            .catch(err => this.error(err));
    };

    getProduct = index => {
        const { products } = this.state;
        return products[index];
    };

    getProductStockCount = product => {
        return product.stock.length === 0
            ? 0
            : product.stock.reduce((acc, stock) => {
                  return { quantity: acc.quantity + stock.quantity };
              });
    };

    consumeOne = event => {
        const product = this.getProduct(event.target.id);
        const stock = product.stock[0];
        this.reduceStockByQuantity({ stock, quantity: 1 });
    };

    consumeAll = event => {
        const product = this.getProduct(event.target.id);

        product.stock.forEach(stock => {
            this.reduceStockByQuantity({ stock, quantity: stock.quantity });
        });
    };

    reduceStockByQuantity = ({ stock, quantity }) => {
        const newQuantity = stock.quantity - quantity;
        const payload = {
            quantity: newQuantity,
            open: true
        };
        if (newQuantity === 0) {
            payload.consumed_date = new Date();
        }
        Axios.put(`/api/stock/${stock._id}`, payload)
            .then(({ data }) => {
                let { products } = this.state;
                const product = products.find(product => product._id === data.product);
                const toReplace = product.stock.find(s => s._id === stock._id);
                if (!data.consumed_date) {
                    product.stock.splice(product.stock.indexOf(toReplace), 1, data);
                } else {
                    product.stock.splice(product.stock.indexOf(toReplace), 1);
                }
                this.setState({ products });
            })
            .catch(err => this.error(err));
    };

    openStock = event => {
        const product = this.getProduct(event.target.id);
        let firstStock = product.stock.find(stock => stock.open === false);
        if (!firstStock) return;
        Axios.put(`/api/stock/${firstStock._id}`, {
            open: true
        })
            .then(({ data }) => {
                let { products } = this.state;
                const product = products.find(product => product._id === data.product);
                const toReplace = product.stock.find(s => s._id === data._id);
                if (!data.consumed_date) {
                    product.stock.splice(product.stock.indexOf(toReplace), 1, data);
                } else {
                    product.stock.splice(product.stock.indexOf(toReplace), 1);
                }
                this.setState({ products });
            })
            .catch(err => this.error(err));
    };

    addProduct = ({ product }) => {
        this.toggleAddProductModal();
    };

    render() {
        const { products } = this.state;
        return (
            <Table responsive hover>
                <thead>
                    <tr>
                        <th />
                        <th>Product</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => {
                        let combined = { quantity: 0 };

                        let earliestBestBefore = null;
                        if (product.stock.length > 0) {
                            combined = this.getProductStockCount(product);

                            earliestBestBefore = product.stock[0].best_before_date;
                            product.stock.forEach(stock => {
                                if (
                                    stock.best_before_date &&
                                    moment(stock.best_before_date).isBefore(
                                        moment(earliestBestBefore)
                                    )
                                ) {
                                    earliestBestBefore = moment(stock.best_before_date);
                                }
                            });
                        }

                        if (combined.quantity >= product.minimum_stock) return null;
                        return (
                            <tr key={index} className="fade show">
                                <td className="align-middle">
                                    <AppSwitch
                                        className={'mx-1'}
                                        variant={'3d'}
                                        color={'primary'}
                                    />
                                </td>
                                <td className="p-1 align-middle">
                                    <Link to={`products/${product._id}`} className="nav-link">
                                        {product.name}
                                    </Link>
                                </td>
                                <td className="p-1 align-middle">
                                    <div className="d-inline-block pr-3">
                                        {product.minimum_stock - combined.quantity}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }
}

export default ShoppingListTable;
