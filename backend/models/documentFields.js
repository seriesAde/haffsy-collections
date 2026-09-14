import mongoose from "mongoose";
const { Schema } = mongoose;
const line = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    name: String,
    quantity: Number,
    price: Number,
  },
  { _id: false },
);
export const documentFields = {
  number: { type: String, unique: true, required: true },
  customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  customerName: String,
  lines: [line],
  amount: Number,
  subtotal: Number,
  tax: Number,
  taxRate: Number,
  currency: { type: String, default: "NGN" },
  due: Date,
  notes: String,
  status: { type: String, default: "Pending" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
};
