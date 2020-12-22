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
  Author: { fields: { date: dateTypePolicy } },
};
```

Where the `dateTypePolicy` `const` should implement the Apollo Client `FieldPolicy`.

Which you can then pass to Apollo's `InMemoryCache`:

```typescript
new InMemoryCache({ typePolicies: scalarTypePolicies })
```

And you can implement a field policy like:

```typescript
export const dateTypePolicy: FieldPolicy<Date, string> = {
  merge: (_, incoming) => {
    if (isNullOrUndefined(incoming)) {
      // It's important for these methods to return null if passed null
      return incoming;
    } else if (incoming instanceof Date) {
      // In tests our mocks already have Date
      return incoming;
    } else {
      return parseISO(incoming as string);
    }
  },
};
```

Note that this will handle reading data from the cache; to handle submitting custom scalars (i.e. `Date`) as variables / input to mutations, your custom scalars should implement `toJSON()`, which Apollo will implicitly calls when putting them on the wire.
