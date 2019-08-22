import React, { Component } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import { Badge } from 'reactstrap';

class OOSProductRow extends Component {
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
                <td className="align-middle text-right">
                    {/* <ButtonDropdown
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
                    </ButtonDropdown> */}

                    <i
                        id={index}
                        className="align-middle cui-pencil icons mr-3"
                        style={{ cursor: 'pointer' }}
                        onClick={this.editProduct}
                    />
                    <i
                        id={index}
                        className="align-middle cui-trash icons mr-0 pr-0"
                        style={{ cursor: 'pointer' }}
                        onClick={this.deleteProduct}
                    />
                </td>
            </tr>
        );
    }
}

export default OOSProductRow;
