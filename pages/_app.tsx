import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Inter } from "@next/font/google";
import * as mapboxgl from "mapbox-gl";
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
// @ts-ignore
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

const font = Inter({
  weight: "400",
  subsets: ["latin"]
})

export default function App({ Component, pageProps }: AppProps) {
  return (
      <main className={font.className}>
        <Component {...pageProps} />
      </main>
      )
}
