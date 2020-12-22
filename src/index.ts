import {
  GraphQLObjectType,
  GraphQLNamedType,
  GraphQLScalarType,
  GraphQLType
} from "graphql";
import { code, imp } from "ts-poet";
import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import PluginOutput = Types.PluginOutput;

/** Generates field policies for user-defined types, i.e. Date handling. */
export const plugin: PluginFunction<Config> = async (schema, _, config) => {
  const { scalarTypePolicies = {} } = config || {};

  const content = await code`
    export const scalarTypePolicies = {
      ${Object.values(schema.getTypeMap())
        .filter(isObjectType)
        .filter(t => !t.name.startsWith("__"))
        .map(type => {
          return code`${type.name}: {${Object.values(type.getFields())
            .filter(
              field =>
                isScalarType(field.type) && scalarTypePolicies[field.type.name]
            )
            .map(
              field =>
                code`${field.name}: ${toImp(
                  scalarTypePolicies[(field.type as GraphQLScalarType).name]
                )},`
            )}},`;
        })}
    };
  `.toStringWithImports();
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
