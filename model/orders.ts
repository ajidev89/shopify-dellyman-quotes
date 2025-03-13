import mongoose, { Schema } from "mongoose";

const ordersSchema = new Schema(
  {
    order_id: {
      type: String,
    },
    store_id: {
      type: String,
      //   unique: true,
    },
    dellyman_order_id: {
      type: String,
    },
    reference_id: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    timestamps: true,
  },
);

const Orders = mongoose.models.orders || mongoose.model("orders", ordersSchema);

export default Orders;
