# rokot-react-router-redux

Rokot - [Rocketmakers](http://www.rocketmakers.com/) TypeScript NodeJs Platform

## Introduction

A typescript library for easily consuming react-router-redux from the server and the browser.


>The Rokot platform components heavily rely on usage of the [typings](https://github.com/typings/typings) utility for typescript definitions management.
If you don't have `typings` installed:
```
npm i typings -g
```

## Getting Started

### Installation
Install via `npm`
```
npm i rokot-react-router-redux --save
```


### Typings

You will also need these ambient dependencies:
>NOTE: you might already have some of these ambient dependencies installed!

```
typings install react redux -SA
```

## Server Example
```typescript
// TODO
```
## Browser Example

```typescript
import * as reducers from "./reducers";
import { Browser } from "rokot-react-router-redux";
import { browserHistory } from "react-router";
import { Home, Layout, Login } from "./views";
import { middlewares } from "./middleware";

function routeFactory(store: Redux.Store): JSX.Element {
    return (
        <Route path="/" component={Layout}>
            <IndexRoute component={Home}/>
            <Route path="/login" component={Login} />
        </Route>)
}

Browser.render(reducers, routeFactory, middlewares, browserHistory);
```