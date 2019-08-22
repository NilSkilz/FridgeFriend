import React, { Component, Fragment } from 'react';
import { Table, PaginationItem, PaginationLink, Pagination } from 'reactstrap';
import Axios from 'axios';
import _ from 'lodash';

class DataTable extends Component {
    state = { page: 1, data: null, refresh: null };

    componentDidMount() {
        this.getData();
    }

    getData = () => {
        const { url, filter } = this.props;
        Axios.get(url).then(({ data }) => {
            data = filter(data.data);
            this.setState({ data: data });
        });
    };

    getPagination = () => {
        const { data, page } = this.state;
        const pages = Math.ceil(parseInt(data.length) / 10);

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
        let { data, page } = this.state;
        const pages = Math.ceil(parseInt(data.length) / 10);
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

    getHeaders = () => {
        const { headers } = this.props;
        const arr = headers.map(header => {
            return <th colSpan={header.colSpan}>{header.label}</th>;
        });

        return arr;
    };

    refresh = () => {
        const { refresh } = this.props;
        this.setState({ state: this.state });
        if (refresh) refresh();
        this.getData();
    };

    render() {
        const { headers, DataRow, filter } = this.props;
        const { data, page, refresh } = this.state;
        if (!data) return null;
        const array = _.cloneDeep(data).splice((page - 1) * 10, 10);
        return (
            <Fragment>
                <Table responsive hover refresh={refresh}>
                    <thead>
                        <tr>
                            {headers.map((header, index) => {
                                return (
                                    <th key={index} colSpan={header.colSpan || 1}>
                                        {header.label}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {data &&
                            array.map((item, index) => {
                                return (
                                    <DataRow
                                        key={index}
                                        item={item}
                                        index={index}
                                        filter={filter}
                                        refresh={this.refresh}
                                    />
                                );
                            })}
                    </tbody>
                </Table>

                {data && this.getPagination()}
            </Fragment>
        );
    }
}

export default DataTable;
