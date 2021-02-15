import { GraphQLScalarType } from 'graphql';

const ScalarResolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date',
    serialize(value) {
      const timestamp = Date.parse(value);
      if (!isNaN(timestamp)) {
        return new Date(timestamp).toJSON();
      } else {
        throw new Error(`Date resolver error - value provided is not a valid date: ${value}`);
      }
    },
  }),
};

export default ScalarResolvers;
