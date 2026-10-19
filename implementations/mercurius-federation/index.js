'use strict'

const { readFileSync } = require('node:fs')
const { join } = require('node:path')
const Fastify = require('fastify')
const { GraphQLError } = require('graphql')
const { mercuriusFederationPlugin } = require('@mercuriusjs/federation')

const dimension = { size: 'small', weight: 1, unit: 'kg' }
const user = {
  email: 'support@apollographql.com',
  name: 'Jane Smith',
  totalProductsCreated: 1337,
  yearsOfEmployment: 10
}
const deprecatedProduct = {
  sku: 'apollo-federation-v1',
  package: '@apollo/federation-v1',
  reason: 'Migrate to Federation V2',
  createdBy: user
}
const productsResearch = [
  { study: { caseNumber: '1234', description: 'Federation Study' }, outcome: null },
  { study: { caseNumber: '1235', description: 'Studio Study' }, outcome: null }
]
const products = [
  {
    id: 'apollo-federation',
    sku: 'federation',
    package: '@apollo/federation',
    variation: { id: 'OSS' },
    dimensions: dimension,
    research: [productsResearch[0]],
    createdBy: user,
    notes: null
  },
  {
    id: 'apollo-studio',
    sku: 'studio',
    package: '',
    variation: { id: 'platform' },
    dimensions: dimension,
    research: [productsResearch[1]],
    createdBy: user,
    notes: null
  }
]
const inventory = { id: 'apollo-oss', deprecatedProducts: [deprecatedProduct] }

const schema = readFileSync(join(__dirname, 'products.graphql'), 'utf8')

const resolvers = {
  Query: {
    product: (_, { id }) => products.find(p => p.id === id),
    deprecatedProduct: (_, { sku, package: pkg }) =>
      sku === deprecatedProduct.sku && pkg === deprecatedProduct.package ? deprecatedProduct : null
  },
  Product: {
    __resolveReference: ref => {
      if (ref.id) return products.find(p => p.id === ref.id)
      if (ref.sku && ref.package !== undefined) return products.find(p => p.sku === ref.sku && p.package === ref.package)
      if (ref.sku && ref.variation) return products.find(p => p.sku === ref.sku && p.variation.id === ref.variation.id)
      return null
    }
  },
  DeprecatedProduct: {
    __resolveReference: ref =>
      ref.sku === deprecatedProduct.sku && ref.package === deprecatedProduct.package ? deprecatedProduct : null
  },
  ProductResearch: {
    __resolveReference: ref => productsResearch.find(r => r.study.caseNumber === ref.study.caseNumber)
  },
  User: {
    __resolveReference: ref => (ref.email ? { ...user, ...ref } : null),
    averageProductsCreatedPerYear: u => {
      if (u.email !== user.email) {
        throw new GraphQLError("user.email was not 'support@apollographql.com'")
      }
      return u.totalProductsCreated ? Math.round(u.totalProductsCreated / u.yearsOfEmployment) : null
    }
  },
  Inventory: {
    __resolveReference: ref => (ref.id === inventory.id ? inventory : null)
  }
}

const app = Fastify()
app.register(mercuriusFederationPlugin, { schema, resolvers, path: '/' })

app.listen({ port: Number(process.env.PRODUCTS_PORT) || 4001, host: '0.0.0.0' }, (err, url) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`🚀 Products subgraph ready at ${url}`)
})
