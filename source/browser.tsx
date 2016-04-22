import * as _ from "underscore";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import { Router } from "react-router";
import { routerMiddleware, routerReducer } from "react-router-redux";

export class Browser{

    public static render(reducers: any, routeFactory: (store: Redux.Store, serverRender: boolean) => JSX.Element, middlewares: Redux.Middleware[], history: any, initialState = {}) {
        const reduxRouterMiddleware = routerMiddleware(history);
        const reducer = combineReducers(_.extend({routing: routerReducer}, reducers));
        middlewares.unshift(reduxRouterMiddleware)
        const store = createStore(reducer, initialState, Browser.injectDevtools(applyMiddleware(...middlewares)))
        
        ReactDOM.render(
            <Provider store={store}>
                <Router history={history}>
                    {routeFactory(store, false)}
                </Router>
            </Provider>,
            document.getElementById("host"));
    }

    private static injectDevtools(func: Function){
        const devTools = window["devToolsExtension"];
        return compose(func, devTools ? devTools() : f => f) as any
    }
}
