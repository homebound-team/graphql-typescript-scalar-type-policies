import {
  GraphQLField,
  GraphQLObjectType,
  GraphQLNamedType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLType,
  isListType,
  isNonNullType,
} from "graphql";
import { code, imp } from "ts-poet";
import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import PluginOutput = Types.PluginOutput;

/** Generates field policies for user-defined types, i.e. Date handling. */
export const plugin: PluginFunction<Config> = async function plugin(schema, _, config) {
  const { scalarTypePolicies = {} } = config || {};

  function hasScalarTypePolicy(field: GraphQLField<unknown, unknown>): boolean {
    return getFieldPolicySpec(field.type, scalarTypePolicies) !== undefined;
  }

  const content = await code`
    export const scalarTypePolicies = {
      ${Object.values(schema.getTypeMap())
        .filter(isObjectType)
        .filter((t) => !t.name.startsWith("__"))
        .filter((t) => Object.values(t.getFields()).some(hasScalarTypePolicy))
        .map((type) => {
          return code`${type.name}: { fields: { ${Object.values(type.getFields())
            .filter(hasScalarTypePolicy)
            .map((field) => {
              const fieldPolicySpec = getFieldPolicySpec(field.type, scalarTypePolicies);
              if (!fieldPolicySpec) {
                throw new Error(`Missing field policy spec for ${type.name}.${field.name}`);
              }
              return code`${field.name}: ${toImp(fieldPolicySpec)},`;
            })} } },`;
        })}
    };
  `.toString();
  return { content } as PluginOutput;
};

/** The config values we read from the graphql-codegen.yml file. */
export type Config = {
  scalars: Record<string, string>;
  scalarTypePolicies: Record<string, string>;
};

export function isObjectType(t: GraphQLNamedType): t is GraphQLObjectType {
  return t instanceof GraphQLObjectType;
}

export function isScalarType(t: GraphQLType): t is GraphQLScalarType {
  return t instanceof GraphQLScalarType;
}

// Maps the graphql-code-generation convention of `@src/context#Context` to ts-poet's `Context@@src/context`.
export function toImp(spec: string | undefined): unknown {
  if (!spec) {
    return undefined;
  }
  const [path, symbol] = spec.split("#");
  return imp(`${symbol}@${path}`);
}

/** Returns the type policy import spec for a field, i.e. `DateArray` for `[Date!]!`. */
export function getFieldPolicySpec(
  type: GraphQLOutputType,
  scalarTypePolicies: Record<string, string>,
): string | undefined {
  const policyKey = getFieldPolicyConfigKey(type);
  if (!policyKey) {
    return undefined;
  }
  return scalarTypePolicies[policyKey];
}

/** Returns the policy config key for a field, i.e. `DateArray` for `[Date!]!`. */
export function getFieldPolicyConfigKey(type: GraphQLOutputType): string | undefined {
  let currentType: GraphQLType = type;
  let isArray = false;

  while (true) {
    if (isNonNullType(currentType)) {
      currentType = currentType.ofType;
      continue;
    }
    if (isListType(currentType)) {
      isArray = true;
      currentType = currentType.ofType;
      continue;
    }
    break;
  }

  if (!isScalarType(currentType)) {
    return undefined;
  }
  return isArray ? `${currentType.name}Array` : currentType.name;
}
