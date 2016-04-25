import * as React from "react";
import {Server, ServerResultType, IServerResult} from "./server";

export interface IResponse{
  status(code: number) : {send(payload: any): any}
  redirect(code: number, url: string) : any
}

export interface IRequest{
  url: string;
}

/** Server side implementation of rendering react applications */
export class ExpressServer{
  
  /** express middleware used to render an isomorphic single page application */
  public static renderIsomorphic(
    /** the redux reducers */
    reducers: any,
    /** provides the page html component, inserting 'child' inside the body  */
    htmlComponentFactory: (store: Redux.Store, child: JSX.Element) => JSX.Element,
    /** a factory method to provide the routes for the react router  */
    routeFactory: (store: Redux.Store, serverRender: boolean) => JSX.Element,
    /** the redux middlewares */
    middlewares: Redux.Middleware[],
    /** the initial state of the redux store */
    initialState = {}) {
    return (req: IRequest, res: IResponse) => {
      this.processPromise(res, Server.renderIsomorphic(
        req.url,
        reducers,
        htmlComponentFactory,
        routeFactory,
        middlewares,
        initialState));
    }
  }

  /** express middleware used to render a traditional single page application */
  public static renderSPA(
    /** the redux reducers */
    reducers: any,
    /** provides the page html component, inserting 'child' inside the body  */
    htmlComponentFactory: (store: Redux.Store) => JSX.Element,
    /** the redux middlewares */
    middlewares: Redux.Middleware[],
    /** the initial state of the redux store */
    initialState = {}) {
    return (req: IRequest, res: IResponse) => {
      this.processPromise(res, Server.renderSPA(
        reducers,
        htmlComponentFactory,
        middlewares,
        initialState));
    }
  }

  private static processPromise(res: IResponse, promise: Promise<IServerResult>) {
    promise.then(r => {
      switch (r.type){
        case ServerResultType.Ok:
          res.status(200).send(r.result);
          break;
        case ServerResultType.Error:
          res.status(500).send(r.result);
          break;
        case ServerResultType.Redirect:
          res.redirect(302, r.result);
          break;
        default:
        case ServerResultType.NotFound:
          res.status(404).send('Not found');
          break;
      }
    }, err => {
      console.error(err);
      console.error(err.stack);
      res.status(500).send(err.message);
    });
  }
}
