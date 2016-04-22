import * as React from "react";

export interface IAppHost extends React.HTMLProps<AppHost>{
  appContext?: Object;
}

export class AppHost extends React.Component<IAppHost, {}> {
  public static childContextTypes:React.ValidationMap<any> = {
    appContext: React.PropTypes.object,
  };

  public getChildContext() {
    return {
      appContext: this.props.appContext || {},
    };
  }

  public render():JSX.Element {
    return this.props.children as any
  }
}