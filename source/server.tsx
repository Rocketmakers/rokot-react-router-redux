import * as React from "react";
import * as ReactServerDOM from "react-dom/server";
import { AppHost } from "./appHost";
import { createMemoryHistory } from "history";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { CustomErrors } from "./errors";
import { match, RouterContext } from "react-router";
import { Promise } from "es6-promise";
import { Provider } from "react-redux";

export enum ServerResultType{
  Ok,
  Error,
  Redirect,
  NotFound,
}

export interface IServerResult{
  type: ServerResultType;
  result?: string;
}

export class Server{
  public static renderIsomorphic(url: string, reducers: any, htmlComponentFactory: (store: Redux.Store, child: JSX.Element) => JSX.Element, routeFactory: (store: Redux.Store, serverRender: boolean) => JSX.Element, middlewares: Redux.Middleware[], initialState: any, appContext?: any) : Promise<IServerResult>{
    return new Promise<IServerResult>(res => {
      const history = createMemoryHistory();
      const store = Server.createAppStore(reducers, middlewares, initialState)
      const routes = routeFactory(store, true);
      match({ routes, location: history.createLocation(url), history }, (error, redirectLocation, renderProps) => {
        if (error) {
          if (error instanceof CustomErrors.CannotRenderOnServerError) {
            res({type: ServerResultType.Ok, result: ReactServerDOM.renderToStaticMarkup(htmlComponentFactory(store, null))});
          }
          else {
            res({type: ServerResultType.Error, result: JSON.stringify(error)});
          }
        } else if (redirectLocation) {
          res({type: ServerResultType.Redirect, result: redirectLocation.pathname + redirectLocation.search});
        } else if (renderProps) {
          const rc = <RouterContext {...(renderProps as any)} />;
          const child = appContext ? (
            <AppHost appContext={appContext}>{rc}</AppHost>
          ) : rc;

          const c = (
            <Provider store={store}>
              {htmlComponentFactory(store, child)}
            </Provider>
          )
          res({type: ServerResultType.Ok, result: ReactServerDOM.renderToStaticMarkup(c)});
        } else {
          res({type: ServerResultType.NotFound});
        }
      })
    })
  }

  public static renderSPA(reducers: any, htmlComponentFactory: (store: Redux.Store) => JSX.Element, middlewares: Redux.Middleware[], initialState?: any) : Promise<IServerResult>{
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
