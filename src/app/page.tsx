"use client";
import Product from "@/components/Products/Product";
import ProductSkeleton from "@/components/Products/ProductSkeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Product as TProduct } from "@/db";
import {
  COLOR_FILTERS,
  DEFAULT_CUSTOM_PRICE,
  PRICE_FILTERS,
  SIZE_FILTERS,
  SLIDER_STEP,
  SORT_OPTIONS,
  SUBCATEGORIES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ProductState } from "@/lib/validators/productValidator";
import { useQuery } from "@tanstack/react-query";
import { QueryResult } from "@upstash/vector";
import axios from "axios";
import { ChevronDown, FilterIcon } from "lucide-react";
import { useCallback, useState } from "react";
import debounce from "lodash.debounce";
import EmptyState from "@/components/Products/EmptyState";

export default function Home() {
  const [filter, setFilter] = useState<ProductState>({
    sort: "none",
    color: ["beige", "blue", "green", "purple", "white"],
    price: { isCustom: false, range: DEFAULT_CUSTOM_PRICE },
    size: ["S", "M", "L"],
  });

  const { data: products, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.post<QueryResult<TProduct>[]>(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/products`,
        {
          filter: {
            sort: filter.sort,
            color: filter.color,
            size: filter.size,
            price: filter.price.range,
          },
        }
      );

      return data;
    },
  });

  const onSubmit = () => refetch();
  const debouncedSubmit = debounce(onSubmit, 500);
  const _debouncedSubmit = useCallback(debouncedSubmit, []);

  const applyArrayFilter = ({
    category,
    value,
  }: {
    category: keyof Omit<typeof filter, "price" | "sort">;
    value: string;
  }) => {
    const isFilterApplied = filter[category].includes(value as never);

    if (isFilterApplied)
      setFilter((prev) => ({
        ...prev,
        [category]: prev[category].filter((v) => v !== value),
      }));
    else
      setFilter((prev) => ({
        ...prev,
        [category]: [...prev[category], value],
      }));

    _debouncedSubmit();
  };

  const minPrice = Math.min(filter.price.range[0], filter.price.range[1]);
  const maxPrice = Math.max(filter.price.range[0], filter.price.range[1]);

  return (
    <main className=" mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className=" flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
        <h1 className=" text-4xl font-bold tracking-tight text-gray-900">
          High-Quality Cotton Selection
        </h1>

        <div className=" flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className=" group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
              Sort
              <ChevronDown className=" -mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((option) => (
                <button
                  className={cn("text-left w-full block px-4 py-2 text-sm", {
                    "text-gray-900 bg-gray-100": option.value === filter.sort,
                    "text-gray-500": option.value !== filter.sort,
                  })}
                  key={option.name}
                  onClick={() => {
                    setFilter((prev) => ({
                      ...prev,
                      sort: option.value,
                    }));

                    _debouncedSubmit();
                  }}
                >
                  {option.name}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button className=" -m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden">
            <FilterIcon className=" h-5 w-5" />
          </button>
        </div>
      </div>

      <section className=" pb-24 pt-6">
        <div className=" grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* filters */}
          <div className=" hidden lg:block">
            <ul className=" space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
              {SUBCATEGORIES.map((category) => (
                <li key={category.name}>
                  <button
                    className=" disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!category.selected}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>

            <Accordion type="multiple" className=" animate-none">
              {/* color filter */}
              <AccordionItem value="color">
                <AccordionTrigger className=" py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className=" font-medium text-gray-900">Color</span>
                </AccordionTrigger>

                <AccordionContent className=" pt-6 animate-none">
                  <ul className=" space-y-4">
                    {COLOR_FILTERS.options.map((option, optionIndex) => (
                      <li key={option.value} className=" flex items-center">
                        <input
                          type="checkbox"
                          id={`color-${optionIndex}`}
                          className=" h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          onChange={() => {
                            applyArrayFilter({
                              category: "color",
                              value: option.value,
                            });
                          }}
                          checked={filter.color.includes(option.value)}
                        />
                        <label
                          htmlFor={`color-${optionIndex}`}
                          className=" ml-3 text-sm text-gray-600"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* size filters */}
              <AccordionItem value="size">
                <AccordionTrigger className=" py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className=" font-medium text-gray-900">Size</span>
                </AccordionTrigger>

                <AccordionContent className=" pt-6 animate-none">
                  <ul className=" space-y-4">
                    {SIZE_FILTERS.options.map((option, optionIndex) => (
                      <li key={option.value} className=" flex items-center">
                        <input
                          type="checkbox"
                          id={`size-${optionIndex}`}
                          className=" h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          onChange={() => {
                            applyArrayFilter({
                              category: "size",
                              value: option.value,
                            });
                          }}
                          checked={filter.size.includes(option.value)}
                        />
                        <label
                          htmlFor={`size-${optionIndex}`}
                          className=" ml-3 text-sm text-gray-600"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* price filters */}
              <AccordionItem value="price">
                <AccordionTrigger className=" py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className=" font-medium text-gray-900">Price</span>
                </AccordionTrigger>

                <AccordionContent className=" pt-6 animate-none">
                  <ul className=" space-y-4">
                    {PRICE_FILTERS.options.map((option, optionIndex) => (
                      <li key={option.label} className=" flex items-center">
                        <input
                          type="radio"
                          id={`price-${optionIndex}`}
                          className=" h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: false,
                                range: [...option.value],
                              },
                            }));

                            _debouncedSubmit();
                          }}
                          checked={
                            !filter.price.isCustom &&
                            filter.price.range[0] === option.value[0] &&
                            filter.price.range[1] === option.value[1]
                          }
                        />
                        <label
                          htmlFor={`price-${optionIndex}`}
                          className=" ml-3 text-sm text-gray-600"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                    <li className=" flex justify-center flex-col gap-2">
                      <div>
                        <input
                          type="radio"
                          id={`price-${PRICE_FILTERS.options.length}`}
                          className=" h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: true,
                                range: [0, 100],
                              },
                            }));

                            _debouncedSubmit();
                          }}
                          checked={filter.price.isCustom}
                        />
                        <label
                          htmlFor={`price-${PRICE_FILTERS.options.length}`}
                          className=" ml-3 text-sm text-gray-600"
                        >
                          Custom
                        </label>
                      </div>

                      <div className=" flex justify-between">
                        <p className=" font-medium">Price</p>
                        <div>
                          {filter.price.isCustom
                            ? minPrice.toFixed(0)
                            : filter.price.range[0].toFixed(0)}{" "}
                          -{" "}
                          {filter.price.isCustom
                            ? maxPrice.toFixed(0)
                            : filter.price.range[1].toFixed(0)}
                        </div>
                      </div>

                      <Slider
                        className={cn({
                          "opacity-50": !filter.price.isCustom,
                        })}
                        disabled={!filter.price.isCustom}
                        onValueChange={(range) => {
                          const [newMin, newMax] = range;

                          setFilter((prev) => ({
                            ...prev,
                            price: {
                              isCustom: true,
                              range: [newMin, newMax],
                            },
                          }));

                          _debouncedSubmit();
                        }}
                        value={
                          filter.price.isCustom
                            ? filter.price.range
                            : DEFAULT_CUSTOM_PRICE
                        }
                        min={DEFAULT_CUSTOM_PRICE[0]}
                        defaultValue={DEFAULT_CUSTOM_PRICE}
                        max={DEFAULT_CUSTOM_PRICE[1]}
                        step={SLIDER_STEP}
                      />
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* propduct grid */}
          <ul className=" lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products && products.length === 0 ? (
              <EmptyState />
            ) : products ? (
              products?.map((product, i) => (
                <Product product={product.metadata!} key={i} />
              ))
            ) : (
              new Array(12)
                .fill(null)
                .map((_, i) => <ProductSkeleton key={i} />)
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
