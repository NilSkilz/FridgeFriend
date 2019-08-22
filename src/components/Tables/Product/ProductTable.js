import React, { Component, Fragment } from 'react';
import {
    Table,
    Badge,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    PaginationItem,
    PaginationLink,
    Pagination
} from 'reactstrap';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import DataTable from '../DataTable';

class ProductTable extends Component {
    state = { page: 1, totalCount: 0, products: [], dropdownOpen: new Array(10).fill(false) };

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

    error = err => {
        console.log('Got error', err);
        const { error } = this.props;
        if (error) error();
    };

    getData = () => {
        Axios.get(`/api/products`)
            .then(({ data }) => {
                this.setState({ products: data.products });
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

    editProduct = event => {
        const index = event.target.id;
        const { products } = this.state;
        const { editProduct } = this.props;
        const product = products[index];
        editProduct(product);
    };

    getPagination = () => {
        const { products, page } = this.state;
        const pages = Math.ceil(parseInt(products.length) / 10);

        let items = [];

        for (let i = 0; i < pages; i++) {
            items.push(
                <PaginationItem active={page === i + 1 ? true : false} key={i}>
                    <PaginationLink tag="button" onClick={this.setPage}>
                        {i + 1}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return (
            <Pagination>
                <PaginationItem>
                    <PaginationLink previous tag="button" onClick={this.prevPage} />
                </PaginationItem>
                {items}
                <PaginationItem>
                    <PaginationLink next tag="button" onClick={this.nextPage} />
                </PaginationItem>
            </Pagination>
        );
    };

    nextPage = () => {
        let { products, page } = this.state;
        const pages = Math.ceil(parseInt(products.length) / 10);
        if (page < pages) page++;
        this.setState({ page }, () => {
            this.getData();
        });
    };

    prevPage = () => {
        let { page } = this.state;
        if (page > 1) page--;
        this.setState({ page }, () => {
            this.getData();
        });
    };

    setPage = event => {
        let { page } = this.state;
        page = parseInt(event.target.innerHTML);
        this.setState({ page }, () => {
            this.getData();
        });
    };

    render() {
        const { products, page } = this.state;
        const { hideInStock, hideOutOfStock } = this.props;

        const array = _.cloneDeep(products).splice((page - 1) * 10, 10);

        return (
            <Fragment>
                <Table responsive hover>
                    <thead>
                        <tr>
                            <th />
                            <th>Product</th>
                            <th colSpan="2">Quantity</th>

                            <th>Best Before</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {array.map((product, index) => {
                            if (hideOutOfStock) {
                                if (product.stock.length < 1) return null;
                            }

                            if (hideInStock) {
                                if (product.stock.length > 0) return null;
                            }

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
                                        moment(stock.best_before_date).isBefore(
                                            moment(earliestBestBefore)
                                        )
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
                                            <Badge
                                                pill
                                                color={
                                                    combined.quantity === 0 ? 'danger' : 'warning'
                                                }
                                            >
                                                <div
                                                    style={{ height: '10px', width: '2px' }}
                                                    className="d-block"
                                                />
                                            </Badge>
                                        ) : (
                                            <Badge pill color={'success'}>
                                                <div
                                                    style={{ height: '10px', width: '2px' }}
                                                    className="d-block"
                                                />
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="p-1 align-middle">
                                        <Link to={`products/${product._id}`} className="nav-link">
                                            {product.name}
                                        </Link>
                                    </td>
                                    <td className="p-1 align-middle">
                                        <div className="d-inline-block pr-3 float-right">
                                            {combined.quantity}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-inline-block">
                                            <div className="d-block" style={{ fontSize: '10px' }}>
                                                {numPacks > 0
                                                    ? `${numPacks} pack${numPacks > 1 ? 's' : ''}`
                                                    : ''}
                                            </div>
                                            <div className="d-block" style={{ fontSize: '10px' }}>
                                                {openCount > 0 ? `${openCount} opened` : ''}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-1 align-middle text-center">
                                        {(earliestBestBefore &&
                                            moment(earliestBestBefore).fromNow()) ||
                                            '-'}
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
                                                <DropdownItem
                                                    id={index}
                                                    onClick={this.openStock}
                                                    className="pt-0 pb-0"
                                                >
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
                                        <i
                                            id={index}
                                            className="align-middle cui-trash icons mr-0 pr-0"
                                            style={{ cursor: 'pointer' }}
                                            onClick={this.deleteProduct}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
                {this.getPagination()}
            </Fragment>
        );
    }
}

export default ProductTable;
