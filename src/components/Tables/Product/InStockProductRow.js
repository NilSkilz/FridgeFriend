import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import { Badge, DropdownMenu, DropdownItem, DropdownToggle, ButtonDropdown } from 'reactstrap';

class ISProductRow extends Component {
    state = { page: 1, totalCount: 0, products: [], dropdownOpen: new Array(10).fill(false) };

    toggle(i) {
        const newArray = this.state.dropdownOpen.map((element, index) => {
            return index === i ? !element : false;
        });
        this.setState({
            dropdownOpen: newArray
        });
    }

    consumeOne = event => {
        const { item: product } = this.props;
        console.log(product);
        const stock = product.stock[0];
        this.reduceStockByQuantity({ stock, quantity: 1 });
    };

    consumeAll = event => {
        const { item: product } = this.props;
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
            .then(() => {
                const { refresh } = this.props;
                refresh();
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

    getProductStockCount = product => {
        return product.stock.length === 0
            ? 0
            : product.stock.reduce((acc, stock) => {
                  return { quantity: acc.quantity + stock.quantity };
              });
    };

    render() {
        const { item: product, index } = this.props;

        let combined = { quantity: 0 };
        let openCount = 0;
        let earliestBestBefore = null;
        if (product.stock.length > 0) {
            combined = this.getProductStockCount(product);

            earliestBestBefore = product.stock[0].best_before_date;
            product.stock.forEach(stock => {
                if (stock.open) openCount++;
                if (
                    stock.best_before_date &&
                    moment(stock.best_before_date).isBefore(moment(earliestBestBefore))
                ) {
                    earliestBestBefore = moment(stock.best_before_date);
                }
            });
        }

        let numPacks = 0;
        const packSize = _.get(product, 'qtyContents.numberOfUnits', 1);

        if (packSize > 1) {
            numPacks = Math.ceil(combined.quantity / packSize);
        }
        return (
            <tr key={index} className="fade show">
                <td className="align-middle">
                    {combined.quantity < product.minimum_stock ? (
                        <Badge pill color={combined.quantity === 0 ? 'danger' : 'warning'}>
                            <div style={{ height: '10px', width: '2px' }} className="d-block" />
                        </Badge>
                    ) : (
                        <Badge pill color={'success'}>
                            <div style={{ height: '10px', width: '2px' }} className="d-block" />
                        </Badge>
                    )}
                </td>
                <td className="p-1 align-middle">
                    <Link to={`products/${product._id}`} className="nav-link">
                        {product.name}
                    </Link>
                </td>
                <td className="p-1 align-middle">
                    <div className="d-inline-block pr-3 float-right">{combined.quantity}</div>
                </td>
                <td>
                    <div className="d-inline-block">
                        <div className="d-block" style={{ fontSize: '10px' }}>
                            {numPacks > 0 ? `${numPacks} pack${numPacks > 1 ? 's' : ''}` : ''}
                        </div>
                        <div className="d-block" style={{ fontSize: '10px' }}>
                            {openCount > 0 ? `${openCount} opened` : ''}
                        </div>
                    </div>
                </td>

                <td className="p-1 align-middle text-center">
                    {(earliestBestBefore && moment(earliestBestBefore).fromNow()) || '-'}
                </td>

                <td className="align-middle text-right">
                    <ButtonDropdown
                        id={index}
                        direction="left"
                        className="p-0 m-0"
                        isOpen={this.state.dropdownOpen[index]}
                        toggle={() => {
                            this.toggle(index);
                        }}
                    >
                        <DropdownToggle size="sm" color="">
                            <i
                                id={index}
                                className="icon-options-vertical icons mr-3"
                                style={{ cursor: 'pointer' }}
                            />
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem
                                id={index}
                                onClick={this.consumeOne}
                                className="pt-0 pb-0"
                            >
                                Consume One
                            </DropdownItem>
                            <DropdownItem
                                id={index}
                                onClick={this.consumeAll}
                                className="pt-0 pb-0"
                            >
                                Consume All
                            </DropdownItem>
                            <DropdownItem id={index} onClick={this.openStock} className="pt-0 pb-0">
                                Mark as open
                            </DropdownItem>
                            <DropdownItem id={index} className="pt-0 pb-0">
                                Mark One as Spoiled
                            </DropdownItem>
                        </DropdownMenu>
                    </ButtonDropdown>

                    <i
                        id={index}
                        className="align-middle cui-pencil icons mr-3"
                        style={{ cursor: 'pointer' }}
                        onClick={this.editProduct}
                    />
                </td>
            </tr>
        );
    }
}

export default ISProductRow;
