import React, { Component, Suspense, Fragment } from 'react';
import { Redirect, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';
import { Row, Col } from 'reactstrap';
import ShoppingListCard from '../../Cards/ShoppingList/ShoppingListCard';

class ShoppingListView extends Component {
    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;

    signOut(e) {
        e.preventDefault();
        this.props.history.push('/login');
    }

    render() {
        return (
            <Container className="p-0">
                <Suspense fallback={this.loading()}>
                    <Switch>
                        <Fragment>
                            <div className="animated fadeIn">
                                <Row>
                                    <Col xs="12" lg="12">
                                        <ShoppingListCard title="Shopping List" />
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

export default ShoppingListView;
