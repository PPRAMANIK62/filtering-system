import { db } from "@/db";
import { AVG_PRODUCT_PRICE, MAX_PRODUCT_PRICE } from "@/lib/constants";
import { ProductFilterValidator } from "@/lib/validators/productValidator";
import { NextRequest } from "next/server";

class Filter {
  private filters: Map<string, string[]> = new Map();

  hasFilters() {
    return this.filters.size > 0;
  }

  add(key: string, operator: string, value: string | number) {
    const filter = this.filters.get(key) || [];
    filter.push(
      `${key} ${operator} ${typeof value === "number" ? value : `"${value}"`}`
    );
    this.filters.set(key, filter);
  }

  addRaw(key: string, rawFilter: string) {
    this.filters.set(key, [rawFilter]);
  }

  get() {
    const parts: string[] = [];
    this.filters.forEach((filter) => {
      const groupedValues = filter.join(" OR ");
      parts.push(`(${groupedValues})`);
    });
    return parts.join(" AND ");
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const { color, price, size, sort } = ProductFilterValidator.parse(
      body.filter
    );

    const filter = new Filter();

    if (color.length > 0)
      color.forEach((color) => filter.add("color", "=", color));
    else if (color.length === 0) filter.addRaw("color", `color = ""`);

    if (size.length > 0) size.forEach((size) => filter.add("size", "=", size));
    else if (size.length === 0) filter.addRaw("size", `size = ""`);
    
    filter.addRaw("price", `price >= ${price[0]} AND price <= ${price[1]}`);

    const products = await db.query({
      topK: 12,
      vector: [
        0,
        0,
        sort === "none"
          ? AVG_PRODUCT_PRICE
          : sort === "price-asc"
          ? 0
          : MAX_PRODUCT_PRICE,
      ],
      includeMetadata: true,
      filter: filter.hasFilters() ? filter.get() : undefined,
    });

    return new Response(JSON.stringify(products));
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
    });
  }
};
