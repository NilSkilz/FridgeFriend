import React, { Component, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import * as router from 'react-router-dom';
import { Container } from 'reactstrap';
import { connect } from 'react-redux';
import Axios from 'axios';

import {
    AppAside,
    AppFooter,
    AppHeader,
    AppSidebar,
    AppSidebarFooter,
    AppSidebarForm,
    AppSidebarHeader,
    AppSidebarMinimizer,
    AppBreadcrumb2 as AppBreadcrumb,
    AppSidebarNav2 as AppSidebarNav
} from '@coreui/react';
// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';

const DefaultAside = React.lazy(() => import('./DefaultAside'));
const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

class DefaultLayout extends Component {
    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;

    signOut(e) {
        e.preventDefault();
        this.props.history.push('/login');
    }

    componentDidMount() {
        this.loadData();
    }

    loadData = () => {
        this.getProducts();
        this.getRecipes();
        this.getLogs();
    };

    getProducts = () => {
        Axios.get('/api/products').then(({ data }) => {
            this.props.dispatch({
                type: 'ADD_PRODUCTS',
                products: data.data
            });
            this.setState({ products: data.data });
        });
    };

    getRecipes = () => {
        Axios.get('/api/recipes').then(({ data }) => {
            this.props.dispatch({
                type: 'ADD_RECIPES',
                recipes: data.data
            });
            this.setState({ recipes: data.data });
        });
    };

    getLogs = () => {
        Axios.get('/api/logs').then(({ data }) => {
            this.props.dispatch({
                type: 'ADD_LOGS',
                logs: data.data
            });
            this.setState({ logs: data.data });
        });
    };

    getDepartments = () => {
        Axios.get('/api/departments').then(({ data }) => {
            this.props.dispatch({
                type: 'ADD_DEPTS',
                depts: data.data
            });
            this.setState({ depts: data.data });
        });
    };

    getSuperDepartments = () => {
        Axios.get('/api/superdepartments').then(({ data }) => {
            this.props.dispatch({
                type: 'ADD_SUPER_DEPTS',
                superDepts: data.data
            });
            this.setState({ superDepts: data.data });
        });
    };

    render() {
        const { products, recipes, logs } = this.props;
        if (!products || !recipes || !logs) return null;
        return (
            <div className="app">
                <AppHeader fixed>
                    <Suspense fallback={this.loading()}>
                        <DefaultHeader onLogout={e => this.signOut(e)} />
                    </Suspense>
                </AppHeader>
                <div className="app-body">
                    <AppSidebar fixed display="lg">
                        <AppSidebarHeader />
                        <AppSidebarForm />
                        <Suspense>
                            <AppSidebarNav navConfig={navigation} {...this.props} router={router} />
                        </Suspense>
                        <AppSidebarFooter />
                        <AppSidebarMinimizer />
                    </AppSidebar>
                    <main className="main">
                        <AppBreadcrumb appRoutes={routes} router={router} />
                        <Container fluid>
                            <Suspense fallback={this.loading()}>
                                <Switch>
                                    {routes.map((route, idx) => {
                                        return route.component ? (
                                            <Route
                                                key={idx}
                                                path={route.path}
                                                exact={route.exact}
                                                name={route.name}
                                                render={props => <route.component {...props} />}
                                            />
                                        ) : null;
                                    })}
                                    <Redirect from="/" to="/products" />
                                </Switch>
                            </Suspense>
                        </Container>
                    </main>
                    <AppAside fixed>
                        <Suspense fallback={this.loading()}>
                            <DefaultAside />
                        </Suspense>
                    </AppAside>
                </div>
                <AppFooter>
                    <Suspense fallback={this.loading()}>
                        <DefaultFooter />
                    </Suspense>
                </AppFooter>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    products: state.products,
    recipes: state.recipes,
    logs: state.logs
});

export default connect(mapStateToProps)(DefaultLayout);
