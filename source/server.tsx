import * as React from "react";
import * as ReactServerDOM from "react-dom/server";
import { createMemoryHistory } from "history";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { ServerErrors } from "./errors";
import { match, RouterContext } from "react-router";
import { Promise } from "es6-promise";
import { Provider } from "react-redux";

/** indicated the type of result from server rendering */
export enum ServerResultType{
  /** Rendered without error */
  Ok,
  /** Error encountered */
  Error,
  /** Redirection required */
  Redirect,
  /** Page not found */
  NotFound,
}

/** indicates the result from server rendering */
export interface IServerResult{
  /** the result type */
  type: ServerResultType;
  /** the result */
  result?: string;
}

/** Server side implementation of rendering react applications */
export class Server{

  /** render an isomorphic single page application */
  public static renderIsomorphic(
    /** the url to render */
    url: string,
    /** the redux reducers */
    reducers: any,
    /** provides the page html component, inserting 'child' inside the body  */
    htmlComponentFactory: (store: Redux.Store, child: JSX.Element) => JSX.Element,
    /** a factory method to provide the routes for the react router  */
    routeFactory: (store: Redux.Store, serverRender: boolean) => JSX.Element,
    /** the redux middlewares */
    middlewares: Redux.Middleware[],
    /** the initial state of the redux store */
    initialState = {}) : Promise<IServerResult>{
    return new Promise<IServerResult>(res => {
      const history = createMemoryHistory();
      const store = Server.createAppStore(reducers, middlewares, initialState)
      const routes = routeFactory(store, true);
      match({ routes, location: history.createLocation(url), history }, (error, redirectLocation, renderProps) => {
        if (error) {
          if (error instanceof ServerErrors.CannotRenderOnServerError) {
            res({type: ServerResultType.Ok, result: ReactServerDOM.renderToStaticMarkup(htmlComponentFactory(store, null))});
          } else {
            res({type: ServerResultType.Error, result: JSON.stringify(error)});
          }
        } else if (redirectLocation) {
          res({type: ServerResultType.Redirect, result: redirectLocation.pathname + redirectLocation.search});
        } else if (renderProps) {
          const c = (
            <Provider store={store}>
              {htmlComponentFactory(store, <RouterContext {...(renderProps as any)} />)}
            </Provider>
          )
          res({type: ServerResultType.Ok, result: ReactServerDOM.renderToStaticMarkup(c)});
        } else {
          res({type: ServerResultType.NotFound});
        }
      })
    })
  }

  /** render a traditional single page application */
  public static renderSPA(
    /** the redux reducers */
    reducers: any,
    /** provides the page html component, inserting 'child' inside the body  */
    htmlComponentFactory: (store: Redux.Store) => JSX.Element,
    /** the redux middlewares */
    middlewares: Redux.Middleware[],
    /** the initial state of the redux store */
    initialState = {}) : Promise<IServerResult>{
    return new Promise<IServerResult>(res => {
      const store = Server.createAppStore(reducers, middlewares, initialState)
      res({
        type: ServerResultType.Ok,
        result: ReactServerDOM.renderToStaticMarkup(htmlComponentFactory(store))
      });
    })
  }

  private static createAppStore(reducers: any, middlewares: Redux.Middleware[], initialState?: any){
    return createStore(combineReducers(reducers), initialState, applyMiddleware(...middlewares) as any)
  }
}
