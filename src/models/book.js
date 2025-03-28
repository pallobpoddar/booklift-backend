const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxLength: 200,
      index: true,
    },
    authors: {
      type: [
        {
          name: {
            type: String,
            required: true,
            maxLength: 100,
            index: true,
          },
          image: {
            type: String,
            required: true,
            maxLength: 500,
          },
          about: {
            type: String,
            required: true,
            maxLength: 1000,
          },
        },
      ],
      required: true,
    },
    image: {
      type: String,
      required: true,
      maxLength: 500,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      max: 10000,
    },
    discount: {
      type: {
        percentage: {
          type: Number,
          required: true,
          min: 1,
          max: 100,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
        },
      },
    },
    overview: {
      type: String,
      required: true,
      maxLength: 3000,
    },
    categories: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          required: true,
          ref: "Category",
          index: true,
        },
      ],
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      max: 10000,
    },
    isbn: {
      type: Number,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^(?:\d{10}|\d{13})$/.test(v.toString());
        },
        message: (props) => `${props.value} is not a valid ISBN number`,
      },
    },
    publisher: {
      type: String,
      required: true,
      maxLength: 100,
    },
    publicationDate: {
      type: Date,
      required: true,
    },
    language: {
      type: String,
      required: true,
      maxLength: 50,
    },
    readingAge: {
      type: String,
      required: true,
      maxLength: 100,
    },
    pages: {
      type: Number,
      required: true,
      min: 1,
      max: 10000,
    },
    dimensions: {
      type: String,
      required: true,
      maxLength: 100,
    },
  },
  { timestamps: true }
);

const book = mongoose.model("Book", bookSchema);
module.exports = book;
