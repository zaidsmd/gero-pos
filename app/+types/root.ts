import type { LinksFunction, MetaFunction } from "react-router";

export namespace Route {
  export type LinksFunction = LinksFunction;
  export type MetaFunction = MetaFunction;
  export interface ErrorBoundaryProps {
    error: unknown;
  }
}