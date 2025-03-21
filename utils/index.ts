import { faker } from "@faker-js/faker";
import { Product } from "../types";

export const generateFakeData = () => {
  const products: Product[] = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    name: faker.commerce.productName(),
    price: +faker.commerce.price(),
    description: faker.commerce.productDescription(),
  }));
  return products;
};
