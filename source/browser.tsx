import * as _ from "underscore";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import { Router } from "react-router";
import { routerMiddleware, routerReducer } from "react-router-redux";

/** Used to render the body of the html from the browser*/
export class Browser{
    // Render the redux provider and react router
    public static render(
      /** the redux reducers */
      reducers: any,
      /** a factory method to provide the routes for the react router  */
      routeFactory: (store: Redux.Store, serverRender: boolean) => JSX.Element,
      /** the redux middlewares */
      middlewares: Redux.Middleware[],
      /** the router history handler required */
      history: HistoryModule.History,
      /** the initial state of the redux store */
      initialState = {}) {
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
