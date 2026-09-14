export const options = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(_doc, value) {
      delete value._id;
      delete value.__v;
      delete value.passwordHash;
      return value;
    },
  },
};
