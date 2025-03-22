import mongoose, { Schema } from "mongoose";

const credentialsSchema = new Schema(
  {
    api_key: {
      type: String,
    },
    webhook_secret: {
      type: String,
    },
    store_id: {
      type: String,
      //   unique: true,
    },
    webhook_url: {
      type: String,
    },
    carrier_id: {
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

const Credential =
  mongoose.models.credentials ||
  mongoose.model("credentials", credentialsSchema);

export default Credential;
