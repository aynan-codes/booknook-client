const reviews = [
  {
    name: "Sarah Ahmed",
    role: "Book Lover",
    review: "A wonderful place to discover new books. The collection is amazing!",
    rating: 5,
  },
  {
    name: "Rakib Hasan",
    role: "Regular Reader",
    review: "BookNook makes finding interesting books so easy and enjoyable.",
    rating: 5,
  },
  {
    name: "Nusrat Jahan",
    role: "Student",
    review: "I love the clean design and the variety of books available here.",
    rating: 4,
  },
];

export default function ReaderReviews() {
  return (
    <section className="bg-[#FAF9F6] px-5 py-20 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">

        <div className="mb-12 text-center">
          <p className="font-semibold uppercase tracking-widest text-[#C69C45]">
            Community Stories
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#193B32] dark:text-white md:text-4xl">
            What Our Readers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-5 text-xl text-[#C69C45]">
                {"★".repeat(review.rating)}
              </div>

              <p className="mb-6 leading-7 text-gray-600 dark:text-gray-300">
                &quot;{review.review}&quot;
              </p>

              <h3 className="font-bold text-[#193B32] dark:text-white">
                {review.name}
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {review.role}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}