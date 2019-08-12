import React, { Component, Suspense, Fragment } from 'react';
import { Redirect, Switch } from 'react-router-dom';
import { Container } from 'reactstrap';
import { Row, Col } from 'reactstrap';
import RecipesCard from '../../Cards/Recipes/RecipesCard';

class RecipesView extends Component {
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
                                    <Col xs="12" lg="6">
                                        <RecipesCard title="Recipes" />
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

export default RecipesView;
