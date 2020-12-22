[![NPM](https://img.shields.io/npm/v/@homebound/graphql-typescript-custom-type-field-policies)](https://www.npmjs.com/package/@homebound/graphql-typescript-simple-resolvers)

This is a [graphql-code-generator](https://graphql-code-generator.com/) plugin that generates type policies for every field that uses custom scalars.

## Overview

Given a config like:

```yaml
generates:
  integration/graphql-types.ts:
    config:
      scalars:
        Date: "src/dates#Date"
      scalarTypePolicies:
        Date: "src/dates#dateTypePolicy"
```

And a schema that uses `Date` fields:

```graphql
scalar Date

type Author {
    name: String!
    date: Date
}
```

This plugin generates the following snippet in the output file:

```typescript
import { dateTypePolicy } from "src/dates";

export const scalarTypePolicies = {
  Author: { date: dateTypePolicy }
};
```

Where the `dateTypePolicy` `const` should implement the Apollo Client `FieldPolicy`.
