import Link from "next/link";

const categories = [
  { name: "Fiction", icon: "📖", description: "Explore imaginary worlds." },
  { name: "Science", icon: "🔬", description: "Discover how the world works." },
  { name: "History", icon: "🏛️", description: "Travel through time." },
  { name: "Kids", icon: "🧸", description: "Stories for young readers." },
  { name: "Others", icon: "📚", description: "Something for everyone." },
];

export default function Categories() {
  return (
    <section className="bg-white px-5 py-20 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">

        <div className="mb-12 text-center">
          <p className="font-semibold uppercase tracking-widest text-[#C69C45]">
            Explore Collections
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#193B32] dark:text-white md:text-4xl">
            Browse by Category
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category, index) => (
            <Link
              href={`/books?category=${category.name}`}
              key={category.name}
              className="category-card group rounded-2xl border border-gray-100 bg-[#FAF9F6] p-8 text-center transition duration-500 hover:-translate-y-3 hover:bg-[#193B32] hover:text-white hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="mb-5 text-5xl transition duration-500 group-hover:scale-125">
                {category.icon}
              </div>

              <h3 className="mb-2 text-xl font-bold">
                {category.name}
              </h3>

              <p className="text-sm text-gray-500 group-hover:text-gray-200 dark:text-gray-400">
                {category.description}
              </p>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}