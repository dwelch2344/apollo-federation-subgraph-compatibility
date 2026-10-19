# Mercurius (`@mercuriusjs/federation`)

The `products` subgraph implemented with [mercurius](https://mercurius.dev) and the
native federation plugin [`@mercuriusjs/federation`](https://github.com/mercurius-js/mercurius-federation)
(Federation 2 support), as opposed to `implementations/mercurius`, which uses `@apollo/subgraph` for the schema.

```sh
npm install
node index.js   # listens on PRODUCTS_PORT (default 4001)
```

Until the Federation 2 release of `@mercuriusjs/federation` is published, `package.json` installs it from
the `feat/fed2-link` branch tarball.
